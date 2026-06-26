# probl.me — Technical Decisions Log

> Living log of significant technical and strategic decisions made during the probl.me project. Updated by the PM Agent whenever a notable decision is made.

---

## Decision 1: GitHub Pages + Astro for Hosting and Framework

**Date:** 2026-06-22

**Decision:** Use GitHub Pages for hosting and Astro as the static site framework.

**Alternatives considered:** Vercel (costs at scale), Netlify (free tier limitations), WordPress (too heavy), Ghost (subscription cost), Next.js (overkill for static blog).

**Reason:** GitHub Pages is completely free for public repositories and integrates natively with GitHub Actions for CI/CD. Astro is purpose-built for content-first sites: generates static HTML with optional islands of interactivity, has first-class MDX support, excellent performance defaults, and a strong ecosystem of free themes and integrations. The probl.me domain is already owned — no additional hosting cost beyond the domain renewal.

**Impact:** All content is written in MDX and lives in the repository. No CMS login, no database, no server. Deployments happen automatically on merge to `main`.

---

## Decision 2: Claude Pro as the Sole External Service

**Date:** 2026-06-22

**Decision:** Use Claude Pro (already paid) as the only external service powering the agent workflow. No additional subscriptions or API costs.

**Alternatives considered:** Midjourney (image generation, subscription required), Canva Pro (design, subscription), Contentful (headless CMS, costs at scale), Netlify CMS (complexity without benefit).

**Reason:** The entire publishing workflow — idea generation, article drafting, image creation, SEO review, and PR creation — can run within the Claude Pro license using a combination of Claude Cowork and Claude Code. Adding external paid services would contradict the zero-incremental-cost goal for the project and make the workflow harder to document authentically for the blog.

**Impact:** Image generation is handled by Claude's native image generation. Content strategy, drafting, and SEO review happen in Claude Cowork. Code and PR creation happen in Claude Code. No external API keys for content services.

---

## Decision 3: Full 7-Layer Security Stack for a Static Site

**Date:** 2026-06-22

**Decision:** Apply the same 7-layer security stack used on the Celly project (Aikido, Semgrep, /security-review, rl-protect, Trivy, Gitleaks, Checkov) to probl.me despite it being a static site.

**Alternatives considered:** Minimal security (Gitleaks only), lightweight security (Gitleaks + Trivy + Checkov).

**Reason:** Two reasons: (1) probl.me will write about security practices, so running real security tooling creates authentic content — readers can trust that the security articles reflect an actual workflow. (2) Even static sites have meaningful attack surface: npm dependency supply chain, GitHub Actions CI/CD pipeline, and secrets management all benefit from the layered approach.

**Impact:** Security standards in `SECURITY_SCANNING.md` apply to all code sessions. Some tools (e.g., /security-review) are less critical for a pure static site but are retained for when integrations are added.

---

## Decision 4: Multi-Agent Workflow for Content Production

**Date:** 2026-06-22

**Decision:** Use a defined multi-agent team — Content Strategist, Writer, Image Creator, SEO Reviewer, and Publisher agents — to produce and publish articles.

**Alternatives considered:** Richard writing everything manually, a single Claude agent handling the full pipeline.

**Reason:** Separating concerns across agents mirrors the checks and balances of a real editorial team, catches more errors (no agent reviews its own work), and enables the agent team to be described in blog content as an authentic workflow. The sequential handoff — draft → review → SEO → publish — produces higher quality output than a single-pass approach.

**Impact:** Every published article passes through at least 4 agent handoffs before Richard reviews the draft PR. The workflow is documented in `AGENTS.md` and `CONTENT_STANDARDS.md`.

---

## Decision 5: Warm Dark Design with Neumorphic Accents

**Date:** 2026-06-22

**Decision:** Dark mode by default. Design inspired by Chirping Astro (layout) and Astro Neumorphism (3D card, scrolling icons). Custom implementation — not a direct theme install.

**Alternatives considered:** Light mode default, pure minimal monochrome design, a direct theme install without customization.

**Reason:** Dark mode is the preference of the target audience (developers and PMs) and aligns with the technical + cybersecurity background of the brand. The neumorphic 3D business card creates a distinctive, memorable personal element. Building a custom implementation rather than installing a theme gives full control over the design system.

**Impact:** `BRAND.md` defines all design tokens. The 3D business card and scrolling icon components are custom-built. Claude Design is used to create the brand icon set.

---

## Decision 6: Four-Phase Milestone Structure

**Date:** 2026-06-22

**Decision:** Organize the project into 4 phases: Setup → Design → Content → Growth.

**Alternatives considered:** 2-phase (Build → Publish), 3-phase (Setup → Launch → Growth).

**Reason:** The extra granularity of 4 phases separates the technical foundation (Setup) from the visual identity (Design) from the initial content sprint (Content) and ongoing operation (Growth). This prevents the common mistake of launching with good code but no design, or launching with design but no content.

**Impact:** `MILESTONES.md` tracks all 4 phases. Version tags (`v0.1.0`, `v0.5.0`, `v1.0.0`, `v2.0.0`) align to phase completions.

---

## Decision 7: Research Agent Added to Content Pipeline

**Date:** 2026-06-22

**Decision:** Add a Research Agent between the Interview Agent and the Writer Agent. It runs a web search and source-gathering pass before any drafting begins, saving a `research-brief.md` alongside `interview-notes.md`.

**Alternatives considered:** Having the Writer Agent research inline while drafting (no separation of concerns), skipping dedicated research entirely (relying on interview notes and Claude's training data only).

**Reason:** The Writer Agent drafting without dedicated research risks outdated information, uncited claims, and articles that repeat what already exists rather than adding something new. Separating research from writing also means the Writer Agent receives clean, structured inputs rather than having to context-switch between gathering and composing. The competitive content scan in the research brief specifically ensures each article adds something the existing articles on the topic do not.

**Impact:** The content pipeline is now 9 steps. Every article requires both `interview-notes.md` and `research-brief.md` before drafting begins. Any statistic in an article must be sourced in the research brief.

---

## Decision 8: Umami Analytics — Self-Hosted on Vercel + Supabase

**Date:** 2026-06-22

**Decision:** Use self-hosted Umami Analytics, deployed to Vercel (free tier), backed by a Supabase PostgreSQL database (free tier). The Umami tracking script is added to `src/layouts/Layout.astro` so it runs on every page of the blog.

**Alternatives considered:** Fathom ($14/mo), Plausible ($9/mo), Google Analytics (invasive, cookie-based, not GDPR-friendly), no analytics.

**Reason:** Umami is open source, privacy-first, cookie-free by default, and GDPR-compliant out of the box — no cookie banner required. The Vercel + Supabase pairing keeps the total cost at $0. Umami tracks page views, unique visitors, sessions, bounce rate, average time on page, referrers, top pages, and device/browser data — sufficient for monthly retrospective reporting. Hosting Umami separately from the blog (Vercel) while the blog itself stays on GitHub Pages keeps each system independent and simple.

**Architecture:**
- Blog: GitHub Pages (Astro static site at probl.me)
- Analytics app: Vercel (Umami Next.js app, auto-deploys from a forked GitHub repo)
- Analytics database: Supabase (PostgreSQL, free tier)
- Connection: One `<script>` tag in `src/layouts/Layout.astro` pointing to the Vercel Umami instance

**Setup steps (one-time, performed in Phase 3):**
1. Create Supabase free account and project — note `DATABASE_URL` and `DIRECT_DATABASE_URL` from database settings
2. Fork `umami-software/umami` to `rustymuffler/umami` on GitHub — modify `schema.prisma` to include `DIRECT_DATABASE_URL` for Supabase compatibility
3. Create Vercel free account — import the forked Umami repo
4. Set `DATABASE_URL` and `DIRECT_DATABASE_URL` as environment variables in Vercel project settings
5. Deploy — Vercel builds and launches the Umami dashboard
6. Add probl.me as a website inside the Umami dashboard — copy the generated `data-website-id`
7. Add the tracking script to `src/layouts/Layout.astro`:
   ```astro
   <script
     async
     src="https://[your-umami-app].vercel.app/script.js"
     data-website-id="[your-unique-website-id]"
   ></script>
   ```
8. Deploy the Astro blog update to GitHub Pages — analytics tracking is live

**Impact:** Monthly retrospectives have access to real reader engagement data. The `data-website-id` and Vercel Umami URL are stored as environment variables or build-time constants — never hardcoded without review. The Umami tracking script is the one approved third-party script in `<head>` per the project invariants. The setup process itself is a blog article candidate in the Tech Stack + Tools category.

---

## Decision 9: Dependabot Vulnerability Alerts — No Action (June 2026)

**Date:** 2026-06-26

**Decision:** Accept the 4 open Dependabot vulnerability alerts on `main` without code changes. No PR opened.

**Alerts in question:**

| Alert | Severity | Vulnerable Package | Root Cause |
|---|---|---|---|
| #69 `tmp` Path Traversal | High | `tmp < 0.2.6` | Transitive dep of `@lhci/cli@0.15.1` |
| #70 `js-yaml` DoS | Moderate | `js-yaml <= 4.1.1` | Transitive dep of `@lhci/cli@0.15.1` |
| #68 `uuid` bounds check | Moderate | `uuid < 11.1.1` | Transitive dep of `@astrojs/check@0.9.9` |
| #66 `tmp` symlink write | Low | `tmp <= 0.2.3` | Transitive dep of `@lhci/cli@0.15.1` |

**Why no action:**

1. Both parent packages (`@lhci/cli@0.15.1`, `@astrojs/check@0.9.9`) are already at their latest published versions — there is no upstream release that resolves these transitive deps.
2. `npm audit fix --force` would **downgrade** `@astrojs/check` from `0.9.9` to `0.9.2`, which is the wrong direction.
3. All affected packages are **dev-only CI tools**. They run in GitHub Actions, not in the static site served to visitors. The vulnerable code never executes in production.
4. The high-severity `tmp` path traversal requires a malicious actor to control the prefix/postfix arguments passed to Lighthouse CI's temp file creation — an implausible attack vector in a controlled CI environment.

**Action to take when revisiting:** Check whether `@lhci/cli` or `@astrojs/check` have released new versions that pull in patched transitive deps. Run `npm audit` at that point — if the vulnerability count drops, update and open a `chore/dependency-update` PR.

---

## Future Decision: Distribution Agent (Phase 4)

**Logged:** 2026-06-22
**Status:** Deferred — revisit when steady 2x/week publishing cadence is established

**What it is:** A Distribution Agent that runs automatically after Richard merges a content PR. It drafts a LinkedIn post and an X/Twitter post adapted from the published article, each in the appropriate format and length for that platform. Richard reviews and posts manually.

**Why deferred:** Building a distribution workflow before there is a content pipeline to distribute would be premature. The agent should be built once the publishing cadence is stable and there is a clear sense of what tone and format works for each platform.

**When to revisit:** Once 8+ articles are published and Phase 4 milestones are underway (M4.8 in MILESTONES.md).

---

*Log continues as decisions are made. The PM Agent adds entries here whenever a significant technical, content, or strategic choice is made during the project.*
