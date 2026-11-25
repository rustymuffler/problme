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
Closes #$ISSUE_NUMBER

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

# The Claude App token is revoked when the Claude action step ends, so it is usually dead by now (first live
# run: HTTP 401). Probe it once and use the default Actions token for everything below when it fails.
# Probe with the same kind of call the script makes (GraphQL): the first live run showed the REST probe passing while
# GraphQL still returned 401.
if ! GH_TOKEN="$GH_TOKEN" gh pr list --repo "$REPO" --limit 1 --json number >/dev/null 2>&1; then
  echo "The preferred token is not valid; using the default Actions token (CI will not start automatically)."
  export GH_TOKEN="$GH_TOKEN_FALLBACK"
fi
existing="$(gh pr list --repo "$REPO" --head "$BRANCH" --state open --json url --jq '.[0].url // ""')"
if [ -n "$existing" ]; then
  pr_url="$existing"
else
  # Opened as a draft until the Proofreader and SEO review stages exist (MILESTONES invariants 4 and 8).
  create=(gh pr create --draft --repo "$REPO" --base "$DEFAULT_BRANCH" --head "$BRANCH" --title "$title" --body-file .pipeline-tmp/pr-body.md)
  pr_url="$("${create[@]}")"
fi
pr_number="$(gh pr view "$pr_url" --repo "$REPO" --json number --jq .number)"
echo "pr_number=$pr_number" >> "$GITHUB_OUTPUT"
echo "pr_url=$pr_url" >> "$GITHUB_OUTPUT"

# A PR opened with the default Actions token does not start CI. Poll up to 2 minutes, then say so.
sha="$(gh pr view "$pr_number" --repo "$REPO" --json headRefOid --jq .headRefOid)"
count=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  count="$(gh api "repos/$REPO/commits/$sha/check-runs" --jq .total_count || echo 0)"
  [ "$count" -gt 0 ] && break
  sleep 10
done
if [ "$count" -eq 0 ]; then
  gh pr comment "$pr_number" --repo "$REPO" --body "CI checks did not start on this PR (GitHub does not run them for PRs opened by the default Actions token). Close and reopen this PR once to start them; they are required before merge."
fi
