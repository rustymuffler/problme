import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const targets = [
  { svg: 'src/content/posts/prompt-injection-lessons-applied/images/hero.svg', out: 'public/assets/posts/prompt-injection-lessons-applied/hero.png', width: 1200, height: 630 },
  { svg: 'src/content/posts/prompt-injection-lessons-applied/images/research-agent-trust-boundary-diagram.svg', out: 'public/assets/posts/prompt-injection-lessons-applied/research-agent-trust-boundary-diagram.png', width: 1100, height: 560 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const t of targets) {
  const svgPath = join(root, t.svg);
  const svgContent = readFileSync(svgPath, 'utf-8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#0F1117;}</style></head><body>${svgContent}</body></html>`;
  await page.setViewportSize({ width: t.width, height: t.height });
  await page.setContent(html, { waitUntil: 'networkidle' });
  const outPath = join(root, t.out);
  mkdirSync(dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: t.width, height: t.height } });
  console.log('Rendered', t.out);
}

await browser.close();
