#!/usr/bin/env bash
# Open (or reuse) the PR for the article branch and verify CI started.
# Env: GH_TOKEN, GH_TOKEN_FALLBACK, REPO, BRANCH, SLUG, ISSUE_NUMBER, DEFAULT_BRANCH.
# Writes pr_number and pr_url to $GITHUB_OUTPUT.
set -euo pipefail
file="src/content/posts/$SLUG/index.mdx"
title="$(sed -n 's/^title:[[:space:]]*//p' "$file" | head -1 | sed -E 's/^"(.*)"$/\1/' | tr -d '\r\n' | head -c 120)"
[ -n "$title" ] || title="Draft article for issue #$ISSUE_NUMBER"
errs="$(grep -c '^  error' .pipeline-tmp/lint-output.txt || true)"
warns="$(grep -c '^  warning' .pipeline-tmp/lint-output.txt || true)"
markers="$(grep -cE '\[(UNVERIFIED|NOT ANSWERED|IMAGE)' "$file" || true)"
scan="$(cat .pipeline-tmp/scan-summary.txt 2>/dev/null || echo unavailable)"
domains="$(grep -oE '\]\(https?://[^/) ]+' "$file" | sed -E 's#\]\(https?://##' | sort -u | tr '\n' ' ')"

cat > .pipeline-tmp/pr-body.md <<BODY
Article issue: #$ISSUE_NUMBER (not a closing keyword: the issue stays open until the article is live)

Automated draft from the content pipeline (interview notes, research brief, draft). Nothing here has been published; merging schedules it for its \`date\`.

## Status
- Content lint: $errs error(s), $warns warning(s). Errors block merge; see the \`Content lint\` check.
- Open placeholders to resolve: $markers (\`[UNVERIFIED]\`, \`[NOT ANSWERED]\`, \`[IMAGE]\`). The lint blocks merge until these are resolved.
- Research safety scan: $scan
- External link hosts in the article: ${domains:-none}
- Images: made by the Image Creator step when it succeeds. If the hero or the required in-article images are missing, the content lint blocks the merge.
- Publish date was set by the pipeline to the next Tuesday or Thursday; change \`date\` in the frontmatter if you prefer another day.

## Reviews
- Proofreader, SEO, AEO and GEO, voice and value, and fact-check reviews run next, as separate runs (up to three passes, with revisions committed to this branch; each push re-runs CI).
- This PR stays a draft until every review passes and the content lint is clean. A scorecard comment follows with each review's scores and anything unresolved. If it is still a draft after the last pass, the scorecard lists what needs you.

BODY

# The Claude App token is not usable here (it is revoked when the Claude action step ends), and live runs
# returned HTTP 401 on GraphQL calls. Use the default Actions token for every call below. CI does not start
# for PRs it opens; the PR comment below and the handover tell Richard to close and reopen once.
orig_token="${GH_TOKEN:-}"
export GH_TOKEN="$GH_TOKEN_FALLBACK"
trap 'echo "open-pr.sh failed at line $LINENO: $BASH_COMMAND" >&2' ERR

# Diagnostics for the first live runs (prints only token prefix, length and HTTP status codes).
diag() { # $1 label, $2 token
  local t="$2" r g
  r="$(curl -q --max-time 10 -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $t" "https://api.github.com/repos/$REPO" || echo curl-failed)"
  g="$(curl -q --max-time 10 -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $t" -X POST -d '{"query":"{viewer{login}}"}' https://api.github.com/graphql || echo curl-failed)"
  echo "token-check $1: prefix=${t:0:4} length=${#t} rest=$r graphql=$g"
}
diag fallback "$GH_TOKEN_FALLBACK"
[ "$orig_token" = "$GH_TOKEN_FALLBACK" ] && echo "token-check: preferred token is the same as the fallback" || diag preferred "$orig_token"

# REST only (no GraphQL), so a token that fails GraphQL cannot stop the PR from opening.
existing="$(gh api "repos/$REPO/pulls?state=open&head=${REPO%%/*}:$BRANCH" --jq '.[0].number // empty')"
if [ -n "$existing" ]; then
  pr_number="$existing"
else
  # Opened as a draft until the Proofreader and SEO review stages exist (MILESTONES invariants 4 and 8).
  pr_number="$(gh api -X POST "repos/$REPO/pulls" -f title="$title" -f head="$BRANCH" -f base="$DEFAULT_BRANCH" -F body=@.pipeline-tmp/pr-body.md -F draft=true --jq .number)"
fi
pr_url="https://github.com/$REPO/pull/$pr_number"
echo "pr_number=$pr_number" >> "$GITHUB_OUTPUT"
echo "pr_url=$pr_url" >> "$GITHUB_OUTPUT"

# A PR opened with the default Actions token does not start CI. Poll up to 2 minutes, then say so.
sha="$(gh api "repos/$REPO/pulls/$pr_number" --jq .head.sha)"
count=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  count="$(gh api "repos/$REPO/commits/$sha/check-runs" --jq .total_count || echo 0)"
  [ "$count" -gt 0 ] && break
  sleep 10
done
if [ "$count" -eq 0 ]; then
  gh api -X POST "repos/$REPO/issues/$pr_number/comments" -f body="CI checks did not start on this PR (GitHub does not run them for PRs opened by the default Actions token). Close and reopen this PR once to start them; they are required before merge." >/dev/null
fi
