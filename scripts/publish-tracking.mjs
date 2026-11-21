#!/usr/bin/env node
/**
 * Publish tracking (roadmap items P5-1 and P5-2).
 *
 *   merged  after an article PR is merged: move its issue to stage:scheduled and record slug and date
 *             env: REPO, HEAD_REF, PR_NUMBER, MERGE_SHA, GH_TOKEN
 *   verify  after a deploy, daily, or on demand: for every scheduled article whose date has arrived,
 *           confirm the live page, sitemap, rss.xml and llms.txt, then mark the issue stage:published
 *           and close it. Overdue articles that are still not live get one warning.
 *             env: REPO, GH_TOKEN
 *
 * Decisions live in scripts/lib/tracking.mjs. `gh` runs without a shell; the only host contacted is
 * https://probl.me. Dependencies are injectable so the logic can be tested.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { OWNER, isDue, issueFromBranch, liveProblems, parseSlugMarker, slugFromFiles, slugMarker } from './lib/tracking.mjs';

const SITE = 'https://probl.me';
const WARNING_MARKER = '<!-- pipeline:publish-warning -->';
const realGh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const realGhJson = (args) => JSON.parse(realGh([...args, '--paginate', '--slurp'])).flat();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeHelpers(repo, gh, ghJson) {
  const ensureLabel = (name, color, description) => {
    try {
      gh(['label', 'create', name, '--repo', repo, '--color', color, '--description', description]);
    } catch {
      // already exists
    }
  };
  const swapLabels = (number, add, removeCandidates) => {
    const current = new Set(ghJson(['api', `repos/${repo}/issues/${number}/labels?per_page=100`]).map((l) => l.name));
    const args = ['issue', 'edit', String(number), '--repo', repo, '--add-label', add];
    for (const l of removeCandidates) if (current.has(l)) args.push('--remove-label', l);
    return args;
  };
  return { ensureLabel, swapLabels };
}

function checkRepo(repo) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('REPO must be owner/name');
}

/** An article PR was merged: schedule its issue. */
export async function runMerged({ repo, headRef, prNumber, mergeSha, gh = realGh, ghJson = realGhJson, log = console.log }) {
  checkRepo(repo);
  const issue = issueFromBranch(headRef);
  if (!issue) return log(`Branch "${headRef}" is not an article branch; nothing to track.`);
  if (!/^[0-9]{1,7}$/.test(String(prNumber))) throw new Error('PR_NUMBER is required');
  if (!/^[0-9a-f]{40}$/.test(String(mergeSha))) throw new Error('MERGE_SHA must be a full commit SHA');
  const { ensureLabel, swapLabels } = makeHelpers(repo, gh, ghJson);

  // Only issues the owner opened are tracked, whatever number the branch name carries.
  const opener = JSON.parse(gh(['api', `repos/${repo}/issues/${issue}`])).user?.login;
  if (opener !== OWNER) return log(`Issue #${issue} was not opened by the owner; nothing to track.`);

  const files = ghJson(['api', `repos/${repo}/pulls/${prNumber}/files?per_page=100`]).map((f) => f.filename);
  const slug = slugFromFiles(files);
  if (!slug) return log('The PR does not belong to exactly one article folder; nothing to track.');
  const mdx = Buffer.from(JSON.parse(gh(['api', `repos/${repo}/contents/src/content/posts/${slug}/index.mdx?ref=${mergeSha}`])).content, 'base64').toString('utf8');
  const date = /^date:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m.exec(mdx)?.[1];
  if (!date) throw new Error(`No valid date in the frontmatter of ${slug}`);

  ensureLabel('stage:scheduled', '0E8A16', 'Merged; waiting for its publish date');
  const args = swapLabels(issue, 'stage:scheduled', ['stage:review', 'stage:stalled', 'stage:drafting', 'stage:interview']);
  args.push('--remove-assignee', OWNER);
  gh(args);
  gh(['issue', 'comment', String(issue), '--repo', repo, '--body',
    `${slugMarker(slug, date)}\nMerged. Scheduled for ${date}: it goes live on the first Tuesday or Thursday deploy on or after that date, and this issue will be marked published and closed when the page is confirmed live.`]);
  log(`#${issue} scheduled for ${date} (${slug}).`);
  return { issue, slug, date };
}

/** The problems with a post's live pages (empty when it is live). */
export async function fetchLiveProblems(slug, fetchImpl = fetch) {
  const get = async (path) => {
    try {
      const res = await fetchImpl(`${SITE}${path}`, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'cache-control': 'no-cache' } });
      return { status: res.status, text: res.ok ? await res.text() : '' };
    } catch {
      return { status: 0, text: '' };
    }
  };
  const page = await get(`/blog/${slug}/`);
  const [sitemap, rss, llms] = await Promise.all([get('/sitemap-0.xml'), get('/rss.xml'), get('/llms.txt')]);
  return liveProblems({ slug, pageStatus: page.status, sitemap: sitemap.text, rss: rss.text, llms: llms.text });
}

/** Confirm scheduled articles that are due; mark them published and close the issue. */
export async function runVerify({ repo, now = new Date(), gh = realGh, ghJson = realGhJson, liveCheck = fetchLiveProblems, wait = sleep, retries = 0, deadlineMs = 8 * 60 * 1000, clock = Date.now, log = console.log }) {
  checkRepo(repo);
  const { ensureLabel, swapLabels } = makeHelpers(repo, gh, ghJson);
  const issues = ghJson(['api', `repos/${repo}/issues?labels=stage:scheduled&state=open&per_page=100`]).filter((i) => !i.pull_request && i.user?.login === OWNER);
  log(`${issues.length} scheduled article(s).`);
  const published = [];
  const failed = [];
  const deadline = clock() + deadlineMs; // one budget for all retries in this run
  for (const issue of issues) {
   try {
    const comments = ghJson(['api', `repos/${repo}/issues/${issue.number}/comments?per_page=100`]);
    const marker = comments.map((c) => (c.user?.login === 'github-actions[bot]' ? parseSlugMarker(c.body) : null)).filter(Boolean).pop();
    if (!marker) {
      log(`#${issue.number}: no schedule marker, skipping.`);
      continue;
    }
    if (!isDue(marker.date, now)) {
      log(`#${issue.number}: ${marker.slug} is scheduled for ${marker.date}, not due yet.`);
      continue;
    }
    let problems = await liveCheck(marker.slug);
    for (let attempt = 1; problems.length && attempt <= retries && clock() < deadline; attempt += 1) {
      await wait(30000); // Pages and the CDN can lag a minute behind the deploy
      problems = await liveCheck(marker.slug);
    }
    if (problems.length === 0) {
      ensureLabel('stage:published', 'BFD4F2', 'Live on the site');
      gh(swapLabels(issue.number, 'stage:published', ['stage:scheduled']));
      gh(['issue', 'comment', String(issue.number), '--repo', repo, '--body', `Live: ${SITE}/blog/${marker.slug}/ (confirmed in the page, sitemap, rss.xml and llms.txt). Closing this issue.`]);
      gh(['issue', 'close', String(issue.number), '--repo', repo, '--reason', 'completed']);
      log(`#${issue.number}: published.`);
      published.push(issue.number);
      continue;
    }
    log(`#${issue.number}: not live yet (${problems.join('; ')}).`);
    const overdueDays = (now.valueOf() - new Date(`${marker.date}T00:00:00Z`).valueOf()) / 86400000;
    const warned = comments.some((c) => c.user?.login === 'github-actions[bot]' && String(c.body ?? '').includes(WARNING_MARKER));
    if (overdueDays >= 2 && !warned) {
      gh(['issue', 'edit', String(issue.number), '--repo', repo, '--add-assignee', OWNER]);
      gh(['issue', 'comment', String(issue.number), '--repo', repo, '--body', `${WARNING_MARKER}\nThis article was due on ${marker.date} but is not live: ${problems.join('; ')}. Check the Deploy to GitHub Pages workflow run and the post's date.`]);
    }
   } catch (err) {
    // One bad issue (deleted, rate limited) must not stop the others.
    failed.push(issue.number);
    log(`::warning::#${issue.number}: ${String(err.message).split('\n')[0].slice(0, 200)}`);
   }
  }
  if (failed.length) throw new Error(`Could not process issue(s): ${failed.join(', ')}`);
  return published;
}

async function main() {
  const repo = process.env.REPO ?? '';
  const command = process.argv[2];
  if (command === 'merged') {
    await runMerged({ repo, headRef: process.env.HEAD_REF ?? '', prNumber: process.env.PR_NUMBER ?? '', mergeSha: process.env.MERGE_SHA ?? '' });
  } else if (command === 'verify') {
    const retries = Math.min(5, Math.max(0, Number(process.env.VERIFY_RETRIES ?? '0') || 0));
    await runVerify({ repo, retries });
  } else {
    throw new Error('Usage: publish-tracking.mjs merged|verify');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.log(`::error::${err.message}`);
    process.exit(1);
  });
}
