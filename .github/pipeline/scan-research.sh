#!/usr/bin/env bash
# Usage: scan-research.sh <brief>   (writes blocked/risk/finding to $GITHUB_OUTPUT)
# Runs the prompt-injection scan on a research brief. Fails closed: a scan that cannot run, or whose
# output has an unexpected shape, counts as a detection.
set -uo pipefail
brief="$1"
out() { echo "$1=$2" >> "$GITHUB_OUTPUT"; }
if ! node scripts/scan-untrusted-content.mjs "$brief" research-brief > .pipeline-tmp/scan.out 2> .pipeline-tmp/scan.err; then
  out blocked true; out risk unknown; out finding "The injection scan could not run."
  exit 0
fi
sed -n '/^{/,$p' .pipeline-tmp/scan.out > .pipeline-tmp/scan.json
if ! jq -e '(.detections | type) == "array" and (.riskLevel | type) == "string"' .pipeline-tmp/scan.json >/dev/null 2>&1; then
  out blocked true; out risk unknown; out finding "The injection scan output was not in the expected format."
  exit 0
fi
det="$(jq '.detections | length' .pipeline-tmp/scan.json)"
risk="$(jq -r '.riskLevel' .pipeline-tmp/scan.json)"
out risk "$risk"
if [ "$det" -gt 0 ]; then
  out blocked true; out finding "$det pattern-level injection detection(s) in the research brief."
else
  out blocked false; out finding ""
fi
echo "detections=$det risk=$risk" | tee .pipeline-tmp/scan-summary.txt
