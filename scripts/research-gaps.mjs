#!/usr/bin/env node
/**
 * Research gap check (roadmap item P3-8).
 *
 *   node scripts/research-gaps.mjs <research-brief.md>
 *
 * Reads the first-pass research brief and prints one line per gap that a second research pass should
 * fill (nothing when the brief is complete). The exit code is 0 for a readable file: the gaps are data
 * for the workflow. Pure string handling, no network, no shell. The brief is untrusted text, so only
 * linear scans are used (no backtracking regexes over the whole document).
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MINIMUMS = [
  ['Competitive Content Scan', 3, 'competitive scan has fewer than 3 articles'],
  ['Credible Sources to Cite', 3, 'fewer than 3 credible sources to cite'],
  ['Counterarguments to Address', 2, 'fewer than 2 counterarguments'],
];

/** Split the brief into a map of heading text to lines, using "## " headings. */
function sections(text) {
  const map = new Map();
  let current = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      current = line.slice(3).trim();
      map.set(current, []);
    } else if (current !== null) {
      map.get(current).push(line);
    }
  }
  return map;
}

const bullets = (lines) => lines.filter((l) => l.trimStart().startsWith('- ') && l.trim().length > 4);
const isNone = (line) => {
  const rest = line.trim().slice(2).trim().toLowerCase();
  return rest === 'none' || rest === 'n/a' || rest === 'nothing' || rest.startsWith('none ') || rest.startsWith('none.');
};

/** The gaps in a first-pass brief, as short human-readable strings. */
export function researchGaps(text) {
  const gaps = [];
  const body = String(text);
  const secs = sections(body);
  for (const [name, min, message] of MINIMUMS) {
    const count = bullets(secs.get(name) ?? []).filter((l) => !isNone(l)).length;
    if (count < min) gaps.push(`${message} (found ${count})`);
  }
  const unverified = body.split('[UNVERIFIED').length - 1;
  if (unverified > 0) gaps.push(`${unverified} claim(s) marked [UNVERIFIED - needs source]`);
  const hasTarget = (secs.get('Competitive Content Scan') ?? []).some((l) => l.toLowerCase().includes('recommended target length'));
  if (!hasTarget) gaps.push('no recommended target length in the competitive scan');
  return gaps;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: research-gaps.mjs <research-brief.md>');
    process.exit(2);
  }
  for (const gap of researchGaps(readFileSync(file, 'utf8'))) console.log(gap);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
