#!/usr/bin/env node
// Scans untrusted, externally-fetched text for prompt-injection patterns before it
// crosses into a trust boundary (e.g. before the Research Agent's returned findings
// are written to research-brief.md). See AGENTS.md "Research Agent — Untrusted
// Content Rules" and DECISIONS.md Decision 13.
//
// Advisory, not a hard gate: Tier 3 (LLM disambiguation for ambiguous ML scores) is
// not wired up, so a "high" risk level from the Tier 2 classifier alone, with no
// Tier 1 pattern-level detections, is a weak signal prone to false positives on
// dense security-technical writing (verified against this repo's own published
// content during setup — see Decision 13). This script never exits non-zero on its
// own; it always prints the full result so a human or the orchestrating Claude Code
// session can review before deciding whether to write the file.
//
// Usage: node scripts/scan-untrusted-content.mjs <file> [sourceLabel]
// Exit code 0 = scan completed (review the output). Exit code 1 = usage/read error only.

import { readFile } from 'node:fs/promises';
import { createPromptDefense } from '@stackone/defender';

const [, , filePath, sourceLabel] = process.argv;

if (!filePath) {
  console.error('Usage: node scripts/scan-untrusted-content.mjs <file> [sourceLabel]');
  process.exit(1);
}

const text = await readFile(filePath, 'utf-8');
const defense = createPromptDefense({ blockHighRisk: false });
const result = await defense.defendToolResult(text, sourceLabel ?? filePath);

console.log(JSON.stringify(result, null, 2));

if (result.detections.length > 0) {
  console.error(`\nPATTERN MATCH: ${result.detections.length} Tier 1 detection(s) in ${filePath}. Strong signal, review before writing.`);
} else if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
  console.error(`\nAMBIGUOUS: risk level "${result.riskLevel}" from the ML tier alone, no pattern detections, in ${filePath}. Weak signal without Tier 3 disambiguation, review the flagged sentence before writing.`);
}
