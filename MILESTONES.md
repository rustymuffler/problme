# probl.me — Development Milestones

> Living checklist. The PM Agent updates status after every item completes.
> Last updated: 2026-06-22

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
| 1.1 | Create GitHub repository (public) | ⬜ | Repo: github.com/rustymuffler/problme |
| 1.2 | Initialize Astro project (`npm create astro@latest`) | ⬜ | Use strictest TypeScript option |
| 1.3 | Configure Tailwind CSS | ⬜ | `@astrojs/tailwind` integration |
| 1.4 | Configure MDX support | ⬜ | `@astrojs/mdx` integration |
| 1.5 | Configure content collections | ⬜ | Astro content collections for `src/content/posts/` |
| 1.6 | Configure GitHub Pages deployment | ⬜ | `astro.config.mjs`: site + base; `output: 'static'` |
| 1.7 | Create `.github/workflows/deploy.yml` | ⬜ | GitHub Actions → GitHub Pages deployment |
| 1.8 | Create `.github/workflows/ci.yml` | ⬜ | Build check + lint + link checker |
| 1.9 | Create `.github/workflows/security.yml` | ⬜ | Gitleaks + Semgrep + Trivy + Checkov |
| 1.10 | Create `.github/workflows/lighthouse.yml` | ⬜ | Lighthouse CI checks on every PR |
| 1.11 | Install Gitleaks pre-commit hook | ⬜ | `.git/hooks/pre-commit` |
| 1.12 | Verify `.env` in `.gitignore` | ⬜ | Check before first push |
| 1.13 | Commit all standards docs to repository | ⬜ | CLAUDE.md, AGENTS.md, DEVELOPMENT_STANDARDS.md, SECURITY_SCANNING.md, CONTENT_STANDARDS.md, BRAND.md, DECISIONS.md, MILESTONES.md, BLOCKERS.md |
| 1.14 | Configure custom domain probl.me on GitHub Pages | ⬜ | DNS: CNAME → rustymuffler.github.io |
| 1.15 | Verify SSL/HTTPS on probl.me | ⬜ | GitHub Pages provides free TLS |
| 1.16 | First successful deploy (placeholder index page) | ⬜ | Anything that builds and deploys |
| 1.17 | Create CHANGELOG.md with v0.1.0 entry | ⬜ | PM Agent / Technical Writer Agent |
| 1.18 | Create BLOCKERS.md | ⬜ | PM Agent |

**Phase 1 complete when:** Site loads at probl.me, CI/CD and security pipelines are green, and all standards docs are in the repository.

---

## Phase 2 — Design (Target: v0.5.0)

**Goal:** Full design system implemented, all page templates built, brand components live.

| # | Item | Status | Notes |
|---|---|---|---|
| 2.1 | Implement design tokens in CSS variables | ⬜ | Colors, typography, shadows from BRAND.md |
| 2.2 | Configure Inter + JetBrains Mono fonts | ⬜ | Via Bunny Fonts or local hosting (privacy) |
| 2.3 | Build base layout component | ⬜ | Header, footer, page wrapper |
| 2.4 | Build navigation component | ⬜ | Desktop + mobile responsive |
| 2.5 | Build homepage layout | ⬜ | Hero, 3D card, scrolling icons, latest posts grid |
| 2.6 | Build 3D business card component | ⬜ | Neumorphic, Richard's info, links |
| 2.7 | Create brand icon set with Claude Design | ⬜ | 8 SVG icons: PM, AI Dev, Tech Tools, Astro, GitHub, Security, Building in Public, Celly |
| 2.8 | Build scrolling icon strip component | ⬜ | Auto-scroll animation, pauses on hover |
| 2.9 | Build blog listing page | ⬜ | Article card grid, category filter |
| 2.10 | Build article card component | ⬜ | Hero thumbnail, category badge, title, excerpt, read time, date |
| 2.11 | Build blog post template | ⬜ | Article body, hero image, metadata, reading time |
| 2.12 | Build About page | ⬜ | Extended bio, career context, 3D card |
| 2.13 | Implement syntax highlighting | ⬜ | Shiki with `github-dark` or `tokyo-night` theme |
| 2.14 | Implement callout block MDX components | ⬜ | note, warning, tip variants |
| 2.15 | Build RSS feed | ⬜ | `/rss.xml` via `@astrojs/rss` |
| 2.16 | Build sitemap | ⬜ | `@astrojs/sitemap` integration |
| 2.17 | Implement Open Graph meta tags | ⬜ | Dynamic per-post OG image, title, description |
| 2.18 | Accessibility audit on all components | ⬜ | axe-core + manual keyboard testing |
| 2.19 | Lighthouse audit — all scores ≥ target | ⬜ | Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 |

**Phase 2 complete when:** All pages are designed and built, Lighthouse scores meet minimums, brand components are live, and the site looks like a real blog.

---

## Phase 3 — Content (Target: v1.0.0)

**Goal:** First 4 articles published, content agent workflow validated end-to-end, 2x/week cadence established.

| # | Item | Status | Notes |
|---|---|---|---|
| 3.1 | Set up Monday idea batch scheduled task | ⬜ | PM Agent creates scheduled task — Content Strategist Agent fires every Monday 9am |
| 3.2 | Set up Friday queue health check scheduled task | ⬜ | PM Agent creates scheduled task — alerts if draft PR count < 4 |
| 3.3 | Set up Tuesday/Thursday PR reminder scheduled task | ⬜ | PM Agent creates scheduled task — lists open draft PRs for Richard |
| 3.4 | Set up monthly retrospective scheduled task | ⬜ | PM Agent creates scheduled task — fires first Monday of each month at 10am |
| 3.5 | Create `retros/` folder in repository | ⬜ | PM Agent creates the folder and adds a `.gitkeep` so it is committed |
| 3.6 | Define initial content calendar (first 4 articles) | ⬜ | First Monday idea batch; Richard selects |
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

*Last updated: 2026-06-22 — Collaboratively defined by Richard and Claude (Cowork).*
