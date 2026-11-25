#!/usr/bin/env node
/**
 * Turn the Image Creator's SVGs into the images an article ships with (roadmap items P1-2 to P1-4).
 *
 *   node scripts/process-images.mjs --slug <slug> --dir <folder with manifest.json and the SVGs>
 *
 * The Image Creator is a model run with no shell, so everything it produced is untrusted. This script,
 * which is plain code, does the rest:
 *   1. validates manifest.json (hero + diagrams, file names, alt text)
 *   2. validates every SVG against the strict allowlist in scripts/lib/svg-safety.mjs
 *   3. rasterises with sharp (hero 1200x630 PNG plus WebP 1200 and 640; diagrams as PNG) and checks
 *      the file-size budgets
 *   4. writes the PNG and WebP files to public/assets/posts/<slug>/ and the validated source SVGs to
 *      src/content/posts/<slug>/images/
 *   5. sets heroImage and imageCredit in the article frontmatter and replaces each
 *      "[IMAGE - ...]" placeholder line, in order, with a markdown image and the manifest's alt text
 *
 * manifest.json: { "hero": { "file": "hero.svg", "alt": "..." },
 *                  "images": [ { "file": "flow.svg", "alt": "..." } ] }
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { validateSvg } from './lib/svg-safety.mjs';

const FILE = /^[a-z0-9]+(?:-[a-z0-9]+){0,5}\.svg$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){2,5}$/;
const MAX_IMAGES = 8;
const BUDGET = { hero: 450_000, diagram: 400_000, webp: 200_000 }; // bytes
const CREDIT = 'AI-generated with Claude';

/** Alt text is plain descriptive text on one line, from a small safe character set (it ends up in MDX). */
export function checkAlt(alt) {
  if (typeof alt !== 'string') return 'alt text is missing';
  const t = alt.trim();
  if (t.length < 20 || t.length > 250) return `alt text is ${t.length} characters; use 20 to 250`;
  if (!/^[A-Za-z0-9 ,.;:'"%&+\-?!/]+$/.test(t)) return 'alt text may use only letters, numbers, spaces and , . ; : \' " % & + - ? ! / on a single line (no brackets, braces, angle brackets, links or markdown)';
  if (/&#|https?:|www\.|\/\//.test(t)) return 'alt text must not contain links or character references';
  if (/^(image|picture|photo|graphic|diagram|screenshot)\s+of\b/i.test(t)) return 'alt text should describe what the image shows, not start with "image of"';
  return null;
}

/** Validate the manifest object. Returns [problems, entries]. */
export function checkManifest(manifest, { heroOptional = false } = {}) {
  const problems = [];
  const entries = [];
  if (!manifest || typeof manifest !== 'object') return [['manifest.json is not an object'], entries];
  const hero = manifest.hero;
  if (!hero && heroOptional) {
    // A revision that does not touch the hero.
  } else if (!hero || !FILE.test(String(hero.file ?? ''))) problems.push('manifest.hero.file must be a lowercase-hyphen .svg name');
  else {
    const altProblem = checkAlt(hero.alt);
    if (altProblem) problems.push(`hero: ${altProblem}`);
    entries.push({ kind: 'hero', file: hero.file, alt: String(hero.alt ?? '').trim(), name: 'hero' });
  }
  const images = Array.isArray(manifest.images) ? manifest.images : [];
  if (images.length > MAX_IMAGES) problems.push(`at most ${MAX_IMAGES} in-article images`);
  const seen = new Set(['hero.svg']);
  for (const img of images.slice(0, MAX_IMAGES)) {
    const file = String(img?.file ?? '');
    if (!FILE.test(file) || seen.has(file)) {
      problems.push(`image file "${file.slice(0, 40)}" must be a unique lowercase-hyphen .svg name other than hero.svg`);
      continue;
    }
    seen.add(file);
    const altProblem = checkAlt(img.alt);
    if (altProblem) problems.push(`${file}: ${altProblem}`);
    entries.push({ kind: 'diagram', file, alt: String(img.alt ?? '').trim(), name: file.replace(/\.svg$/, '') });
  }
  return [problems, entries];
}

/** Number of [IMAGE ...] placeholder lines outside code fences. */
export function countPlaceholders(mdx) {
  let inFence = false;
  let n = 0;
  for (const line of mdx.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    else if (!inFence && /^\[IMAGE\b[^\]]*\]\s*$/.test(line)) n += 1;
  }
  return n;
}

/** True if the hero WebP files already exist. */
function e0(outputs, publicDir) {
  return outputs.some(({ e }) => e.kind === 'hero') && ['hero.webp', 'hero-640.webp'].some((f) => existsSync(path.join(publicDir, f)));
}

const cleanAlt = (alt) => alt.replace(/[\r\n{}<>\[\]()`*_#|\\]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Set heroImage and imageCredit in the frontmatter, and fill [IMAGE ...] placeholders in order.
 *
 * Revise mode (`revise: true`, the owner's `@claude revise`): the frontmatter is left alone, only the
 * entries listed in `fresh` fill placeholders, and every entry in `replaced` updates the alt text of the
 * existing image line that already points at /assets/posts/<slug>/<name>.png.
 */
export function updateArticle(mdx, slug, entries, { revise = false, fresh = null, replaced = [] } = {}) {
  const text = mdx.replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  if (lines[0] !== '---') throw new Error('Article has no frontmatter.');
  const end = lines.indexOf('---', 1);
  if (end === -1) throw new Error('Article frontmatter is not closed.');
  let fm = lines.slice(1, end);
  if (!revise) {
    fm = fm.filter((l) => !/^(heroImage|imageCredit):/.test(l));
    const readTime = fm.findIndex((l) => /^readTime:/.test(l));
    const insertAt = readTime === -1 ? fm.length : readTime + 1;
    fm.splice(insertAt, 0, `heroImage: /assets/posts/${slug}/hero.png`, `imageCredit: "${CREDIT}"`);
  }

  const body = lines.slice(end + 1);
  const diagrams = (fresh ?? entries).filter((e) => e.kind === 'diagram');
  const altUpdates = new Map(replaced.filter((e) => e.kind === 'diagram').map((e) => [`/assets/posts/${slug}/${e.name}.png`, cleanAlt(e.alt)]));
  const altDone = new Set();
  let next = 0;
  let inFence = false;
  const placedFiles = [];
  const out = body.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) return line;
    if (next < diagrams.length && /^\[IMAGE\b[^\]]*\]\s*$/.test(line)) {
      const d = diagrams[next];
      next += 1;
      placedFiles.push(d.file);
      return `![${cleanAlt(d.alt)}](/assets/posts/${slug}/${d.name}.png)`;
    }
    if (altUpdates.size && line.startsWith('![')) {
      for (const [url, alt] of altUpdates) {
        if (line.endsWith(`](${url})`)) {
          altDone.add(url);
          return `![${alt}](${url})`;
        }
      }
    }
    return line;
  });
  return {
    mdx: ['---', ...fm, '---', ...out].join('\n'),
    placed: placedFiles,
    unplaced: diagrams.slice(next).map((d) => d.file),
    altMissing: [...altUpdates.keys()].filter((u) => !altDone.has(u)),
  };
}

async function render(svg, entry, size) {
  const png = await sharp(Buffer.from(svg), { density: 192 })
    .resize(size.width, size.height, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return png;
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i === -1 ? '' : args[i + 1] ?? '';
  };
  const slug = get('--slug');
  const dir = path.resolve(get('--dir'));
  if (!SLUG.test(slug)) throw new Error('Invalid or missing --slug');
  if (!get('--dir')) throw new Error('Missing --dir');

  const fail = (messages) => {
    for (const m of messages) console.log(`::error::[images] ${m}`);
    process.exit(1);
  };

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  } catch (err) {
    return fail([`manifest.json could not be read: ${err.message}`]);
  }
  // Revise mode (the owner's `@claude revise`): the hero is optional, and an entry whose PNG already exists
  // REPLACES that image (files overwritten, alt text updated) instead of filling a placeholder.
  const revise = get('--mode') === 'revise';
  const [manifestProblems, entries] = checkManifest(manifest, { heroOptional: revise });
  if (manifestProblems.length) return fail(manifestProblems);

  const publicDir = path.resolve('public/assets/posts', slug);
  const sourceDir = path.resolve('src/content/posts', slug, 'images');
  const articleFile = path.resolve('src/content/posts', slug, 'index.mdx');
  const articleText = readFileSync(articleFile, 'utf8');
  const exists = (e) => existsSync(path.join(publicDir, `${e.name}.png`));
  // Decided once, before any file is written (afterwards every new diagram would look like an existing one).
  const replaceFiles = new Set(entries.filter((e) => revise && (e.kind === 'hero' || exists(e))).map((e) => e.file));
  const replacing = (e) => replaceFiles.has(e.file);

  // A replaced diagram must already be in the article, so a stray file name cannot add an unreferenced image.
  const missingRefs = entries.filter((e) => e.kind === 'diagram' && replacing(e) && !articleText.includes(`](/assets/posts/${slug}/${e.name}.png)`));
  if (missingRefs.length) return fail(missingRefs.map((e) => `${e.file}: the article has no image named ${e.name}.png to replace`));

  // Count the placeholders first: a new diagram without a placeholder is dropped, never committed.
  const placeholders = countPlaceholders(articleText);
  const freshAll = entries.filter((e) => e.kind === 'diagram' && !replacing(e));
  const dropped = freshAll.slice(placeholders).map((e) => e.file);
  for (const e of entries.filter((x) => x.kind === 'diagram' && dropped.includes(x.file))) entries.splice(entries.indexOf(e), 1);
  for (const f of dropped) console.log(`::warning::[images] ${f} has no [IMAGE] placeholder and was dropped`);
  const written = [];
  const problems = [];
  const outputs = [];

  for (const e of entries) {
    let svg;
    try {
      svg = readFileSync(path.join(dir, e.file), 'utf8');
    } catch {
      problems.push(`${e.file}: file not found`);
      continue;
    }
    const result = validateSvg(svg, { kind: e.kind });
    if (!result.ok) {
      problems.push(...result.problems.map((p) => `${e.file}: ${p}`));
      continue;
    }
    outputs.push({ e, svg, width: result.width, height: result.height });
  }
  if (problems.length) return fail(problems);

  // Never overwrite, except in revise mode where an entry deliberately replaces its own existing image.
  for (const { e } of outputs) {
    if (replacing(e)) continue;
    for (const f of [path.join(publicDir, `${e.name}.png`), path.join(sourceDir, e.file)]) {
      if (existsSync(f)) problems.push(`${path.relative(process.cwd(), f)} already exists; refusing to overwrite it`);
    }
  }
  if (!revise && e0(outputs, publicDir)) problems.push('hero webp files already exist; refusing to overwrite them');
  if (problems.length) return fail(problems);

  mkdirSync(publicDir, { recursive: true });
  mkdirSync(sourceDir, { recursive: true });

  for (const { e, svg, width, height } of outputs) {
    const png = await render(svg, e, { width, height });
    const budget = e.kind === 'hero' ? BUDGET.hero : BUDGET.diagram;
    let finalPng = png;
    if (png.length > budget) {
      // Flat illustration compresses well as a palette PNG; try that before giving up.
      finalPng = await sharp(png).png({ palette: true, quality: 85, compressionLevel: 9 }).toBuffer();
    }
    if (finalPng.length > budget) {
      problems.push(`${e.name}.png is ${Math.round(finalPng.length / 1024)} KB; the budget is ${Math.round(budget / 1024)} KB. Simplify the drawing.`);
      continue;
    }
    writeFileSync(path.join(publicDir, `${e.name}.png`), finalPng);
    writeFileSync(path.join(sourceDir, e.file), svg);
    written.push(`public/assets/posts/${slug}/${e.name}.png`, `src/content/posts/${slug}/images/${e.file}`);
    if (e.kind === 'hero') {
      for (const [file, w] of [['hero.webp', 1200], ['hero-640.webp', 640]]) {
        const webp = await sharp(finalPng).resize({ width: w, withoutEnlargement: true }).webp({ quality: 90, effort: 5 }).toBuffer();
        if (webp.length > BUDGET.webp) {
          problems.push(`${file} is ${Math.round(webp.length / 1024)} KB; the budget is ${Math.round(BUDGET.webp / 1024)} KB.`);
          continue;
        }
        writeFileSync(path.join(publicDir, file), webp);
        written.push(`public/assets/posts/${slug}/${file}`);
      }
    }
  }
  if (problems.length) return fail(problems);

  const updated = revise
    ? updateArticle(articleText, slug, entries, { revise: true, fresh: entries.filter((e) => !replacing(e)), replaced: entries.filter((e) => replacing(e)) })
    : updateArticle(articleText, slug, entries);
  writeFileSync(articleFile, updated.mdx);
  console.log(JSON.stringify({ slug, written, placed: updated.placed, unplaced: updated.unplaced }, null, 2));
  for (const u of updated.altMissing ?? []) console.log(`::warning::[images] no image line found for ${u}; its alt text was not updated`);
  for (const f of updated.unplaced) console.log(`::warning::[images] ${f} has no [IMAGE] placeholder to replace and was not added to the article`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.log(`::error::[images] ${err.message}`);
    process.exit(1);
  });
}
