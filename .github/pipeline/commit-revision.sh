#!/usr/bin/env bash
# Commit the validated revision of the article to the article branch from a pristine repository
# (nothing left in the workspace .git can run or redirect the push). Only the article file is added.
# Env: GH_TOKEN (preferred: the Claude App token, so CI runs), GH_TOKEN_FALLBACK, REPO, BRANCH, SLUG,
# PASS_NUMBER, ISSUE_NUMBER, and optionally COMMIT_MESSAGE (default: the review-pass message).
set -euo pipefail
file="src/content/posts/$SLUG/index.mdx"
base_sha="$(cat .pipeline-tmp/base-sha)"
mkdir -p "$RUNNER_TEMP/rev"
cp -- "$file" "$RUNNER_TEMP/rev/index.mdx"

rm -rf .git
git init -q
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git remote add origin "https://github.com/$REPO.git"
gh_git() { # $1 = token, rest = git args
  local auth
  auth="$(printf 'x-access-token:%s' "$1" | base64 -w0)"
  shift
  git -c core.hooksPath=/dev/null -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $auth" "$@"
}
git fetch -q --depth=1 origin "$BRANCH"
# If the branch moved while this run worked (for example Richard edited the article), do not overwrite it.
[ "$(git rev-parse FETCH_HEAD)" = "$base_sha" ] || { echo "The article branch changed during the review; not committing this revision."; exit 1; }
git checkout -q -f -B "$BRANCH" FETCH_HEAD
cp -- "$RUNNER_TEMP/rev/index.mdx" "$file"
git add -- "$file"
staged="$(git diff --cached --name-only)"
[ "$staged" = "$file" ] || { echo "Unexpected staged files: $staged"; exit 1; }
msg="${COMMIT_MESSAGE:-content: revision after review pass $PASS_NUMBER for issue #$ISSUE_NUMBER}"
git -c core.hooksPath=/dev/null commit -q -m "$msg"
if ! gh_git "$GH_TOKEN" push origin "$BRANCH"; then
  echo "Push with the preferred token failed; retrying with the default Actions token (CI will not start automatically)."
  gh_git "$GH_TOKEN_FALLBACK" push origin "$BRANCH"
fi
echo "Revision committed."
