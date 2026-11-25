/**
 * Decisions for the owner's `@claude revise` command on an article pull request. Pure functions, so
 * they are unit-tested; scripts/revise.mjs only fetches and writes.
 *
 * Every regular expression is linear and anchored or bounded. The comment text is the owner's own, but
 * the same text may be quoted by others, so nothing here evaluates it.
 */
import { OWNER, issueFromBranch, slugFromFiles } from './tracking.mjs';

export const MIN_INSTRUCTIONS = 10;
export const MAX_INSTRUCTIONS = 4000;
export const MAX_SUMMARY = 2000;

// Built from code points so this file stays plain ASCII (invisible and bidirectional characters in source are a review hazard).
const ZWSP = String.fromCharCode(0x200b);
const HIDDEN_RANGES = [[0x00, 0x08], [0x0b, 0x1f], [0x7f, 0x7f], [0x200b, 0x200f], [0x202a, 0x202e], [0x2060, 0x2064], [0xfeff, 0xfeff]];
const HIDDEN = new RegExp(`[${HIDDEN_RANGES.map(([a, b]) => `${String.fromCharCode(a)}-${String.fromCharCode(b)}`).join('')}]`, 'g');

/**
 * Pull the instructions out of a comment. The command is `@claude revise` at the start of a line; the
 * instructions are the rest of that line and every line after it. Returns { ok, text } or { ok: false, error }.
 */
export function extractInstructions(body) {
  const lines = String(body ?? '').replace(/\r\n/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trimStart();
    if (line.length < 14 || line.slice(0, 7).toLowerCase() !== '@claude') continue;
    const rest = line.slice(7);
    if (!/^[ \t]+revise(?![A-Za-z0-9_])/i.test(rest)) continue;
    const afterWord = rest.replace(/^[ \t]+revise/i, '');
    const text = [afterWord, ...lines.slice(i + 1)].join('\n').trim();
    if (text.length < MIN_INSTRUCTIONS) return { ok: false, error: `Say what to change after \`@claude revise\` (at least ${MIN_INSTRUCTIONS} characters).` };
    if (text.length > MAX_INSTRUCTIONS) return { ok: false, error: `The instructions are too long (${text.length} characters; the limit is ${MAX_INSTRUCTIONS}). Split them into two comments.` };
    return { ok: true, text };
  }
  return { ok: false, error: 'No `@claude revise` command found at the start of a line.' };
}

/** What is wrong with this pull request for a revision (empty string when it is fine). */
export function prProblem(pr, repo) {
  if (!pr || typeof pr !== 'object') return 'Could not read the pull request.';
  if (pr.state !== 'open') return 'Revisions only work on an open article pull request. For a merged article, open a new issue or edit the file directly.';
  if (pr.merged) return 'This pull request is already merged.';
  if (String(pr.head?.repo?.full_name ?? '') !== repo) return 'The pull request branch is not in this repository.';
  if (issueFromBranch(pr.head?.ref) === null) return 'Only pipeline article branches (article/<issue>) can be revised this way.';
  const author = pr.user?.login;
  if (author !== 'github-actions[bot]' && author !== OWNER) return 'This pull request was not opened by the pipeline or by the owner.';
  return '';
}

/** The slug of the one article this pull request carries, from its changed files; null otherwise. */
export function slugOfPr(files) {
  return slugFromFiles((files ?? []).map((f) => f.filename ?? f));
}

/**
 * Make the Writer's short summary (or an error message) safe to post: bounded, no control or hidden
 * characters, no HTML or comments, no images, no links of any kind, no code fences, and @mentions and
 * #references neutralised so nobody gets pinged or cross-linked.
 */
export function sanitizeSummary(text) {
  let s = String(text ?? '');
  s = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?[A-Za-z][^>\n]{0,200}>/g, '');
  s = s.replace(/!\[[^\]\n]{0,200}\]\([^)\n]{0,500}\)/g, '');
  s = s.replace(HIDDEN, '');
  s = s.replace(/\[([^\]\n]{0,200})\]\([^)\n]{0,500}\)/g, '$1');
  s = s.replace(/https?:\/\/[^\s)>]{1,500}/gi, '[link removed]');
  s = s.replace(/`/g, "'");
  s = s.replace(/@(?=\w)/g, `@${ZWSP}`);
  s = s.replace(/#(?=\d)/g, '# ');
  s = s.trim();
  return s.length > MAX_SUMMARY ? `${s.slice(0, MAX_SUMMARY)}...` : s;
}
