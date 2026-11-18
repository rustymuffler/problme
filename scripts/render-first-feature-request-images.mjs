/**
 * Rasterize the SVG sources for the "first feature request / RSS" article to PNG.
 * Safe to re-run. Usage: node scripts/render-first-feature-request-images.mjs
 * Then: node scripts/generate-webp-heroes.mjs (for hero.webp / hero-640.webp)
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = 'src/content/posts/first-feature-request-rss-problem-solved/images/';
const out = 'public/assets/posts/first-feature-request-rss-problem-solved/';
const targets = [
  { name: 'hero', width: 1200, height: 630 },
  { name: 'rss-discoverability-diagram', width: 1200, height: 640 },
  { name: 'ci-check-never-ran-diagram', width: 1200, height: 600 },
  { name: 'before-after-lighthouse-chart', width: 1200, height: 660 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
mkdirSync(join(root, out), { recursive: true });
for (const t of targets) {
  const svg = readFileSync(join(root, src, `${t.name}.svg`), 'utf-8');
  await page.setViewportSize({ width: t.width, height: t.height });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#15120E}svg{display:block}</style></head><body>${svg}</body></html>`);
  await page.screenshot({ path: join(root, out, `${t.name}.png`), clip: { x: 0, y: 0, width: t.width, height: t.height } });
  console.log('Rendered', `${out}${t.name}.png`);
}
await browser.close();
