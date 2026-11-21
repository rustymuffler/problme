#!/usr/bin/env bash
# After the image stage, the workspace may contain only: the article, its source SVGs, and its
# generated PNG and WebP files. Anything else aborts the run. Env: SLUG.
set -uo pipefail
status="$(git status --porcelain --untracked-files=all)"
bad=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  path="${line#?? }"
  if [ "${line:0:3}" != '?? ' ]; then bad=1; echo "Unexpected change: $line"; continue; fi
  case "$path" in
    "src/content/posts/$SLUG/index.mdx") ;;
    "src/content/posts/$SLUG/images/"*.svg) [[ "$path" =~ ^src/content/posts/${SLUG}/images/[a-z0-9-]+\.svg$ ]] || { bad=1; echo "Unexpected path: $path"; } ;;
    "public/assets/posts/$SLUG/"*) [[ "$path" =~ ^public/assets/posts/${SLUG}/[a-z0-9-]+\.(png|webp)$ ]] || { bad=1; echo "Unexpected path: $path"; } ;;
    *) bad=1; echo "Unexpected path: $path" ;;
  esac
done <<< "$status"
for f in $(printf '%s\n' "$status" | sed -E 's/^.{3}//'); do
  if [ -L "$f" ] || [ ! -f "$f" ]; then bad=1; echo "Not a regular file: $f"; fi
  if [ -f "$f" ] && [ "$(wc -c < "$f")" -ge 600000 ]; then bad=1; echo "Too large: $f"; fi
done
[ "$bad" -eq 0 ] || exit 1
echo "Image files OK."
