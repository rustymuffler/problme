import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTimer } from '../scripts/stalled-timer.mjs';
import { runMerged, runVerify } from '../scripts/publish-tracking.mjs';
import { BOT, INTERVIEW_MARKER, OWNER, slugMarker } from '../scripts/lib/tracking.mjs';

const day = 24 * 60 * 60 * 1000;
const now = new Date('2026-12-01T12:00:00Z');
const ago = (d: number) => new Date(now.valueOf() - d * day).toISOString();
const quiet = () => {};

/** Fake gh: records every write call; ghJson answers from a table keyed by a fragment of the endpoint. */
function fakes(table: Record<string, unknown[]>, ghResponses: Record<string, string> = {}) {
  const calls: string[][] = [];
  const gh = (args: string[]) => {
    calls.push(args);
    const hit = Object.entries(ghResponses).find(([k]) => args.join(' ').includes(k));
    return hit ? hit[1] : '';
  };
  const ghJson = (args: string[]) => {
    const key = Object.keys(table).find((k) => args.join(' ').includes(k));
    return key ? table[key] : [];
  };
  const writes = () => calls.filter((c) => c[0] === 'issue' || c[0] === 'label').map((c) => c.join(' '));
  return { gh, ghJson, calls, writes };
}

const interviewIssue = (n: number) => ({ number: n, user: { login: OWNER } });
const botQ = (d: number) => ({ user: { login: BOT }, body: `${INTERVIEW_MARKER}\nQ`, created_at: ago(d) });

test('timer: dry run decides but changes nothing; a live run nudges and stalls', () => {
  const table = { 'issues?labels=stage:interview': [interviewIssue(1), interviewIssue(2), interviewIssue(3)], 'issues/1/comments': [botQ(4)], 'issues/2/comments': [botQ(9)], 'issues/3/comments': [botQ(1)] };
  const dry = fakes(table);
  assert.deepEqual(runTimer({ repo: 'o/r', dry: true, now, gh: dry.gh, ghJson: dry.ghJson, log: quiet }), []);
  assert.equal(dry.writes().length, 0);

  const live = fakes(table);
  const acted = runTimer({ repo: 'o/r', now, gh: live.gh, ghJson: live.ghJson, log: quiet });
  assert.deepEqual(acted, [{ number: 1, action: 'nudge' }, { number: 2, action: 'stall' }]);
  const w = live.writes().join('\n');
  assert.match(w, /issue comment 1 .*pipeline:nudge/);
  assert.match(w, /issue edit 2 .*--remove-label stage:interview --add-label stage:stalled --add-assignee rustymuffler/);
  assert.match(w, /issue comment 2 .*pipeline:stalled/);
  assert.doesNotMatch(w, /issue (comment|edit) 3/);
});

test('timer: pull requests and invalid repo names are ignored or rejected', () => {
  const f = fakes({ 'issues?labels=stage:interview': [{ number: 5, user: { login: OWNER }, pull_request: {} }] });
  assert.deepEqual(runTimer({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, log: quiet }), []);
  assert.throws(() => runTimer({ repo: 'o/r; rm -rf', now, log: quiet }), /owner\/name/);
});

test('merged: schedules the issue, removes stale stage labels, records slug and date', async () => {
  const mdx = Buffer.from('---\ntitle: "x"\ndate: 2026-12-08\n---\nbody\n').toString('base64');
  const f = fakes(
    { 'pulls/9/files': [{ filename: 'src/content/posts/my-new-article/index.mdx' }, { filename: 'public/assets/posts/my-new-article/hero.png' }], 'issues/12/labels': [{ name: 'stage:review' }, { name: 'cat:tech-tools' }] },
    { 'contents/src/content/posts/my-new-article/index.mdx': JSON.stringify({ content: mdx }), 'repos/o/r/issues/12': JSON.stringify({ user: { login: OWNER } }) },
  );
  const r = await runMerged({ repo: 'o/r', headRef: 'article/12', prNumber: '9', mergeSha: 'a'.repeat(40), gh: f.gh, ghJson: f.ghJson, log: quiet });
  assert.deepEqual(r, { issue: 12, slug: 'my-new-article', date: '2026-12-08' });
  const w = f.writes().join('\n');
  assert.match(w, /issue edit 12 .*--add-label stage:scheduled --remove-label stage:review --remove-assignee rustymuffler/);
  assert.doesNotMatch(w, /--remove-label stage:stalled/);
  assert.ok(w.includes(slugMarker('my-new-article', '2026-12-08')));
});

test('merged: ignores non-article branches, mixed PRs, and bad inputs', async () => {
  const f = fakes({});
  assert.equal(await runMerged({ repo: 'o/r', headRef: 'feat/x', prNumber: '9', mergeSha: 'a'.repeat(40), gh: f.gh, ghJson: f.ghJson, log: quiet }), undefined);
  assert.equal(f.writes().length, 0);
  const mixed = fakes({ 'pulls/9/files': [{ filename: 'src/content/posts/a-b-c/index.mdx' }, { filename: 'src/components/X.astro' }, { filename: 'src/content/posts/x-y-z/index.mdx' }] }, { 'repos/o/r/issues/3': JSON.stringify({ user: { login: OWNER } }) });
  assert.equal(await runMerged({ repo: 'o/r', headRef: 'article/3', prNumber: '9', mergeSha: 'a'.repeat(40), gh: mixed.gh, ghJson: mixed.ghJson, log: quiet }), undefined);
  assert.equal(mixed.writes().length, 0);
  await assert.rejects(runMerged({ repo: 'o/r', headRef: 'article/3', prNumber: '9', mergeSha: 'not-a-sha', log: quiet }), /MERGE_SHA/);
  await assert.rejects(runMerged({ repo: 'o/r', headRef: 'article/3', prNumber: 'x', mergeSha: 'a'.repeat(40), log: quiet }), /PR_NUMBER/);
});

const scheduled = (n: number, slug: string, date: string) => ({
  issue: { number: n, user: { login: OWNER } },
  comments: [{ user: { login: BOT }, body: slugMarker(slug, date), created_at: ago(1) }],
});

test('verify: a due, live article is published and closed; a future one is left alone', async () => {
  const a = scheduled(20, 'live-article-one', '2026-11-30');
  const b = scheduled(21, 'future-article-two', '2026-12-08');
  const f = fakes({ 'issues?labels=stage:scheduled': [a.issue, b.issue], 'issues/20/comments': a.comments, 'issues/21/comments': b.comments, 'issues/20/labels': [{ name: 'stage:scheduled' }] });
  const published = await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => [], wait: async () => {}, log: quiet });
  assert.deepEqual(published, [20]);
  const w = f.writes().join('\n');
  assert.match(w, /issue edit 20 .*--add-label stage:published --remove-label stage:scheduled/);
  assert.match(w, /issue close 20 .*--reason completed/);
  assert.doesNotMatch(w, /issue (edit|comment|close) 21/);
});

test('verify: not live yet retries, then waits; an overdue article gets one warning', async () => {
  const a = scheduled(30, 'late-article-three', '2026-11-25');
  const f = fakes({ 'issues?labels=stage:scheduled': [a.issue], 'issues/30/comments': a.comments, 'issues/30/labels': [] });
  let checks = 0;
  const published = await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => { checks += 1; return ['the page returned 404']; }, wait: async () => {}, retries: 2, log: quiet });
  assert.deepEqual(published, []);
  assert.equal(checks, 3);
  const w = f.writes().join('\n');
  assert.match(w, /issue comment 30 .*pipeline:publish-warning/);
  assert.doesNotMatch(w, /issue close/);

  const warned = scheduled(31, 'warned-article-four', '2026-11-25');
  warned.comments.push({ user: { login: BOT }, body: '<!-- pipeline:publish-warning -->', created_at: ago(1) });
  const g = fakes({ 'issues?labels=stage:scheduled': [warned.issue], 'issues/31/comments': warned.comments });
  await runVerify({ repo: 'o/r', now, gh: g.gh, ghJson: g.ghJson, liveCheck: async () => ['not in the sitemap'], wait: async () => {}, retries: 0, log: quiet });
  assert.equal(g.writes().length, 0);
});

test('verify: other people issues and issues without a marker are skipped', async () => {
  const stranger = { number: 40, user: { login: 'stranger' } };
  const noMarker = { number: 41, user: { login: OWNER } };
  const f = fakes({ 'issues?labels=stage:scheduled': [stranger, noMarker], 'issues/41/comments': [{ user: { login: BOT }, body: 'hello', created_at: ago(1) }] });
  assert.deepEqual(await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => [], wait: async () => {}, log: quiet }), []);
  assert.equal(f.writes().length, 0);
});

test('merged: an issue the owner did not open, or an article without a date, is not tracked', async () => {
  const stranger = fakes({ 'pulls/9/files': [{ filename: 'src/content/posts/my-new-article/index.mdx' }] }, { 'repos/o/r/issues/7': JSON.stringify({ user: { login: 'stranger' } }) });
  assert.equal(await runMerged({ repo: 'o/r', headRef: 'article/7', prNumber: '9', mergeSha: 'a'.repeat(40), gh: stranger.gh, ghJson: stranger.ghJson, log: quiet }), undefined);
  assert.equal(stranger.writes().length, 0);
  const noDate = fakes(
    { 'pulls/9/files': [{ filename: 'src/content/posts/my-new-article/index.mdx' }] },
    { 'contents/src/content/posts/my-new-article/index.mdx': JSON.stringify({ content: Buffer.from('---\ntitle: x\n---\n').toString('base64') }), 'repos/o/r/issues/8': JSON.stringify({ user: { login: OWNER } }) },
  );
  await assert.rejects(runMerged({ repo: 'o/r', headRef: 'article/8', prNumber: '9', mergeSha: 'a'.repeat(40), gh: noDate.gh, ghJson: noDate.ghJson, log: quiet }), /No valid date/);
  assert.equal(noDate.writes().length, 0);
});

test('verify: schedule markers and warning markers from anyone but github-actions[bot] are ignored', async () => {
  const marker = slugMarker('spoofed-article-five', '2026-11-20');
  const spoof = (login: string) => ({ user: { login }, body: marker, created_at: ago(1) });
  for (const login of ['stranger', OWNER, 'github-actions']) {
    const f = fakes({ 'issues?labels=stage:scheduled': [{ number: 50, user: { login: OWNER } }], 'issues/50/comments': [spoof(login)] });
    const published = await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => [], wait: async () => {}, log: quiet });
    assert.deepEqual(published, [], login);
    assert.equal(f.writes().length, 0, login);
  }
  const a = scheduled(51, 'overdue-article-six', '2026-11-25');
  a.comments.push({ user: { login: 'stranger' }, body: '<!-- pipeline:publish-warning -->', created_at: ago(1) });
  const f = fakes({ 'issues?labels=stage:scheduled': [a.issue], 'issues/51/comments': a.comments });
  await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => ['not in the sitemap'], wait: async () => {}, log: quiet });
  assert.match(f.writes().join('\n'), /pipeline:publish-warning/); // a stranger's copy of the marker does not suppress the warning
});

test('verify: no retries by default, and a run deadline stops the retries', async () => {
  const a = scheduled(60, 'slow-article-seven', '2026-11-30');
  let checks = 0;
  const f = fakes({ 'issues?labels=stage:scheduled': [a.issue], 'issues/60/comments': a.comments });
  await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => { checks += 1; return ['the page returned 404']; }, wait: async () => {}, log: quiet });
  assert.equal(checks, 1);

  let t = 0;
  const clock = () => { t += 100000; return t; }; // each reading advances 100 s against an 8 minute budget
  checks = 0;
  await runVerify({ repo: 'o/r', now, gh: f.gh, ghJson: f.ghJson, liveCheck: async () => { checks += 1; return ['the page returned 404']; }, wait: async () => {}, retries: 50, clock, log: quiet });
  assert.ok(checks > 1 && checks < 10, `checks ${checks}`);
});

test('one failing issue does not stop the others, but the run reports the failure', async () => {
  const a = scheduled(70, 'broken-article-eight', '2026-11-30');
  const b = scheduled(71, 'fine-article-nine', '2026-11-30');
  const f = fakes({ 'issues?labels=stage:scheduled': [a.issue, b.issue], 'issues/70/comments': a.comments, 'issues/71/comments': b.comments, 'issues/71/labels': [{ name: 'stage:scheduled' }] });
  const gh = (args: string[]) => {
    if (args.join(' ').includes('issue comment 70')) throw new Error('rate limited');
    return f.gh(args);
  };
  await assert.rejects(runVerify({ repo: 'o/r', now, gh, ghJson: f.ghJson, liveCheck: async () => [], wait: async () => {}, log: quiet }), /Could not process issue\(s\): 70/);
  assert.match(f.writes().join('\n'), /issue close 71/);

  const t = fakes({ 'issues?labels=stage:interview': [interviewIssue(80), interviewIssue(81)], 'issues/80/comments': [botQ(4)], 'issues/81/comments': [botQ(4)] });
  const tgh = (args: string[]) => {
    if (args.join(' ').includes('issue comment 80')) throw new Error('boom');
    return t.gh(args);
  };
  assert.throws(() => runTimer({ repo: 'o/r', now, gh: tgh, ghJson: t.ghJson, log: quiet }), /Could not process issue\(s\): 80/);
  assert.match(t.writes().join('\n'), /issue comment 81/);
});
