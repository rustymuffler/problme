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
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { validateSvg } from './lib/svg-safety.mjs';

const FILE = /^[a-z0-9]+(?:-[a-z0-9]+){0,5}\.svg$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){2,5}$/;
const MAX_IMAGES = 8;
const BUDGET = { hero: 450_000, diagram: 400_000, webp: 200_000 }; // bytes
const CREDIT = 'AI-generated with Claude';

/** Alt text must be plain descriptive text: no markup, links, or markdown. */
export function checkAlt(alt) {
  if (typeof alt !== 'string') return 'alt text is missing';
  const t = alt.trim();
  if (t.length < 20 || t.length > 250) return `alt text is ${t.length} characters; use 20 to 250`;
  if (/[<>\[\]()`*_#|\\]|https?:|www\.|\/\//.test(t)) return 'alt text must be plain text (no markup, brackets, links or markdown)';
  if (/^(image|picture|photo|graphic|diagram|screenshot)\s+of\b/i.test(t)) return 'alt text should describe what the image shows, not start with "image of"';
  return null;
}

/** Validate the manifest object. Returns [problems, entries]. */
export function checkManifest(manifest) {
  const problems = [];
  const entries = [];
  if (!manifest || typeof manifest !== 'object') return [['manifest.json is not an object'], entries];
  const hero = manifest.hero;
  if (!hero || !FILE.test(String(hero.file ?? ''))) problems.push('manifest.hero.file must be a lowercase-hyphen .svg name');
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

/** Set heroImage and imageCredit in the frontmatter, and fill [IMAGE ...] placeholders in order. */
export function updateArticle(mdx, slug, entries) {
  const text = mdx.replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  if (lines[0] !== '---') throw new Error('Article has no frontmatter.');
  const end = lines.indexOf('---', 1);
  if (end === -1) throw new Error('Article frontmatter is not closed.');
  const fm = lines.slice(1, end).filter((l) => !/^(heroImage|imageCredit):/.test(l));
  const readTime = fm.findIndex((l) => /^readTime:/.test(l));
  const insertAt = readTime === -1 ? fm.length : readTime + 1;
  fm.splice(insertAt, 0, `heroImage: /assets/posts/${slug}/hero.png`, `imageCredit: "${CREDIT}"`);

  const body = lines.slice(end + 1);
  const diagrams = entries.filter((e) => e.kind === 'diagram');
  let next = 0;
  let inFence = false;
  const replaced = [];
  const out = body.map((line) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && next < diagrams.length && /^\[IMAGE\b[^\]]*\]\s*$/.test(line)) {
      const d = diagrams[next];
      next += 1;
      replaced.push(d.file);
      return `![${d.alt}](/assets/posts/${slug}/${d.name}.png)`;
    }
    return line;
  });
  return { mdx: ['---', ...fm, '---', ...out].join('\n'), placed: replaced, unplaced: diagrams.slice(next).map((d) => d.file) };
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
  const [manifestProblems, entries] = checkManifest(manifest);
  if (manifestProblems.length) return fail(manifestProblems);

  const publicDir = path.resolve('public/assets/posts', slug);
  const sourceDir = path.resolve('src/content/posts', slug, 'images');
  const articleFile = path.resolve('src/content/posts', slug, 'index.mdx');
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

  const updated = updateArticle(readFileSync(articleFile, 'utf8'), slug, entries);
  writeFileSync(articleFile, updated.mdx);
  console.log(JSON.stringify({ slug, written, placed: updated.placed, unplaced: updated.unplaced }, null, 2));
  for (const f of updated.unplaced) console.log(`::warning::[images] ${f} has no [IMAGE] placeholder to replace and was not added to the article`);
  void statSync;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.log(`::error::[images] ${err.message}`);
    process.exit(1);
  });
}
