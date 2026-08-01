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

**Addendum (2026-07-15):** Setup step 2's `schema.prisma` modification is no longer needed. Upstream Umami now supports `DIRECT_DATABASE_URL` natively — its `scripts/check-db.js` uses that variable for Prisma migrations when set, which is exactly what the Supabase workaround provided. The fork was created as planned (`rustymuffler/umami`, for Vercel to deploy from) but carries **no code changes**; keeping it unmodified means upstream updates can be pulled cleanly. Steps 1 and 3–8 are unchanged: set both `DATABASE_URL` (pooled) and `DIRECT_DATABASE_URL` (direct) as Vercel environment variables in step 4.

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

## Decision 10: OpenSSF Scorecard Added, Results Kept Private

**Date:** 2026-07-12 to 2026-07-15

**Decision:** Add `.github/workflows/scorecard.yml` as a new, non-redundant security layer (weekly + push-to-main + branch-protection-rule triggers). Keep `publish_results: false` rather than exposing the score on the public OpenSSF/deps.dev database.

**Context:** Discovered while researching the C7 article that `SECURITY_SCANNING.md` had been claiming Checkov enforces SHA-pinning of GitHub Actions. It doesn't, that check doesn't exist in Checkov. Scorecard's Pinned-Dependencies check is the real tool for this.

**Reason for keeping results private:** Several Scorecard checks (Code-Review, Contributors, CII-Best-Practices, Fuzzing) score near-zero for a solo-maintainer static site for structural reasons unrelated to actual risk. Publishing before the genuinely actionable gaps (branch protection, `SECURITY.md`, SAST recognition) closed would have been a misleading public signal, readers would see a low number without the context that half of it is structural, not a real weakness.

**What actually happened by end of session:** Richard merged `SECURITY.md` (PR #57) and configured a branch protection ruleset directly. Score moved 6.1 → 7.0. Security-Policy and part of Branch-Protection are now genuinely resolved. `publish_results` is still `false`; SAST recognition and Vulnerabilities triage remain open. Full breakdown tracked in `SCORECARD_IMPROVEMENTS.md`.

**Impact:** `SCORECARD_IMPROVEMENTS.md` is the source of truth for when to flip `publish_results` to `true`. Revisit once the remaining actionable items close, not on a fixed date.

---

## Decision 11: Prompt Injection Article — No Live Payloads Against Third Parties

**Date:** 2026-07-15

**Decision:** The planned C8 article on prompt injection will discuss and cite real techniques (hidden web pages, DNS TXT records, SEO-poisoned pages, email/calendar/shared-doc payloads, images/PDFs, untrusted survey input) with inert, clearly-labeled example payloads. It will **not** embed a live, functioning prompt-injection payload in the published page or its content, even a non-malicious one, designed to trigger an unintended action in any AI agent that reads it.

**Context:** Richard's pitch for the article came from personally encountering a hidden prompt-injection attempt on lawsofux.com. He proposed demonstrating the technique on probl.me itself with a harmless payload (redirecting an AI agent to a rickroll video), hidden in the live article page.

**Reason:** A real, functioning injection payload on a public, indexed page affects any third party's AI agent that processes it, a future reader's browser assistant, a search crawler's summarizer, another Claude Code session run against this repo by someone else, without that party's knowledge or consent. The harmlessness of the specific payload doesn't change the mechanism: it's the same "hidden instruction manipulates an AI that wasn't expecting it" pattern the article is meant to warn readers about, deployed against an uncontrolled, non-consenting audience instead of a controlled one.

**Alternative agreed:** An explicitly opt-in, clearly-labeled interactive demo (reader chooses to trigger it, sees what's happening) plus inert example payloads shown as text/code for each technique category, discussed and cited rather than live. Exact shape to be worked out when C8 enters the pipeline.

**Impact:** The Interview Agent should not need to re-litigate this framing when C8's interview happens, it's settled. See `MILESTONES.md`'s Content Calendar C8 note for the full pitch and this decision's summary.

---

## Decision 12: Prompt-Injection Defenses Added to probl.me's Own Agent Pipeline

**Date:** 2026-07-16

**Decision:** Close two real gaps found while researching and writing the C8 article, rather than just writing about them: (1) content PRs that touch site code can ship without a security scan, and (2) no documented rule for how much untrusted content an agent should process versus how much capability it should be granted while doing so. `AGENTS.md` and `SECURITY_SCANNING.md` are updated with process rules addressing both, and a live example of gap (1) was retroactively scanned and confirmed clean.

**Context:** probl.me's existing 8-layer security stack (`SECURITY_SCANNING.md`) covers code, dependencies, secrets, and IaC. None of it addressed the exact risk category C8 is about: how an agent should behave when it processes untrusted external content, and how much capability a content-fetching agent should be granted. A live example of the gap surfaced in the same session: a manual-review fix to `src/pages/blog/[slug].astro` (table CSS, PR #72) shipped without Aikido or Semgrep ever running on it, even though `SECURITY_SCANNING.md`'s own trigger table requires both for "writing or editing code." The content workflow and code workflow in `AGENTS.md` are documented as separate tracks, and this PR crossed both without either track's security step firing.

**Reason:** A blog that runs its own content pipeline through Claude agents fetching untrusted web content, per the C8 article itself, has a direct obligation to apply the defenses the article recommends to its own operation. Writing about defense-in-depth without checking whether our own pipeline practices it would be a credibility gap, not just a missed opportunity.

**What changed:**
1. **Workflow-seam rule** (`AGENTS.md`, Agent Interaction Rules): a content PR that touches anything outside `src/content/posts/[slug]/` or `public/assets/posts/[slug]/` now explicitly triggers the code workflow's Security Auditor Agent and Code Reviewer Agent steps, not just the content workflow's SEO Reviewer and Proofreader.
2. **Untrusted-content and tool-scoping rules for the Research Agent** (`AGENTS.md`, Research Agent standards): fetched content is documented as untrusted data that must never be treated as instructions; every Research Agent prompt must include this framing; the Research Agent should be spawned with the most restrictive tool access that accomplishes its task (search/fetch/summarize only, no Bash/Edit/Write/git, findings returned in its response rather than written directly); `research-brief.md` is documented as the trust boundary between raw fetched content and the rest of the pipeline.
3. **Provenance check** added to the Proofreader Agent's checklist (`AGENTS.md`): every claim, quote, code example, or embedded instruction in a draft must trace back to `interview-notes.md`, `research-brief.md`, or an explicit instruction from Richard.
4. **Scanning trigger added** (`SECURITY_SCANNING.md`, Scanning Triggers — Quick Reference): a content PR touching site code now explicitly requires Aikido + Semgrep before the PR opens, regardless of how minor the change looks.

**Retroactive scan result (the gap, closed for real, not just documented):** `src/pages/blog/[slug].astro` was scanned after the fact. Aikido (Opengrep engine via the Aikido MCP tool): 307 rules run, 0 findings. Semgrep (`--config auto`): 47 applicable rules run, 100% of lines parsed, 0 findings. Both scans are real, run this session, not assumed clean.

**What was deferred:** Adopting an open-source prompt-injection scanning library (LLM Guard, Rebuff, Vigil) to automatically screen fetched content for injection patterns. See the Future Decision entry below for why and when to revisit.

**Impact:** Future Research Agent spawns should reflect the tool-scoping change in practice (return findings, let the orchestrating session write `research-brief.md`), not just in the document. The next content pipeline run is the real test of whether this held.

---

## Decision 13: Adopt @stackone/defender for Content-Pipeline Prompt-Injection Scanning

**Date:** 2026-07-16

**Decision:** Install `@stackone/defender` (npm) as the automated scanner Decision 12 deferred, wired into the exact trust boundary already identified: it scans the Research Agent's returned text before that text is written to `research-brief.md`, via `scripts/scan-untrusted-content.mjs`. This resolves the "Future Decision: OSS Prompt-Injection Scanning Tools" entry below.

**Context:** Richard brought research proposing Vigil (`deadbits/vigil-llm`) as the tool to adopt. Verification (not taking the research at face value) found it unworkable: no PyPI package (clone-from-source only), a separate YARA v4.3.2 C-library install required, no CLI (server or Python-library only), and the project itself stale — last real commit 2024-01-31, still alpha, author moved to other work. The proposed integration code also didn't match the real API and assumed an architecture (a custom Python loop calling the Anthropic SDK directly) this repo doesn't have — probl.me has zero Python dependencies and runs its content pipeline through Claude Code subagents, not a custom inference loop we control.

**Alternatives considered (all verified via GitHub API and/or the npm registry directly, not just search-result summaries):**
- **LLM Guard** (`protectai/llm-guard`) — archived 2026-07-08, 8 days before this session. Was genuinely well-maintained until then.
- **Rebuff** (`protectai/rebuff`) — archived since 2024, last real commit January 2024, confirmed prototype status.
- **Guardrails AI** (`guardrails-ai/guardrails`) — actively maintained (pushed the same day as this research), but a broad general-purpose validation framework (PII, toxicity, format checking; prompt injection is one of many configurable Guards) with its dedicated prompt-injection validator historically dependent on the now-dead Rebuff. Python, heavier than needed.
- **Meta's LlamaFirewall** (`meta-llama/PurpleLlama`) — real, actively maintained, Meta-backed. A much larger framework (fine-tuned BERT model, chain-of-thought auditing, code scanning) for a narrow use case.

**Why `@stackone/defender` won:** actively maintained (release 9 days before this session, confirmed via GitHub API and a direct npm registry check, not just documentation claims), TypeScript/npm (matches this repo's actual runtime, no new Python/YARA toolchain), purpose-built for indirect prompt injection in fetched tool/agent content (exactly the Research Agent's job), lightweight (bundled ONNX model, CPU-only, no server, no external calls), real published benchmark (F1 ≈ 0.91).

**Integration notes (a real bug found and fixed during setup, not assumed away):**
- `@huggingface/transformers`, `onnxruntime-node`, and `fasttext.wasm` are optional peer dependencies npm does not auto-install. Without them, the ML classification tier (the actual F1 ≈ 0.91 stage) silently fails to load and the tool degrades to pattern-matching only, with no visible error in the result, just a `tier2SkipReason` field. All three were installed explicitly.
- `@huggingface/transformers@3.8.1` hard-pins its own `onnxruntime-node@1.21.0`, separate from the `1.27.0` version that satisfies `@stackone/defender`'s own peer range. Installing the loose range created two conflicting native binary copies (`Current ORT Version: 1.21.0` vs. an API call expecting version 27), a real runtime error. Fixed by pinning the top-level `onnxruntime-node` install to `1.21.0` exactly, deduplicating to one shared copy.
- With both tiers actually working, the tool **false-positived on this repo's own already-published, human-reviewed content** (`pin-github-actions-dependabot/research-brief.md`): zero Tier 1 pattern detections, but a Tier 2 ML score of 0.649 landed in the tool's documented "gray band" (`[0.3, 0.85)`, meant to escalate to a Tier 3 LLM adjudicator) and, with `blockHighRisk: true` and no Tier 3 provider configured, auto-blocked. The flagged sentence was benign commentary about Checkov policy check IDs. Richard's call: `blockHighRisk: false`. The tool is advisory — it always prints its result, never blocks the pipeline on its own. A Tier 1 pattern detection is treated as a strong signal worth stopping for; a Tier-2-only "high"/"critical" is a prompt for the orchestrating Claude Code session (or Richard) to read the flagged sentence before deciding, the same triage posture already used for Aikido/Semgrep WARN findings in this project.

**rl-protect-scan results (real, run this session):** `@stackone/defender@0.7.2` and its dependency tree scanned clean except two accepted findings, both logged in `SECURITY_SCANNING.md`'s Accepted Risk Log: `onnxruntime-node` WARN (debugging symbols and hardening flags typical of a compiled native addon, same class as the already-accepted Playwright entries, 0 vulnerabilities/malware/tampering), and `tar@7.5.20` GOVERNANCE FAIL (a 5-day-old package, all six substantive checks passed, same recency-gate pattern as the already-accepted `yargs`/`@playwright/test` entries). Richard explicitly reviewed and approved both before install.

**Impact:** `scripts/scan-untrusted-content.mjs` is now a real, tested step in the content pipeline (see `AGENTS.md` Research Agent — Untrusted Content Rules and `SECURITY_SCANNING.md` §9). It is advisory, not a hard gate, its real value is surfacing pattern-level detections and flagging ambiguous content for review, not auto-blocking.

---

## Decision 14: Lightweight Second-Pass Review for Infra-Only PRs

**Date:** 2026-07-22

**Decision:** A PR that only bumps a dependency version or fixes a CI/security-tool failure (no feature or content changes) requires a second look before merge, a fresh Claude Code session or agent reviewing the diff, without needing the full Developer → Test Writer → Security Auditor → Code Reviewer pipeline reserved for feature/content-crossing code. Added to `AGENTS.md` under Agent Interaction Rules.

**Context:** A single session chasing a cascading Trivy failure (js-yaml, then sharp/svgo/fast-xml-parser once main moved forward) touched PRs #74, #76, #85, #86, and triggered Dependabot rebases on #77-84, all as one agent acting alone: writing the fix, running the security scans, and merging the reasoning together with no separate reviewer at any point. That's exactly the self-review gap the existing "no agent reviews its own work" rule exists to prevent for code and content, it just hadn't been extended to infra-only changes.

**Why lightweight, not the full pipeline:** most of these changes are one-line version bumps with an `rl-protect` scan and a build/Trivy check already run. Routing every dependency bump through four sequential agent roles would be disproportionate overhead for a solo operator. A second pass that actually reads the diff and the verification steps catches the same class of mistake (an unscoped fix, a missed edge case, a fix that doesn't actually address the failure) without the ceremony.

**Impact:** `AGENTS.md` — new "Infra-only PRs" subsection under Agent Interaction Rules.

---

## Decision 15: Formalize the Hand-Built Diagram and Animation Pipeline

**Date:** 2026-07-22

**Decision:** Document the SVG + rasterization method (already used twice, for C2's article images and the README's animated pipeline diagram) as a first-class image source for the Image Creator Agent, not an implicit fallback. Covers both static diagrams (SVG → PNG via `sharp` or Playwright) and animated GIFs (a script-generated SVG frame sequence → PNG via `sharp` → assembled with `ffmpeg`'s two-pass palette). Added to `AGENTS.md`'s Image Creator Agent section and `BRAND.md`'s Image Standards.

**Context:** Richard asked whether the project's agent roster had the right tooling for images, specifically wanting emotional and animated imagery. Investigation found two real precedents already existed in the repo, `scripts/render-article-images.mjs` (C2, Playwright-based static rendering) and `public/assets/readme/generate-pipeline-frames.cjs` (README, `sharp` + `ffmpeg` animation), but neither was documented as a standing method in `AGENTS.md` or `BRAND.md`. Claude Design generation, the documented default, isn't always connected in a given session, and when it isn't, the Image Creator Agent had no fallback method on record even though a working one already existed in the codebase.

**Scope and limits:** this pipeline is geometric (nodes, lines, cards, brand-palette shapes). It cannot produce human expression or photographic realism, that gap is covered by the existing Stock Images allowance (Unsplash/Pexels for stills, GIPHY for pre-made GIFs), not by trying to force a diagram to do a photo's job.

**Impact:** `AGENTS.md` — Image Creator Agent — Image Rules, new source #2 plus emotion/animation guidance. `BRAND.md` — new "Hand-Built Diagrams and Animation" subsection under Image Standards, plus a cross-reference from Stock Images on when to reach for a photo instead of a diagram.

---

## Future Decision: Distribution Agent (Phase 4)

**Logged:** 2026-06-22
**Status:** Deferred — revisit when steady 2x/week publishing cadence is established

**What it is:** A Distribution Agent that runs automatically after Richard merges a content PR. It drafts a LinkedIn post and an X/Twitter post adapted from the published article, each in the appropriate format and length for that platform. Richard reviews and posts manually.

**Why deferred:** Building a distribution workflow before there is a content pipeline to distribute would be premature. The agent should be built once the publishing cadence is stable and there is a clear sense of what tone and format works for each platform.

**When to revisit:** Once 8+ articles are published and Phase 4 milestones are underway (M4.8 in MILESTONES.md).

---

## Future Decision: OSS Prompt-Injection Scanning Tools

**Logged:** 2026-07-16 (see Decision 12)
**Status:** Resolved 2026-07-16 — see Decision 13. Adopted `@stackone/defender`, not the three options named below (LLM Guard and Rebuff are both now archived/dead; Vigil, proposed separately, turned out to be stale and architecturally incompatible). Original deferral reasoning kept below for the record.

**What it is:** Adopting an open-source library (LLM Guard, Rebuff, or Vigil) to automatically pattern-scan content fetched by the Research Agent for injection attempts, rather than relying solely on prompt-level framing and human PR review.

**Why deferred:** The pipeline is low-volume (a handful of articles a month) and every output already passes through human review before merge. A new dependency adds real maintenance surface (it would need to clear `rl-protect-scan`, get tracked in `THIRD-PARTY-NOTICES.md`, and be kept current) for a risk that the process changes in Decision 12 already address at the point that matters most: what the agent is allowed to do with fetched content, not just whether the content looks suspicious.

**When to revisit:** If the content pipeline starts processing content that isn't reviewed by a human before publishing, or if fetch volume grows past what PR review can reasonably catch.

---

*Log continues as decisions are made. The PM Agent adds entries here whenever a significant technical, content, or strategic choice is made during the project.*
