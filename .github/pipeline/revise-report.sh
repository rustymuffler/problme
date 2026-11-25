#!/usr/bin/env bash
# Reply on the pull request with the outcome of an owner revision. Runs from a copy of the tools taken
# before the branch checkout. Env: GH_TOKEN, REPO, PR_NUMBER, PREP_OK, PREP_ERROR, WRITER, CHECK, COMMIT, RUN_URL.
# Uses REST only. Never prints or posts the instructions themselves.
set -uo pipefail
body=".pipeline-tmp/revise-reply.md"
mkdir -p .pipeline-tmp

# Short, mention-safe excerpt of a file (last lines), for failure details.
excerpt() {
  tail -n 15 "$1" 2>/dev/null | head -c 1500 | perl -CS -pe 's/@(?=\w)/@\x{200B}/g; s/[^\n\x20-\x7E\x{A0}-\x{FFFF}]//g'
}

if [ "${PREP_OK:-}" != "true" ]; then
  printf 'I could not start this revision: %s\n\nRun: %s\n' "${PREP_ERROR:-unknown error}" "$RUN_URL" > "$body"
elif [ "${WRITER:-}" != "success" ]; then
  printf 'The Writer step failed (a common cause is the Claude Pro usage limit). Nothing was changed. Comment `@claude revise ...` again later.\n\nRun: %s\n' "$RUN_URL" > "$body"
elif [ "${CHECK:-}" != "success" ]; then
  {
    printf 'I made the edits but the safety checks rejected them, so nothing was committed. The check said:\n\n```\n'
    excerpt .pipeline-tmp/check-output.txt
    printf '\n```\n\nRephrase the request (for example, name the link or fact you want and where it comes from) and comment again.\n\nRun: %s\n' "$RUN_URL"
  } > "$body"
elif [ "${COMMIT:-}" != "success" ]; then
  printf 'The revision passed the checks but could not be committed (the branch may have changed while I worked). Nothing was changed. Comment `@claude revise ...` again.\n\nRun: %s\n' "$RUN_URL" > "$body"
else
  {
    printf 'Revised as you asked.\n\n'
    cat .pipeline-tmp/summary-clean.txt 2>/dev/null
    printf '\n\nWhat to do next: the Vercel preview rebuilds from this push, so open the preview link to read it. Pushes made by the pipeline do not start the required checks by themselves, so close and reopen this pull request once before merging. The review agents do not re-run on a manual revision; the content lint did.\n\nRun: %s\n' "$RUN_URL"
  } > "$body"
fi

gh api -X POST "repos/$REPO/issues/$PR_NUMBER/comments" -F body=@"$body" > /dev/null
