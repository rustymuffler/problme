#!/usr/bin/env bash
# After the last review pass: post the quality scorecard on the PR, mark the PR ready only if every
# review passed and the lint is clean, and hand the issue to Richard with the right label.
# Env: GH_TOKEN, REPO, ISSUE_NUMBER, PR_NUMBER, PR_URL, OWNER, LAST_PASS, RUN_ATTEMPT.
set -euo pipefail
dir=".pipeline-tmp/dl/agg-$LAST_PASS-$RUN_ATTEMPT"
state="$dir/state.json"
[ -s "$state" ] && [ -s "$dir/scorecard.md" ] || { echo "No scorecard found for pass $LAST_PASS."; exit 1; }
ready="$(jq -r '.ready' "$state")"
exhausted="$(jq -r '.exhausted' "$state")"

{ printf '<!-- pipeline:scorecard -->\n'; cat "$dir/scorecard.md"; } > .pipeline-tmp/scorecard-body.md
# The scorecard is built from validated, sanitised data; still never post anything credential-shaped.
if sed -E 's#https?://[^ )>]+##g' .pipeline-tmp/scorecard-body.md | grep -qE 'gh[pousr]_[A-Za-z0-9]{20,}|github_pat_|sk-ant-|eyJ[A-Za-z0-9_-]{20,}'; then
  echo "Scorecard looks like it contains a secret; not posting."; exit 1
fi
gh pr comment "$PR_NUMBER" --repo "$REPO" --body-file .pipeline-tmp/scorecard-body.md

if [ "$ready" = true ]; then
  gh pr ready "$PR_NUMBER" --repo "$REPO" || true
  gh label create "stage:review" --repo "$REPO" --color 5319E7 --description "Draft PR open for review" 2>/dev/null || true
  gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --remove-label "stage:drafting" --add-label "stage:review" --add-assignee "$OWNER"
  gh issue comment "$ISSUE_NUMBER" --repo "$REPO" --body "Ready for you: $PR_URL. Every automated review passed (pass $LAST_PASS) and the content lint is clean. Read the scorecard comment, open the preview, check the required CI results, then merge."
else
  gh label create "stage:stalled" --repo "$REPO" --color B60205 --description "No progress; needs Richard" 2>/dev/null || true
  gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --remove-label "stage:drafting" --add-label "stage:stalled" --add-assignee "$OWNER"
  gh issue comment "$ISSUE_NUMBER" --repo "$REPO" --body "Needs you: $PR_URL stays a draft PR. After $LAST_PASS review pass(es) some items are unresolved (see the scorecard comment). Edit the article on the article branch, or comment \`@claude draft\` after deleting the branch to start over."
fi
echo "ready=$ready exhausted=$exhausted"
