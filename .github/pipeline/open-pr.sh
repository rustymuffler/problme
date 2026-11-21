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
- Images: not created yet. Hero and in-article images are a later pipeline step.
- Publish date was set by the pipeline to the next Tuesday or Thursday; change \`date\` in the frontmatter if you prefer another day.

## Reviews that have NOT run yet
- Proofreader review (grammar, tone checklist), SEO review (keyword, links, headings) and the AEO check are not automated yet (see PIPELINE_ROADMAP.md, phases 2 and 3). This PR is a draft for that reason. Check those items yourself, then use "Ready for review" before merging.

An independent review comment follows. Read it first.
BODY

try() { GH_TOKEN="$1" "${@:2}"; }
existing="$(gh pr list --repo "$REPO" --head "$BRANCH" --state open --json url --jq '.[0].url // ""')"
if [ -n "$existing" ]; then
  pr_url="$existing"
else
  # Opened as a draft until the Proofreader and SEO review stages exist (MILESTONES invariants 4 and 8).
  create=(gh pr create --draft --repo "$REPO" --base "$DEFAULT_BRANCH" --head "$BRANCH" --title "$title" --body-file .pipeline-tmp/pr-body.md)
  pr_url="$(try "$GH_TOKEN" "${create[@]}" || try "$GH_TOKEN_FALLBACK" "${create[@]}")"
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
