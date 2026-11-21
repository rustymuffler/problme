#!/usr/bin/env bash
# Commit the validated draft, its images and the research brief to the article branch from a
# pristine repository, so nothing left in the workspace .git (hooks, config) can run or redirect the
# push. Env: GH_TOKEN (preferred: the Claude App token, so CI runs), GH_TOKEN_FALLBACK (default
# Actions token), REPO, BRANCH, SLUG, ISSUE_NUMBER. Writes head_sha and used_fallback to $GITHUB_OUTPUT.
set -euo pipefail
dir="src/content/posts/$SLUG"
assets="public/assets/posts/$SLUG"

# Everything new under the article's two folders (check-draft.sh and check-images.sh already
# verified this is exactly the expected set). The research brief is added separately.
mapfile -t files < <(git ls-files --others --exclude-standard -- "$dir" "$assets" | sort)
[ "${#files[@]}" -ge 1 ] || { echo "No files to publish."; exit 1; }
for f in "${files[@]}"; do
  [[ "$f" =~ ^(src/content/posts|public/assets/posts)/${SLUG}/[A-Za-z0-9._/-]+$ ]] || { echo "Unexpected path: $f"; exit 1; }
  [ -f "$f" ] && [ ! -L "$f" ] || { echo "Not a regular file: $f"; exit 1; }
done
rm -rf "$RUNNER_TEMP/out"
for f in "${files[@]}"; do
  mkdir -p "$RUNNER_TEMP/out/$(dirname "$f")"
  cp -- "$f" "$RUNNER_TEMP/out/$f"
done
cp -- .pipeline-tmp/research-brief.md "$RUNNER_TEMP/research-brief.md"

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
for f in "${files[@]}"; do
  mkdir -p "$(dirname "$f")"
  cp -- "$RUNNER_TEMP/out/$f" "$f"
done
cp -- "$RUNNER_TEMP/research-brief.md" "$dir/research-brief.md"
git add -- "${files[@]}" "$dir/research-brief.md"
expected="$(printf '%s\n' "${files[@]}" "$dir/research-brief.md" | sort)"
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
