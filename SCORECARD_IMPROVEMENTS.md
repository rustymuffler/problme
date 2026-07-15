# probl.me — OpenSSF Scorecard Improvement Log

> Tracks the real, measured OpenSSF Scorecard score for this repository and what's worth fixing before `publish_results` is flipped to `true` in `.github/workflows/scorecard.yml`.
> Results are currently **private** (visible only in this repo's Security tab). This file is the source of truth for the decision to eventually go public.

---

## Latest run

- **Date:** 2026-07-15
- **Overall score:** 7.0 / 10 (up from 6.1)
- **Commit analyzed:** `30cbec68fa044019b0e50eb171cda09dd4b0a734`
- **Method:** `docker run --rm -e GITHUB_AUTH_TOKEN="$(gh auth token)" gcr.io/openssf/scorecard:stable --repo=github.com/rustymuffler/problme --format=json`

## Full breakdown

| Check | Score | Reason |
|---|---|---|
| Token-Permissions | 10/10 | Workflows follow least privilege |
| Dependency-Update-Tool | 10/10 | Dependabot detected |
| Dangerous-Workflow | 10/10 | No dangerous workflow patterns |
| CI-Tests | 10/10 | 14/14 merged PRs checked by CI |
| Maintained | 10/10 | 30 commits in last 90 days |
| License | 10/10 | License file detected |
| Binary-Artifacts | 10/10 | No binaries in repo |
| Security-Policy | 10/10 (was 0) | `SECURITY.md` detected, fixed via PR #57 |
| Pinned-Dependencies | 9/10 ⬇ (was 10) | Regression, see below, caught and fixed same day |
| Vulnerabilities | 9/10 | 1 known vulnerability detected (needs triage, see below) |
| Branch-Protection | 4/10 ⬆ (was 0) | Ruleset "Main Enforcement" active on `main`: blocks deletion and force-push, requires PR + 7 required status checks. Not "maximal" because `required_approving_review_count` is 0, see below |
| SAST | 1/10 ⬆ (was 0) | PR #60 added Semgrep SARIF upload to code scanning. Scorecard's SAST check looks at recent commit history, not just the latest commit, score should keep climbing as more commits land with SARIF present |
| Code-Review | 0/10 | 0/10 merged changesets had a human approval |
| Contributors | 0/10 | 0 contributing orgs (solo project) |
| CII-Best-Practices | 0/10 | No OpenSSF Best Practices badge |
| Fuzzing | 0/10 | Not fuzzed |
| Packaging | N/A (-1) | No packaging workflow (not applicable, static site) |
| Signed-Releases | N/A (-1) | No releases (not applicable) |

## Actionable before considering public

1. **Pinned-Dependencies regression (9/10, was 10/10).** PR #60's SAST fix added `python3 -m pip install semgrep` with no version pin, exactly the kind of thing this whole article/session was about avoiding. Caught on the very next Scorecard run. Fixed same day by pinning to `semgrep==1.169.0`. Full hash-pinning (`--require-hashes` + a requirements file with per-package hashes) would be the theoretically complete fix but is a bigger lift for one point, not pursued right now.
2. **SAST, still climbing (1/10).** The fix is in (#60), Scorecard just needs more commits with SARIF present in history before it credits "all commits." No further action, just time and normal commit activity.
3. **Vulnerabilities (9/10).** 1 known vulnerability flagged via OSV. The Scorecard JSON summary doesn't include which one, cross-reference against `SECURITY_SCANNING.md`'s Accepted Risk Log (the `yaml` stack-overflow chain and `@lhci/cli` transitive HIGH finding are the most likely candidates, both already reviewed and accepted as dev-only, zero production attack surface). Needs a follow-up run with more verbose output to confirm which CVE this maps to before calling it fully resolved.
4. **Branch-Protection, incremental only (4/10).** Enabling "Require branches to be up to date before merging" (`strict_required_status_checks_policy: true` on the ruleset) would likely nudge this up slightly further without needing a second reviewer. The larger jump to a top-tier score requires `required_approving_review_count` ≥ 1, which runs into the same solo-maintainer ceiling as Code-Review below.

## Resolved

- **Security-Policy (was 0/10, now 10/10).** Fixed via PR #57, `SECURITY.md` added 2026-07-14/15.
- **Branch-Protection (was 0/10, now 4/10, partial).** Ruleset "Main Enforcement" added 2026-07-14, requires PR + 7 status checks, blocks force-push/deletion. Real, meaningful improvement, not yet "maximal" (see above).
- **SAST (was 0/10, now 1/10, in progress).** Fixed via PR #60, will keep climbing as more commits accumulate with SARIF present.

## Structurally low-fixability, not worth chasing right now

These score 0 for reasons tied to being a solo-maintainer project, not real security gaps:

- **Code-Review (0/10).** Requires a second human approving PRs. Richard is the only maintainer, this would require deliberately recruiting a second reviewer for every PR, which isn't realistic right now. Also the main remaining ceiling on Branch-Protection's score.
- **Contributors (0/10).** Requires contributors from multiple organizations. Not applicable to a solo personal project.
- **CII-Best-Practices (0/10).** Requires manually applying for and completing the separate OpenSSF Best Practices badge program, a real but optional, low-priority initiative, not a quick config fix.
- **Fuzzing (0/10).** Not meaningfully applicable, probl.me is a static content site with no parser/executable attack surface to fuzz.
- **Packaging / Signed-Releases (N/A).** Not applicable, this isn't a published package with releases.

## Decision log

- **2026-07-12:** Scorecard workflow added with `publish_results: false`. Decision made to keep results private until the actionable items above (Branch-Protection, Security-Policy, SAST recognition) are addressed, so a future public score reflects genuinely fixed gaps rather than exposing unaddressed ones alongside structural non-issues that could be misread by readers unfamiliar with the checks.
- **2026-07-14/15:** Richard merged PR #57 (`SECURITY.md`) and configured a ruleset requiring PRs + 7 status checks on `main`. Score improved 6.1 → 6.9. `publish_results` still left `false`, remaining actionable items (SAST recognition, Vulnerabilities triage) not yet closed.
