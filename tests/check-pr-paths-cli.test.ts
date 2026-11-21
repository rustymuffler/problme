import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const script = path.resolve('scripts/check-pr-paths.mjs');

function git(cwd: string, ...args: string[]) {
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, stdio: 'pipe' });
}

function run(cwd: string, headRef: string) {
  return spawnSync('node', [script, 'main'], { cwd, env: { ...process.env, HEAD_REF: headRef }, encoding: 'utf8' });
}

test('a component moved into an article folder is still rejected (rename bypass)', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pathguard-'));
  try {
    git(dir, 'init', '-q', '-b', 'main');
    mkdirSync(path.join(dir, 'src/components'), { recursive: true });
    writeFileSync(path.join(dir, 'src/components/X.astro'), '<div>component</div>\n'.repeat(20));
    git(dir, 'add', '-A');
    git(dir, 'commit', '-q', '-m', 'base');
    git(dir, 'switch', '-q', '-c', 'article/1');
    mkdirSync(path.join(dir, 'src/content/posts/my-new-article'), { recursive: true });
    git(dir, 'mv', 'src/components/X.astro', 'src/content/posts/my-new-article/X.astro');
    git(dir, 'commit', '-q', '-m', 'move');

    const result = run(dir, 'article/1');
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /src\/components\/X\.astro/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a clean article change passes, and non-article branches are skipped', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pathguard-'));
  try {
    git(dir, 'init', '-q', '-b', 'main');
    writeFileSync(path.join(dir, 'README.md'), 'hi\n');
    git(dir, 'add', '-A');
    git(dir, 'commit', '-q', '-m', 'base');
    git(dir, 'switch', '-q', '-c', 'article/2');
    mkdirSync(path.join(dir, 'src/content/posts/clean-article-slug'), { recursive: true });
    writeFileSync(path.join(dir, 'src/content/posts/clean-article-slug/index.mdx'), 'x\n');
    git(dir, 'add', '-A');
    git(dir, 'commit', '-q', '-m', 'article');

    assert.equal(run(dir, 'article/2').status, 0);
    assert.equal(run(dir, 'feat/anything').status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
