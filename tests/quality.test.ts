import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintPost } from '../scripts/lint-content.mjs';
import { addDictionaryWords, syllables, fleschKincaid } from '../scripts/lib/quality.mjs';

const filler = (n: number) => Array.from({ length: n }, (_, i) => `word${'abcdefg'[i % 7]}`).join(' ');

/** A post whose body carries `extra` as one more paragraph. Body words are filler, so quality checks stay quiet. */
function post(extra = '', front: Record<string, string> = {}) {
  const fm: Record<string, string> = {
    title: '"' + 'T'.repeat(55) + '"',
    description: '"' + 'D'.repeat(155) + '"',
    category: 'tech-tools',
    tags: '["one", "two"]',
    date: '2026-11-24',
    readTime: '"7 min"',
    ...front,
  };
  const faq = [0, 1, 2].map((i) => `  - question: "Q${i}?"\n    answer: "${filler(50)}"`).join('\n');
  const head = Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join('\n');
  const paras = Array.from({ length: 60 }, () => `Start ${filler(12)} end.`).join('\n\n');
  const body = `<Callout type="note">\nTL;DR: ${filler(50)}.\n</Callout>\n\n## Section one\n\n${paras}\n\n${extra}\n`;
  return `---\n${head}\nfaq:\n${faq}\n---\n${body}`;
}

const base = { slug: 'good-post-slug', fileExists: () => true };
const find = (raw: string, rule: string, ctx: Record<string, unknown> = {}) =>
  lintPost(raw, { ...base, ...ctx }).filter((f: { rule: string }) => f.rule === rule);
const level = (raw: string, rule: string, ctx: Record<string, unknown> = {}) =>
  find(raw, rule, ctx).map((f: { level: string }) => f.level);

test('repeated words are an error', () => {
  assert.deepEqual(level(post('I went to the the store.'), 'repeated-word'), ['error']);
});

test('credentials, emails and phone numbers are errors', () => {
  assert.deepEqual(level(post('Token ' + ['gh', 'p_abcdefghijklmnopqrstuvwxyz0123456789'].join('') + ' here.'), 'secret-pattern'), ['error']);
  assert.deepEqual(level(post('Write to someone@private-company.com today.'), 'sensitive-email'), ['error']);
  assert.deepEqual(level(post('Call 415-555-0134 now.'), 'sensitive-phone'), ['warning']);
  assert.deepEqual(level(post('Mail hello@probl.me instead.'), 'sensitive-email'), []);
});

test('blocklist terms and do-not-publish text are errors', () => {
  assert.deepEqual(level(post('Our Project Falcon launch is next.'), 'sensitive-term', { sensitiveTerms: ['project falcon'] }), ['error']);
  const notes = '# Notes\n\n## Do not publish\nthe customer renewed their contract at a ten percent discount\n\n## Other\nx\n';
  const leak = post('Honestly the customer renewed their contract at a ten percent discount last year.');
  assert.deepEqual(level(leak, 'do-not-publish', { interviewNotes: notes }), ['error']);
  assert.deepEqual(level(post('Something unrelated entirely.'), 'do-not-publish', { interviewNotes: notes }), []);
});

test('duplicate titles are an error; identical description is an error', () => {
  const t = 'T'.repeat(55);
  assert.deepEqual(level(post(), 'duplicate-title', { otherPosts: [{ slug: 'x', title: t, prose: '' }] }), ['error']);
  assert.deepEqual(level(post('', { description: '"' + 'T'.repeat(55) + '"' }), 'seo-description'), ['error']);
});

test('code fences: invalid JSON is an error, valid JSON passes, bare fences warn', () => {
  assert.deepEqual(level(post('```json\n{"a": }\n```'), 'code-json'), ['error']);
  assert.deepEqual(level(post('```json\n{"a": 1}\n```'), 'code-json'), []);
  assert.deepEqual(level(post('```\nplain\n```'), 'code-language'), ['warning']);
});

test('primary keyword checks', () => {
  const raw = post('', { primaryKeyword: '"zebra stripes"' });
  assert.ok(find(raw, 'seo-keyword').length >= 3); // missing from title, description, slug, first 200 words
  assert.equal(find(post(), 'seo-keyword').length, 1); // no keyword set
});

test('a statistic needs a source link in its paragraph', () => {
  assert.deepEqual(level(post('About 83 percent of sites fail this check.'), 'aeo-statistic-source'), ['warning']);
  assert.deepEqual(level(post('About 83 percent of sites fail this check, per [the study](https://example.org/s).'), 'aeo-statistic-source'), []);
});

test('spelling: misspellings warn; dictionary words and proper nouns pass', () => {
  const hits = (text: string, word: string) =>
    find(post(text), 'spelling').filter((f: { message: string }) => f.message.includes(`"${word}"`)).length;
  assert.equal(hits('I will recieve the package soon.', 'recieve'), 1);
  assert.equal(hits('The flurbnicator ships soon.', 'flurbnicator'), 1);
  addDictionaryWords(['flurbnicator']);
  assert.equal(hits('The flurbnicator ships soon.', 'flurbnicator'), 0);
  assert.equal(hits('I met Zorblax at the event.', 'Zorblax'), 0);
});

test('numbers under ten should be words, but ratios, thousands and decimals are fine', () => {
  assert.equal(find(post('I bought 3 apples today.'), 'number-style').length, 1);
  for (const ok of ['The ratio is 4.5:1 here.', 'About 1,000 files changed.', 'It took 2.5 seconds.', 'It improved by 3%.', 'See `step 3` above.']) {
    assert.equal(find(post(ok), 'number-style').length, 0, ok);
  }
});

test('originality: heavy overlap with another post warns', () => {
  const shared = 'the quick brown fox jumps over the lazy dog while the cat watches from the old stone wall nearby';
  const raw = post(shared + '.');
  assert.ok(find(raw, 'originality-overlap', { otherPosts: [{ slug: 'old-post', title: 'x', prose: shared + ' ' + filler(5) }] }).length >= 1);
  assert.equal(find(raw, 'originality-overlap', { otherPosts: [{ slug: 'old-post', title: 'x', prose: 'completely different text about other matters' }] }).length, 0);
});

test('tags: format is an error, near-duplicates of existing tags warn', () => {
  assert.deepEqual(level(post('', { tags: '["Bad Tag", "ok"]' }), 'tag-format'), ['error']);
  assert.deepEqual(level(post('', { tags: '["github-action", "ok"]' }), 'tag-similar', { knownTags: new Set(['github-actions']) }), ['warning']);
  assert.deepEqual(level(post('', { tags: '["brand-new", "ok"]' }), 'tag-similar', { knownTags: new Set(['github-actions']) }), []);
});

test('link text and HTTPS', () => {
  assert.deepEqual(level(post('Read [here](https://example.org/a) now.'), 'link-text'), ['warning']);
  assert.deepEqual(level(post('Read [the guide](http://example.org/a) now.'), 'link-https'), ['warning']);
});

test('readability helpers', () => {
  assert.equal(syllables('cat'), 1);
  assert.equal(syllables('table'), 2);
  assert.equal(syllables('banana'), 3);
  const easy = ['The cat sat.', 'The dog ran.'];
  assert.ok(fleschKincaid(easy.join(' '), easy) < 3);
});
