#!/usr/bin/env node
/**
 * Image checks for articles (roadmap item P1-8).
 *
 * For each post: the hero exists and is 1200x630 (the Open Graph size) within the size budget, the
 * WebP variants exist, every in-article image is self-hosted under /assets/posts/<slug>/, exists, and
 * stays within the width and size budgets.
 *
 *   node scripts/check-post-images.mjs <slug> [...]
 *   node scripts/check-post-images.mjs --changed <base-ref>
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { parseFrontmatter } from '@astrojs/markdown-remark';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BUDGET = { heroPng: 450_000, heroWebp: 200_000, image: 400_000, maxWidth: 1600 };

/** Returns problems for one post. `publicRoot` is the folder that /assets/... maps into. */
export async function checkPostImages({ slug, frontmatter, body, publicRoot }) {
  const problems = [];
  const fail = (m) => problems.push(m);
  const abs = (webPath) => path.join(publicRoot, webPath.replace(/^\/+/, ''));
  const sizeOf = (f) => statSync(f).size;

  const hero = frontmatter.heroImage ? String(frontmatter.heroImage) : '';
  if (!hero) fail('No heroImage in the frontmatter.');
  else {
    if (!hero.startsWith(`/assets/posts/${slug}/`)) fail(`heroImage must live under /assets/posts/${slug}/.`);
    const file = abs(hero);
    if (!existsSync(file)) fail(`heroImage file not found: ${hero}`);
    else {
      const meta = await sharp(file).metadata();
      if (meta.width !== 1200 || meta.height !== 630) fail(`Hero is ${meta.width}x${meta.height}; it must be 1200x630 (the Open Graph size).`);
      if (sizeOf(file) > BUDGET.heroPng) fail(`Hero PNG is ${Math.round(sizeOf(file) / 1024)} KB; the budget is ${Math.round(BUDGET.heroPng / 1024)} KB.`);
      if (/\.png$/i.test(hero)) {
        const stem = hero.replace(/\.png$/i, '');
        for (const [variant, width] of [[`${stem}.webp`, 1200], [`${stem}-640.webp`, 640]]) {
          const vf = abs(variant);
          if (!existsSync(vf)) fail(`Missing ${variant}; run node scripts/generate-webp-heroes.mjs.`);
          else {
            const vm = await sharp(vf).metadata();
            if (vm.width !== width) fail(`${variant} is ${vm.width}px wide; expected ${width}.`);
            if (sizeOf(vf) > BUDGET.heroWebp) fail(`${variant} is ${Math.round(sizeOf(vf) / 1024)} KB; the budget is ${Math.round(BUDGET.heroWebp / 1024)} KB.`);
          }
        }
      }
    }
  }

  for (const m of body.matchAll(/!\[[^\]\n]{0,300}\]\(([^)\s]{1,300})[^)\n]{0,200}\)/g)) {
    const src = m[1];
    if (/^https?:|^\/\//i.test(src)) {
      fail(`In-article image must be self-hosted, not external: ${src}`);
      continue;
    }
    if (!src.startsWith(`/assets/posts/${slug}/`) || src.includes('..')) {
      fail(`In-article image must live under /assets/posts/${slug}/: ${src}`);
      continue;
    }
    const file = abs(src);
    if (!existsSync(file)) {
      fail(`In-article image not found: ${src}`);
      continue;
    }
    const meta = await sharp(file).metadata();
    if ((meta.width ?? 0) > BUDGET.maxWidth) fail(`${src} is ${meta.width}px wide; the maximum is ${BUDGET.maxWidth}.`);
    if (sizeOf(file) > BUDGET.image) fail(`${src} is ${Math.round(sizeOf(file) / 1024)} KB; the budget is ${Math.round(BUDGET.image / 1024)} KB.`);
  }
  return problems;
}

function changedSlugs(base) {
  if (!/^(?!-)[\w./-]+$/.test(base)) throw new Error('Invalid base ref');
  const out = execFileSync('git', ['diff', '--name-only', '--no-renames', '--diff-filter=ACM', `${base}...HEAD`, '--', 'src/content/posts', 'public/assets/posts'], { cwd: ROOT, encoding: 'utf8' });
  const slugs = new Set();
  for (const f of out.split('\n')) {
    const m = /^(?:src\/content\/posts|public\/assets\/posts)\/([a-z0-9-]+)\//.exec(f.trim());
    if (m && existsSync(path.join(ROOT, 'src/content/posts', m[1], 'index.mdx'))) slugs.add(m[1]);
  }
  return [...slugs];
}

async function main() {
  const args = process.argv.slice(2);
  const slugs = args[0] === '--changed' ? changedSlugs(args[1] ?? '') : args.length ? args : readdirSync(path.join(ROOT, 'src/content/posts'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  if (slugs.length === 0) {
    console.log('No posts to check.');
    return;
  }
  let failed = 0;
  for (const slug of slugs) {
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug: ${slug}`);
    const { frontmatter, content } = parseFrontmatter(readFileSync(path.join(ROOT, 'src/content/posts', slug, 'index.mdx'), 'utf8'));
    const problems = await checkPostImages({ slug, frontmatter, body: content, publicRoot: path.join(ROOT, 'public') });
    if (problems.length) {
      failed += 1;
      for (const p of problems) console.log(`::error file=src/content/posts/${slug}/index.mdx::[images] ${p}`);
    } else {
      console.log(`OK ${slug}`);
    }
  }
  if (failed) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.log(`::error::[images] ${err.message}`);
    process.exit(1);
  });
}
