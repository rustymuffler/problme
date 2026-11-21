#!/usr/bin/env bash
# Open (or reuse) the PR for the article branch and verify CI started.
# Env: GH_TOKEN, REPO, BRANCH, SLUG, ISSUE_NUMBER, DEFAULT_BRANCH, FALLBACK_TOKEN, RESEARCH_RISK.
# Writes pr_number and pr_url to $GITHUB_OUTPUT.
set -euo pipefail
file="src/content/posts/$SLUG/index.mdx"
title="$(sed -n 's/^title:[[:space:]]*//p' "$file" | head -1 | sed -E 's/^"(.*)"$/\1/' | tr -d '\r\n' | head -c 120)"
[ -n "$title" ] || title="Draft article for issue #$ISSUE_NUMBER"
errs="$(grep -c '^  error' .pipeline-tmp/lint-output.txt || true)"
warns="$(grep -c '^  warning' .pipeline-tmp/lint-output.txt || true)"
markers="$(grep -cE '\[(UNVERIFIED|NOT ANSWERED|IMAGE)' "$file" || true)"
scan="$(cat .pipeline-tmp/scan-summary.txt 2>/dev/null || echo unavailable)"

cat > .pipeline-tmp/pr-body.md <<BODY
Closes #$ISSUE_NUMBER

Automated draft from the content pipeline (interview notes, research brief, draft). Nothing here has been published; merging schedules it for its \`date\`.

## Status
- Content lint: $errs error(s), $warns warning(s). Errors block merge; see the \`Content lint\` check.
- Open placeholders to resolve: $markers (\`[UNVERIFIED]\`, \`[NOT ANSWERED]\`, \`[IMAGE]\`). The lint blocks merge until these are resolved.
- Research safety scan: $scan
- Images: not created yet. Hero and in-article images are a later pipeline step.
- Publish date was set by the pipeline to the next Tuesday or Thursday; change \`date\` in the frontmatter if you prefer another day.

An independent review comment follows. Read it first.
BODY

existing="$(gh pr list --repo "$REPO" --head "$BRANCH" --state open --json url --jq '.[0].url // ""')"
if [ -n "$existing" ]; then
  pr_url="$existing"
else
  pr_url="$(gh pr create --repo "$REPO" --base "$DEFAULT_BRANCH" --head "$BRANCH" --title "$title" --body-file .pipeline-tmp/pr-body.md)"
fi
pr_number="$(gh pr view "$pr_url" --repo "$REPO" --json number --jq .number)"
echo "pr_number=$pr_number" >> "$GITHUB_OUTPUT"
echo "pr_url=$pr_url" >> "$GITHUB_OUTPUT"

# A PR opened with the default Actions token does not start CI. Check, and say so if it did not.
sleep 75
sha="$(gh pr view "$pr_number" --repo "$REPO" --json headRefOid --jq .headRefOid)"
count="$(gh api "repos/$REPO/commits/$sha/check-runs" --jq .total_count || echo 0)"
if [ "$count" -eq 0 ]; then
  gh pr comment "$pr_number" --repo "$REPO" --body "CI checks did not start on this PR (GitHub does not run them for PRs opened by the default Actions token). Close and reopen this PR once to start them; they are required before merge."
fi
