# probl.me — Development Standards & Practices

> **File:** `DEVELOPMENT_STANDARDS.md`
> **Purpose:** Defines the development workflow, quality gates, agentic team structure, and release practices for the probl.me blog and portfolio site.
> **Authority:** This document, `AGENTS.md`, `CONTENT_STANDARDS.md`, and `SECURITY_SCANNING.md` together form the complete operating rulebook. All four must be read at the start of every session.

---

## 1. Tech Stack Reference

| Layer | Technology | Cost |
|---|---|---|
| Framework | Astro (latest stable) | Free |
| Language | TypeScript | Free |
| Styling | Tailwind CSS | Free |
| Content | MDX (Markdown + JSX) | Free |
| Hosting | GitHub Pages | Free |
| Repository | GitHub (public) | Free |
| Domain | probl.me | Already owned |
| Image generation | Claude (Claude Pro license) | Already paid |
| CI/CD | GitHub Actions | Free (public repo) |
| Package manager | npm | Free |
| Analytics app | Umami (self-hosted, open source) | Free |
| Analytics hosting | Vercel (free tier) | Free |
| Analytics database | Supabase PostgreSQL (free tier) | Free |

**Total recurring cost beyond Claude Pro: $0**

**Analytics architecture:** The Umami app lives on Vercel (separate from the blog). The blog connects to it via a single `<script>` tag in `src/layouts/Layout.astro`. Umami is privacy-first, cookie-free, and GDPR-compliant — no cookie banner required. See `DECISIONS.md` Decision 8 for the full setup process.

---

## 2. The Agentic Development Team

probl.me is built and operated by a solo founder (Richard) working with Claude agents. The complete agent roster, tool assignments, and interaction rules are defined in `AGENTS.md`. This section summarizes the core workflow principles.

### Core Principles

- **No self-review.** The agent that writes code cannot be the sole reviewer of it. The agent that drafts an article cannot be the agent that approves it.
- **Sequential handoffs.** Work passes through defined stages: create → test/review → security scan → human review → publish.
- **PM Agent coordinates.** The PM Agent owns `MILESTONES.md`, `BLOCKERS.md`, and all handoff documents. It does not write code or content.

---

## 3. Version Control & Branching Strategy

### Branch Structure

```
main          ← Always deployable. Never commit directly.
  └── feat/astro-component-[name]
  └── fix/[short-description]
  └── chore/dependency-update-[month]
  └── content/[article-slug]   ← One branch per article
```

### Rules

- **`main` is sacred.** It must always be in a deployable state. GitHub Pages deploys from `main`. All work happens on branches.
- **One branch per unit of work.** One feature, one fix, or one article per branch. Do not accumulate unrelated changes on one branch.
- **No direct pushes to `main`.** Every change merges via a pull request, including content articles.
- **Content branches use the `content/` prefix.** Branch names follow the article slug: `content/building-probl-me-with-astro`.
- **Merge strategy:** Squash and merge for all branches to keep `main` history clean.

### Commit Message Format

```
<type>(<scope>): <short description>

Types: feat | fix | chore | test | security | docs | content | refactor
Scope: area of the codebase or content category (e.g., blog, layout, home, pm-craft)

Examples:
feat(blog): add reading time estimate to post template
content(ai-development): publish "how I use Claude as my PM co-pilot"
fix(layout): correct mobile nav overflow on small screens
security: update Astro to patch CVE-2026-XXXX
chore: update npm dependencies — June 2026
```

---

## 4. Definition of Done

### Code Changes

A code change is **not done** until all gates pass:

| Gate | Requirement |
|---|---|
| ✅ Build passes | `npm run build` completes with zero errors |
| ✅ Tests pass | Accessibility, link checker, and component tests pass |
| ✅ Lighthouse score | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 95 |
| ✅ Security scans pass | No BLOCK or CRITICAL findings (see `SECURITY_SCANNING.md`) |
| ✅ Code Reviewer Agent approved | Separate Code Reviewer Agent has reviewed and approved the PR |

### Content Articles

An article is **not done** until all gates pass:

| Gate | Requirement |
|---|---|
| ✅ Interview notes captured | `interview-notes.md` exists and contains Richard's personal input (Interview Agent completed) |
| ✅ Research brief captured | `research-brief.md` exists with current sources, competitive scan, and data points (Research Agent completed) |
| ✅ Richard's content present | The draft includes identifiable first-person content from the interview, not just agent-researched material |
| ✅ Word count | 1,200–2,500 words |
| ✅ Images ready | Hero image + any in-article images created and saved to the correct path |
| ✅ MDX frontmatter complete | All required frontmatter fields populated (see `CONTENT_STANDARDS.md`) |
| ✅ SEO checklist complete | All items in the SEO Reviewer Agent checklist (see `AGENTS.md`) are green |
| ✅ Proofreader approved | Proofreader Agent has passed the draft: no em dashes, natural tone, correct grammar and punctuation |
| ✅ Draft PR opened | Publisher Agent has opened a draft PR with the article branch |
| ✅ Richard approved | Richard has reviewed the draft PR and merged it |

---

## 5. Testing Standards

### Code Testing

- **The build is the primary test.** Every code change must produce a successful `npm run build` with zero errors and zero warnings.
- **Accessibility is non-negotiable.** All new components must pass automated accessibility checks using axe-core.
- **Lighthouse CI runs on every PR.** Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 95. These are hard gates.
- **Link checking.** The CI pipeline runs a dead-link checker on every PR to catch broken internal and external links.

### Content Testing

- **Grammar and readability.** Writer Agent self-checks using Hemingway-level analysis before handing off to SEO Reviewer Agent.
- **Factual accuracy.** Any technical claim must be verifiable. If uncertain, Writer Agent flags it with a `[VERIFY]` comment for Richard.
- **No fabricated quotes.** Never attribute a quote to a named person unless it is a real, verified quote with a source link.

### Regression Rule

Before any PR is merged, the site must build clean:

```bash
npm run build
```

If a code change causes a previously passing build to fail, stop. Fix the issue before continuing. Do not merge code that breaks the build.

---

## 6. Security Standards

Security is a first-class requirement even for a static blog. The security stack serves two purposes: (1) protecting the project, and (2) generating authentic content about security practices.

The full security tooling rules are in `SECURITY_SCANNING.md`. This section summarises the key standards.

### Pre-PR Security Gate (Code PRs)

Before any code pull request is opened, the Security Auditor Agent must run:

```
□ Semgrep — full ruleset mode before every code PR
□ Gitleaks — secrets scan (pre-commit hook must have passed on all commits)
□ Trivy — no HIGH or CRITICAL CVEs in npm dependencies
□ Checkov — required when .github/workflows/ files are modified
□ Aikido — zero BLOCK or WARN findings (once configured)
□ rl-protect-scan — required before any new npm package is installed
```

### Core Security Rules

1. **Never write API keys or tokens into source files.** Use environment variables or GitHub Secrets. Verify `.env` is in `.gitignore` before the first commit.
2. **Never bypass Gitleaks** (`git commit --no-verify`) without Richard's explicit approval.
3. **Before adding any new npm package,** the Security Auditor Agent must run rl-protect-scan first, then Trivy. Do not install packages flagged as malicious.
4. **All GitHub Actions workflows must be Checkov-scanned** before being committed to the repository.
5. **No third-party scripts in `<head>` without review.** Analytics, comment systems, or any external script adds attack surface. Discuss with Richard before adding. **Exception, already approved:** The Umami tracking script hosted on the project's own Vercel instance is pre-approved (see Decision 8 in `DECISIONS.md`).

---

## 7. Code Review Standards

The Code Reviewer Agent reviews every code PR before merge. Reviews are not optional.

### What the Code Reviewer Agent Checks

**Code quality:** Is the code readable and consistent with the existing codebase? Are there unnecessary abstractions or duplicated logic?

**Astro patterns:** Does the change follow Astro conventions? Is content fetching, component composition, and routing done correctly?

**Performance:** Will this change affect Core Web Vitals? Heavy JavaScript, large images, or blocking resources must be justified.

**Accessibility:** Are all interactive elements keyboard-navigable? Do images have alt text? Are heading levels correct?

**Security:** Does the change introduce any new external dependencies, scripts, or API calls? Were they reviewed?

### Review Outcomes

- **Approved** — merge is clear.
- **Approved with comments** — minor notes; can merge but Developer Agent should address in follow-up.
- **Changes requested** — blocking issues. Developer Agent must address and re-request review.

---

## 8. CI/CD Pipeline

GitHub Actions runs automatically on every push and pull request. The site deploys to GitHub Pages on every merge to `main`.

### Pipeline Stages

```
On push / pull_request:
  1. Build          → npm run build (must pass, zero errors)
  2. Gitleaks       → secrets scan (hard gate — must pass)
  3. Semgrep        → SAST scan (HIGH/CRITICAL = fail)
  4. Trivy          → dependency CVE scan (HIGH/CRITICAL = fail)
  5. Checkov        → IaC scan if .github/workflows/ changed
  6. Lighthouse CI  → Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
  7. Link checker   → dead links = fail

On merge to main:
  8. Deploy         → GitHub Actions deploys Astro build to GitHub Pages
```

### Pipeline Rules

- **A failing CI pipeline blocks the merge.** No exceptions without Richard's explicit approval.
- **The PM Agent monitors CI status** and logs any persistent failures in `BLOCKERS.md`.
- **Content PRs run the build and link checker.** They do not require Lighthouse CI (content changes don't affect scores) but must pass the build.

---

## 8b. Scheduling & Automation

The content pipeline uses Claude's scheduling tools to run autonomously. Richard only participates at two points: the interview and the final PR merge.

### Scheduled Tasks

Three Claude scheduled tasks keep the pipeline running without manual prompting:

| Task | Schedule | Purpose |
|---|---|---|
| Content idea batch | Every Monday, 9am | Content Strategist Agent generates the week's article ideas |
| Queue health check | Every Friday, 9am | PM Agent checks draft PR count; alerts if fewer than 4 articles are queued |
| PR review reminder | Tuesdays and Thursdays, 8am | PM Agent lists open draft PRs waiting for Richard's review |
| Monthly retrospective | First Monday of each month, 10am | PM Agent fills out the retrospective template, presents findings, and updates standards docs based on what is agreed |

These are set up in the first content session using `mcp__scheduled-tasks__create_scheduled_task`. See `AGENTS.md` — Scheduling & Loops section for the exact task prompts.

### Looped Handoffs

Once Richard selects an article idea and completes the interview, the remaining steps run as an automated loop: Writer Agent → Image Creator Agent → SEO Reviewer Agent → Proofreader Agent → Publisher Agent. Each agent's completion triggers the next. Richard does not need to prompt each step.

If a revision loop occurs (agent returns feedback, Writer Agent revises), the loop runs a maximum of 3 times before escalating to Richard.

### Writing About the Workflow

The scheduling and looping workflow is intentionally built to be blog-worthy. The Content Strategist Agent should generate article ideas in the **AI-Assisted Development** category that document:
- How the scheduled pipeline was set up
- What a revision loop looks like in practice
- What broke and how it was fixed

These are authentic build-in-public articles — the process being described is the actual process running the site.

---

## 9. Environments

| Environment | Purpose | Deployment |
|---|---|---|
| **Local (dev)** | Active development | `npm run dev` at `localhost:4321` |
| **Preview (PR)** | Per-PR preview (optional — GitHub Actions can deploy to a preview URL) | GitHub Actions on PR open |
| **Production** | Live site at probl.me | GitHub Actions on merge to `main` |

### Environment Rules

- **Production deployments are automatic** on merge to `main`. Richard controls when a PR is merged.
- **Never test destructive content changes directly on `main`.** All articles go through a draft PR first.
- **GitHub Secrets** store any tokens or keys needed by GitHub Actions (e.g., for future integrations). Never store secrets in workflow files.

---

## 10. Versioning & Releases

### Strategy: Phase-Based Milestones

See `MILESTONES.md` for the full milestone plan. High-level versions:

| Version | Phase | Description |
|---|---|---|
| `v0.1.0` | Phase 1 — Setup | Astro + GitHub Pages live, CI/CD configured, standards docs committed |
| `v0.5.0` | Phase 2 — Design | Brand design system, all page templates, 3D card, scrolling icons |
| `v1.0.0` | Phase 3 — Content | First 4 articles published, content workflow validated end-to-end |
| `v2.0.0` | Phase 4 — Growth | Steady 2x/week cadence running, site fully operational |

### Tagging Process

```bash
git tag -a v0.1.0 -m "Release v0.1.0: Astro + GitHub Pages setup complete"
git push origin v0.1.0
```

### Pre-Release Checklist

```
□ All milestone items in the phase are marked ✅ in MILESTONES.md
□ npm run build passes
□ Full security scan stack passes (see SECURITY_SCANNING.md)
□ Lighthouse scores meet minimums (Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95)
□ Richard has reviewed and approved the release
```

---

## 11. Documentation Standards

### Living Documents

| Document | Owner | Updated When |
|---|---|---|
| `MILESTONES.md` | PM Agent | After every feature or content milestone completes |
| `BLOCKERS.md` | PM Agent | When a blocker is found or resolved |
| `DECISIONS.md` | PM Agent | When a significant technical or content decision is made |
| `DEVELOPMENT_STANDARDS.md` | PM Agent + Richard | When standards change |
| `SECURITY_SCANNING.md` | Developer Agent | When stack or tools change |
| `AGENTS.md` | PM Agent | When agent roles change |
| `CONTENT_STANDARDS.md` | PM Agent + Richard | When content strategy evolves |
| `BRAND.md` | PM Agent + Richard | When design tokens or visual identity change |
| `HANDOFF-YYYY-MM-DD-HHMM.md` | PM Agent | At every context limit |
| `CHANGELOG.md` | PM Agent | On every versioned release |
| `retros/RETRO-YYYY-MM.md` | PM Agent | First Monday of each month — one file per month, filed in `retros/` |
| `RETROSPECTIVE-TEMPLATE.md` | PM Agent + Richard | When the retrospective format itself needs improving |

### Code-Level Documentation

- Every Astro component must have a comment block at the top explaining its purpose and props.
- Every helper function in `src/utils/` or `src/lib/` must have a JSDoc comment.
- Complex logic (RSS generation, content collection queries, image processing) must have inline comments explaining the *why*, not just the *what*.

---

## 12. Invariants — Never Violate

These rules must be preserved by every agent in every session.

1. **Write as Richard.** All published content is written in Richard's first-person voice. Claude agents draft; Richard is the author of record. Never publish an article that reads like it was written by an AI.
2. **No fabricated quotes.** Never attribute a quote to a named person unless it is a real, verified quote with a source link.
3. **No unlicensed images.** All images are either Claude-generated (frontmatter: `imageCredit: "AI-generated with Claude"`), personal screenshots (noted as such), or personal photos. No hotlinking or unlicensed third-party images.
4. **No secrets in source files.** Never commit API keys, tokens, passwords, or credentials. Always use environment variables or GitHub Secrets.
5. **SEO minimum requirements on every post.** A content PR cannot be opened until the SEO Reviewer Agent has passed all checklist items (see `AGENTS.md`).
6. **Lighthouse minimums.** No code PR may merge if Lighthouse scores fall below: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
7. **No third-party scripts without review.** Any external JavaScript added to `<head>` must be reviewed and approved by Richard before merging. **Exception, already approved:** The Umami Analytics tracking script (`script.js` from the self-hosted Vercel instance) is the one approved third-party script. It is cookie-free and sends no personally identifiable information.
8. **Brand consistency.** All design work follows `BRAND.md`. No ad-hoc colors, fonts, or layouts that deviate from the defined design system.
9. **Only recommend tools we use.** Blog content may not recommend paid tools or services that Richard is not actively using in the probl.me or Celly workflow.

---

## 13. Session Start Checklist

### Code Session

At the start of every code session, before writing any code:

```
□ Read CLAUDE.md
□ Read AGENTS.md
□ Read DEVELOPMENT_STANDARDS.md (this file)
□ Read SECURITY_SCANNING.md
□ Read the most recent HANDOFF-*.md file (if one exists)
□ Read MILESTONES.md to confirm current state
□ Read BLOCKERS.md to check for active blockers
□ Run npm run build — confirm site builds before touching anything
```

### Content Session

At the start of every content session:

```
□ Read CLAUDE.md
□ Read AGENTS.md
□ Read CONTENT_STANDARDS.md
□ Read BRAND.md
□ Check MILESTONES.md for content calendar and queue status
□ Check BLOCKERS.md for any content blockers
```

---

## 14. First Session — Repository Setup Tasks

The very first code session must complete the following one-time setup before any feature work begins:

```
□ Developer Agent: Initialize Astro project (npm create astro@latest)
□ Developer Agent: Configure TypeScript (strict mode)
□ Developer Agent: Configure Tailwind CSS
□ Developer Agent: Configure MDX support
□ Developer Agent: Configure GitHub Pages deployment in astro.config.mjs (site + base)
□ Developer Agent: Create .github/workflows/deploy.yml (GitHub Pages deploy)
□ Developer Agent: Create .github/workflows/ci.yml (build + lint + link checker)
□ Developer Agent: Create .github/workflows/security.yml (Gitleaks + Semgrep + Trivy + Checkov)
□ Developer Agent: Create .github/workflows/lighthouse.yml (Lighthouse CI)
□ Developer Agent: Install and configure Gitleaks pre-commit hook
□ Developer Agent: Verify .env is in .gitignore
□ Developer Agent: Commit all standards docs (CLAUDE.md, AGENTS.md, etc.) to repository
□ Technical Writer Agent (PM Agent): Create CHANGELOG.md with v0.1.0 entry
□ PM Agent: Create BLOCKERS.md from template in this document
```

**BLOCKERS.md template:**

```markdown
# probl.me — Active Blockers

| # | Blocker | Blocked Item | Owner | Date Added | Status |
|---|---|---|---|---|---|
| 1 | GitHub Pages custom domain DNS configuration | probl.me domain pointing to Pages | Richard | 2026-06-22 | ⬜ Not started |
```

---

*Last updated: June 2026 — Collaboratively defined by Richard and Claude (Cowork).*
