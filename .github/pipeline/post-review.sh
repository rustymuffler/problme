#!/usr/bin/env bash
# Post the independent review to the PR and hand the issue back to Richard.
# Env: GH_TOKEN, REPO, PR_NUMBER, PR_URL, ISSUE_NUMBER, OWNER.
set -euo pipefail
test -s .pipeline-tmp/review.md || { echo "Reviewer wrote no review"; exit 1; }
# Strip HTML comments and tags, hidden characters and control characters, then cap the size.
perl -CSD -0777 -pe 's/<!--.*?-->//gs; s/<\/?[A-Za-z][^>]*>//g; s/[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{FEFF}\x{E0000}-\x{E007F}]//g; s/(?![\n\t])\p{Cc}//g' .pipeline-tmp/review.md | head -c 6000 > .pipeline-tmp/review-trimmed.md
# Credential check (URLs are removed first so long links do not trigger it).
if sed -E 's#https?://[^ )>]+##g' .pipeline-tmp/review-trimmed.md | grep -qE 'gh[pousr]_[A-Za-z0-9]{20,}|github_pat_|sk-ant-|eyJ[A-Za-z0-9_-]{20,}|[A-Za-z0-9+/=]{120,}'; then
  echo "Review looks like it contains a secret; not posting."; exit 1
fi
perl -CS -pe 's/(?<!`)@(?=\w)/@\x{200B}/g' .pipeline-tmp/review-trimmed.md > .pipeline-tmp/review-safe.md
{ printf '<!-- pipeline:review -->\n## Independent review (automated)\n\n'; cat .pipeline-tmp/review-safe.md; } > .pipeline-tmp/review-final.md
gh pr comment "$PR_NUMBER" --repo "$REPO" --body-file .pipeline-tmp/review-final.md
gh label create "stage:review" --repo "$REPO" --color 5319E7 --description "Draft PR open for review" 2>/dev/null || true
gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --remove-label "stage:drafting" --add-label "stage:review" --add-assignee "$OWNER"
gh issue comment "$ISSUE_NUMBER" --repo "$REPO" --body "Draft ready for your review: $PR_URL. Read the automated review comment first, resolve any open placeholders, check the CI results, then check grammar and SEO yourself (those reviews are not automated yet), tap Ready for review, and merge."
