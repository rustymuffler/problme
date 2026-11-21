#!/usr/bin/env bash
# Validate the Writer's revision before it is committed. The article was overlaid from the article
# branch (so the index holds the committed version) and the Writer edited the working copy.
# Env: SLUG. Exits 1 on any violation, so nothing outside the article is ever committed.
set -uo pipefail
file="src/content/posts/$SLUG/index.mdx"

changed="$(git diff --name-only)"
if [ "$changed" != "$file" ]; then
  echo "Expected only $file to change. Changed:"; echo "$changed"; exit 1
fi
untracked="$(git ls-files --others --exclude-standard)"
if [ -n "$untracked" ]; then
  echo "Unexpected new files:"; echo "$untracked"; exit 1
fi
if [ -L "$file" ] || [ ! -f "$file" ] || [ "$(wc -c < "$file")" -ge 100000 ]; then
  echo "The article must be a regular file under 100,000 bytes."; exit 1
fi

before="$(git show ":$file")"
# The publish date is not the Writer's to change.
if [ "$(printf '%s\n' "$before" | grep -m1 '^date:')" != "$(grep -m1 '^date:' "$file")" ]; then
  echo "The date line changed."; exit 1
fi
# Images stay: the revision may not drop image lines or shrink the article to nothing.
imgs_before="$(printf '%s\n' "$before" | grep -c '](/assets/posts/' || true)"
imgs_after="$(grep -c '](/assets/posts/' "$file" || true)"
if [ "$imgs_after" -lt "$imgs_before" ]; then
  echo "The revision removed image lines ($imgs_before before, $imgs_after after)."; exit 1
fi
if [ "$(wc -c < "$file")" -lt $(( $(printf '%s' "$before" | wc -c) / 2 )) ]; then
  echo "The revision removed more than half of the article."; exit 1
fi

# Lint (recorded, not fatal: the next review pass reads the result).
LINT_REQUIRE_IMAGES=true node scripts/lint-content.mjs "$SLUG" > .pipeline-tmp/lint-revision.txt 2>&1 || true
cat .pipeline-tmp/lint-revision.txt

# Link gate: every external link host must be in the research brief or the fact check's sources.
allowed="$( { grep -oE 'https?://[^/) >]+' .pipeline-tmp/research-brief.md | sed -E 's#https?://##; s#^www\.##'; cat .pipeline-tmp/extra-hosts.txt 2>/dev/null; } | tr 'A-Z' 'a-z' | sort -u)"
bad=0
for host in $(grep -oE '\]\(https?://[^/) ]+' "$file" | sed -E 's#\]\(https?://##; s#^www\.##' | tr 'A-Z' 'a-z' | sort -u); do
  case "$host" in probl.me|github.com) continue ;; esac
  if ! printf '%s\n' "$allowed" | grep -qxF "$host"; then
    echo "Link host not in the research brief or the fact check sources: $host"; bad=1
  fi
done
[ "$bad" -eq 0 ] || exit 1
echo "Revision OK."
