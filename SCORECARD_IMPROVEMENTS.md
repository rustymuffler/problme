# probl.me — OpenSSF Scorecard Improvement Log

> Tracks the real, measured OpenSSF Scorecard score for this repository and what's worth fixing before `publish_results` is flipped to `true` in `.github/workflows/scorecard.yml`.
> Results are currently **private** (visible only in this repo's Security tab). This file is the source of truth for the decision to eventually go public.

---

## Latest run

- **Date:** 2026-07-12
- **Overall score:** 6.1 / 10
- **Commit analyzed:** `e5ba35330388973b4900483481d6e67ae86cf2be`
- **Method:** `docker run --rm -e GITHUB_AUTH_TOKEN="$(gh auth token)" gcr.io/openssf/scorecard:stable --repo=github.com/rustymuffler/problme --format=json`

## Full breakdown

| Check | Score | Reason |
|---|---|---|
| Pinned-Dependencies | 10/10 | All dependencies are pinned |
| Token-Permissions | 10/10 | Workflows follow least privilege |
| Dependency-Update-Tool | 10/10 | Dependabot detected |
| Dangerous-Workflow | 10/10 | No dangerous workflow patterns |
| CI-Tests | 10/10 | 11/11 merged PRs checked by CI |
| Maintained | 10/10 | 30 commits in last 90 days |
| License | 10/10 | License file detected |
| Binary-Artifacts | 10/10 | No binaries in repo |
| Vulnerabilities | 9/10 | 1 known vulnerability detected (needs triage, see below) |
| Branch-Protection | 0/10 | Not enabled on `main` |
| Security-Policy | 0/10 | No `SECURITY.md` |
| SAST | 0/10 | Scorecard doesn't recognize a SAST tool running on all commits |
| Code-Review | 0/10 | 0/14 merged changesets had a human approval |
| Contributors | 0/10 | 0 contributing orgs (solo project) |
| CII-Best-Practices | 0/10 | No OpenSSF Best Practices badge |
| Fuzzing | 0/10 | Not fuzzed |
| Packaging | N/A (-1) | No packaging workflow (not applicable, static site) |
| Signed-Releases | N/A (-1) | No releases (not applicable) |

## Actionable before considering public

These are real gaps, not structural artifacts of being a solo project, worth fixing:

1. **Branch-Protection (0/10).** `main` currently has no branch protection rule (`gh api repos/rustymuffler/problme/branches/main/protection` returns 404). Fix: enable "Require a pull request before merging" and "Require status checks to pass" (ci, security, lighthouse) on `main`. Does not require a second human reviewer to still raise this score, that requirement is what would additionally move Code-Review.
2. **Security-Policy (0/10).** No `SECURITY.md` at repo root. Fix: add one describing how to report a vulnerability (even a simple "email richard.muffler@gmail.com" policy satisfies the check).
3. **SAST (0/10).** Semgrep already runs in `security.yml`, but Scorecard's SAST check specifically looks for recognized SAST tool signals tied to commits (e.g., SARIF uploads to GitHub code scanning), not just any step named "semgrep" in a workflow. Fix: have the Semgrep step upload SARIF results to GitHub's code scanning (similar to what `scorecard.yml` now does), so Scorecard recognizes it as an active SAST tool.
4. **Vulnerabilities (9/10).** 1 known vulnerability flagged via OSV. The Scorecard JSON summary doesn't include which one, cross-reference against `SECURITY_SCANNING.md`'s Accepted Risk Log (the `yaml` stack-overflow chain and `@lhci/cli` transitive HIGH finding are the most likely candidates, both already reviewed and accepted as dev-only, zero production attack surface). Needs a follow-up run with more verbose output to confirm which CVE this maps to before calling it fully resolved.

## Structurally low-fixability, not worth chasing right now

These score 0 for reasons tied to being a solo-maintainer project, not real security gaps:

- **Code-Review (0/10).** Requires a second human approving PRs. Richard is the only maintainer, this would require deliberately recruiting a second reviewer for every PR, which isn't realistic right now.
- **Contributors (0/10).** Requires contributors from multiple organizations. Not applicable to a solo personal project.
- **CII-Best-Practices (0/10).** Requires manually applying for and completing the separate OpenSSF Best Practices badge program, a real but optional, low-priority initiative, not a quick config fix.
- **Fuzzing (0/10).** Not meaningfully applicable, probl.me is a static content site with no parser/executable attack surface to fuzz.
- **Packaging / Signed-Releases (N/A).** Not applicable, this isn't a published package with releases.

## Decision log

- **2026-07-12:** Scorecard workflow added with `publish_results: false`. Decision made to keep results private until the actionable items above (Branch-Protection, Security-Policy, SAST recognition) are addressed, so a future public score reflects genuinely fixed gaps rather than exposing unaddressed ones alongside structural non-issues that could be misread by readers unfamiliar with the checks.
