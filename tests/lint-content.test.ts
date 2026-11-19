import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintPost } from '../scripts/lint-content.mjs';

const filler = (n: number, seed = 'word') =>
  Array.from({ length: n }, (_, i) => `${seed}${i % 7}`).join(' ');
const sentence = (n: number) => `Start ${filler(n - 2)} end.`;

/** A post that passes every rule. Tests break one thing at a time. */
function goodPost(over: { front?: Record<string, string>; body?: string } = {}) {
  const front: Record<string, string> = {
    title: '"' + 'T'.repeat(55) + '"',
    description: '"' + 'D'.repeat(155) + '"',
    category: 'tech-tools',
    tags: '["one", "two", "three"]',
    date: '2026-11-24',
    readTime: '"7 min"',
    ...over.front,
  };
  const faq = Array.from({ length: 3 }, (_, i) =>
    `  - question: "Question ${i}?"\n    answer: "${filler(50, 'ans')}"`,
  ).join('\n');
  const frontText = Object.entries(front).map(([k, v]) => `${k}: ${v}`).join('\n');
  const paragraphs = Array.from({ length: 70 }, () => `${sentence(10)} ${sentence(8)}`).join('\n\n');
  const body =
    over.body ??
    `<Callout type="note">\nTL;DR: ${filler(50, 'tl')}.\n</Callout>\n\n## First section\n\n${paragraphs}\n\n### Detail\n\nMore text here.\n`;
  return `---\n${frontText}\nfaq:\n${faq}\n---\n${body}`;
}

const ctx = { slug: 'good-post-slug', fileExists: () => true };
const rules = (raw: string, level = 'error') =>
  lintPost(raw, ctx).filter((f: { level: string }) => f.level === level).map((f: { rule: string }) => f.rule);

test('a well-formed post has no errors', () => {
  assert.deepEqual(rules(goodPost()), []);
});

test('em dash is an error', () => {
  assert.ok(rules(goodPost({ body: goodPost().split('---\n')[2] + '\nThis — is wrong.\n' })).includes('em-dash'));
});

test('em dash inside a code fence is ignored', () => {
  const body = goodPost().split('---\n')[2] + '\n```\na — b\n```\n';
  assert.ok(!rules(goodPost({ body })).includes('em-dash'));
});

test('en dash allowed in numeric ranges, including percent ranges', () => {
  const body = goodPost().split('---\n')[2] + '\nUse 1,200–2,500 words and 24.3%–31.8% rates.\n';
  assert.ok(!rules(goodPost({ body })).includes('en-dash'));
});

test('en dash between words is an error', () => {
  const body = goodPost().split('---\n')[2] + '\nThis – is wrong.\n';
  assert.ok(rules(goodPost({ body })).includes('en-dash'));
});

test('banned phrases are errors, including curly apostrophes', () => {
  const body = goodPost().split('---\n')[2] + '\nIt’s no secret that we leverage a game-changer.\n';
  const found = lintPost(goodPost({ body }), ctx).filter((f: { rule: string }) => f.rule === 'banned-phrase');
  assert.ok(found.length >= 3);
});

test('skipped heading level and H4 are errors; body H1 is an error', () => {
  const base = goodPost().split('---\n')[2];
  assert.ok(rules(goodPost({ body: base + '\n#### Deep\n' })).includes('heading'));
  assert.ok(rules(goodPost({ body: base + '\n# Another title\n' })).includes('heading'));
  assert.ok(rules(goodPost({ body: base.replace('## First section', '### First section') })).includes('heading'));
});

test('image without alt text is an error', () => {
  const body = goodPost().split('---\n')[2] + '\n![](/assets/x.png)\n';
  assert.ok(rules(goodPost({ body })).includes('alt-text'));
});

test('missing TL;DR is an error', () => {
  const base = goodPost().split('---\n')[2].replace(/TL;DR/, 'Summary');
  assert.ok(rules(goodPost({ body: base })).includes('tldr'));
});

test('too-short body is an error', () => {
  const body = '<Callout type="note">\nTL;DR: short.\n</Callout>\n\n## Only\n\nTiny.\n';
  assert.ok(rules(goodPost({ body })).includes('word-count'));
});

test('bad category, tag count, and FAQ count are errors', () => {
  assert.ok(rules(goodPost({ front: { category: 'misc' } })).includes('category'));
  assert.ok(rules(goodPost({ front: { tags: '["only"]' } })).includes('tags'));
  const noFaq = goodPost().replace(/faq:[\s\S]*?---\n/, '---\n');
  assert.ok(rules(noFaq).includes('faq'));
});

test('missing hero file is an error; missing webp only warns', () => {
  const raw = goodPost({ front: { heroImage: '/assets/posts/x/hero.png' } });
  assert.ok(lintPost(raw, { slug: 'good-post-slug', fileExists: () => false }).some((f: { rule: string; level: string }) => f.rule === 'hero' && f.level === 'error'));
  const onlyPng = (p: string) => p.endsWith('.png');
  const found = lintPost(raw, { slug: 'good-post-slug', fileExists: onlyPng });
  assert.ok(found.some((f: { rule: string; level: string }) => f.rule === 'hero-webp' && f.level === 'warning'));
  assert.ok(!found.some((f: { level: string }) => f.level === 'error'));
});

test('slug rules', () => {
  const bad = lintPost(goodPost(), { slug: 'Bad_Slug', fileExists: () => true });
  assert.ok(bad.some((f: { rule: string; level: string }) => f.rule === 'slug' && f.level === 'error'));
  const dated = lintPost(goodPost(), { slug: 'post-2026-11-24-thing', fileExists: () => true });
  assert.ok(dated.some((f: { rule: string; level: string }) => f.rule === 'slug' && f.level === 'error'));
});

test('long sentences and paragraphs only warn', () => {
  const base = goodPost().split('---\n')[2];
  const body = base + `\n${sentence(40)}\n\n${Array.from({ length: 5 }, () => sentence(6)).join(' ')}\n`;
  const raw = goodPost({ body });
  assert.ok(rules(raw, 'warning').includes('sentence-length'));
  assert.ok(rules(raw, 'warning').includes('paragraph-length'));
  assert.deepEqual(rules(raw), []);
});

test('em dash in a link URL or an import line is ignored', () => {
  const base = goodPost().split('---\n')[2];
  const body = base + '\nSee [a page](https://example.com/a—b) for more.\n';
  assert.ok(!rules(goodPost({ body })).includes('em-dash'));
});

test('em dash in frontmatter is an error', () => {
  assert.ok(rules(goodPost({ front: { title: '"Title — with a dash padded out to fifty-five chars"' } })).includes('em-dash'));
});

test('CRLF files lint the same as LF files', () => {
  assert.deepEqual(rules(goodPost().replace(/\n/g, '\r\n')), []);
});

test('a file with no frontmatter reports errors instead of crashing', () => {
  const found = rules('Just some text with no frontmatter.\n');
  assert.ok(found.includes('frontmatter'));
});

test('oversized files are rejected quickly', () => {
  const start = Date.now();
  assert.ok(rules('x'.repeat(600_000)).includes('file-size'));
  assert.ok(Date.now() - start < 1000);
});

test('unclosed code fence warns', () => {
  const body = goodPost().split('---\n')[2] + '\n```\nnever closed\n';
  assert.ok(rules(goodPost({ body }), 'warning').includes('code-fence'));
});

test('out-of-range TL;DR length only warns', () => {
  const base = goodPost().split('---\n')[2].replace(/TL;DR: [^\n]*/, 'TL;DR: Too short.');
  assert.ok(rules(goodPost({ body: base }), 'warning').includes('tldr'));
  assert.ok(!rules(goodPost({ body: base })).includes('tldr'));
});
