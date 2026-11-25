#!/usr/bin/env bash
# Commit the validated revision of the article to the article branch from a pristine repository
# (nothing left in the workspace .git can run or redirect the push). Only the article file is added.
# Env: GH_TOKEN (preferred: the Claude App token, so CI runs), GH_TOKEN_FALLBACK, REPO, BRANCH, SLUG,
# PASS_NUMBER, ISSUE_NUMBER, and optionally COMMIT_MESSAGE (default: the review-pass message) and
# ALLOW_IMAGES=true (also commit the article's replaced or new image files).
set -euo pipefail
file="src/content/posts/$SLUG/index.mdx"
base_sha="$(cat .pipeline-tmp/base-sha)"
mkdir -p "$RUNNER_TEMP/rev"
cp -- "$file" "$RUNNER_TEMP/rev/index.mdx"

# With ALLOW_IMAGES=true (the owner's revise command) the article's replaced or new image files are
# committed too. check-revision.sh already validated their paths, types and sizes; this re-checks the list.
extra=()
if [ "${ALLOW_IMAGES:-}" = true ]; then
  mapfile -t extra < <({ git diff --name-only -- "public/assets/posts/$SLUG" "src/content/posts/$SLUG/images"; git ls-files --others --exclude-standard -- "public/assets/posts/$SLUG" "src/content/posts/$SLUG/images"; } | sort -u)
  for f in "${extra[@]}"; do
    [[ "$f" =~ ^(public/assets/posts/${SLUG}/[a-z0-9-]+\.(png|webp)|src/content/posts/${SLUG}/images/[a-z0-9-]+\.svg)$ ]] || { echo "Unexpected image path: $f"; exit 1; }
    [ -f "$f" ] && [ ! -L "$f" ] || { echo "Not a regular file: $f"; exit 1; }
    mkdir -p "$RUNNER_TEMP/rev/$(dirname "$f")"
    cp -- "$f" "$RUNNER_TEMP/rev/$f"
  done
fi

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
for f in "${extra[@]}"; do
  mkdir -p "$(dirname "$f")"
  cp -- "$RUNNER_TEMP/rev/$f" "$f"
done
git add -- "$file" "${extra[@]}"
# The staged set must be non-empty and a subset of the allowed set. (It may lack the article itself when the
# revision only replaced images and the article text came out identical.)
allowed="$(printf '%s\n' "$file" "${extra[@]}" | sort -u)"
staged="$(git diff --cached --name-only | sort -u)"
[ -n "$staged" ] || { echo "Nothing to commit."; exit 1; }
while IFS= read -r s; do
  printf '%s\n' "$allowed" | grep -qxF -- "$s" || { echo "Unexpected staged file: $s"; exit 1; }
done <<< "$staged"
msg="${COMMIT_MESSAGE:-content: revision after review pass $PASS_NUMBER for issue #$ISSUE_NUMBER}"
git -c core.hooksPath=/dev/null commit -q -m "$msg"
if ! gh_git "$GH_TOKEN" push origin "$BRANCH"; then
  echo "Push with the preferred token failed; retrying with the default Actions token (CI will not start automatically)."
  gh_git "$GH_TOKEN_FALLBACK" push origin "$BRANCH"
fi
echo "Revision committed."
