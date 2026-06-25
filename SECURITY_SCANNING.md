# probl.me — Security Scanning Instructions

> **File:** `SECURITY_SCANNING.md`
> **Purpose:** Instructs Claude agents on when and how to run each security tool during development of the probl.me static site.
> **Authority:** Read alongside `DEVELOPMENT_STANDARDS.md` and `AGENTS.md` at the start of every code session.
> **Last updated:** June 2026

---

## Overview

probl.me uses a layered, defense-in-depth security stack — the same philosophy as the Celly project, adapted for a static site. Although probl.me has no database, no authentication, and no user data, the security stack serves two important purposes:

1. **Project protection** — keeps the repository, CI/CD pipeline, and npm dependencies clean
2. **Content marketing** — the security workflow is real and can be written about authentically, providing credible technical content for the blog

Each tool covers a distinct threat category. They are **not redundant** — do not skip a layer because another tool ran.

### The Stack at a Glance

| Layer | Tool | Threat Category | When |
|---|---|---|---|
| 1 | Aikido (MCP plugin) | SAST — code you write, real-time | Every file write/edit |
| 2 | Semgrep CE | SAST — pattern-based rules | Every file write/edit + pre-PR |
| 3 | `/security-review` | Deep logic & integration flaws | On demand / before security-sensitive changes |
| 4 | rl-protect-skills (Claude Code plugin) | Supply chain malware | Before any new npm dependency |
| 5 | Trivy | Dependency CVEs (SCA) | After package installs / CI |
| 6 | Gitleaks | Hardcoded secrets | Pre-commit hook + CI |
| 7 | Checkov | IaC misconfigurations | When GitHub Actions workflows are written |

---

## Tool-by-Tool Rules

### 1. Aikido Security — Real-Time SAST

> Configure via Claude Code marketplace: `/plugin marketplace add aikido`

**When to run:**
- Automatically after every file write or significant modification
- After completing any feature that touches: GitHub Actions workflows, API integrations, or third-party script additions

**What it catches:**
- SAST vulnerabilities in TypeScript/JavaScript (XSS, injection, insecure deserialization)
- Hardcoded secrets in generated code
- IaC misconfigurations in GitHub Actions YAML files

**Behavior:**
- If Aikido flags a **BLOCK-severity** finding, stop and fix it before writing more code
- **WARN-severity** findings must be addressed before the session ends
- Do not dismiss findings without understanding them. If a finding appears to be a false positive, annotate with a comment and log it

**Static site note:** Aikido's SSRF checks may flag Astro's content fetching or image optimization calls. These are almost always false positives on a static site — annotate them with an explanation and log in the Accepted Risk section at the bottom of this file.

---

### 2. Semgrep CE — Deterministic SAST Baseline

**Install MCP:** `/plugin marketplace add semgrep/mcp-marketplace`
**Install CLI:** `pip install semgrep`

**When to run:**
- After every file write or edit
- Before any pull request or commit

**Scan modes:**
- Use `"important only"` / `--severity ERROR` during active coding for speed
- Use `"run all"` / `auto` mode before PR merge

**Run locally:**
```bash
# During coding — fast, high-confidence only
semgrep --config auto --severity ERROR .

# Before PR — full ruleset
semgrep --config auto .
```

**probl.me-specific focus areas:**
- XSS in Astro components (`set:html`, unescaped user-controlled strings)
- SSRF if any server-side API calls are added in the future
- Insecure GitHub Actions patterns (third-party actions without pinned versions)

**Suppressing false positives:**
```typescript
// nosemgrep: rule-id — explanation of why this is a false positive
```

---

### 3. `/security-review` — Deep Logic & Integration Review

**Command:** Built into Claude Code, no install required.

**When to run — always run before merging any change that involves:**
- Adding new GitHub Actions workflows or modifying existing ones
- Adding any third-party script or external service integration
- Adding API calls or webhooks (e.g., if a contact form or newsletter signup is added in the future)
- Any significant refactor of the Astro configuration

**What it catches (beyond Semgrep/Aikido):**
- Logic flaws that pattern-matching tools miss
- Supply chain risk in GitHub Actions (untrusted actions, unpinned action versions)
- Privilege escalation via GitHub Actions `permissions`

**Static site context:** For a purely static site, `/security-review` is less critical than for Celly (no auth, no DB), but it becomes important as the site grows and integrations are added.

---

### 4. ReversingLabs rl-protect-skills — Supply Chain Malware

**Plugin:** `ReversingLabs/rl-protect-skills` (Claude Code marketplace plugin)

**When to run — MANDATORY before adding any new npm dependency:**
- Before every `npm install <package>`
- When updating a dependency to a new major version
- When reviewing a PR that adds or updates `package.json` dependencies

**Decision rule:**
- **Do not install any package that RL flags as malicious or compromised**, regardless of how well-known it appears
- For WARN-level findings, assess the specific finding and document the decision in `DECISIONS.md` before proceeding

**What this catches:**
- Active malware injected into legitimate packages
- Maintainer account takeover attacks
- Typosquatting and dependency confusion

---

### 5. Trivy — Dependency CVE Scanning (SCA)

**Install:** See [aquasecurity.github.io/trivy](https://aquasecurity.github.io/trivy/latest/getting-started/installation/)

**When to run:**
- After any `npm install` or lockfile change
- CI: runs on every push and pull request (hard gate)
- Before any significant release

**Run locally:**
```bash
trivy fs . --severity HIGH,CRITICAL
```

**Severity thresholds:**
- **CRITICAL:** Block immediately. Do not proceed until resolved or risk documented.
- **HIGH:** Must be addressed within the current session or next work session.
- **MEDIUM/LOW:** Log and track; address in scheduled dependency maintenance.

**Suppressing false positives:**
```
# .trivyignore
# CVE-2024-XXXXX — false positive; only affects a code path probl.me does not use
CVE-2024-XXXXX
```

---

### 6. Gitleaks — Hardcoded Secrets Detection

**Install:** See [github.com/gitleaks/gitleaks/releases](https://github.com/gitleaks/gitleaks/releases)

**When to run:**
- **Automatically on every commit** via the pre-commit hook (install at `.git/hooks/pre-commit`)
- Manually before any push: `gitleaks detect --source . -v`
- When writing any configuration, environment file, or GitHub Actions YAML that references secrets

**What it catches:**
- API keys, tokens, and passwords accidentally written to source files
- Secrets in config files, comments, or GitHub Actions YAML

**Rules:**
- **Never write API keys or tokens directly into source files** — always use `process.env.MY_SECRET` or GitHub Secrets
- In examples or docs, use obviously fake placeholders: `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- `.env*` files must be in `.gitignore` — verify before first commit

**Pre-commit hook install:**
```bash
# Create the hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
gitleaks protect --staged --redact -v
EOF
chmod +x .git/hooks/pre-commit
```

**Never bypass with `git commit --no-verify`** without Richard's explicit approval.

---

### 7. Checkov — Infrastructure-as-Code Security

**Install:** `pip install checkov`

**When to run — whenever you write or modify:**
- `.github/workflows/` — GitHub Actions workflows (high priority — all CI/CD lives here)
- `Dockerfile` or `docker-compose.yml` (if ever added)

**Run locally:**
```bash
# GitHub Actions workflows
checkov -d .github/ --quiet

# All IaC
checkov -d . --quiet
```

**probl.me-specific focus:**
- GitHub Actions workflow security is the primary concern. Every workflow must be scanned.
- Pin all third-party GitHub Actions to a specific commit SHA (not just a tag): `uses: actions/checkout@v4` is a tag and can be compromised; `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683` is pinned.
- Use `permissions: read-all` at the workflow level and only escalate permissions for the specific job that needs them (e.g., `pages: write` only for the deploy job).

**Suppressing false positives:**
```yaml
# checkov:skip=CKV_GHA_1 — reason why this is acceptable
```

---

## Scanning Triggers — Quick Reference

```
Writing or editing code?
  → Run: Aikido (auto, once configured) + Semgrep (auto)

Adding or updating a dependency?
  → Run: rl-protect-scan FIRST — malware check
  → Then: npm install (only after rl-protect passes)
  → Then: Trivy — CVE check

Writing or modifying .github/workflows/?
  → Run: Checkov immediately
  → Run: /security-review before merging

Committing code?
  → Gitleaks fires automatically via pre-commit hook

Before any PR merge?
  → Semgrep (full / auto mode) + Trivy + Gitleaks confirmation
  → Checkov if .github/ files changed
```

---

## CI/CD Integration

Security scans run as GitHub Actions on every push and pull request.

```yaml
name: Security

on: [push, pull_request]

jobs:
  gitleaks:
    name: Gitleaks — Secrets Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  semgrep:
    name: Semgrep — SAST
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: auto
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}

  trivy:
    name: Trivy — Dependency CVE Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy filesystem scan
        uses: aquasecurity/trivy-action@0.31.0
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'
          ignore-unfixed: false

  checkov:
    name: Checkov — IaC Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v44
        with:
          files: |
            .github/**
            Dockerfile
      - name: Run Checkov
        if: steps.changed-files.outputs.any_changed == 'true'
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: .
          quiet: true
          soft_fail: false
```

---

## Handling Findings

### Severity Decision Matrix

| Severity | Aikido / Semgrep | Trivy / Checkov | Action |
|---|---|---|---|
| BLOCK / CRITICAL | Stop. Fix before writing more code. | Block. Fix immediately. | Mandatory fix before merge |
| WARN / HIGH | Fix before the session ends. | Fix within the next work session. | Required fix |
| INFO / MEDIUM | Log and review at session end. | Track in backlog. | Scheduled fix |
| LOW | Note for future maintenance. | Note for future maintenance. | Optional |

### Suppressing False Positives

All suppressions require a comment explaining why the finding is a false positive. Suppressions without explanations will be rejected in code review.

| Tool | Suppression method |
|---|---|
| Gitleaks | Add allowlist entry to `.gitleaks.toml` with explanation |
| Semgrep | Inline `// nosemgrep: rule-id — explanation` |
| Trivy | Add CVE ID to `.trivyignore` with comment |
| Checkov | Inline `# checkov:skip=CKV_... — explanation` |
| Aikido | Annotate with comment explaining why + log in Accepted Risk table below |

---

## Accepted Risk Log

Findings reviewed and accepted as out-of-scope or not actionable for a static site. Each entry requires a reason and compensating controls.

| Date | Tool | Finding | Severity | Reason | Compensating Controls |
|---|---|---|---|---|---|
| 2026-06-24 | Gitleaks | `linkedin-client-id` match on `richardmuffler` in commit `204e4aca` (`_config.yml`, 2019 Jekyll era) | WARN | False positive. `richardmuffler` is a public LinkedIn profile handle, not a secret client ID. The file is no longer in the working tree and pre-dates the Astro project. | Suppressed in `.gitleaks.toml` allowlist with explanation. No real secret exposed. |
| 2026-06-24 | rl-protect-skills | npm install performed without rl-protect-scan (tool not yet configured) | INFO | rl-protect-skills was not yet installed in this first code session. Packages installed: `astro@7.0.2`, `@astrojs/mdx@7.0.0`, `tailwindcss@4.1.x`, `@tailwindcss/vite@4.1.x` — all official, well-known packages from trusted maintainers. | npm audit run immediately after install: 0 vulnerabilities. Trivy scan required before next dependency change. rl-protect-skills must be configured before any additional packages are installed. |
| 2026-06-24 | rl-protect-skills | `yargs@17.7.3` GOVERNANCE FAIL — version published 6 days ago (recency gate) | GOVERNANCE | Transitive dependency of `@astrojs/check@0.9.9`. All seven security checks passed (no malware, no tampering, no CVEs, no secrets). `yargs` is a top-50 npm package (~50M weekly downloads). The FAIL is the recency gate only. Richard explicitly acknowledged and approved the install. | Dev-only toolchain dependency — not shipped to users. Will re-scan in ~2 weeks; recency gate will clear automatically once the package has been out long enough. |
| 2026-06-24 | npm audit | `yaml@2.0.0-2.8.2` Stack Overflow via deeply nested YAML collections (GHSA-48c2-rrv3-qjmp) — 5 MODERATE findings in the `yaml → yaml-language-server → volar-service-yaml → @astrojs/language-server → @astrojs/check` chain | MODERATE | Dev-only type-checking tool. No user-controlled YAML flows through `@astrojs/check` — the tool consumes only project source files. Attack surface is zero in normal use. The npm-suggested fix (`--force`) would downgrade to `@astrojs/check@0.9.2`, which is a breaking change and not worth it for a MODERATE in a dev tool. | Track in scheduled dependency maintenance. Re-evaluate if `@astrojs/check` releases a non-breaking patch that resolves the chain. |

---

## What These Tools Do NOT Cover

Gaps to be aware of:

- **DAST (Dynamic testing):** No tools test the running site dynamically. For a static site this is a minimal risk, but if dynamic features are added (forms, API calls), OWASP ZAP should be considered.
- **Content security:** These tools do not validate article accuracy, copyright compliance, or content policy. That is the responsibility of the human review step (Richard's PR review).
- **Runtime protection:** All tools here are pre-deploy. If the site grows to include server-side functionality, runtime monitoring should be added.

---

## Setup Status

| Tool | Status |
|---|---|
| Aikido | ⬜ Not yet configured |
| Semgrep | ⬜ Not yet configured |
| rl-protect-skills | ✅ Operational 2026-06-24 — used to scan `@astrojs/check@0.9.9` + `typescript@6.0.3` before install; one GOVERNANCE FAIL acknowledged by Richard (see Accepted Risk Log) |
| Gitleaks (pre-commit) | ✅ Installed 2026-06-24 — `.git/hooks/pre-commit` using Gitleaks 8.30.1; `.gitleaks.toml` with allowlist |
| Trivy | ⬜ Not yet configured |
| Checkov | ⬜ Not yet configured |

Update this table as tools are configured during setup.

---

## Maintaining This File

Update this file when:
- A new tool is added to or removed from the probl.me security stack
- A tool is successfully configured (update the status table)
- The tech stack changes in ways that affect threat categories (e.g., a server-side feature is added)

---

*Last updated: June 2026 — Collaboratively defined by Richard and Claude (Cowork).*
