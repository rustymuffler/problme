/**
 * Deterministic article quality checks (roadmap phase 2).
 *
 * Everything here is a pure function of the article text and the context passed in, so it can be
 * unit tested without touching the file system. lint-content.mjs loads the context (other posts,
 * interview notes, research brief, dictionaries) and calls qualityFindings().
 *
 * Severity: clear mistakes that must never ship (leaked secrets, private data, duplicate titles,
 * invalid code samples, repeated words) are errors. Style and judgment signals are warnings that the
 * Proofreader and SEO reviewers (phase 3) read from the lint output.
 *
 * The article text is model-written and may be hostile, so every regex here is linear or bounded,
 * long lines and long tokens are skipped, and the number of spelling lookups is capped.
 */
import nspell from 'nspell';
import dictionary from 'dictionary-en';

const speller = nspell(dictionary);

const MAX_LINE = 2000; // longer lines skip the per-line scans
const MAX_TOKEN = 30; // longer words are not spell-checked
const MAX_SPELLING_REPORTS = 40; // suggestions are slow; cap the lookups

/** Add project words (technical terms and names) to the spelling dictionary. */
export function addDictionaryWords(words) {
  for (const w of words) if (w) speller.add(w);
}

const words = (text) => text.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
const countWords = (text) => (text.match(/\S+/g) ?? []).length;
const normalise = (text) => words(text).join(' ');
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function shingles(text, n) {
  const w = words(text);
  const set = new Set();
  for (let i = 0; i + n <= w.length; i += 1) set.add(w.slice(i, i + n).join(' '));
  return set;
}

function overlap(a, b) {
  if (a.size === 0) return 0;
  let hit = 0;
  for (const s of a) if (b.has(s)) hit += 1;
  return hit / a.size;
}

/** Rough English syllable count, good enough for a readability grade. */
export function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch-Kincaid grade level of plain prose. */
export function fleschKincaid(prose, sentences) {
  const w = prose.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  if (w.length === 0 || sentences.length === 0) return 0;
  const syl = w.reduce((n, x) => n + syllables(x), 0);
  return 0.39 * (w.length / sentences.length) + 11.8 * (syl / w.length) - 15.59;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

// Provider-specific token formats (length-checked so a mention of a prefix is not an error).
const CREDENTIALS = [
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-ant-[A-Za-z0-9_-]{20,}/,
  /sk-(?:proj-|live-)?[A-Za-z0-9_-]{32,}/,
  /AKIA[0-9A-Z]{16}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /xox[bpas]-[A-Za-z0-9-]{10,}/,
  /npm_[A-Za-z0-9]{36}/,
  /[sp]k_live_[A-Za-z0-9]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
  /-----BEGIN [A-Z ]{0,30}PRIVATE KEY-----/,
  /\b(?:api[_-]?key|secret|token|passwd|password)\s{0,3}[:=]\s{0,3}["']?[A-Za-z0-9/+_=-]{16,}/i,
  /:\/\/[^/\s:@]{1,64}:[^/\s@]{3,64}@/,
];
const PLACEHOLDER = /x{4,}|\.{3}|<[^>]+>|your[_-]|example|placeholder|changeme|redacted|dummy/i;
const NOT_AN_EMAIL_DOMAIN = /\.(?:png|jpe?g|gif|webp|svg|ico|avif|css|js|mjs|json|md|mdx|txt|zip|gz|pdf|ts|tsx|astro|yml|yaml|xml|html)$/i;
const SAFE_EMAIL_DOMAINS = /^(?:probl\.me|example\.(?:com|org|net)|users\.noreply\.github\.com|github\.com|localhost)$/i;
const REPEAT_OK = new Set(['that', 'had', 'no', 'very', 'bye', 'so', 'ha', 'yeah', 'blah', 'go', 'knock', 'ho']);

/** Every markdown link in the body, found with bounded regex work. */
function extractLinks(body) {
  return [...body.matchAll(/(?<!!)\[([^\]\n]{0,200})\]\(([^)\s]{0,500})[^)\n]{0,200}\)/g)];
}

/** The "Do not publish" items from the interview notes, one per line, bullets removed. */
function doNotPublishItems(notes) {
  const lines = notes.split(/\r?\n/);
  const items = [];
  let level = 0;
  for (const line of lines) {
    const heading = /^(#{1,6})\s*(.{0,200})$/.exec(line);
    if (heading) {
      if (level) {
        if (heading[1].length <= level) break;
      } else if (/^do not publish\b/i.test(heading[2].trim())) {
        level = heading[1].length;
        continue;
      }
      if (level) continue;
    }
    if (level) {
      const item = line.replace(/^\s*(?:[-*+]|\d+[.)])\s*/, '').trim();
      if (item && items.length < 200) items.push(item.slice(0, 300));
    }
  }
  return items;
}

/**
 * @param {object} a
 * @param {string} a.slug
 * @param {object} a.frontmatter
 * @param {string} a.raw            whole file
 * @param {string} a.body           MDX body without frontmatter
 * @param {number} a.bodyOffset     line number offset of the body
 * @param {string} a.prose          body with code, tags, images and link URLs stripped
 * @param {string[]} a.sentences    prose split into sentences (all paragraphs)
 * @param {Array<{n:number, raw:string, prose:string, code:boolean}>} a.bodyLines
 * @param {object} a.ctx            optional: otherPosts, knownTags, interviewNotes, researchBrief, sensitiveTerms
 */
export function qualityFindings({ slug, frontmatter, raw, body, bodyOffset, prose, sentences, bodyLines, ctx }) {
  const findings = [];
  const add = (level, rule, line, message) => findings.push({ level, rule, line, message });
  const title = String(frontmatter.title ?? '');
  const description = String(frontmatter.description ?? '');
  let longLines = 0;

  // ---- Spelling ------------------------------------------------------------------------------
  const unknown = new Set();
  for (const sentence of sentences) {
    if (sentence.length > MAX_LINE * 2) continue;
    const tokens = sentence.match(/[A-Za-z][A-Za-z'’-]{0,60}/g) ?? [];
    tokens.forEach((tok, i) => {
      if (tok.length > MAX_TOKEN) return;
      const word = tok.replace(/’/g, "'").replace(/'s$/i, '').replace(/^-+|-+$/g, '');
      if (word.length < 3) return;
      if (word === word.toUpperCase()) return; // acronyms
      if (/[a-z][A-Z]/.test(word)) return; // camelCase names
      if (i > 0 && /^[A-Z]/.test(word)) return; // proper nouns inside a sentence
      for (const part of word.split('-')) {
        if (part.length < 3 || part === part.toUpperCase() || (/^[A-Z]/.test(part) && i > 0)) continue;
        if (!speller.correct(part) && !speller.correct(part.toLowerCase())) unknown.add(part);
      }
    });
  }
  let reported = 0;
  for (const word of unknown) {
    if (reported >= MAX_SPELLING_REPORTS) {
      add('warning', 'spelling', 1, `${unknown.size - reported} more possible misspellings not listed.`);
      break;
    }
    const suggestions = speller.suggest(word).slice(0, 3);
    const hint = suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : '';
    add('warning', 'spelling', 1, `Possible misspelling: "${word}".${hint} Add real technical terms to scripts/dictionary.txt.`);
    reported += 1;
  }

  // ---- Readability and the Proofreader checklist --------------------------------------------
  if (sentences.length >= 20) {
    const grade = fleschKincaid(prose, sentences);
    if (grade > 11 || grade < 6) {
      add('warning', 'readability', 1, `Flesch-Kincaid grade is ${grade.toFixed(1)}; the target is 8 to 10 (acceptable 6 to 11).`);
    }
    const avg = countWords(prose) / sentences.length;
    if (avg > 22 || avg < 11) {
      add('warning', 'sentence-average', 1, `Average sentence length is ${avg.toFixed(1)} words; the target is 15 to 20.`);
    }
  }
  for (let i = 1; i < sentences.length; i += 1) {
    const a = sentences[i - 1].match(/[A-Za-z']{1,40}/)?.[0]?.toLowerCase();
    const b = sentences[i].match(/[A-Za-z']{1,40}/)?.[0]?.toLowerCase();
    if (a && a === b && a.length > 1) {
      add('warning', 'repeated-opener', 1, `Consecutive sentences start with "${a}": "${sentences[i].slice(0, 40)}..."`);
    }
  }
  for (const line of bodyLines) {
    if (line.code || /^\s*(\||>|import\s)/.test(line.raw)) continue;
    if (line.raw.length > MAX_LINE) {
      longLines += 1;
      continue;
    }
    // Repeated word: compare neighbouring tokens (linear, no backreference regex).
    const tokens = line.prose.split(/\s+/).filter(Boolean);
    for (let i = 1; i < tokens.length; i += 1) {
      const a = tokens[i - 1].replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '').toLowerCase();
      const b = tokens[i].replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '').toLowerCase();
      // Only plain words, and no punctuation between them: "it, it" and "end. End" are fine.
      if (a.length >= 2 && a === b && /^[a-z']+$/.test(a) && !REPEAT_OK.has(a) && !/[.!?,;:—–-]$/.test(tokens[i - 1])) {
        add('error', 'repeated-word', line.n + bodyOffset, `Repeated word: "${tokens[i - 1]} ${tokens[i]}".`);
        break;
      }
    }
    // Inline code leaves a gap in the stripped prose, so test the raw line with code spans masked.
    if (/[A-Za-z0-9.,;:!?)] {2,}[A-Za-z(]/.test(line.raw.replace(/`[^`]{0,500}`/g, 'x'))) {
      add('warning', 'double-space', line.n + bodyOffset, 'Double space between words.');
    }
  }
  // Numbers under ten are spelled out in prose (not in tables, code, versions or units).
  for (const line of bodyLines) {
    if (line.code || line.raw.length > MAX_LINE || /^\s*(\||#|[-*]\s|\d+\.\s)/.test(line.raw)) continue;
    const text = line.prose.replace(/\]\([^)]{0,500}\)/g, ']');
    for (const m of text.matchAll(/(?<![\w.$/:,-])([1-9])(?![\w%:/-]|[.,]\d|\s?(?:%|percent|x\b|px|ms|s\b|kb|mb|gb|am|pm|a\.m|p\.m))/gi)) {
      const after = text.slice(m.index + 1, m.index + 12);
      if (/^\s?(?:of \d|\/|\.\d)/.test(after)) continue;
      add('warning', 'number-style', line.n + bodyOffset, `Spell out "${m[1]}" as "${NUMBER_WORDS[Number(m[1])]}" (numbers under 10 are words).`);
      break;
    }
  }
  const passive = (prose.match(/\b(?:was|were|been|being|is|are)\s+(?:\w{1,20}ly\s+)?(?:\w{1,20}ed|built|done|made|shown|written|given|taken|seen|found|known)\b(?:\s+by\b)?/gi) ?? []).length;
  if (sentences.length >= 20 && passive / sentences.length > 0.15) {
    add('warning', 'passive-voice', 1, `About ${passive} passive constructions in ${sentences.length} sentences; prefer active voice.`);
  }

  // ---- SEO mechanics ------------------------------------------------------------------------
  const keyword = typeof frontmatter.primaryKeyword === 'string' ? frontmatter.primaryKeyword.trim().toLowerCase() : '';
  if (!keyword) {
    add('warning', 'seo-keyword', 1, 'No primaryKeyword in the frontmatter; the keyword checks were skipped.');
  } else {
    const first200 = words(prose).slice(0, 200).join(' ');
    if (!title.toLowerCase().includes(keyword)) add('warning', 'seo-keyword', 2, `Primary keyword "${keyword}" is not in the title.`);
    if (!description.toLowerCase().includes(keyword)) add('warning', 'seo-keyword', 3, `Primary keyword "${keyword}" is not in the description.`);
    const slugTokens = keyword.split(/\s+/).filter((t) => t.length > 2);
    if (slugTokens.length && !slugTokens.every((t) => slug.includes(t.replace(/[^a-z0-9]/g, '')))) {
      add('warning', 'seo-keyword', 1, `Primary keyword "${keyword}" is not reflected in the slug "${slug}".`);
    }
    if (!first200.includes(normalise(keyword))) add('warning', 'seo-keyword', 1, `Primary keyword "${keyword}" is not in the first 200 words.`);
  }
  if (title && description && description.trim().toLowerCase() === title.trim().toLowerCase()) {
    add('error', 'seo-description', 3, 'The description is identical to the title; it should add information.');
  } else if (title && description.toLowerCase().startsWith(title.toLowerCase())) {
    add('warning', 'seo-description', 3, 'The description starts by repeating the title; it should add information.');
  }
  const links = extractLinks(body);
  const internal = links.filter((m) => /^\/(?!\/)/.test(m[2]) || /^https?:\/\/(www\.)?probl\.me/i.test(m[2]));
  if (links.length && internal.length === 0 && (ctx?.otherPosts?.length ?? 0) > 0) {
    add('warning', 'seo-internal-link', 1, 'No internal link to another probl.me page; add at least one.');
  }
  for (const m of links) {
    if (/^(here|click here|this|this link|link|read more|more)$/i.test(m[1].trim())) {
      add('warning', 'link-text', 1, `Vague link text "${m[1]}"; describe where the link goes.`);
    }
    if (/^http:\/\//i.test(m[2])) add('warning', 'link-https', 1, `Link is not HTTPS: ${m[2]}`);
  }
  if (links.length - internal.length > 15) {
    add('warning', 'link-count', 1, `${links.length - internal.length} external links; more than 15 dilutes the article.`);
  }
  const h2 = bodyLines.filter((l) => !l.code && /^##\s+\S/.test(l.raw));
  if (h2.length >= 4 && !h2.some((l) => /\?\s*$/.test(l.raw))) {
    add('warning', 'aeo-headings', 1, 'No H2 is phrased as a question; AI answer engines favour question headings where natural.');
  }

  // ---- AEO mechanics ------------------------------------------------------------------------
  const sections = body.split(/^##\s+/m).slice(1);
  for (const sec of sections) {
    const heading = sec.split('\n')[0].trim();
    if (/^(frequently asked|faq)/i.test(heading)) continue;
    const n = countWords(sec.split('\n').slice(1).join(' ').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]{0,300}>/g, ' '));
    if (n < 40 || n > 600) add('warning', 'aeo-section', 1, `Section "${heading.slice(0, 50)}" is ${n} words; self-contained sections run about 40 to 600.`);
  }
  const bodyGrams = shingles(prose, 5);
  for (const item of Array.isArray(frontmatter.faq) ? frontmatter.faq : []) {
    const ratio = overlap(shingles(String(item?.answer ?? ''), 5), bodyGrams);
    if (ratio > 0.5) add('warning', 'faq-duplicates-body', 1, `FAQ answer repeats the article body (${Math.round(ratio * 100)}% overlap): "${String(item.question).slice(0, 50)}"`);
  }
  // A statistic needs a source link in the same paragraph.
  const statistic = /(?<![\w.])\d[\d,.]{0,15}\s?(?:%|percent|million|billion|thousand)\b|\$\d[\d,.]{0,15}|\b\d[\d,.]{0,15}\s?x\s+(?:faster|slower|more|less|cheaper)/i;
  let inFence = false;
  body.split(/\n\s*\n/).forEach((para) => {
    if (/^\s*(```|~~~)/.test(para)) inFence = !inFence;
    if (inFence || para.length > MAX_LINE * 5 || /^\s*(```|~~~|\||#|import\s|<)/.test(para)) return;
    if (statistic.test(para) && !/\]\(https?:\/\//.test(para) && !/<a\s/i.test(para)) {
      add('warning', 'aeo-statistic-source', 1, `A statistic has no source link in its paragraph: "${para.trim().slice(0, 60)}..."`);
    }
  });

  // ---- Originality ---------------------------------------------------------------------------
  const others = ctx?.otherPosts ?? [];
  if (title && others.some((p) => String(p.title ?? '').trim().toLowerCase() === title.trim().toLowerCase())) {
    add('error', 'duplicate-title', 2, 'Another post already has this exact title.');
  }
  if (keyword) {
    for (const p of others) {
      if (String(p.primaryKeyword ?? '').trim().toLowerCase() === keyword) {
        add('warning', 'keyword-cannibalisation', 1, `Post "${p.slug}" targets the same primary keyword "${keyword}".`);
      }
    }
  }
  const ownGrams = shingles(prose, 8);
  for (const p of others) {
    const ratio = overlap(ownGrams, shingles(String(p.prose ?? ''), 8));
    if (ratio > 0.05) add('warning', 'originality-overlap', 1, `${Math.round(ratio * 100)}% of this article's 8-word phrases also appear in "${p.slug}".`);
  }
  if (ctx?.researchBrief) {
    const ratio = overlap(ownGrams, shingles(String(ctx.researchBrief), 8));
    if (ratio > 0.03) add('warning', 'copied-from-brief', 1, `${Math.round(ratio * 100)}% of 8-word phrases match the research brief; rewrite in your own words.`);
  }

  // ---- Sensitivity ---------------------------------------------------------------------------
  const rawLines = raw.split(/\r?\n/);
  rawLines.forEach((line, i) => {
    const n = i + 1;
    if (line.length > MAX_LINE) {
      longLines += 1;
      // Credentials hide in long lines too; the bounded patterns are linear, so still check those.
      if (CREDENTIALS.some((re) => re.test(line) && !PLACEHOLDER.test(line.match(re)[0]))) add('error', 'secret-pattern', n, 'Looks like a credential or private key. Remove it.');
      return;
    }
    const secret = CREDENTIALS.map((re) => line.match(re)).find((m) => m && !PLACEHOLDER.test(m[0]));
    if (secret) add('error', 'secret-pattern', n, 'Looks like a credential or private key. Remove it.');
    for (const m of line.matchAll(/[A-Za-z0-9._%+-]{1,64}@([A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24})/g)) {
      const domain = m[1];
      if (SAFE_EMAIL_DOMAINS.test(domain) || NOT_AN_EMAIL_DOMAIN.test(domain) || /^\d/.test(domain)) continue;
      add('error', 'sensitive-email', n, `Email address in the article: ${m[0]}`);
    }
    if (/(?<!\d)(?:\+?1[ .-])?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)/.test(line)) add('warning', 'sensitive-phone', n, 'Looks like a phone number; remove it if it is one.');
    if (/[A-Za-z]:\\Users\\[^\\\s]{1,64}/i.test(line) || /\/home\/[a-z][a-z0-9_-]{0,30}\//.test(line)) add('warning', 'sensitive-path', n, 'A path with a user name; replace it with a placeholder.');
    for (const m of line.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)) {
      if (!/^(127\.0\.0\.1|0\.0\.0\.0|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(m[0]) && m[0].split('.').every((p) => Number(p) <= 255)) {
        add('warning', 'sensitive-ip', n, `IP address in the article: ${m[0]}`);
      }
    }
  });
  for (const term of ctx?.sensitiveTerms ?? []) {
    if (term && new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(String(term).slice(0, 200))}(?![A-Za-z0-9])`, 'i').test(raw)) {
      add('error', 'sensitive-term', 1, `Contains a term from scripts/sensitive-terms.txt: "${term}".`);
    }
  }
  if (ctx?.interviewNotes) {
    // Items under "Do not publish" are matched against the whole file (frontmatter, FAQ, code and
    // link text included). Short items must appear whole; longer items match on their first words.
    const haystack = ` ${normalise(raw)} `;
    for (const item of doNotPublishItems(String(ctx.interviewNotes))) {
      const w = words(item);
      if (w.length === 0) continue;
      const needle = w.slice(0, Math.min(w.length, 6)).join(' ');
      if (needle.length >= 3 && haystack.includes(` ${needle} `)) {
        add('error', 'do-not-publish', 1, `The article contains text the interview marked "Do not publish": "${item.slice(0, 60)}".`);
        break;
      }
    }
  }

  // ---- Code samples and tags -----------------------------------------------------------------
  let open = null;
  rawLines.forEach((line, i) => {
    if (line.length > MAX_LINE) return;
    const fence = /^\s*(```|~~~)\s*([A-Za-z0-9_+#.-]{0,30})/.exec(line);
    if (!fence) {
      if (open && open.lines.length < 2000) open.lines.push(line);
      return;
    }
    if (!open) {
      open = { lang: fence[2], start: i + 1, lines: [] };
      if (!fence[2]) add('warning', 'code-language', i + 1, 'Code fence has no language tag.');
      return;
    }
    if (open.lang.toLowerCase() === 'json') {
      const text = open.lines.join('\n');
      if (!/\.\.\.|\/\/|\/\*/.test(text)) {
        try {
          JSON.parse(text);
        } catch (err) {
          add('error', 'code-json', open.start, `JSON code sample does not parse: ${err.message}`);
        }
      }
    }
    open = null;
  });
  if (open) add('warning', 'code-fence', open.start, 'A code fence is never closed.');
  const known = ctx?.knownTags;
  for (const tag of Array.isArray(frontmatter.tags) ? frontmatter.tags : []) {
    if (typeof tag !== 'string') {
      add('error', 'tag-format', 1, `Tag ${JSON.stringify(tag)} must be a text value.`);
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) {
      add('error', 'tag-format', 1, `Tag "${tag}" must be lowercase and hyphenated.`);
    } else if (known && !known.has(tag)) {
      // A new tag is fine; a near-duplicate of an existing tag (plural, hyphenation) splits the topic page.
      const flat = (t) => String(t).replace(/-/g, '').replace(/s$/, '');
      const twin = [...known].find((k) => flat(k) === flat(tag));
      if (twin) add('warning', 'tag-similar', 1, `Tag "${tag}" is nearly the same as the existing tag "${twin}"; reuse the existing one.`);
    }
  }

  if (longLines > 0) {
    add('warning', 'long-lines', 1, `${longLines} line(s) over ${MAX_LINE} characters were not fully checked; break them up.`);
  }
  return findings;
}
