/**
 * Generate WebP copies of every post hero image.
 *
 * For each public/assets/posts/<slug>/hero.png this writes:
 *   hero.webp      1200px wide  (post page and featured card)
 *   hero-640.webp   640px wide  (card thumbnails)
 *
 * The PNG stays: it is the Open Graph / JSON-LD image (WebP is not reliably
 * supported by social crawlers) and the fallback inside <picture>.
 * Safe to re-run; outputs are overwritten. Run after adding or changing a hero:
 *   node scripts/generate-webp-heroes.mjs
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const POSTS = new URL('../public/assets/posts/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const QUALITY = 90; // 82 showed faint banding in dark gradients

const kb = (path) => `${Math.round(statSync(path).size / 1024)}KB`;

for (const slug of readdirSync(POSTS, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  const dir = join(POSTS, slug.name);
  const png = join(dir, 'hero.png');
  if (!existsSync(png)) continue;

  for (const [file, width] of [['hero.webp', 1200], ['hero-640.webp', 640]]) {
    const out = join(dir, file);
    await sharp(png).resize({ width, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
    console.log(`${slug.name}/${file}  ${kb(out)}  (png ${kb(png)})`);
  }
}
