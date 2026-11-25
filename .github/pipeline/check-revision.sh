#!/usr/bin/env bash
# Validate the Writer's revision before it is committed. The article was overlaid from the article
# branch (so the index holds the committed version) and the Writer edited the working copy.
# Env: SLUG. Exits 1 on any violation, so nothing outside the article is ever committed.
set -uo pipefail
file="src/content/posts/$SLUG/index.mdx"

changed="$(git diff --name-only)"
untracked="$(git ls-files --others --exclude-standard)"
if [ "${ALLOW_IMAGES:-}" = true ]; then
  # The owner's @claude revise may also replace or add this article's images (their SVG sources, PNG and
  # WebP files). Nothing else may change, every file must be a small regular file, and nothing is deleted.
  all="$(printf '%s\n%s\n' "$changed" "$untracked" | sed '/^$/d')"
  [ -n "$all" ] || { echo "Nothing changed."; exit 1; }
  bad=0
  while IFS= read -r p; do
    case "$p" in
      "$file") ;;
      "src/content/posts/$SLUG/images/"*) [[ "$p" =~ ^src/content/posts/${SLUG}/images/[a-z0-9-]+\.svg$ ]] || { bad=1; echo "Unexpected path: $p"; } ;;
      "public/assets/posts/$SLUG/"*) [[ "$p" =~ ^public/assets/posts/${SLUG}/[a-z0-9-]+\.(png|webp)$ ]] || { bad=1; echo "Unexpected path: $p"; } ;;
      *) bad=1; echo "Unexpected path: $p" ;;
    esac
    if [ -L "$p" ] || [ ! -f "$p" ]; then bad=1; echo "Not a regular file (or deleted): $p"; fi
    if [ -f "$p" ] && [ "$(wc -c < "$p")" -ge 600000 ]; then bad=1; echo "Too large: $p"; fi
  done <<< "$all"
  [ "$bad" -eq 0 ] || exit 1
else
  if [ "$changed" != "$file" ]; then
    echo "Expected only $file to change. Changed:"; echo "$changed"; exit 1
  fi
  if [ -n "$untracked" ]; then
    echo "Unexpected new files:"; echo "$untracked"; exit 1
  fi
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

# Lint. Most findings are read by the next review pass, but a crash and the hard-safety rules (executable
# MDX, secrets, personal data, do-not-publish text) must never be committed.
LINT_REQUIRE_IMAGES=true node scripts/lint-content.mjs "$SLUG" > .pipeline-tmp/lint-revision.txt 2>&1 || true
cat .pipeline-tmp/lint-revision.txt
if ! grep -q '^Content lint: ' .pipeline-tmp/lint-revision.txt; then
  echo "The content lint did not complete."; exit 1
fi
if grep -qE '^  error .*\[(mdx-[a-z]+|secret-pattern|sensitive-[a-z]+|do-not-publish)\]' .pipeline-tmp/lint-revision.txt; then
  echo "The revision breaks a hard safety rule (see the lint output above)."; exit 1
fi

# Link gate: every external host must be in the research brief (or probl.me or github.com). The fact
# check's sources are shown on the scorecard for Richard but never widen this gate.
allowed="$(node scripts/link-hosts.mjs .pipeline-tmp/research-brief.md --all)"
bad=0
while IFS= read -r host; do
  [ -z "$host" ] && continue
  case "$host" in probl.me|github.com) continue ;; esac
  if ! printf '%s\n' "$allowed" | grep -qxF -- "$host"; then
    echo "Link host not in the research brief: $host"; bad=1
  fi
done < <(node scripts/link-hosts.mjs "$file")
[ "$bad" -eq 0 ] || exit 1
echo "Revision OK."
