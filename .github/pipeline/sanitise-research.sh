#!/usr/bin/env bash
# Usage: sanitise-research.sh <input> <output>
# Cleans a Research Agent brief (untrusted, web-derived) and writes the result to <output> only when
# every check passes, so a failed second pass never replaces a good first-pass brief.
set -euo pipefail
in="$1"; out="$2"
test -s "$in" || { echo "Research Agent wrote no brief"; exit 1; }
[ "$(wc -c < "$in")" -le 20000 ] || { echo "Research brief too large"; exit 1; }
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
# Strip HTML comments and tags, markdown images (tracking pixels), hidden/bidi/zero-width/tag
# characters, and control characters.
perl -CSD -0777 -pe 's/<!--.*?-->//gs; s/!\[[^\]]*\]\([^)]*\)//g; s/<\/?[A-Za-z][^>]*>//g; s/[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{FEFF}\x{E0000}-\x{E007F}]//g; s/(?![\n\t])\p{Cc}//g' "$in" > "$tmp"
if sed -E 's#https?://[^ )>]+##g' "$tmp" | grep -qE 'gh[pousr]_[A-Za-z0-9]{20,}|github_pat_|sk-ant-|eyJ[A-Za-z0-9_-]{20,}'; then
  echo "Research brief contains something that looks like a credential"; exit 1
fi
cp "$tmp" "$out"
