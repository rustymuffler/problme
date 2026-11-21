import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPaths } from '../scripts/check-pr-paths.mjs';

test('one article folder and its images is allowed', () => {
  assert.deepEqual(
    checkPaths([
      'src/content/posts/my-new-article/index.mdx',
      'src/content/posts/my-new-article/interview-notes.md',
      'public/assets/posts/my-new-article/hero.png',
    ]),
    [],
  );
});

test('site code, workflows, scripts and config are rejected', () => {
  for (const f of [
    'src/components/Callout.astro',
    'src/layouts/Layout.astro',
    '.github/workflows/ci.yml',
    'scripts/lint-content.mjs',
    'astro.config.mjs',
    'package.json',
    'src/content/posts/index.mdx',
  ]) {
    assert.equal(checkPaths(['src/content/posts/a-b-c/index.mdx', f]).length, 1, f);
  }
});

test('two articles in one PR are rejected', () => {
  const problems = checkPaths(['src/content/posts/a-b-c/index.mdx', 'public/assets/posts/x-y-z/hero.png']);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /only one article/);
});

test('an empty change set and path tricks are rejected', () => {
  assert.equal(checkPaths([]).length, 1);
  assert.ok(checkPaths(['src/content/posts/a-b-c/../../../../etc/passwd']).length >= 1);
  assert.ok(checkPaths(['src/content/posts/UPPER/index.mdx']).length >= 1);
});
