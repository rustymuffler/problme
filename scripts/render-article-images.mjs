import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const targets = [
  { svg: 'src/content/posts/claude-agent-content-pipeline/images/hero.svg', out: 'public/assets/posts/claude-agent-content-pipeline/hero.png', width: 1200, height: 630 },
  { svg: 'src/content/posts/claude-agent-content-pipeline/images/pipeline-diagram.svg', out: 'public/assets/posts/claude-agent-content-pipeline/pipeline-diagram.png', width: 1100, height: 560 },
  { svg: 'src/content/posts/claude-agent-content-pipeline/images/what-broke-diagram.svg', out: 'public/assets/posts/claude-agent-content-pipeline/what-broke-diagram.png', width: 1100, height: 560 },
  { svg: 'src/content/posts/claude-agent-content-pipeline/images/workflow-tools-diagram.svg', out: 'public/assets/posts/claude-agent-content-pipeline/workflow-tools-diagram.png', width: 1100, height: 560 },
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
