import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOT, INTERVIEW_MARKER, NUDGE_MARKER, OWNER, STALLED_MARKER, decideStall, isDue, issueFromBranch, liveProblems, parseSlugMarker, slugFromFiles, slugMarker } from '../scripts/lib/tracking.mjs';

const day = 24 * 60 * 60 * 1000;
const now = new Date('2026-12-01T12:00:00Z');
const ago = (d: number) => new Date(now.valueOf() - d * day).toISOString();
const issue = { user: { login: OWNER } };
const botQ = (d: number) => ({ user: { login: BOT }, body: `${INTERVIEW_MARKER}\nQuestions`, created_at: ago(d) });
const mine = (d: number) => ({ user: { login: OWNER }, body: 'my answer', created_at: ago(d) });

test('waiting on Richard: nothing before 3 days, one nudge at 3, stalled at 7', () => {
  assert.equal(decideStall(issue, [botQ(1)], now).action, 'none');
  assert.equal(decideStall(issue, [botQ(3.5)], now).action, 'nudge');
  assert.equal(decideStall(issue, [botQ(8)], now).action, 'stall');
});

test('a nudge is sent once, and the stall once', () => {
  const nudge = { user: { login: BOT }, body: `${NUDGE_MARKER}\nnudge`, created_at: ago(1) };
  assert.equal(decideStall(issue, [botQ(4), nudge], now).action, 'none');
  const stalled = { user: { login: BOT }, body: `${STALLED_MARKER}\nstalled`, created_at: ago(0.5) };
  assert.equal(decideStall(issue, [botQ(8), nudge, stalled], now).action, 'none');
});

test('a new interview message restarts the clock; Richard answering last means no action', () => {
  const oldNudge = { user: { login: BOT }, body: `${NUDGE_MARKER}`, created_at: ago(6) };
  assert.equal(decideStall(issue, [botQ(9), oldNudge, botQ(4)], now).action, 'nudge'); // a nudge before the latest question does not count
  assert.equal(decideStall(issue, [botQ(9), mine(8)], now).action, 'none');
  assert.equal(decideStall(issue, [botQ(9), mine(8), botQ(1)], now).action, 'none');
});

test('strangers, other bots and unstarted interviews are ignored', () => {
  assert.equal(decideStall({ user: { login: 'someone-else' } }, [botQ(9)], now).action, 'none');
  assert.equal(decideStall(issue, [], now).action, 'none');
  const stranger = { user: { login: 'stranger' }, body: `${INTERVIEW_MARKER}`, created_at: ago(1) };
  assert.equal(decideStall(issue, [botQ(9), stranger], now).action, 'stall'); // a stranger's comment does not reset the clock
  const otherBot = { user: { login: 'dependabot[bot]' }, body: 'hi', created_at: ago(1) };
  assert.equal(decideStall(issue, [botQ(9), otherBot], now).action, 'stall');
  const unmarked = { user: { login: BOT }, body: 'some other bot comment', created_at: ago(1) };
  assert.equal(decideStall(issue, [botQ(9), unmarked], now).action, 'stall');
  assert.equal(decideStall(issue, [{ user: { login: BOT }, body: INTERVIEW_MARKER, created_at: 'garbage' }], now).action, 'none');
});

test('the slug marker round-trips and rejects malformed input', () => {
  const m = slugMarker('my-new-article', '2026-12-08');
  assert.deepEqual(parseSlugMarker(`Scheduled. ${m}`), { slug: 'my-new-article', date: '2026-12-08' });
  assert.equal(parseSlugMarker('<!-- pipeline:scheduled slug=../../etc date=2026-12-08 -->'), null);
  assert.equal(parseSlugMarker('<!-- pipeline:scheduled slug=a-b-c date=tomorrow -->'), null);
  assert.equal(parseSlugMarker(undefined), null);
});

test('due dates, branch names and article folders', () => {
  assert.equal(isDue('2026-12-01', now), true);
  assert.equal(isDue('2026-12-02', now), false);
  assert.equal(isDue('nonsense', now), false);
  assert.equal(issueFromBranch('article/165'), 165);
  assert.equal(issueFromBranch('article/165-999999'), 165);
  assert.equal(issueFromBranch('feat/article/165'), null);
  assert.equal(issueFromBranch('article/../x'), null);
  assert.equal(slugFromFiles(['src/content/posts/my-new-article/index.mdx', 'src/content/posts/my-new-article/interview-notes.md', 'public/assets/posts/my-new-article/hero.png']), 'my-new-article');
  assert.equal(slugFromFiles(['src/content/posts/a-b-c/index.mdx', 'src/content/posts/x-y-z/index.mdx']), null);
  assert.equal(slugFromFiles(['src/components/X.astro']), null);
});

test('live checks need a 200 page and a sitemap, rss and llms entry', () => {
  const ok = { slug: 'my-new-article', pageStatus: 200, sitemap: '<loc>https://probl.me/blog/my-new-article/</loc>', rss: '/blog/my-new-article/', llms: '(https://probl.me/blog/my-new-article/)' };
  assert.deepEqual(liveProblems(ok), []);
  assert.equal(liveProblems({ ...ok, pageStatus: 404 }).length, 1);
  assert.equal(liveProblems({ ...ok, sitemap: '', rss: '', llms: '' }).length, 3);
});
