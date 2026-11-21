#!/usr/bin/env node
/**
 * List the external hosts an article links to or loads from (roadmap phase 3 hardening).
 *
 *   node scripts/link-hosts.mjs <file> [--all]
 *
 * Prints one lowercase host per line (leading "www." removed). Outside fenced code blocks it finds
 * markdown links, <autolinks>, bare URLs, reference definitions, href and src attributes, protocol
 * relative //host links, and any upper-case or spaced variant. `--all` also scans inside code
 * fences (used for the research brief, where listed URLs matter more than syntax).
 *
 * Every regular expression is linear; the host character class is bounded.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Hosts found in text. Pure, so the lint and the workflow scripts share one definition. */
export function extractHosts(text, { includeCode = false } = {}) {
  const hosts = new Set();
  let inFence = false;
  for (const line of String(text).split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence && !includeCode) continue;
    if (line.length > 4000) continue; // pathological lines are reported by the lint, not scanned here
    // Absolute URLs with a scheme, in any context (autolink, bare, href, src, reference definition).
    for (const m of line.matchAll(/https?:\/\/([A-Za-z0-9.-]{1,253})/gi)) hosts.add(m[1]);
    // Protocol-relative URLs: ](//host), ="//host", (//host.
    for (const m of line.matchAll(/(?:\]\(|[="'(<]|\s)\s{0,3}\/\/([A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24})/g)) hosts.add(m[1]);
  }
  return [...hosts].map((h) => h.toLowerCase().replace(/^www\./, '').replace(/\.$/, '')).filter(Boolean).sort().filter((h, i, a) => a.indexOf(h) === i);
}

function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('Usage: link-hosts.mjs <file> [--all]');
    process.exit(1);
  }
  for (const h of extractHosts(readFileSync(file, 'utf8'), { includeCode: args.includes('--all') })) console.log(h);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
