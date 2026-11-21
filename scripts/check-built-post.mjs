#!/usr/bin/env node
/**
 * Built-page checks for articles (roadmap item P2-6).
 *
 * After `npm run build`, verifies that the page the site actually generated for a post matches its
 * frontmatter and carries the structured data, canonical, feeds and sitemap entry that search and AI
 * engines rely on:
 *   - JSON-LD: BlogPosting (headline, description, dates, author, url), BreadcrumbList, and FAQPage
 *     when the post has a faq
 *   - one canonical link, one h1, an absolute og:image, a meta description equal to the frontmatter
 *   - no noindex on a post page
 *   - the post appears in sitemap, rss.xml and llms.txt
 *
 *   node scripts/check-built-post.mjs <slug> [...]
 *   node scripts/check-built-post.mjs --changed <base-ref>      (posts a PR adds or changes)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { parseFrontmatter } from '@astrojs/markdown-remark';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://probl.me';

/** Returns a list of problems for one built post page. Pure: all inputs are passed in. */
export function checkBuiltPage({ slug, frontmatter, html, sitemap, rss, llms }) {
  const problems = [];
  const url = `${SITE}/blog/${slug}/`;
  const fail = (m) => problems.push(m);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
    try {
      return JSON.parse(m[1]);
    } catch {
      fail('A JSON-LD block is not valid JSON.');
      return null;
    }
  }).filter(Boolean);
  const byType = (t) => blocks.find((b) => b['@type'] === t);

  const post = byType('BlogPosting');
  if (!post) fail('Missing BlogPosting JSON-LD.');
  else {
    if (post.headline !== frontmatter.title) fail(`BlogPosting headline "${post.headline}" does not match the title.`);
    if (post.description !== frontmatter.description) fail('BlogPosting description does not match the frontmatter description.');
    const parsed = new Date(frontmatter.date);
    if (Number.isNaN(parsed.valueOf())) fail(`The frontmatter date "${frontmatter.date}" is not a valid date.`);
    else {
      const date = parsed.toISOString().slice(0, 10);
      if (!String(post.datePublished ?? '').startsWith(date)) fail(`BlogPosting datePublished "${post.datePublished}" does not match date ${date}.`);
    }
    if (!post.dateModified) fail('BlogPosting is missing dateModified.');
    if (post.url !== url) fail(`BlogPosting url should be ${url}.`);
    if (!post.author?.name) fail('BlogPosting is missing an author name.');
  }

  const crumbs = byType('BreadcrumbList');
  if (!crumbs || !Array.isArray(crumbs.itemListElement) || crumbs.itemListElement.length < 2) fail('Missing or short BreadcrumbList JSON-LD.');

  const faq = Array.isArray(frontmatter.faq) ? frontmatter.faq : [];
  const faqLd = byType('FAQPage');
  if (faq.length > 0) {
    if (!faqLd) fail('The post has a faq but the page has no FAQPage JSON-LD.');
    else if ((faqLd.mainEntity ?? []).length !== faq.length) fail(`FAQPage has ${(faqLd.mainEntity ?? []).length} questions; the frontmatter has ${faq.length}.`);
  } else if (faqLd) {
    fail('FAQPage JSON-LD present without a faq in the frontmatter.');
  }

  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  if (canon.length !== 1) fail(`Expected one canonical link, found ${canon.length}.`);
  else if (canon[0] !== url) fail(`Canonical is ${canon[0]}; expected ${url}.`);

  const og = /property="og:image" content="([^"]+)"/.exec(html)?.[1];
  if (!og) fail('Missing og:image.');
  else if (!/^https:\/\//.test(og)) fail(`og:image must be an absolute https URL, got ${og}.`);

  const desc = /name="description" content="([^"]*)"/.exec(html)?.[1];
  if (desc === undefined) fail('Missing meta description.');
  else if (desc.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&') !== frontmatter.description) fail('Meta description does not match the frontmatter description.');

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) fail(`Expected exactly one h1, found ${h1}.`);
  if (/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) fail('A post page must not be noindex.');

  if (!sitemap.includes(url)) fail('Not in the sitemap.');
  if (!rss.includes(`/blog/${slug}/`)) fail('Not in rss.xml.');
  if (!llms.includes(`/blog/${slug}/`)) fail('Not in llms.txt.');
  return problems;
}

function changedSlugs(base) {
  if (!/^(?!-)[\w./-]+$/.test(base)) throw new Error('Invalid base ref');
  const out = execFileSync('git', ['diff', '--name-only', '--no-renames', '--diff-filter=ACM', `${base}...HEAD`, '--', 'src/content/posts'], { cwd: ROOT, encoding: 'utf8' });
  const slugs = new Set();
  for (const f of out.split('\n')) {
    const m = /^src\/content\/posts\/([a-z0-9-]+)\//.exec(f.trim());
    if (m && existsSync(path.join(ROOT, 'src/content/posts', m[1], 'index.mdx'))) slugs.add(m[1]);
  }
  return [...slugs];
}

function main() {
  const args = process.argv.slice(2);
  const slugs = args[0] === '--changed' ? changedSlugs(args[1] ?? '') : args.length ? args : readdirSync(path.join(ROOT, 'src/content/posts'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  if (slugs.length === 0) {
    console.log('No posts to check.');
    return;
  }
  const dist = path.join(ROOT, 'dist');
  const read = (f) => (existsSync(path.join(dist, f)) ? readFileSync(path.join(dist, f), 'utf8') : '');
  const sitemap = read('sitemap-0.xml');
  const rss = read('rss.xml');
  const llms = read('llms.txt');
  let failed = 0;
  for (const slug of slugs) {
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug: ${slug}`);
    const htmlFile = path.join(dist, 'blog', slug, 'index.html');
    if (!existsSync(htmlFile)) {
      console.log(`::error::${slug}: no built page at dist/blog/${slug}/index.html (run npm run build first; future-dated posts need INCLUDE_FUTURE_POSTS=true)`);
      failed += 1;
      continue;
    }
    const { frontmatter } = parseFrontmatter(readFileSync(path.join(ROOT, 'src/content/posts', slug, 'index.mdx'), 'utf8'));
    const problems = checkBuiltPage({ slug, frontmatter, html: readFileSync(htmlFile, 'utf8'), sitemap, rss, llms });
    if (problems.length) {
      failed += 1;
      for (const p of problems) console.log(`::error file=src/content/posts/${slug}/index.mdx::[built-page] ${p}`);
    } else {
      console.log(`OK ${slug}`);
    }
  }
  if (failed) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
