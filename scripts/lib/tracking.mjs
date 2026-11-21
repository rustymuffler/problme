/**
 * Decisions for the stalled-interview timer and the publish tracking (roadmap P4-7, P5-1, P5-2).
 *
 * Pure functions of the data passed in, so the rules can be unit tested without GitHub. The CLIs
 * (scripts/stalled-timer.mjs, scripts/publish-tracking.mjs) fetch the data and carry out the decision.
 */

export const OWNER = 'rustymuffler';
export const BOT = 'github-actions[bot]';
export const INTERVIEW_MARKER = '<!-- pipeline:interview -->';
export const NUDGE_MARKER = '<!-- pipeline:nudge -->';
export const STALLED_MARKER = '<!-- pipeline:stalled -->';
const DAY = 24 * 60 * 60 * 1000;

/**
 * What to do with an issue labelled stage:interview.
 *
 * The issue is "waiting on Richard" when the newest message in the thread is one of the Interview
 * Agent's own. From that moment: one nudge after `nudgeDays`, and stage:stalled after `stallDays`.
 * If Richard answered last, the pipeline owes the reply, so nothing is due.
 *
 * @param {{user?: {login: string}}} issue
 * @param {Array<{user: {login: string}, body: string, created_at: string}>} comments oldest first
 * @returns {{action: 'none'|'nudge'|'stall', reason: string, waitingDays?: number}}
 */
export function decideStall(issue, comments, now = new Date(), { nudgeDays = 3, stallDays = 7 } = {}) {
  if (issue?.user?.login !== OWNER) return { action: 'none', reason: 'not an owner issue' };
  const relevant = (comments ?? []).filter(
    (c) => c.user?.login === OWNER || (c.user?.login === BOT && String(c.body ?? '').includes(INTERVIEW_MARKER)),
  );
  const last = relevant[relevant.length - 1];
  if (!last) return { action: 'none', reason: 'the interview has not started' };
  if (last.user.login === OWNER) return { action: 'none', reason: 'Richard answered last; the pipeline owes the reply' };

  const since = new Date(last.created_at);
  const days = (now.valueOf() - since.valueOf()) / DAY;
  if (Number.isNaN(days)) return { action: 'none', reason: 'unreadable timestamp' };
  if (days >= stallDays) {
    const already = (comments ?? []).some((c) => c.user?.login === BOT && String(c.body ?? '').includes(STALLED_MARKER) && new Date(c.created_at) >= since);
    return already ? { action: 'none', reason: 'already marked stalled', waitingDays: days } : { action: 'stall', reason: `no answer for ${Math.floor(days)} days`, waitingDays: days };
  }
  if (days >= nudgeDays) {
    const nudged = (comments ?? []).some((c) => c.user?.login === BOT && String(c.body ?? '').includes(NUDGE_MARKER) && new Date(c.created_at) >= since);
    return nudged ? { action: 'none', reason: 'already nudged', waitingDays: days } : { action: 'nudge', reason: `no answer for ${Math.floor(days)} days`, waitingDays: days };
  }
  return { action: 'none', reason: 'still within the waiting period', waitingDays: days };
}

/** The hidden marker the merge step leaves on the issue so the publish check knows slug and date. */
export function slugMarker(slug, date) {
  return `<!-- pipeline:scheduled slug=${slug} date=${date} -->`;
}

/** Read slug and date back from a comment body; null if absent or malformed. */
export function parseSlugMarker(body) {
  const m = /<!-- pipeline:scheduled slug=([a-z0-9]+(?:-[a-z0-9]+){2,5}) date=(\d{4}-\d{2}-\d{2}) -->/.exec(String(body ?? ''));
  return m ? { slug: m[1], date: m[2] } : null;
}

/** A post is due once its publish date (UTC midnight) has arrived. */
export function isDue(date, now = new Date()) {
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.valueOf()) && d.valueOf() <= now.valueOf();
}

/** Issue number from a pipeline branch name, or null. article/12 and article/12-987654 both give 12. */
export function issueFromBranch(branch) {
  const m = /^article\/([0-9]{1,7})(?:-[0-9]{1,15})?$/.exec(String(branch ?? ''));
  return m ? Number(m[1]) : null;
}

/** The one article folder a set of changed files belongs to, or null if it is not exactly one. */
export function slugFromFiles(files) {
  const slugs = new Set();
  for (const f of files ?? []) {
    const m = /^src\/content\/posts\/([a-z0-9]+(?:-[a-z0-9]+){2,5})\//.exec(String(f));
    if (m) slugs.add(m[1]);
  }
  return slugs.size === 1 ? [...slugs][0] : null;
}

/** What the live site must contain for a published post. Returns the problems, empty when live. */
export function liveProblems({ slug, pageStatus, sitemap, rss, llms }) {
  const problems = [];
  if (pageStatus !== 200) problems.push(`the page returned ${pageStatus}`);
  if (!String(sitemap ?? '').includes(`/blog/${slug}/`)) problems.push('not in the sitemap');
  if (!String(rss ?? '').includes(`/blog/${slug}/`)) problems.push('not in rss.xml');
  if (!String(llms ?? '').includes(`/blog/${slug}/`)) problems.push('not in llms.txt');
  return problems;
}
