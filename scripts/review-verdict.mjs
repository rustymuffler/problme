#!/usr/bin/env node
/**
 * Validate and normalise one reviewer's verdict file (roadmap phase 3).
 *
 *   node scripts/review-verdict.mjs --role <proofreader|seo|aeo|voice|factcheck> --in <verdict.json> --out <normalised.json>
 *
 * Exits 1 (with ::error:: lines) when the file is missing, too large, not JSON, or off-rubric, so a
 * reviewer that did not produce a usable verdict fails its job instead of passing silently.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { ROLES, validateVerdict } from './lib/reviews.mjs';

function main() {
  const args = process.argv.slice(2);
  const get = (f) => {
    const i = args.indexOf(f);
    return i === -1 ? '' : (args[i + 1] ?? '');
  };
  const role = get('--role');
  const input = get('--in');
  const output = get('--out');
  const fail = (m) => {
    console.log(`::error::[review:${role}] ${m}`);
    process.exit(1);
  };
  if (!ROLES[role]) fail('Unknown or missing --role');
  if (!input || !output) fail('Usage: --role <role> --in <file> --out <file>');
  let text;
  try {
    if (statSync(input).size > 60_000) fail('The verdict file is larger than 60,000 bytes.');
    text = readFileSync(input, 'utf8');
  } catch {
    return fail('The reviewer wrote no verdict file.');
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    return fail(`The verdict is not valid JSON: ${err.message}`);
  }
  const result = validateVerdict(json, role);
  if (!result.ok) {
    for (const p of result.problems) console.log(`::error::[review:${role}] ${p}`);
    process.exit(1);
  }
  writeFileSync(output, JSON.stringify(result.verdict, null, 2));
  console.log(`${role}: ${result.verdict.verdict} (${result.verdict.findings.length} finding(s))`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
