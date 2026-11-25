#!/usr/bin/env bash
# Reply on the pull request with the outcome of an owner revision. Runs from a copy of the tools taken
# before the branch checkout. Env: GH_TOKEN, REPO, PR_NUMBER, RUN_URL and the step outcomes PREP_OK,
# PREP_ERROR, STAGE, WRITER, CHANGED, CHECK, SUMMARY, COMMIT.
# Uses REST only. Never prints or posts the instructions themselves.
set -uo pipefail
body=".pipeline-tmp/revise-reply.md"
mkdir -p .pipeline-tmp

# Short, mention-safe excerpt of a file (last lines) for failure details: no backticks, angle brackets,
# or control characters, @mentions neutralised.
excerpt() {
  tail -n 15 "$1" 2>/dev/null | head -c 1500 | perl -CS -pe 's/[`<>]//g; s/@(?=\w)/@\x{200B}/g; s/[^\n\x20-\x7E\x{A0}-\x{FFFF}]//g'
}
summary() { cat .pipeline-tmp/summary-clean.txt 2>/dev/null; }

if [ "${PREP_OK:-}" != "true" ]; then
  if [ -n "${PREP_ERROR:-}" ]; then
    printf 'I could not start this revision: %s\n\nRun: %s\n' "$PREP_ERROR" "$RUN_URL" > "$body"
  else
    printf 'The revision job failed before it could check the request (setup problem, not your wording). Nothing was changed. See the run: %s\n' "$RUN_URL" > "$body"
  fi
elif [ "${STAGE:-}" != "success" ]; then
  printf 'I could not load the article files from the pull request branch (for example the interview notes or research brief are missing). Nothing was changed.\n\nRun: %s\n' "$RUN_URL" > "$body"
elif [ "${WRITER:-}" != "success" ]; then
  printf 'The Writer step failed (a common cause is the Claude Pro usage limit). Nothing was changed. Comment `@claude revise ...` again later.\n\nRun: %s\n' "$RUN_URL" > "$body"
elif [ "${CHANGED:-}" = "false" ]; then
  {
    printf 'No change made. The Writer did not edit the article.\n\n'
    summary
    printf '\n\nRephrase the request if you want a different outcome.\n\nRun: %s\n' "$RUN_URL"
  } > "$body"
elif [ "${CHECK:-}" != "success" ]; then
  {
    printf 'I made the edits but the safety checks rejected them, so nothing was committed. The check said:\n\n```\n'
    excerpt .pipeline-tmp/check-output.txt
    printf '\n```\n\nRephrase the request (for example, name the link or fact you want and where it comes from) and comment again.\n\nRun: %s\n' "$RUN_URL"
  } > "$body"
elif [ "${COMMIT:-}" != "success" ] || [ "${SUMMARY:-}" != "success" ]; then
  printf 'The revision passed the checks but could not be completed (the branch may have changed while I worked, or the summary step failed). If the branch changed, nothing was committed. Check the pull request, then comment `@claude revise ...` again if needed.\n\nRun: %s\n' "$RUN_URL" > "$body"
else
  {
    printf 'Revised as you asked.\n\n'
    summary
    printf '\n\nWhat to do next: the Vercel preview rebuilds from this push, so open the preview link to read it. Pushes made by the pipeline do not start the required checks by themselves, so close and reopen this pull request once before merging. The review agents do not re-run on a manual revision; the content lint did.\n\nRun: %s\n' "$RUN_URL"
  } > "$body"
fi

gh api -X POST "repos/$REPO/issues/$PR_NUMBER/comments" -F body=@"$body" > /dev/null
