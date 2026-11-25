#!/usr/bin/env node
/**
 * `@claude revise` helpers for the workflow (roadmap: edits from a phone).
 *
 *   prepare   env: REPO, PR_NUMBER, COMMENT_BODY, COMMENT_ID, GH_TOKEN
 *             Validates the pull request, extracts the instructions into .pipeline-tmp/instructions.md,
 *             and writes ok/error/branch/slug/issue/publish_date to $GITHUB_OUTPUT.
 *   summary   Prints the sanitised .pipeline-tmp/revise-summary.md (empty when there is none).
 *
 * Decisions live in scripts/lib/revise.mjs. `gh` runs without a shell. Dependencies are injectable.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { issueFromBranch } from './lib/tracking.mjs';
import { extractInstructions, prProblem, sanitizeSummary, slugOfPr } from './lib/revise.mjs';

const realGh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const realGhJson = (args) => JSON.parse(realGh([...args, '--paginate', '--slurp'])).flat();

/** Validate everything about the command. Returns { ok, ... } and never throws for a bad request. */
export function prepare({ repo, prNumber, commentBody, commentId, gh = realGh, ghJson = realGhJson, write = writeFileSync, mkdir = mkdirSync }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('REPO must be owner/name');
  if (!/^[0-9]{1,7}$/.test(String(prNumber))) throw new Error('PR_NUMBER is required');

  const ext = extractInstructions(commentBody);
  if (!ext.ok) return { ok: false, error: ext.error };

  const pr = JSON.parse(gh(['api', `repos/${repo}/pulls/${prNumber}`]));
  const problem = prProblem(pr, repo);
  if (problem) return { ok: false, error: problem };

  const slug = slugOfPr(ghJson(['api', `repos/${repo}/pulls/${prNumber}/files?per_page=100`]));
  if (!slug) return { ok: false, error: 'The pull request does not carry exactly one article folder.' };

  const mdx = Buffer.from(JSON.parse(gh(['api', `repos/${repo}/contents/src/content/posts/${slug}/index.mdx?ref=${pr.head.sha}`])).content, 'base64').toString('utf8');
  const date = /^date:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m.exec(mdx)?.[1];
  if (!date) return { ok: false, error: 'The article has no valid date in its frontmatter.' };

  mkdir('.pipeline-tmp', { recursive: true });
  write('.pipeline-tmp/instructions.md', `${ext.text}\n`);
  if (commentId && /^[0-9]{1,15}$/.test(String(commentId))) {
    try {
      gh(['api', '-X', 'POST', `repos/${repo}/issues/comments/${commentId}/reactions`, '-f', 'content=eyes']);
    } catch {
      // the acknowledgement is a convenience only
    }
  }
  return { ok: true, branch: pr.head.ref, slug, issue: issueFromBranch(pr.head.ref), publishDate: date };
}

function setOutputs(values) {
  const file = process.env.GITHUB_OUTPUT;
  const lines = Object.entries(values).map(([k, v]) => `${k}=${String(v).replace(/[\r\n]+/g, ' ')}`);
  if (file) appendFileSync(file, `${lines.join('\n')}\n`);
  else console.log(lines.join('\n'));
}

function main() {
  const command = process.argv[2];
  if (command === 'prepare') {
    let r;
    try {
      r = prepare({ repo: process.env.REPO ?? '', prNumber: process.env.PR_NUMBER ?? '', commentBody: process.env.COMMENT_BODY ?? '', commentId: process.env.COMMENT_ID ?? '' });
    } catch (err) {
      r = { ok: false, error: `Could not prepare the revision: ${String(err.message).split('\n')[0].slice(0, 200)}` };
    }
    setOutputs(r.ok ? { ok: true, error: '', branch: r.branch, slug: r.slug, issue: r.issue, publish_date: r.publishDate } : { ok: false, error: r.error });
  } else if (command === 'summary') {
    const file = '.pipeline-tmp/revise-summary.md';
    console.log(existsSync(file) ? sanitizeSummary(readFileSync(file, 'utf8')) : '');
  } else {
    console.error('Usage: revise.mjs prepare|summary');
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
