#!/usr/bin/env bash
# Verify the draft job produced exactly one new file, pin its date, run hard safety checks, and lint.
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

# Link gate: every external link must point at a host that appears in the research brief
# (or probl.me / github.com). A poisoned brief cannot add new destinations here.
allowed="$(grep -oE 'https?://[^/) >]+' .pipeline-tmp/research-brief.md | sed -E 's#https?://##; s#^www\.##' | tr 'A-Z' 'a-z' | sort -u)"
extra=0
for host in $(grep -oE '\]\(https?://[^/) ]+' "$file" | sed -E 's#\]\(https?://##; s#^www\.##' | tr 'A-Z' 'a-z' | sort -u); do
  case "$host" in probl.me|github.com) continue ;; esac
  if ! printf '%s\n' "$allowed" | grep -qxF "$host"; then
    echo "  error   $file:1  [link-domain] Link host not found in the research brief: $host" >> .pipeline-tmp/lint-output.txt
    extra=1
  fi
done
cat .pipeline-tmp/lint-output.txt
if [ "$code" -ne 0 ] || [ "$extra" -ne 0 ]; then
  echo "lint_errors=true" >> "$GITHUB_OUTPUT"
else
  echo "lint_errors=false" >> "$GITHUB_OUTPUT"
fi
exit 0
