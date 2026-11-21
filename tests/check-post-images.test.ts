import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { checkPostImages } from '../scripts/check-post-images.mjs';

const slug = 'sample-article-slug';

async function png(file: string, width: number, height: number) {
  writeFileSync(file, await sharp({ create: { width, height, channels: 3, background: '#15120E' } }).png().toBuffer());
}
async function webp(file: string, width: number) {
  writeFileSync(file, await sharp({ create: { width, height: Math.round(width / 2), channels: 3, background: '#15120E' } }).webp().toBuffer());
}

async function build(opts: { heroW?: number; heroH?: number; withWebp?: boolean; diagramW?: number } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'chkimg-'));
  const dir = path.join(root, 'assets/posts', slug);
  mkdirSync(dir, { recursive: true });
  await png(path.join(dir, 'hero.png'), opts.heroW ?? 1200, opts.heroH ?? 630);
  if (opts.withWebp !== false) {
    await webp(path.join(dir, 'hero.webp'), 1200);
    await webp(path.join(dir, 'hero-640.webp'), 640);
  }
  await png(path.join(dir, 'flow.png'), opts.diagramW ?? 800, 400);
  return root;
}
const cleanup = (d: string) => {
  try {
    rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    // best effort on Windows
  }
};
const fm = { heroImage: `/assets/posts/${slug}/hero.png` };
const body = `Text.\n\n![A flow diagram with three labelled steps.](/assets/posts/${slug}/flow.png)\n`;

test('a correct set of images passes', async () => {
  const root = await build();
  try {
    assert.deepEqual(await checkPostImages({ slug, frontmatter: fm, body, publicRoot: root }), []);
  } finally {
    cleanup(root);
  }
});

test('hero size, missing webp, wide diagram, and external or missing images are reported', async () => {
  const wrongHero = await build({ heroW: 1000, heroH: 500 });
  const noWebp = await build({ withWebp: false });
  const wide = await build({ diagramW: 2000 });
  try {
    assert.ok((await checkPostImages({ slug, frontmatter: fm, body, publicRoot: wrongHero })).some((p) => /1200x630/.test(p)));
    assert.ok((await checkPostImages({ slug, frontmatter: fm, body, publicRoot: noWebp })).some((p) => /Missing .*webp/.test(p)));
    assert.ok((await checkPostImages({ slug, frontmatter: fm, body, publicRoot: wide })).some((p) => /wide/.test(p)));
    const root = await build();
    try {
      const external = await checkPostImages({ slug, frontmatter: fm, body: '![External image of something useful here](https://evil.test/a.png)', publicRoot: root });
      assert.ok(external.some((p) => /self-hosted/.test(p)));
      const missing = await checkPostImages({ slug, frontmatter: fm, body: `![Another descriptive alt text here](/assets/posts/${slug}/nope.png)`, publicRoot: root });
      assert.ok(missing.some((p) => /not found/.test(p)));
      const traversal = await checkPostImages({ slug, frontmatter: fm, body: '![Traversal attempt with alt text](/assets/posts/other/../../x.png)', publicRoot: root });
      assert.ok(traversal.length > 0);
      assert.ok((await checkPostImages({ slug, frontmatter: {}, body: '', publicRoot: root })).some((p) => /No heroImage/.test(p)));
    } finally {
      cleanup(root);
    }
  } finally {
    cleanup(wrongHero);
    cleanup(noWebp);
    cleanup(wide);
  }
});
