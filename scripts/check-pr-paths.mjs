#!/usr/bin/env node
/**
 * Content PR path guard (roadmap item P0-4).
 *
 * Pipeline PRs (branches named article/<n>) may change only one article folder
 * and its image folder:
 *   src/content/posts/<slug>/...   and   public/assets/posts/<slug>/...
 * Anything else (components, layouts, styles, workflows, scripts, config) must go
 * through the code workflow with the Security Auditor and Code Reviewer steps
 * (AGENTS.md: "Content PRs that touch site code").
 *
 *   node scripts/check-pr-paths.mjs <base-ref>     env HEAD_REF = the PR's head branch
 *
 * Branches that are not article/* pass without checks.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ARTICLE_BRANCH = /^article\/[0-9]+(-[0-9]+)?$/;

/** Returns a list of problems; an empty list means the change set is allowed. */
export function checkPaths(files) {
  const problems = [];
  if (files.length === 0) return ['The pull request changes no files.'];
  const slugs = new Set();
  for (const f of files) {
    const m = /^(?:src\/content\/posts|public\/assets\/posts)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/[^/].*$/.exec(f);
    if (!m || f.includes('..')) {
      problems.push(`Not allowed in an article PR: ${f}`);
      continue;
    }
    slugs.add(m[1]);
  }
  if (slugs.size > 1) {
    problems.push(`An article PR may touch only one article, found: ${[...slugs].join(', ')}`);
  }
  return problems;
}

function main() {
  const head = process.env.HEAD_REF ?? '';
  const base = process.argv[2];
  if (!ARTICLE_BRANCH.test(head)) {
    console.log(`Branch "${head}" is not an article branch; nothing to check.`);
    return;
  }
  if (!base || !/^(?!-)[\w./-]+$/.test(base)) throw new Error('Usage: check-pr-paths.mjs <base-ref>');
  // --no-renames lists both the old and new path of a move, so a component moved into an article
  // folder cannot hide its deletion.
  const out = execFileSync('git', ['diff', '--name-only', '--no-renames', `${base}...HEAD`], { encoding: 'utf8' });
  const files = out.split('\n').map((s) => s.trim()).filter(Boolean);
  const problems = checkPaths(files);
  if (problems.length) {
    for (const p of problems) console.log(`::error::${p}`);
    console.log('Article PRs may only change one article folder and its images. Use the code workflow for anything else.');
    process.exit(1);
  }
  console.log(`OK: ${files.length} file(s), all within one article.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
