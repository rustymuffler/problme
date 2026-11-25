import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractInstructions, prProblem, sanitizeSummary, slugOfPr, MAX_INSTRUCTIONS } from '../scripts/lib/revise.mjs';
import { prepare } from '../scripts/revise.mjs';

const REPO = 'rustymuffler/problme';
const goodPr = { state: 'open', merged: false, head: { ref: 'article/165', sha: 'a'.repeat(40), repo: { full_name: REPO } }, user: { login: 'github-actions[bot]' } };

test('extractInstructions: command must start a line; rest of line and following lines are the text', () => {
  assert.deepEqual(extractInstructions('@claude revise shorten the intro and fix the typo in section two'), { ok: true, text: 'shorten the intro and fix the typo in section two' });
  const multi = extractInstructions('thanks\n  @Claude   REVISE\nmake the TL;DR shorter\nand drop the last FAQ');
  assert.equal(multi.ok, true);
  assert.equal(multi.text, 'make the TL;DR shorter\nand drop the last FAQ');
  assert.equal(extractInstructions('please @claude revise this later, thanks').ok, false); // not at the start of a line
  assert.equal(extractInstructions('@claude revisement of the intro please do it').ok, false); // a different word
  assert.equal(extractInstructions('@claude revise ok').ok, false); // too short
  assert.equal(extractInstructions(`@claude revise ${'x'.repeat(MAX_INSTRUCTIONS + 1)}`).ok, false);
  assert.equal(extractInstructions(undefined).ok, false);
});

test('extractInstructions stays fast on hostile input', () => {
  const start = Date.now();
  extractInstructions(`${' '.repeat(100000)}@claude${' '.repeat(100000)}revise`);
  extractInstructions(`${'@claude revis\n'.repeat(50000)}`);
  assert.ok(Date.now() - start < 1500);
});

test('prProblem accepts an open same-repo pipeline article PR and rejects the rest', () => {
  assert.equal(prProblem(goodPr, REPO), '');
  assert.equal(prProblem({ ...goodPr, user: { login: 'rustymuffler' } }, REPO), '');
  assert.match(prProblem({ ...goodPr, state: 'closed' }, REPO), /open article pull request/);
  assert.match(prProblem({ ...goodPr, merged: true }, REPO), /already merged/);
  assert.match(prProblem({ ...goodPr, head: { ...goodPr.head, repo: { full_name: 'someone/fork' } } }, REPO), /not in this repository/);
  assert.match(prProblem({ ...goodPr, head: { ...goodPr.head, ref: 'feat/x' } }, REPO), /article\/<issue>/);
  assert.match(prProblem({ ...goodPr, user: { login: 'stranger' } }, REPO), /not opened by/);
  assert.match(prProblem({ ...goodPr, head: { ...goodPr.head, repo: null } }, REPO), /not in this repository/);
  assert.match(prProblem(null, REPO), /Could not read/);
});

test('slugOfPr needs exactly one article folder', () => {
  const f = (name: string) => ({ filename: name });
  assert.equal(slugOfPr([f('src/content/posts/aa-bb-cc/index.mdx'), f('public/assets/posts/aa-bb-cc/hero.png')]), 'aa-bb-cc');
  assert.equal(slugOfPr([f('src/content/posts/aa-bb-cc/index.mdx'), f('src/content/posts/dd-ee-ff/index.mdx')]), null);
  assert.equal(slugOfPr([f('src/pages/index.astro')]), null);
});

test('sanitizeSummary strips markup, controls and mentions and bounds length', () => {
  const out = sanitizeSummary('Changed: <b>x</b> <!-- hidden --> ![pixel](http://t/x.png) ping @someone​ and \u0007 bell');
  assert.ok(!out.includes('<b>') && !out.includes('hidden') && !out.includes('pixel') && !out.includes('\u0007'));
  assert.ok(out.includes('@​someone'));
  assert.equal(sanitizeSummary('y'.repeat(5000)).length, 2003);
  assert.equal(sanitizeSummary(null), '');
});

function fakeGh({ pr = goodPr, files = ['src/content/posts/aa-bb-cc/index.mdx', 'src/content/posts/aa-bb-cc/interview-notes.md'], mdx = '---\ntitle: T\ndate: 2026-12-01\n---\nBody\n', calls = [] as string[][] } = {}) {
  const gh = (args: string[]) => {
    calls.push(args);
    const url = args.find((a) => a.startsWith('repos/')) ?? '';
    if (/pulls\/\d+$/.test(url)) return JSON.stringify(pr);
    if (url.includes('/contents/')) return JSON.stringify({ content: Buffer.from(mdx).toString('base64') });
    return '{}';
  };
  const ghJson = () => files.map((filename) => ({ filename }));
  return { gh, ghJson, calls };
}

test('prepare writes the instructions and returns branch, slug, issue and date', () => {
  const writes: Record<string, string> = {};
  const { gh, ghJson, calls } = fakeGh();
  const r = prepare({ repo: REPO, prNumber: 184, commentBody: '@claude revise tighten the intro paragraph', commentId: 99, gh, ghJson, write: (p: string, t: string) => { writes[p] = t; }, mkdir: () => {} });
  assert.deepEqual(r, { ok: true, branch: 'article/165', slug: 'aa-bb-cc', issue: 165, publishDate: '2026-12-01' });
  assert.equal(writes['.pipeline-tmp/instructions.md'], 'tighten the intro paragraph\n');
  assert.ok(calls.some((c) => c.join(' ').includes('issues/comments/99/reactions')));
});

test('prepare refuses bad requests without writing anything', () => {
  const writes: string[] = [];
  const opts = { repo: REPO, prNumber: 184, commentId: 1, write: (p: string) => { writes.push(p); }, mkdir: () => {} };
  assert.equal(prepare({ ...opts, commentBody: 'hello', ...fakeGh() }).ok, false);
  assert.equal(prepare({ ...opts, commentBody: '@claude revise do something useful', ...fakeGh({ pr: { ...goodPr, state: 'closed' } }) }).ok, false);
  assert.equal(prepare({ ...opts, commentBody: '@claude revise do something useful', ...fakeGh({ files: ['src/pages/index.astro'] }) }).ok, false);
  assert.equal(prepare({ ...opts, commentBody: '@claude revise do something useful', ...fakeGh({ mdx: 'no frontmatter' }) }).ok, false);
  assert.deepEqual(writes, []);
  assert.throws(() => prepare({ ...opts, repo: 'bad repo', commentBody: '@claude revise do something useful', ...fakeGh() }), /REPO/);
});
