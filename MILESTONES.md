# probl.me — Development Milestones

> Living checklist. The PM Agent updates status after every item completes.
> Last updated: 2026-06-24

---

## Legend

- ✅ Complete
- 🔄 In progress
- ⬜ Not started
- 🔑 Blocked on external action or credential

---

## Phase 1 — Setup (Target: v0.1.0)

**Goal:** Site is live at probl.me with CI/CD, security tooling, and all standards documents committed.

| # | Item | Status | Notes |
|---|---|---|---|
| 1.1 | Create GitHub repository (public) | ✅ | Repo live at github.com/rustymuffler/problme — 2026-06-23 |
| 1.2 | Initialize Astro project (`npm create astro@latest`) | ✅ | Astro 7.0.2, TypeScript strictest preset — 2026-06-24 |
| 1.3 | Configure Tailwind CSS | ✅ | Tailwind CSS 4.x via `@tailwindcss/vite` plugin — 2026-06-24 |
| 1.4 | Configure MDX support | ✅ | `@astrojs/mdx` 7.0.0 — 2026-06-24 |
| 1.5 | Configure content collections | ✅ | `src/content.config.ts` with glob loader, posts schema — 2026-06-24 |
| 1.6 | Configure GitHub Pages deployment | ✅ | `astro.config.mjs`: `site: 'https://probl.me'`, `output: 'static'` — 2026-06-24 |
| 1.7 | Create `.github/workflows/deploy.yml` | ✅ | GitHub Actions → GitHub Pages, all SHA-pinned — 2026-06-24 |
| 1.8 | Create `.github/workflows/ci.yml` | ✅ | Build + astro check + lychee link checker (lychee-action v2.8.0) — 2026-06-24 |
| 1.9 | Create `.github/workflows/security.yml` | ✅ | Gitleaks + Semgrep + Trivy v0.71.2 (via gh release download) + Checkov — 2026-06-24 |
| 1.10 | Create `.github/workflows/lighthouse.yml` | ✅ | LHCI 3-run average; perf threshold 0.50 in CI (localhost not representative) — 2026-06-24 |
| 1.11 | Install Gitleaks pre-commit hook | ✅ | `.git/hooks/pre-commit`, Gitleaks 8.30.1, `.gitleaks.toml` allowlist — 2026-06-24 |
| 1.12 | Verify `.env` in `.gitignore` | ✅ | Astro/Node .gitignore committed 2026-06-23 |
| 1.13 | Commit all standards docs to repository | ✅ | All governance docs committed to main 2026-06-23 |
| 1.14 | Configure custom domain probl.me on GitHub Pages | ✅ | CNAME set, DNS A records and CNAME verified, Pages custom domain confirmed — 2026-06-25 |
| 1.15 | Verify SSL/HTTPS on probl.me | ✅ | GitHub Pages TLS active; HTTP 200 confirmed at https://probl.me — 2026-06-25 |
| 1.16 | First successful deploy (placeholder index page) | ✅ | feat/astro-foundation merged to main 2026-06-25; GitHub Actions deploy fired — site live at rustymuffler.github.io/problme |
| 1.17 | Create CHANGELOG.md with v0.1.0 entry | ⬜ | PM Agent / Technical Writer Agent |
| 1.18 | Create BLOCKERS.md | ✅ | Committed to main 2026-06-23 |

**Phase 1 complete when:** Site loads at probl.me, CI/CD and security pipelines are green, and all standards docs are in the repository.

---

## Phase 2 — Design (Target: v0.5.0)

**Goal:** Full design system implemented, all page templates built, brand components live.

| # | Item | Status | Notes |
|---|---|---|---|
| 2.1 | Implement design tokens in CSS variables | ✅ | Full Workshop palette + type scale + spacing in `src/styles/global.css` — 2026-06-24 |
| 2.2 | Configure Inter + JetBrains Mono fonts | ✅ | Hanken Grotesk + JetBrains Mono via Bunny Fonts in Layout head — 2026-06-24 |
| 2.3 | Build base layout component | ✅ | `src/layouts/Layout.astro`: sticky header, footer, OG meta — 2026-06-24 |
| 2.4 | Build navigation component | ✅ | Sticky header with nav links built into `Layout.astro` — 2026-06-24 |
| 2.5 | Build homepage layout | ✅ | Hero + 3D card + IconStrip + latest posts grid — 2026-06-24 |
| 2.6 | Build 3D business card component | ✅ | `BusinessCard.astro` — tilt, glare, homepage + about variants; email obfuscated via data-* attrs — 2026-06-25 |
| 2.7 | Create brand icon set with Claude Design | ✅ | All assets in `design_handoff_blog_site/assets/` — 2026-06-24 |
| 2.8 | Build scrolling icon strip component | ✅ | `IconStrip.astro` — marquee scroll, pauses on hover, accessible — 2026-06-24 |
| 2.9 | Build blog listing page | ✅ | `src/pages/blog/index.astro` — category filter, ArticleCard grid — 2026-06-24 |
| 2.10 | Build article card component | ✅ | `ArticleCard.astro` — hero thumb, category badge, title, excerpt, read time, date — 2026-06-24 |
| 2.11 | Build blog post template | ✅ | `src/pages/blog/[slug].astro` — article body, hero, metadata — 2026-06-24 |
| 2.12 | Build About page | ✅ | `src/pages/about.astro` — bio, 3D card (about variant), icon strip — 2026-06-24 |
| 2.13 | Implement syntax highlighting | ✅ | Shiki `material-theme-palenight` via `astro.config.mjs` + `CodeBlock.astro` with copy button — 2026-06-26 |
| 2.14 | Implement callout block MDX components | ✅ | `src/components/Callout.astro` — note (amber), warning (terracotta), tip (olive) — 2026-06-26 |
| 2.15 | Build RSS feed | ✅ | `/rss.xml` via `@astrojs/rss@4.0.18`; autodiscovery `<link>` in Layout.astro — 2026-06-26 |
| 2.16 | Build sitemap | ✅ | `@astrojs/sitemap@3.7.3` in integrations; `sitemap-index.xml` at build; `<link rel="sitemap">` in Layout.astro — 2026-06-26 |
| 2.17 | Implement Open Graph meta tags | ✅ | Dynamic title/description/OG in `Layout.astro` — 2026-06-24 |
| 2.18 | Accessibility audit on all components | ✅ | axe-core Playwright tests passing; all violations resolved — 2026-06-24 |
| 2.19 | Lighthouse audit — all scores ≥ target | ✅ | Production audit at https://probl.me: Perf 96, A11y 100, BP 100, SEO 100 — 2026-06-25 |

**Phase 2 complete when:** All pages are designed and built, Lighthouse scores meet minimums, brand components are live, and the site looks like a real blog.

---

## Phase 3 — Content (Target: v1.0.0)

**Goal:** First 4 articles published, content agent workflow validated end-to-end, 2x/week cadence established.

| # | Item | Status | Notes |
|---|---|---|---|
| 3.1 | Set up Monday idea batch scheduled task | ✅ | `probme-monday-idea-batch` — fires every Monday 9am — 2026-06-26 |
| 3.2 | Set up Friday queue health check scheduled task | ✅ | `probme-friday-queue-check` — fires every Friday 9am — 2026-06-26 |
| 3.3 | Set up Tuesday/Thursday PR reminder scheduled task | ✅ | `probme-pr-reminder` — fires every Tue/Thu 8am — 2026-06-26 |
| 3.4 | Set up monthly retrospective scheduled task | ✅ | `probme-monthly-retro` — fires first Monday of month 10am; next run 2026-07-06 — 2026-06-26 |
| 3.5 | Create `retros/` folder in repository | ✅ | `retros/.gitkeep` committed to main — 2026-06-26 |
| 3.6 | Define initial content calendar (first 4 articles) | ✅ | First idea batch run 2026-06-26; Richard selected 7 articles — see Content Calendar below |
| 3.7 | Article 1: Interview → Research → Draft → Review → Proofread → PR | ⬜ | Full end-to-end test of the complete pipeline |
| 3.8 | Article 2: Interview → Research → Draft → Review → Proofread → PR | ⬜ | |
| 3.9 | Article 3: Interview → Research → Draft → Review → Proofread → PR | ⬜ | |
| 3.10 | Article 4: Interview → Research → Draft → Review → Proofread → PR | ⬜ | |
| 3.11 | First monthly retrospective | ⬜ | Run after first full month of publishing — RETRO filed in `retros/` |
| 3.12 | Write and publish article about the agent content pipeline | ⬜ | AI-Assisted Development category — documents how the loop and scheduling work |
| 3.13 | Write and publish article about the retrospective process | ⬜ | AI-Assisted Development category — documents how the monthly retro improves the workflow |
| 3.14 | Content calendar: 4 articles in draft queue | ⬜ | Queue must stay ≥ 4 articles ahead |
| 3.15 | Confirm 2x/week publish cadence is sustainable | ⬜ | Tuesday + Friday schedule |
| 3.16 | Submit sitemap to Google Search Console | ⬜ | Requires Google Search Console property for probl.me |
| 3.17 | Create Supabase free account + project | ⬜ | Note DATABASE_URL and DIRECT_DATABASE_URL from database settings |
| 3.18 | Fork umami-software/umami to rustymuffler/umami | ⬜ | Modify schema.prisma to add DIRECT_DATABASE_URL for Supabase |
| 3.19 | Create Vercel free account — import forked Umami repo | ⬜ | Connect GitHub account; select the umami fork |
| 3.20 | Set DATABASE_URL + DIRECT_DATABASE_URL as Vercel env vars | ⬜ | Paste Supabase connection strings into Vercel project settings |
| 3.21 | Deploy Umami to Vercel + add probl.me as a website | ⬜ | Copy the generated data-website-id from Umami dashboard |
| 3.22 | Add Umami tracking script to src/layouts/Layout.astro | ⬜ | `<script async src="https://[umami].vercel.app/script.js" data-website-id="[id]">` — store id as build constant, not hardcoded |
| 3.23 | Deploy Astro update to GitHub Pages — verify analytics tracking | ⬜ | Open the site, check Umami dashboard for a live visit |
| 3.24 | Write and publish article about the Umami setup | ⬜ | Tech Tools category — documents the free Vercel + Supabase + Umami stack |

**Phase 3 complete when:** 4 articles are live, the agent workflow has been validated once end-to-end, and the site is indexed by Google.

---

## Phase 4 — Growth (Target: v2.0.0)

**Goal:** Site is fully operational at 2x/week cadence, content is growing, and the publishing process runs smoothly.

| # | Item | Status | Notes |
|---|---|---|---|
| 4.1 | 2x/week cadence running for 4 consecutive weeks | ⬜ | 8+ articles published |
| 4.2 | Monthly retrospective process running smoothly | ⬜ | At least 2 retrospectives completed; standards docs have been updated at least once based on findings |
| 4.3 | All 3 content categories have ≥ 3 articles each | ⬜ | PM Craft, AI Development, Tech Tools |
| 4.4 | Internal linking established between articles | ⬜ | Every article links to at least one other |
| 4.5 | Series: "Building probl.me in Public" (3-part) | ⬜ | Documents the process of building this site |
| 4.6 | Series: "Building Celly in Public" (3-part) | ⬜ | Documents the Celly development journey |
| 4.7 | Email newsletter signup (optional) | ⬜ | Discussion needed — adds complexity |
| 4.8 | Social sharing optimization | ⬜ | OG images verified on LinkedIn, X |
| 4.9 | Build and activate Distribution Agent | ⬜ | After merge, auto-drafts a LinkedIn post and an X/Twitter post for Richard to review and post manually |
| 4.10 | Write article about the Distribution Agent workflow | ⬜ | AI-Assisted Development category — documents how content distribution was automated |
| 4.11 | Dependency maintenance cadence established | ⬜ | Monthly npm update review — can surface as a retrospective action item |
| 4.12 | Annual security stack review | ⬜ | Review SECURITY_SCANNING.md annually |

**Phase 4 complete when:** The site is self-sustaining — content is being published regularly, the process is documented, and the project can serve as a reference for future projects.

---

## Invariants (Never Violate)

These invariants are tracked across all phases. The Code Reviewer Agent checks for violations on every PR.

1. **Write as Richard.** All articles are first-person, Richard's voice.
2. **Interview notes are required.** No article may be drafted without `interview-notes.md`. Richard's personal content must be present and identifiable in the final article.
3. **No em dashes.** Never. Proofreader Agent rejects any draft containing `—`. Rewrite the sentence.
4. **Proofreader must approve** before any content PR is opened.
5. **No fabricated quotes.** Every attributed quote must be real and verifiable.
6. **No unlicensed images.** Claude-generated, personal screenshots, or personal photos only.
7. **No secrets in source files.** Use environment variables and GitHub Secrets.
8. **SEO checklist 100% complete before any content PR opens.**
9. **Lighthouse minimums:** Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
10. **No third-party scripts without Richard's review.**
11. **Brand palette only** — no ad-hoc colors, fonts, or layouts.
12. **Only recommend tools we actually use.**

---

---

## Content Calendar

> Maintained by the PM Agent. Updated when articles enter or exit the pipeline.
> Last updated: 2026-06-26

| # | Working Title | Category | Status | Target Publish |
|---|---|---|---|---|
| C1 | Writing a spec your AI agent can actually follow | pm-craft | ⬜ Queued | TBD |
| C2 | How I built a fully automated content pipeline with Claude agents (and what broke first) | ai-development | ⬜ Queued | TBD |
| C3 | Multi-agent workflows without an orchestration framework: the AGENTS.md approach | ai-development | ⬜ Queued | TBD |
| C4 | How Context Limits Changed the Way I Build with AI | ai-development | ✅ Published | 2026-06-26 |
| C5 | Scheduled Claude agents: setting up autonomous loops that don't need babysitting | ai-development | ⬜ Queued | TBD |
| C6 | Astro on GitHub Pages in 2026: what the docs don't tell you | tech-tools | ⬜ Queued | TBD |
| C7 | Why I SHA-pin every GitHub Action and how I automate keeping them current | tech-tools | ⬜ Queued | TBD |

**Pipeline status key:** ⬜ Queued → 🔄 Interview → 🔄 Research → 🔄 Draft → 🔄 Review → 🔄 Proofread → 🔑 PR Open → ✅ Published

---

*Last updated: 2026-06-26 — PM Agent: marked 1.14, 1.15, 2.19, 3.1–3.6 ✅; added Content Calendar with 7 selected articles (session 2026-06-26).*
