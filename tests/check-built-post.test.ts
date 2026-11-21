import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBuiltPage } from '../scripts/check-built-post.mjs';

const slug = 'my-test-article';
const url = `https://probl.me/blog/${slug}/`;
const fm = {
  title: 'My Test Article',
  description: "A description with an apostrophe isn't a problem.",
  date: '2026-11-24',
  faq: [
    { question: 'One?', answer: 'a' },
    { question: 'Two?', answer: 'b' },
  ],
};

function ld(obj: unknown) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function page(over: { html?: (h: string) => string } = {}) {
  const author = { '@type': 'Person', name: 'Richard' };
  let html = [
    '<html><head>',
    `<link rel="canonical" href="${url}">`,
    '<meta property="og:image" content="https://probl.me/assets/posts/x/hero.png">',
    '<meta name="description" content="A description with an apostrophe isn&#39;t a problem.">',
    ld({ '@type': 'BlogPosting', headline: fm.title, description: fm.description, datePublished: '2026-11-24T00:00:00.000Z', dateModified: '2026-11-24T00:00:00.000Z', url, author }),
    ld({ '@type': 'BreadcrumbList', itemListElement: [{}, {}, {}] }),
    ld({ '@type': 'FAQPage', mainEntity: [{}, {}] }),
    '</head><body><h1>My Test Article</h1></body></html>',
  ].join('\n');
  if (over.html) html = over.html(html);
  return html;
}

const files = { sitemap: `<loc>${url}</loc>`, rss: `<link>/blog/${slug}/</link>`, llms: `(https://probl.me/blog/${slug}/)` };
const check = (html: string, extra: Record<string, unknown> = {}) =>
  checkBuiltPage({ slug, frontmatter: fm, html, ...files, ...extra });

test('a correct page has no problems', () => {
  assert.deepEqual(check(page()), []);
});

test('missing or mismatched structured data is reported', () => {
  assert.ok(check(page({ html: (h) => h.replace('BlogPosting', 'Article') })).some((p) => /BlogPosting/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('My Test Article', 'Changed') })).some((p) => /headline/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('FAQPage', 'Other') })).some((p) => /FAQPage/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('"mainEntity":[{},{}]', '"mainEntity":[{}]') })).some((p) => /2/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('2026-11-24T00:00:00.000Z', '2026-01-01T00:00:00.000Z') })).some((p) => /datePublished/.test(p)));
});

test('canonical, og:image, description, h1 and robots', () => {
  assert.ok(check(page({ html: (h) => h.replace(url, 'https://probl.me/blog/other/') })).some((p) => /anonical|url/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('https://probl.me/assets', '/assets') })).some((p) => /og:image/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('A description with', 'Another description with') })).some((p) => /Meta description/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('<h1>', '<h1>x</h1><h1>') })).some((p) => /h1/.test(p)));
  assert.ok(check(page({ html: (h) => h.replace('</head>', '<meta name="robots" content="noindex"></head>') })).some((p) => /noindex/.test(p)));
});

test('the post must be in the sitemap, rss and llms.txt', () => {
  assert.ok(check(page(), { sitemap: '' }).some((p) => /sitemap/.test(p)));
  assert.ok(check(page(), { rss: '' }).some((p) => /rss/.test(p)));
  assert.ok(check(page(), { llms: '' }).some((p) => /llms/.test(p)));
});
