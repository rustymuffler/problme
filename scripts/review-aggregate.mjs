#!/usr/bin/env node
/**
 * Combine the normalised verdicts of one review pass (roadmap phase 3).
 *
 *   node scripts/review-aggregate.mjs --dir <folder of normalised *.json verdicts> --lint <lint-output.txt>
 *       --pass <n> --out-dir <folder> [--roles a,b,c] [--scan <scan-summary.txt>]
 *
 * Writes feedback.md (what the Writer revises from), scorecard.md (shown in the PR)
 * and state.json, and prints needs_work, ready and exhausted lines
 * for $GITHUB_OUTPUT.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { ROLES, aggregateReviews } from './lib/reviews.mjs';

function main() {
  const args = process.argv.slice(2);
  const get = (f) => {
    const i = args.indexOf(f);
    return i === -1 ? '' : (args[i + 1] ?? '');
  };
  const dir = get('--dir');
  const outDir = get('--out-dir');
  const pass = Number(get('--pass') || '1');
  if (!dir || !outDir || !Number.isInteger(pass) || pass < 1 || pass > 9) {
    console.log('::error::Usage: --dir <verdicts> --lint <file> --pass <n> --out-dir <folder>');
    process.exit(1);
  }
  const roles = (get('--roles') || Object.keys(ROLES).join(',')).split(',').filter((r) => ROLES[r]);
  const verdicts = [];
  for (const f of readdirSync(dir).filter((n) => /^[a-z]+\.json$/.test(n))) {
    try {
      const v = JSON.parse(readFileSync(path.join(dir, f), 'utf8'));
      if (ROLES[v.role] && roles.includes(v.role)) verdicts.push(v);
    } catch {
      console.log(`::warning::Ignoring unreadable verdict ${f}`);
    }
  }
  const read = (p) => (p && existsSync(p) ? readFileSync(p, 'utf8') : '');
  const result = aggregateReviews(verdicts, {
    lintText: read(get('--lint')),
    pass,
    scanSummary: read(get('--scan')).trim(),
    expectedRoles: roles,
  });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'feedback.md'), result.feedback);
  writeFileSync(path.join(outDir, 'scorecard.md'), result.scorecard);
  writeFileSync(path.join(outDir, 'state.json'), JSON.stringify({ needsWork: result.needsWork, ready: result.ready, exhausted: result.exhausted, missing: result.missing, lint: result.lint }, null, 2));
  console.log(`needs_work=${result.needsWork}`);
  console.log(`ready=${result.ready}`);
  console.log(`exhausted=${result.exhausted}`);
  console.error(result.scorecard);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
