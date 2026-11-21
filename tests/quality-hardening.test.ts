import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintPost } from '../scripts/lint-content.mjs';
import { checkBuiltPage } from '../scripts/check-built-post.mjs';

const filler = (n: number) => Array.from({ length: n }, (_, i) => `word${'abcdefg'[i % 7]}`).join(' ');

const j = (...parts: string[]) => parts.join('');

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
  return `---\n${head}\nfaq:\n${faq}\n---\n<Callout type="note">\nTL;DR: ${filler(50)}.\n</Callout>\n\n## Section one\n\n${paras}\n\n${extra}\n`;
}

const base = { slug: 'good-post-slug', fileExists: () => true };
const rules = (raw: string, ctx: Record<string, unknown> = {}, level = 'error') =>
  lintPost(raw, { ...base, ...ctx }).filter((f: { level: string }) => f.level === level).map((f: { rule: string }) => f.rule);

test('do-not-publish: heading variants, frontmatter leaks, short items, CRLF notes', () => {
  const run = (notes: string, article: string) => rules(article, { interviewNotes: notes }).includes('do-not-publish');
  const article = post('My client is Acme Corp and we met in Denver.');
  assert.ok(run('## Do not publish\n- Acme Corp\n', article), 'short item');
  assert.ok(run('## Do not publish:\n- Acme Corp\n', article), 'heading with a colon');
  assert.ok(run('### Do Not Publish (private)\r\n- Acme Corp\r\n', article), 'CRLF and suffix');
  assert.ok(run('## Do not publish\n- Acme Corp\n', post('Something else.', { description: '"A summary that names Acme Corp in the frontmatter, padded out to look like a real description text."' })), 'frontmatter leak');
  assert.ok(!run('## Do not publish\n- Acme Corp\n\n## Other\n- fine\n', post('Nothing sensitive here at all.')));
  assert.ok(!run('## Other\n- Acme Corp\n', article), 'items outside the section do not count');
  assert.ok(!run('## Do not publish\n- Acme Corp\n', post('The word Acmeism is unrelated.')), 'word boundaries');
});

test('emails: common non-email shapes are not errors', () => {
  for (const ok of ['Clone with git@github.com:owner/repo.git now.', 'Use the hero@2x.png image.', 'Mail hello@probl.me today.']) {
    assert.ok(!rules(post(ok)).includes('sensitive-email'), ok);
  }
  assert.ok(rules(post('Write to jane@private-company.io please.')).includes('sensitive-email'));
});

test('credential patterns: real formats are errors; prefix mentions and placeholders are not', () => {
  const secrets = [
    j('sk-', 'ant-api03-abcdefghijklmnopqrstuvwxyz0123'),
    j('sk-', 'proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD'),
    j('AI', 'zaSyA1234567890abcdefghijklmnopqrstuvw'),
    j('xo', 'xb-1234567890-abcdefghij'),
    j('np', 'm_abcdefghijklmnopqrstuvwxyz0123456789'),
    j('sk_', 'live_abcdefghijklmnopqrstuvwx'),
    j('github_', 'pat_11ABCDEFG0123456789abcdef'),
    'api_key = "abcdef0123456789abcdef"',
    'postgres://admin:hunter2pass@db.internal/app',
  ];
  for (const s of secrets) assert.ok(rules(post(`Here is ${s} for you.`)).includes('secret-pattern'), s);
  for (const ok of ['The sk-ant- prefix marks Anthropic keys.', 'Set api_key = "your_api_key_here" first.', 'Token sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx is a placeholder.']) {
    assert.ok(!rules(post(ok)).includes('secret-pattern'), ok);
  }
});

test('phone numbers are a warning, not an error', () => {
  assert.ok(!rules(post('Order 415-555-0134 shipped.')).includes('sensitive-phone'));
  assert.ok(rules(post('Order 415-555-0134 shipped.'), {}, 'warning').includes('sensitive-phone'));
});

test('a neighbour post with non-string fields does not crash the lint', () => {
  const others = [{ slug: 'odd', title: 2026, primaryKeyword: 42, prose: 'x' }];
  assert.doesNotThrow(() => lintPost(post('', { primaryKeyword: '"keyword"' }), { ...base, otherPosts: others }));
});

test('hostile input stays fast and does not crash', () => {
  const cases: Record<string, string> = {
    'link brackets': '[](' .repeat(10000),
    'apostrophes': "a'".repeat(15000),
    'one long token': 'a'.repeat(30000),
    'whitespace run': ' '.repeat(30000),
    'many unknown words': Array.from({ length: 1500 }, (_, i) => `qzx${i}kvw`).join(' '),
    'many at-signs': 'a'.repeat(5000) + '@'.repeat(5000),
  };
  for (const [name, text] of Object.entries(cases)) {
    const start = Date.now();
    assert.doesNotThrow(() => lintPost(post(text), base), name);
    assert.ok(Date.now() - start < 5000, `${name} took ${Date.now() - start} ms`);
  }
});

test('missing optional fields and an empty-ish body do not crash', () => {
  assert.doesNotThrow(() => lintPost('---\ntitle: "x"\n---\n', base));
  assert.doesNotThrow(() => lintPost(post('').replace(/faq:[\s\S]*?---\n/, '---\n'), base));
});

test('built-page checker reports an invalid date instead of crashing', () => {
  const html = '<script type="application/ld+json">{"@type":"BlogPosting","headline":"t","description":"d","datePublished":"x","dateModified":"x","url":"https://probl.me/blog/s/","author":{"name":"R"}}</script>';
  const problems = checkBuiltPage({ slug: 's', frontmatter: { title: 't', description: 'd', date: 'not-a-date' }, html, sitemap: '', rss: '', llms: '' });
  assert.ok(problems.some((p: string) => /not a valid date/.test(p)));
});
