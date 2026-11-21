#!/usr/bin/env bash
# Verify the draft job produced exactly one new file, pin its date, and lint it.
# Env: SLUG, PUBLISH_DATE. Writes lint_errors=true|false to $GITHUB_OUTPUT.
set -uo pipefail
file="src/content/posts/$SLUG/index.mdx"
changed="$(git status --porcelain --untracked-files=all)"
if [ "$changed" != "?? $file" ]; then
  echo "Expected exactly one new file ($file). Found:"; echo "$changed"; exit 1
fi
if [ -L "$file" ] || [ ! -f "$file" ] || [ "$(wc -c < "$file")" -ge 100000 ]; then
  echo "Draft must be a regular file under 100,000 bytes."; exit 1
fi
# The publish date is set by the workflow, never by the model.
sed -i -E "0,/^date:.*/s//date: $PUBLISH_DATE/" "$file"
set +e
node scripts/lint-content.mjs "$SLUG" > .pipeline-tmp/lint-output.txt 2>&1
code=$?
cat .pipeline-tmp/lint-output.txt
echo "lint_errors=$([ "$code" -ne 0 ] && echo true || echo false)" >> "$GITHUB_OUTPUT"
exit 0
