import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { checkAlt, checkManifest, updateArticle } from '../scripts/process-images.mjs';

const script = path.resolve('scripts/process-images.mjs');
// Windows can hold image files open for a moment after sharp reads them; cleanup is best effort.
const cleanup = (dir: string) => {
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    // temp files are cleared by the OS
  }
};
const NS = 'xmlns="http://www.w3.org/2000/svg"';
const heroSvg = `<svg ${NS} viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#15120E"/><circle cx="600" cy="315" r="120" fill="#F2A24B"/></svg>`;
const diagramSvg = `<svg ${NS} viewBox="0 0 800 400"><rect width="800" height="400" fill="#1C1812"/><text x="40" y="80" font-family="sans-serif" font-size="32" fill="#F4EFE6">Flow</text></svg>`;
const ALT = 'A flow diagram with three labelled steps from interview to published article.';

const article = `---
title: "A title"
description: "A description"
category: tech-tools
tags: ["one", "two"]
date: 2026-11-24
readTime: "7 min"
---

Intro paragraph.

[IMAGE - a diagram of the flow]

More text.

\`\`\`
[IMAGE - inside a fence stays]
\`\`\`
`;

function setup(manifest: unknown, files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), 'procimg-'));
  const slug = 'sample-article-slug';
  mkdirSync(path.join(root, 'src/content/posts', slug), { recursive: true });
  writeFileSync(path.join(root, 'src/content/posts', slug, 'index.mdx'), article);
  const dir = path.join(root, 'tmp-images');
  mkdirSync(dir);
  writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(dir, name), text);
  return { root, slug, dir };
}
const run = (root: string, slug: string, dir: string) =>
  spawnSync('node', [script, '--slug', slug, '--dir', dir], { cwd: root, encoding: 'utf8', env: { ...process.env, NODE_PATH: path.resolve('node_modules') } });

test('alt text rules', () => {
  assert.equal(checkAlt(ALT), null);
  assert.ok(checkAlt('short'));
  assert.ok(checkAlt('Image of a diagram showing the three stages of the pipeline here.'));
  assert.ok(checkAlt('A diagram [with brackets] describing the pipeline stages for readers.'));
  assert.ok(checkAlt('See https://example.com for a diagram of the pipeline stages please.'));
});

test('manifest rules', () => {
  const [ok] = checkManifest({ hero: { file: 'hero.svg', alt: ALT }, images: [{ file: 'flow.svg', alt: ALT }] });
  assert.deepEqual(ok, []);
  assert.ok(checkManifest({ images: [] })[0].length > 0);
  assert.ok(checkManifest({ hero: { file: '../hero.svg', alt: ALT } })[0].length > 0);
  assert.ok(checkManifest({ hero: { file: 'hero.svg', alt: ALT }, images: [{ file: 'hero.svg', alt: ALT }] })[0].length > 0);
  assert.ok(checkManifest({ hero: { file: 'hero.svg', alt: ALT }, images: [{ file: 'Bad Name.svg', alt: ALT }] })[0].length > 0);
});

test('updateArticle sets hero fields and fills placeholders in order, skipping fences', () => {
  const entries = [
    { kind: 'hero', file: 'hero.svg', alt: ALT, name: 'hero' },
    { kind: 'diagram', file: 'flow.svg', alt: ALT, name: 'flow' },
    { kind: 'diagram', file: 'extra.svg', alt: ALT, name: 'extra' },
  ];
  const r = updateArticle(article, 'sample-article-slug', entries);
  assert.match(r.mdx, /heroImage: \/assets\/posts\/sample-article-slug\/hero\.png/);
  assert.match(r.mdx, /imageCredit: "AI-generated with Claude"/);
  assert.match(r.mdx, /!\[A flow diagram[^\]]*\]\(\/assets\/posts\/sample-article-slug\/flow\.png\)/);
  assert.match(r.mdx, /\[IMAGE - inside a fence stays\]/);
  assert.deepEqual(r.placed, ['flow.svg']);
  assert.deepEqual(r.unplaced, ['extra.svg']);
  // idempotent on the frontmatter fields
  assert.equal((updateArticle(r.mdx, 'sample-article-slug', entries).mdx.match(/^heroImage:/gm) ?? []).length, 1);
});

test('end to end: valid SVGs become sized PNG and WebP files and a rewritten article', async () => {
  const { root, slug, dir } = setup(
    { hero: { file: 'hero.svg', alt: ALT }, images: [{ file: 'flow.svg', alt: ALT }] },
    { 'hero.svg': heroSvg, 'flow.svg': diagramSvg },
  );
  try {
    const result = run(root, slug, dir);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const pub = path.join(root, 'public/assets/posts', slug);
    const hero = await sharp(path.join(pub, 'hero.png')).metadata();
    assert.equal(hero.width, 1200);
    assert.equal(hero.height, 630);
    assert.equal((await sharp(path.join(pub, 'hero-640.webp')).metadata()).width, 640);
    assert.equal((await sharp(path.join(pub, 'flow.png')).metadata()).width, 800);
    assert.ok(existsSync(path.join(root, 'src/content/posts', slug, 'images/flow.svg')));
    const mdx = readFileSync(path.join(root, 'src/content/posts', slug, 'index.mdx'), 'utf8');
    assert.match(mdx, /!\[A flow diagram/);
    assert.match(mdx, /heroImage:/);
  } finally {
    cleanup(root);
  }
});

test('an unsafe SVG fails the run and writes nothing', () => {
  const { root, slug, dir } = setup(
    { hero: { file: 'hero.svg', alt: ALT }, images: [{ file: 'flow.svg', alt: ALT }] },
    { 'hero.svg': heroSvg, 'flow.svg': `<svg ${NS} viewBox="0 0 800 400"><script>alert(1)</script></svg>` },
  );
  try {
    const result = run(root, slug, dir);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /not allowed/);
    assert.equal(existsSync(path.join(root, 'public/assets/posts', slug, 'hero.png')), false);
    assert.match(readFileSync(path.join(root, 'src/content/posts', slug, 'index.mdx'), 'utf8'), /\[IMAGE - a diagram/);
  } finally {
    cleanup(root);
  }
});

test('bad manifest, missing file and invalid slug fail cleanly', () => {
  const a = setup({ hero: { file: 'hero.svg', alt: 'short' } }, { 'hero.svg': heroSvg });
  const b = setup({ hero: { file: 'hero.svg', alt: ALT } }, {});
  try {
    assert.equal(run(a.root, a.slug, a.dir).status, 1);
    assert.equal(run(b.root, b.slug, b.dir).status, 1);
    assert.equal(run(a.root, 'Bad_Slug', a.dir).status, 1);
  } finally {
    cleanup(a.root);
    cleanup(b.root);
  }
});

test('alt text cannot carry MDX, markdown, entities or newlines', () => {
  for (const bad of [
    'A diagram {process.env.SECRET} describing the pipeline stages for readers.',
    'A diagram with a break\nimport x from "y" describing the pipeline stages.',
    'A diagram with an <script> tag describing the pipeline stages for readers.',
    'A diagram with an entity &#123; describing the pipeline stages for readers.',
    'A diagram with ${template} describing the pipeline stages for readers.',
    'A diagram with `code` describing the pipeline stages for readers.',
  ]) {
    assert.ok(checkAlt(bad), JSON.stringify(bad));
  }
  assert.equal(checkAlt("It's a flow: interview, research, draft & review (4 steps) - 100% automatic."), checkAlt("It's a flow: interview, research, draft & review (4 steps) - 100% automatic."));
});

test('a diagram without a placeholder is dropped, and existing files are never overwritten', async () => {
  const { root, slug, dir } = setup(
    { hero: { file: 'hero.svg', alt: ALT }, images: [{ file: 'flow.svg', alt: ALT }, { file: 'orphan.svg', alt: ALT }] },
    { 'hero.svg': heroSvg, 'flow.svg': diagramSvg, 'orphan.svg': diagramSvg },
  );
  try {
    const first = run(root, slug, dir);
    assert.equal(first.status, 0, first.stdout + first.stderr);
    assert.equal(existsSync(path.join(root, 'public/assets/posts', slug, 'orphan.png')), false);
    assert.equal(existsSync(path.join(root, 'src/content/posts', slug, 'images/orphan.svg')), false);
    const second = run(root, slug, dir);
    assert.equal(second.status, 1);
    assert.match(second.stdout, /refusing to overwrite/);
  } finally {
    cleanup(root);
  }
});
