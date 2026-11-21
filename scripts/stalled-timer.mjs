#!/usr/bin/env node
/**
 * Stalled-interview timer (roadmap item P4-7).
 *
 *   REPO=owner/name GH_TOKEN=... node scripts/stalled-timer.mjs [--dry-run]
 *
 * For every open issue the owner opened that is labelled stage:interview and is waiting on Richard
 * (the Interview Agent spoke last): one nudge comment after 3 days, and stage:stalled after 7. A missed
 * answer then never blocks anything. Decisions live in scripts/lib/tracking.mjs; this file only fetches
 * and acts. It runs `gh` without a shell and touches only issues, labels and comments.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { NUDGE_MARKER, OWNER, STALLED_MARKER, decideStall } from './lib/tracking.mjs';

const realGh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const realGhJson = (args) => JSON.parse(realGh([...args, '--paginate', '--slurp'])).flat();

/** Carry out the timer. `gh` and `ghJson` are injectable so the logic can be tested. */
export function runTimer({ repo, dry = false, now = new Date(), gh = realGh, ghJson = realGhJson, log = console.log }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('REPO must be owner/name');
  const issues = ghJson(['api', `repos/${repo}/issues?labels=stage:interview&state=open&per_page=100`]).filter((i) => !i.pull_request);
  log(`${issues.length} open issue(s) labelled stage:interview.`);
  const acted = [];
  for (const issue of issues) {
    const comments = ghJson(['api', `repos/${repo}/issues/${issue.number}/comments?per_page=100`]);
    const d = decideStall(issue, comments, now);
    log(`#${issue.number}: ${d.action} (${d.reason})`);
    if (dry || d.action === 'none') continue;

    if (d.action === 'nudge') {
      gh(['issue', 'comment', String(issue.number), '--repo', repo, '--body',
        `${NUDGE_MARKER}\nA nudge: this interview has been waiting for your answers for ${Math.floor(d.waitingDays)} days. Answer in any order, even a sentence each, or comment \`@claude done\` on its own line if you have said enough. If there is no reply, I will park this issue as stalled after 7 days. Nothing is lost either way.`]);
    } else if (d.action === 'stall') {
      try {
        gh(['label', 'create', 'stage:stalled', '--repo', repo, '--color', 'B60205', '--description', 'No progress; needs Richard']);
      } catch {
        // the label already exists
      }
      gh(['issue', 'edit', String(issue.number), '--repo', repo, '--remove-label', 'stage:interview', '--add-label', 'stage:stalled', '--add-assignee', OWNER]);
      gh(['issue', 'comment', String(issue.number), '--repo', repo, '--body',
        `${STALLED_MARKER}\nParked as stalled: no answer for ${Math.floor(d.waitingDays)} days. Nothing is lost and no other article is blocked. To restart, add the label \`stage:interview\` again; the Interview Agent will continue from the answers already in this thread.`]);
    }
    acted.push({ number: issue.number, action: d.action });
  }
  return acted;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runTimer({ repo: process.env.REPO ?? '', dry: process.argv.includes('--dry-run') });
  } catch (err) {
    console.log(`::error::${err.message}`);
    process.exit(1);
  }
}
