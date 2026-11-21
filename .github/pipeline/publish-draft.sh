#!/usr/bin/env bash
# Commit the validated draft and research brief to the article branch from a pristine
# repository, so nothing left in the workspace .git (hooks, config) can run or redirect the push.
# Env: GH_TOKEN (preferred: the Claude App token, so CI runs), GH_TOKEN_FALLBACK (default Actions
# token), REPO, BRANCH, SLUG, ISSUE_NUMBER. Writes head_sha and used_fallback to $GITHUB_OUTPUT.
set -euo pipefail
dir="src/content/posts/$SLUG"
mkdir -p "$RUNNER_TEMP/out"
cp -- "$dir/index.mdx" "$RUNNER_TEMP/out/index.mdx"
cp -- .pipeline-tmp/research-brief.md "$RUNNER_TEMP/out/research-brief.md"

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
git fetch -q --depth=1 origin "$BRANCH"   # public repository: no credentials needed to read
git checkout -q -f -B "$BRANCH" FETCH_HEAD
mkdir -p "$dir"
cp -- "$RUNNER_TEMP/out/index.mdx" "$dir/index.mdx"
cp -- "$RUNNER_TEMP/out/research-brief.md" "$dir/research-brief.md"
git add -- "$dir/index.mdx" "$dir/research-brief.md"
expected="$(printf '%s\n%s\n' "$dir/index.mdx" "$dir/research-brief.md" | sort)"
staged="$(git diff --cached --name-only | sort)"
[ "$staged" = "$expected" ] || { echo "Unexpected staged files:"; echo "$staged"; exit 1; }
git -c core.hooksPath=/dev/null commit -q -m "content: draft article for issue #$ISSUE_NUMBER"

used_fallback=false
if ! gh_git "$GH_TOKEN" push origin "$BRANCH"; then
  echo "Push with the preferred token failed; retrying with the default Actions token (CI will not start automatically)."
  gh_git "$GH_TOKEN_FALLBACK" push origin "$BRANCH"
  used_fallback=true
fi
echo "head_sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"
echo "used_fallback=$used_fallback" >> "$GITHUB_OUTPUT"
