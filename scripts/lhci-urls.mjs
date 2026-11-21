#!/usr/bin/env node
/**
 * Prints `--collect.url=...` flags for Lighthouse CI: the URLs in .lighthouserc.json
 * plus the page of every post a pull request adds or changes, so a new article is
 * audited before it is published (roadmap item P0-3).
 *
 *   node scripts/lhci-urls.mjs [<base-ref>]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ORIGIN = 'http://localhost:4321';
const config = JSON.parse(readFileSync('.lighthouserc.json', 'utf8'));
const urls = new Set(config.ci.collect.url);

const base = process.argv[2];
if (base) {
  if (!/^(?!-)[\w./-]+$/.test(base)) throw new Error('Invalid base ref');
  const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`, '--', 'src/content/posts'], { encoding: 'utf8' });
  for (const f of out.split('\n')) {
    const m = /^src\/content\/posts\/([a-z0-9-]+)\/index\.mdx$/.exec(f.trim());
    if (m) urls.add(`${ORIGIN}/blog/${m[1]}/`);
  }
}
console.log([...urls].map((u) => `--collect.url=${u}`).join(' '));
