#!/usr/bin/env node
/**
 * Content lint for probl.me articles.
 *
 * Enforces the mechanical rules from CONTENT_STANDARDS.md and the SEO Reviewer
 * and Proofreader checklists in AGENTS.md, so agents only spend effort on the
 * judgment calls (tone, voice, source tracing).
 *
 *   node scripts/lint-content.mjs                 lint every post
 *   node scripts/lint-content.mjs <slug> [...]    lint specific posts
 *   node scripts/lint-content.mjs --changed <ref> lint posts changed vs <ref>
 *
 * Errors fail the run (exit 1). Warnings are reported but never fail it.
 * No new dependencies: frontmatter is parsed by @astrojs/markdown-remark,
 * which the site already depends on.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { parseFrontmatter } from '@astrojs/markdown-remark';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');

const CATEGORIES = ['pm-craft', 'ai-development', 'tech-tools'];

// CONTENT_STANDARDS.md section 4. Patterns run on text with curly quotes
// normalised to straight ones.
const BANNED_PHRASES = [
  { re: /in today's fast-paced world/i, say: "in today's fast-paced world" },
  { re: /it's no secret that/i, say: "it's no secret that" },
  { re: /\bleverag(?:e|es|ed|ing)\b/i, say: 'leverage (use "use")' },
  { re: /\bsynergy\b/i, say: 'synergy' },
  { re: /paradigm shift/i, say: 'paradigm shift' },
  { re: /game[- ]changer/i, say: 'game-changer' },
  { re: /cutting[- ]edge/i, say: 'cutting-edge' },
  { re: /\binnovative\b/i, say: 'innovative' },
  { re: /\bseamless(?:ly)?\b/i, say: 'seamless' },
  { re: /deep[- ]dive/i, say: 'deep dive' },
];
const WARN_PHRASES = [
  { re: /\bbest practices?\b/i, say: 'best practices (only if you explain the practice)' },
];

const countWords = (text) => (text.match(/\S+/g) ?? []).length;
const normaliseQuotes = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

/** Line-by-line view of a document that marks fenced-code lines and blanks inline code. */
function scanLines(text) {
  let inFence = false;
  return text.split(/\r?\n/).map((line, i) => {
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) {
      inFence = !inFence;
      return { n: i + 1, raw: line, prose: '', code: true };
    }
    if (inFence) return { n: i + 1, raw: line, prose: '', code: true };
    return { n: i + 1, raw: line, prose: line.replace(/`[^`]*`/g, ''), code: false };
  });
}

/** Prose with MDX imports, JSX tags, images, code and link URLs stripped, for counting and sentence rules. */
function toProse(body) {
  return scanLines(body)
    .filter((l) => !l.code && !/^\s*import\s.+from\s/.test(l.raw))
    .map((l) => l.prose)
    .join('\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_]{1,3}/g, '');
}

function splitSentences(paragraph) {
  return paragraph
    .replace(/\b(e\.g|i\.e|vs|etc|approx)\./gi, '$1')
    .split(/(?<=[.!?])["')\]]*\s+(?=[A-Z0-9"'(\[])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Lint one post. Pure: all file-system facts come in through `ctx`.
 * ctx = { slug, fileExists(relPathFromPublic) }
 * Returns [{ level: 'error' | 'warning', rule, line, message }]
 */
export function lintPost(raw, ctx) {
  const findings = [];
  const add = (level, rule, line, message) => findings.push({ level, rule, line, message });

  let frontmatter;
  let body;
  try {
    const parsed = parseFrontmatter(raw);
    frontmatter = parsed.frontmatter ?? {};
    body = parsed.content ?? '';
  } catch (err) {
    add('error', 'frontmatter', 1, `Frontmatter could not be parsed: ${err.message}`);
    return findings;
  }
  // Line number of the first body line, so body findings point at the real file line.
  const bodyOffset = raw.slice(0, raw.length - body.length).split(/\r?\n/).length - 1;

  // Best-effort line lookup for findings that come from stripped prose.
  const rawLines = raw.split(/\r?\n/);
  const lineOf = (snippet) => {
    const key = snippet.slice(0, 25);
    const i = rawLines.findIndex((l) => l.includes(key));
    return i === -1 ? 1 : i + 1;
  };

  // ---- Slug ----------------------------------------------------------------
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ctx.slug)) {
    add('error', 'slug', 1, `Slug "${ctx.slug}" must be lowercase and hyphen-separated.`);
  }
  if (/\d{4}-\d{2}-\d{2}/.test(ctx.slug)) {
    add('error', 'slug', 1, `Slug "${ctx.slug}" must not contain a date; slugs stay evergreen.`);
  }
  const slugWords = ctx.slug.split('-').length;
  if (slugWords < 3 || slugWords > 6) {
    add('warning', 'slug', 1, `Slug has ${slugWords} words; aim for 3-6.`);
  }

  // ---- Frontmatter ---------------------------------------------------------
  for (const field of ['title', 'description', 'category', 'tags', 'date', 'readTime']) {
    if (frontmatter[field] === undefined || frontmatter[field] === '') {
      add('error', 'frontmatter', 1, `Missing required frontmatter field "${field}".`);
    }
  }
  const title = String(frontmatter.title ?? '');
  const description = String(frontmatter.description ?? '');
  if (title && (title.length < 50 || title.length > 60)) {
    add('warning', 'title-length', 2, `Title is ${title.length} characters; SEO target is 50-60.`);
  }
  if (description && (description.length < 150 || description.length > 160)) {
    add('warning', 'description-length', 3, `Description is ${description.length} characters; SEO target is 150-160.`);
  }
  if (frontmatter.category !== undefined && !CATEGORIES.includes(frontmatter.category)) {
    add('error', 'category', 1, `Category "${frontmatter.category}" must be one of: ${CATEGORIES.join(', ')}.`);
  }
  if (Array.isArray(frontmatter.tags)) {
    if (frontmatter.tags.length < 2 || frontmatter.tags.length > 5) {
      add('error', 'tags', 1, `Found ${frontmatter.tags.length} tags; use 2-5.`);
    }
  } else if (frontmatter.tags !== undefined) {
    add('error', 'tags', 1, 'tags must be a list.');
  }
  if (frontmatter.date !== undefined && Number.isNaN(new Date(frontmatter.date).valueOf())) {
    add('error', 'date', 1, `date "${frontmatter.date}" is not a valid date.`);
  }

  // ---- FAQ -----------------------------------------------------------------
  const faq = frontmatter.faq;
  if (!Array.isArray(faq) || faq.length < 3 || faq.length > 5) {
    add('error', 'faq', 1, `faq needs 3-5 entries (found ${Array.isArray(faq) ? faq.length : 0}).`);
  } else {
    faq.forEach((item, i) => {
      const words = countWords(String(item?.answer ?? ''));
      if (!item?.question || !item?.answer) {
        add('error', 'faq', 1, `FAQ entry ${i + 1} needs both a question and an answer.`);
      } else if (words < 40 || words > 90) {
        add('warning', 'faq-length', 1, `FAQ answer ${i + 1} is ${words} words; target is 40-90.`);
      }
    });
  }

  // ---- Hero image ----------------------------------------------------------
  if (frontmatter.heroImage) {
    const hero = String(frontmatter.heroImage);
    if (!ctx.fileExists(hero)) {
      add('error', 'hero', 1, `heroImage file not found under public/: ${hero}`);
    } else if (/\.png$/i.test(hero)) {
      const stem = hero.replace(/\.png$/i, '');
      for (const variant of [`${stem}.webp`, `${stem}-640.webp`]) {
        if (!ctx.fileExists(variant)) {
          add('warning', 'hero-webp', 1, `Missing ${variant}; run node scripts/generate-webp-heroes.mjs.`);
        }
      }
    }
  } else {
    add('warning', 'hero', 1, 'No heroImage set; every article needs a hero image.');
  }
  if (frontmatter.heroImage && !frontmatter.imageCredit) {
    add('warning', 'image-credit', 1, 'heroImage is set but imageCredit is missing.');
  }

  // ---- Punctuation and banned phrases (whole file, frontmatter included) ---
  for (const line of scanLines(raw)) {
    if (line.code) continue;
    const text = normaliseQuotes(line.prose);
    if (text.includes('—')) {
      add('error', 'em-dash', line.n, 'Em dash found. Use a comma, colon, period or rewrite the sentence.');
    }
    // En dashes are only for numeric ranges such as 1,200-2,500.
    for (const m of text.matchAll(/–/g)) {
      const before = text[m.index - 1] ?? '';
      const after = text[m.index + 1] ?? '';
      if (!(/[\d%)]/.test(before) && /\d/.test(after))) {
        add('error', 'en-dash', line.n, 'En dash used outside a numeric range. Use a hyphen or comma.');
        break;
      }
    }
    for (const { re, say } of BANNED_PHRASES) {
      if (re.test(text)) add('error', 'banned-phrase', line.n, `Banned phrase: ${say}.`);
    }
    for (const { re, say } of WARN_PHRASES) {
      if (re.test(text)) add('warning', 'banned-phrase', line.n, `Check phrase: ${say}.`);
    }
  }

  // ---- Headings ------------------------------------------------------------
  let prevLevel = 1; // the page title is the H1
  for (const line of scanLines(body)) {
    if (line.code) continue;
    const m = /^(#{1,6})\s+\S/.exec(line.raw);
    if (!m) continue;
    const level = m[1].length;
    const n = line.n + bodyOffset;
    if (level === 1) add('error', 'heading', n, 'H1 in body. The title is the only H1 and is set from frontmatter.');
    else if (level > 3) add('error', 'heading', n, `H${level} found; use H2 and H3 only.`);
    else if (level > prevLevel + 1) add('error', 'heading', n, `Heading level skipped (H${prevLevel} to H${level}).`);
    prevLevel = level;
  }

  // ---- Length --------------------------------------------------------------
  const prose = toProse(body);
  const words = countWords(prose);
  if (words < 1000 || words > 3000) {
    add('error', 'word-count', 1, `Body is about ${words} words; hard limits are 1,000-3,000.`);
  } else if (words < 1200 || words > 2500) {
    add('warning', 'word-count', 1, `Body is about ${words} words; standard range is 1,200-2,500.`);
  }

  // ---- TL;DR ---------------------------------------------------------------
  const tldr = /TL;DR:?\s*([\s\S]*?)(?:<\/Callout>|\n\s*\n)/i.exec(body);
  if (!tldr) {
    add('error', 'tldr', 1, 'Missing TL;DR. Put a Callout starting "TL;DR:" first in the article.');
  } else {
    const tldrWords = countWords(tldr[1].replace(/<[^>]+>/g, ' '));
    if (tldrWords < 40 || tldrWords > 60) {
      add('warning', 'tldr', 1, `TL;DR is ${tldrWords} words; target is 40-60.`);
    }
    if (body.indexOf(tldr[0]) > 600) {
      add('warning', 'tldr', 1, 'TL;DR should be the first block after the title.');
    }
  }

  // ---- Images --------------------------------------------------------------
  let inArticleImages = 0;
  for (const line of scanLines(body)) {
    if (line.code) continue;
    for (const m of line.prose.matchAll(/!\[([^\]]*)\]\(([^)]*)\)/g)) {
      inArticleImages += 1;
      if (!m[1].trim()) add('error', 'alt-text', line.n + bodyOffset, `Image ${m[2]} has no alt text.`);
    }
    for (const m of line.prose.matchAll(/<img\b[^>]*>/gi)) {
      inArticleImages += 1;
      if (!/\balt\s*=\s*["'{][^"'}]/i.test(m[0])) add('error', 'alt-text', line.n + bodyOffset, '<img> has no alt text.');
    }
  }
  const wantedImages = Math.floor(words / 500);
  if (inArticleImages < wantedImages) {
    add('warning', 'image-ratio', 1, `${inArticleImages} in-article image(s) for ~${words} words; standard is one per ~500 words (${wantedImages}).`);
  }

  // ---- Sentences and paragraphs (warnings: the Proofreader judges these) ---
  const paragraphs = prose.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    if (/^(#{1,6}\s|\||[-*]\s|\d+\.\s)/.test(p)) continue; // headings, tables, lists
    const sentences = splitSentences(p.replace(/\s*\n\s*/g, ' '));
    if (sentences.length > 4) {
      add('warning', 'paragraph-length', lineOf(p), `Paragraph has ${sentences.length} sentences (max 4): "${p.slice(0, 50)}..."`);
    }
    for (const s of sentences) {
      const n = countWords(s);
      if (n > 35) add('warning', 'sentence-length', lineOf(s), `Sentence has ${n} words (max 35): "${s.slice(0, 50)}..."`);
    }
  }

  return findings;
}

// ---- CLI ---------------------------------------------------------------------

function postSlugs(args) {
  const all = () =>
    readdirSync(POSTS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  if (args[0] === '--changed') {
    const ref = args[1];
    if (!ref || !/^[\w./-]+$/.test(ref)) throw new Error('--changed needs a git ref such as origin/main');
    const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${ref}...HEAD`, '--', 'src/content/posts'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    const slugs = new Set();
    for (const file of out.split('\n')) {
      const m = /^src\/content\/posts\/([^/]+)\//.exec(file.trim());
      if (m && existsSync(path.join(POSTS_DIR, m[1], 'index.mdx'))) slugs.add(m[1]);
    }
    return [...slugs];
  }
  return args.length ? args : all();
}

function main() {
  const slugs = postSlugs(process.argv.slice(2));
  const inActions = process.env.GITHUB_ACTIONS === 'true';
  let errors = 0;
  let warnings = 0;

  if (slugs.length === 0) console.log('No posts to lint.');

  for (const slug of slugs) {
    const file = path.join(POSTS_DIR, slug, 'index.mdx');
    if (!/^[\w-]+$/.test(slug) || !existsSync(file)) {
      console.error(`error  ${slug}: no src/content/posts/${slug}/index.mdx`);
      errors += 1;
      continue;
    }
    const rel = path.posix.join('src/content/posts', slug, 'index.mdx');
    const findings = lintPost(readFileSync(file, 'utf8'), {
      slug,
      fileExists: (p) => existsSync(path.join(ROOT, 'public', p.replace(/^\/+/, ''))),
    });
    const e = findings.filter((f) => f.level === 'error');
    const w = findings.filter((f) => f.level === 'warning');
    errors += e.length;
    warnings += w.length;
    console.log(`\n${slug}: ${e.length} error(s), ${w.length} warning(s)`);
    for (const f of findings) {
      console.log(`  ${f.level.padEnd(7)} ${rel}:${f.line}  [${f.rule}] ${f.message}`);
      if (inActions) {
        const msg = `[${f.rule}] ${f.message}`.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
        console.log(`::${f.level} file=${rel},line=${f.line}::${msg}`);
      }
    }
  }

  console.log(`\nContent lint: ${errors} error(s), ${warnings} warning(s) in ${slugs.length} post(s).`);
  if (errors > 0) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
