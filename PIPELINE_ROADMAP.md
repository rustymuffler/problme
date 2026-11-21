# probl.me: Content Pipeline Roadmap

> **File:** `PIPELINE_ROADMAP.md`
> **Purpose:** The complete inventory of what the phone-first content pipeline does today and every part still to automate, in phases, so nothing is missed.
> **Related:** `PIPELINE_AUTOMATION_SPEC.md` (requirements), `AGENTS.md` and `CONTENT_STANDARDS.md` (the standards the pipeline enforces), `MILESTONES.md` (invariants and calendar).
> **Created:** 2026-11-21. Status key: ⬜ not started, 🔄 in progress, ✅ done.

## How this is tracked

- This file is the source of truth for scope and the definition of done.
- Each phase has a GitHub issue with a checklist, so progress is visible and tickable from your phone: [phase 0](https://github.com/rustymuffler/problme/issues/157), [phase 1](https://github.com/rustymuffler/problme/issues/158), [phase 2](https://github.com/rustymuffler/problme/issues/159), [phase 3](https://github.com/rustymuffler/problme/issues/160), [phase 4](https://github.com/rustymuffler/problme/issues/161), [phase 5](https://github.com/rustymuffler/problme/issues/162), [phase 6](https://github.com/rustymuffler/problme/issues/163).
- When an item ships, tick it in its phase issue and update its status here in the same PR.
- New gaps found later are added here first, then to the phase issue.

## Quality bar

Every article should be the best available answer to the reader's question, in Richard's own voice. "Ready to merge" means all of the following are true. Automation raises the floor; Richard's merge is the final gate.

1. **Original insight.** Richard's interview content is present, quoted, and drives the angle. The article says something the top search results do not.
2. **Accurate.** Every claim, statistic and quote traces to the interview notes or a source that was opened and checked. No unresolved `[UNVERIFIED]` markers.
3. **Clear and readable.** Grade 8 to 10, short sentences and paragraphs, no jargon without explanation, no banned phrases or dashes, correct grammar and spelling.
4. **Answer first.** The TL;DR and the first 200 words answer the core question. Sections stand alone. FAQ answers are real, self-contained and not a restatement.
5. **Findable by search and AI engines.** Title, description, slug, headings, internal links, structured data and feeds all pass the SEO and AEO checks.
6. **Visual.** A hero image and about one in-article visual per 500 words, each adding information, with descriptive alt text and the brand palette.
7. **Safe.** No private or employer information, no secrets, no executable content, no links to sources that were not checked.
8. **Reviewed independently.** Reviews are done by runs that did not write the draft, and the quality scorecard shows every line passing.

**Invariant gap to close first:** `MILESTONES.md` requires Proofreader approval (invariant 4) and a complete SEO checklist (invariant 8) before a content PR opens. The pipeline built so far opens PRs with only the mechanical lint and one independent review. Until phases 2 and 3 exist, pipeline PRs open as drafts and say which reviews have not run (item P0-2).

## Built so far

| Capability | Where | Status |
|---|---|---|
| Scheduled publishing (future-dated posts hidden, Tue/Thu release) | PR 153 | Merged |
| Content lint: mechanical rules, changed-post CI job, required check | PR 154 | Merged; required check added 2026-11-21 |
| Interview stage: label, follow-ups, notes, owner-only gate | PR 155 | Merged; not yet run live |
| Research, draft, lint loop, draft PR, independent review | PR 156 | Open; not yet run live |
| Fork PR approval for all external contributors | Setting | Done 2026-11-21 |
| Issue labels (stage and category) | Setting | Done 2026-11-20 |

Not yet proven live: the interview stage and the research and draft stage have only been tested locally and by independent review.

## What is automated today, and what is still manual

| Step in the original process (AGENTS.md) | Today |
|---|---|
| Idea generation (Content Strategist) | Manual. The Cowork scheduled tasks are paused. Phase 4. |
| Interview | Automated (built, unproven live). Stalled timer and batch mode are phase 4. |
| Research | Automated (built, unproven live). Second pass and fact-check are phase 3. |
| Draft (Writer) | Automated (built, unproven live). |
| Images (Image Creator) | Manual. Phase 1. |
| SEO review | Mechanical length rules only. Phases 2 and 3. |
| AEO and GEO review | TL;DR and FAQ presence only. Phases 2 and 3. |
| Proofread, grammar, readability | Banned phrases, dashes, sentence and paragraph length only. Phases 2 and 3. |
| Fact check | Not done beyond the single independent review. Phase 3. |
| Publish (draft PR, preview, merge) | PR automated; preview is phase 1; merge is yours. |
| Scheduling | Automated (Tue/Thu release). |
| Post-merge tracking and calendar | Manual. Phase 5. |
| Distribution (LinkedIn, X) | Manual. Phase 5. |
| Performance review and retrospective | Manual. Phases 5 and 6. |
| Updates, corrections, freshness | Manual. Phase 6. |

## Phase 0: Prove, secure and align what exists

The built stages run live, are locked down, and the docs match reality, before more is added.  Tracking issue: [#157](https://github.com/rustymuffler/problme/issues/157).

| ID | Item | Status |
|---|---|---|
| P0-1 | FINAL STEP, run only when the full test gate is met (see "Full test gate" in PIPELINE_ROADMAP.md): one article through the complete pipeline, idea issue to published, with nothing skipped. Record Pro quota used, wall time per stage, your minutes, and fix first-run problems (Claude App token validity, tool-permission rule syntax, injection scanner on the runner, github_token behaviour). Already verified live on 2026-11-21: the interview start stage (the allowlist needed the nested setup-bun action). | ⬜ |
| P0-2 | Open pipeline PRs as draft PRs until the Proofreader and SEO gates exist (MILESTONES invariants 4 and 8 say both must pass before a content PR opens). The PR body must say which reviews have not run. | 🔄 |
| P0-3 | CI builds with INCLUDE_FUTURE_POSTS=true on pull requests so Lighthouse, accessibility and link checks cover a scheduled article now, not after it goes live. Production deploy stays unchanged. | ⬜ |
| P0-4 | Content-PR path guard: a required check that article PRs touch only src/content/posts/<slug>/ and public/assets/posts/<slug>/. Anything else must go through the code workflow (Security Auditor and Code Reviewer). | ⬜ |
| P0-5 | Add actionlint (or equivalent) for workflow files to CI, and confirm Semgrep and Checkov cover .github/workflows and .github/pipeline scripts. | ⬜ |
| P0-6 | Repository lockdown to your account only. Done 2026-11-21: fork PR approval set to all external contributors. Needs your yes each: default workflow token to read-only, restrict allowed Actions to a pinned list, require SHA pinning, enable secret scanning and push protection, consider interaction limits, review the "Actions can create and approve PRs" setting. | 🔄 |
| P0-7 | Fix lint errors in published posts (context-limits-design-constraint: banned word and missing TL;DR) and review the lint warnings on older posts. | ⬜ |
| P0-8 | Docs alignment: rewrite AGENTS.md (roster, content workflow, Scheduling and Loops), CONTENT_STANDARDS.md section 7, MILESTONES.md (calendar, phase 3 and 4 items), DECISIONS.md (new decisions: GitHub-native pipeline, owner gate, isolation model), SECURITY_SCANNING.md (pipeline workflows), README pipeline diagram. | ⬜ |
| P0-9 | Retire or delete the four paused Cowork scheduled tasks once their replacements exist; keep their prompts in the repo history. | ⬜ |
| P0-10 | Subscription token lifecycle: calendar reminder before CLAUDE_CODE_OAUTH_TOKEN expires (about one year from 2026-11-19) and a documented behaviour when the Pro quota is exhausted (retry later, never silent). | ⬜ |

## Phase 1: Images and previews

Every draft arrives with a hero image, in-article visuals, and a link you can read on your phone.  Tracking issue: [#158](https://github.com/rustymuffler/problme/issues/158).

| ID | Item | Status |
|---|---|---|
| P1-1 | Image Creator stage: a run with no shell and no web writes SVG files from the article and BRAND.md (hero 1200x630 plus in-article diagrams and charts). | ⬜ |
| P1-2 | SVG sanitiser (no scripts, external references, foreignObject, embedded HTML; palette limited to BRAND.md) and a deterministic rasteriser (sharp) producing PNG, then hero.webp and hero-640.webp via scripts/generate-webp-heroes.mjs, with file-size budgets. | ⬜ |
| P1-3 | In-article visuals at one per about 500 words: replace each [IMAGE - ...] placeholder with a markdown image and descriptive alt text. Optional animated GIF (SVG frames to ffmpeg) only where motion clarifies. | ⬜ |
| P1-4 | Fill heroImage and imageCredit deterministically; check alt-text quality (descriptive, not "image of"), hero dimensions, and credit value. | ⬜ |
| P1-5 | Photo and emotion path stays manual (licence check required: royalty-free, commercial use, source URL recorded). Document the hand-off in the PR. | ⬜ |
| P1-6 | After P1-1 works: make heroImage required and the image ratio an error in the lint. | ⬜ |
| P1-7 | Vercel per-PR preview with INCLUDE_FUTURE_POSTS=true, noindex, link posted in the PR body and review comment. | ⬜ |
| P1-8 | Image CI checks: OG size, image weight, WebP present, no broken image paths. | ⬜ |

## Phase 2: Deterministic quality gates

Everything a tool can check is checked by a tool, so agents only judge what needs judgment.  Tracking issue: [#159](https://github.com/rustymuffler/problme/issues/159).

| ID | Item | Status |
|---|---|---|
| P2-1 | Grammar and spelling check (choose tooling, for example cspell plus retext plugins or a self-hosted LanguageTool). Run the supply-chain scan on any new dependency first. | ⬜ |
| P2-2 | Readability metrics: Flesch-Kincaid grade 8 to 10, average sentence length 15 to 20, paragraph length. Warn, then promote to errors once tuned. | ⬜ |
| P2-3 | Remaining Proofreader checklist items that tools can do: consecutive sentences starting with the same word, numbers under ten spelled out, passive-voice flags, repeated words. | ⬜ |
| P2-4 | SEO mechanics: a primaryKeyword field; keyword in title, description, slug and first 200 words; description differs from the title; H2s phrased as questions where natural; at least one internal link; sensible link counts. | ⬜ |
| P2-5 | AEO and GEO mechanics: TL;DR 40 to 60 words, core answer in the first 200 words, FAQ answers not duplicating the body (similarity check), data in tables, sections that stand alone (H2 section size bounds), a source link beside every statistic. | ⬜ |
| P2-6 | Structured data and feeds on the built page: BlogPosting, BreadcrumbList and FAQPage JSON-LD parse and match frontmatter; canonical, sitemap, RSS and llms.txt entries exist. | ⬜ |
| P2-7 | Originality and cannibalisation: n-gram overlap against the research sources and existing posts; duplicate title, slug or keyword detection. | ⬜ |
| P2-8 | Sensitivity scan: employer and customer names, emails, keys, private URLs, anything flagged "Do not publish" in the interview, against a blocklist you maintain. | ⬜ |
| P2-9 | Link quality: no "click here" text, external link liveness at draft time, sources older than 2 years flagged, primary sources preferred. | ⬜ |
| P2-10 | Code and config sample checks: YAML and JSON parse, shell syntax, language tag on every fence, no secrets in samples. | ⬜ |
| P2-11 | Tag taxonomy: prefer existing tags, flag new tags, category matches the issue label. | ⬜ |

## Phase 3: AI review agents and the revision loop

Independent reviewers check what tools cannot, and the draft is revised until it passes or escalates to you.  Tracking issue: [#160](https://github.com/rustymuffler/problme/issues/160).

| ID | Item | Status |
|---|---|---|
| P3-1 | Proofreader Agent as its own run using the AGENTS.md checklist, with line-level feedback, Writer revision, and a maximum of 3 passes before escalation (invariant 4). | ⬜ |
| P3-2 | SEO Reviewer Agent: search intent, title click-worthiness, headings, internal link suggestions, description quality; approve or return feedback (invariant 8). | ⬜ |
| P3-3 | AEO and GEO Reviewer: answer-first quality, standalone sections, FAQ questions that match real queries, citation-worthiness, per GEO_MEASUREMENT.md. | ⬜ |
| P3-4 | Fact-checker: reads each cited source and verifies every statistic and claim, flags unsupported ones, and tries to resolve [UNVERIFIED] items before they reach you. Runs isolated like research. | ⬜ |
| P3-5 | Voice and value reviewer: Richard's insight is present and quoted, a clear takeaway, better than the competing articles from the research scan, concrete examples, reads like a person. | ⬜ |
| P3-6 | Quality scorecard in every PR: originality and insight, accuracy, voice, structure, SEO, AEO, images, readability, with pass thresholds, revision count and open items. "Ready" only when every line passes. | ⬜ |
| P3-7 | Revision loop orchestration across all reviewers, maximum 3 passes, then stage:stalled with a summary of what is unresolved. | ⬜ |
| P3-8 | Second research pass on request: fill gaps, thin counterarguments and unverified items (the C2 article needed this manually). | ✅ |
| P3-9 | Reviewer independence: separate runs and prompts from the Writer; never the drafting run reviewing itself. | ⬜ |

## Phase 4: Ideas and planning

Good ideas arrive on their own and you only pick, with the cadence managed for you.  Tracking issue: [#161](https://github.com/rustymuffler/problme/issues/161).

| ID | Item | Status |
|---|---|---|
| P4-1 | Idea issue form (.github/ISSUE_TEMPLATE/idea.yml): working title, category, reader pitch, Celly or probl.me tie-in, time-sensitive, target reader question. | ⬜ |
| P4-2 | Monthly idea batch (Content Strategist) as an Action: mines recent Celly and probl.me work (merged PRs, decisions), content gaps against competitors, reader questions, and time-sensitive news; skips duplicates of published and queued posts; opens 5 to 8 idea issues. | ⬜ |
| P4-3 | Keyword and search-intent research per idea using free sources (Search Console queries, autocomplete); saves the primary keyword and intent in the issue. Paid tools only with your approval. | ⬜ |
| P4-4 | Selection flow: thumbs-up or a label promotes an idea toward stage:interview, with a cap on interviews in flight. | ⬜ |
| P4-5 | Cadence planner: choose publish dates that avoid collisions, hold the weekly target, and alert when fewer than 4 ideas or drafts are queued. | ⬜ |
| P4-6 | Project board with Publish date, Category and Slug fields; weekly status issue; MILESTONES.md calendar kept in sync automatically. | ⬜ |
| P4-7 | Stalled timer (F10): nudge after 3 days without an answer, stage:stalled after 7, resume commands documented. | ⬜ |
| P4-8 | Batch interviews: several topics in one sitting, with notes split per article. | ⬜ |
| P4-9 | Interview upgrades: ask for screenshots or artefacts to use as images, and for the primary keyword in the reader's own words. | ⬜ |

## Phase 5: Publish, distribution and feedback

After you merge, state updates and distribution drafts happen on their own, and results feed the next ideas.  Tracking issue: [#162](https://github.com/rustymuffler/problme/issues/162).

| ID | Item | Status |
|---|---|---|
| P5-1 | On PR merge: set stage:scheduled, comment the publish date, update the calendar. | ⬜ |
| P5-2 | On publish day, after deploy: set stage:published, close the issue, comment the live URL; verify the page returns 200 and appears in the sitemap, RSS and llms.txt. | ⬜ |
| P5-3 | Indexing hygiene: sitemap already submitted; optional IndexNow or Bing ping; Search Console coverage check for the new URL. | ⬜ |
| P5-4 | Distribution Agent (MILESTONES 4.9): draft a LinkedIn post and an X post per article in your voice for you to post manually. Never auto-post. | ⬜ |
| P5-5 | Post-publish performance: Umami and Search Console figures plus the AI-citation prompt checks from GEO_MEASUREMENT.md, summarised per article. | ⬜ |
| P5-6 | Monthly retrospective generated into retros/RETRO-YYYY-MM.md with pipeline metrics: articles per month, your minutes per article, revision loops, quota used. | ⬜ |
| P5-7 | Feedback loop: retro findings update prompts and standards, logged in DECISIONS.md. | ⬜ |

## Phase 6: Operations, maintenance and evaluation

The pipeline stays healthy and measurably gets better.  Tracking issue: [#163](https://github.com/rustymuffler/problme/issues/163).

| ID | Item | Status |
|---|---|---|
| P6-1 | Article updates and corrections workflow (CONTENT_STANDARDS section 9): updatedDate, correction notes, triggered by your comment. | ⬜ |
| P6-2 | Quarterly content freshness review: dead links, statistics older than 2 years, outdated tool versions; opens issues. | ⬜ |
| P6-3 | Prompt evaluations: a golden set of sample interviews to catch quality regressions when prompts change, with the quality scorecard tracked over time. | ⬜ |
| P6-4 | Pipeline dry-run and test harness so workflow changes can be tested without a live article. | ⬜ |
| P6-5 | Quota and cost monitoring with a queue so heavy runs do not overlap; documented fallback (API key with a hard spend cap) that needs your approval. | ⬜ |
| P6-6 | Secrets and dependency rhythm: token rotation schedule, monthly dependency review (MILESTONES 4.11), annual security stack review (4.12). | ⬜ |
| P6-7 | Document how pipeline code changes use the code workflow (Test Writer, Security Auditor, Code Reviewer) versus article PRs. | ⬜ |
| P6-8 | Incident runbook: injection detection, leaked secret, wrong publish (revert or unpublish), failed deploy. | ⬜ |

## Full test gate

No article is run through the pipeline as a pilot until the gate below is met. The first end-to-end test (item P0-1) runs once, when everything required is built, so it tests the finished pipeline and produces a fully completed article. Scope decided by Richard 2026-11-21: Phases 0 to 3 plus publish tracking (decided by Richard 2026-11-21). Tracking issue: [#166](https://github.com/rustymuffler/problme/issues/166).

An earlier interview-only trial on issue #165 was started by mistake and parked. It verified that the interview start stage works live (and exposed a missing allowlist entry for the nested setup-bun action), and it is otherwise idle.

### Required before the test run

- Phase 0: P0-2, P0-3, P0-4, P0-5, P0-6, P0-7, P0-8, P0-10 (P0-1 is the test itself; P0-2 ends with the draft-PR rule removed once phase 3 passes)
- Phase 1: all of P1-1 to P1-8 (images, SVG safety, previews, image checks)
- Phase 2: all of P2-1 to P2-11 (every deterministic quality gate)
- Phase 3: all of P3-1 to P3-9 (Proofreader, SEO, AEO, fact-checker, voice and value review, scorecard, revision loop, second research pass)
- Phase 4: P4-7 only (stalled timer, so a missed answer never blocks the pipeline)
- Phase 5: P5-1 and P5-2 only (stage tracking after merge and on publish day)

### Deferred until after the first test

- Phase 0: P0-9 (retire the paused scheduled tasks)
- Phase 4: P4-1 to P4-6, P4-8, P4-9 (idea batch, keyword research, selection, cadence planner, project board, batch interviews). The test article starts from a manually created idea issue.
- Phase 5: P5-3 to P5-7 (indexing, distribution drafts, performance, retrospective, feedback loop)
- Phase 6: all (updates, freshness, evaluations, dry-run harness, quota monitoring, runbook)

### Acceptance criteria for the test run

1. An idea issue goes through stage:interview with real answers from Richard, ending with `@claude done`, using about 20 minutes of his time or less across the whole run.
2. The research brief cites only opened sources, the injection scan is clean, and every statistic is verified by the fact-checker or flagged to Richard.
3. The draft has zero lint errors, no open placeholders, passes the grammar, readability, SEO, AEO, originality and sensitivity gates, and uses Richard's interview content.
4. A hero image and in-article visuals exist (about one per 500 words) with descriptive alt text, WebP variants and the correct credit.
5. The Proofreader, SEO, AEO, fact-check and voice reviews all pass within 3 revision passes, and the quality scorecard shows every line passing.
6. The PR opens ready for review (not draft), the phone preview link works, and all required checks pass including accessibility, Lighthouse and the link checker on the new article.
7. Merge on a phone sets stage:scheduled; on the publish day the page is live, in the sitemap, RSS and llms.txt, and the issue shows stage:published and is closed.
8. Failure drills pass: a missed interview answer triggers the stalled timer; a deliberately poisoned research brief is stopped by the scan; `@claude draft` resumes after a forced failure.
9. Metrics recorded in the roadmap: Pro quota used, wall time per stage, revision loops, and Richard's minutes. Decide the 1 or 2 per week cadence from them.

## Decisions needed from Richard

| Decision | Needed by | Recommendation |
|---|---|---|
| Grammar and spelling tooling: local libraries (cspell, retext) or a self-hosted LanguageTool | Phase 2 | Local libraries first: free, fast, no extra service |
| Paid keyword tools (for example Ahrefs) | Phase 4 | Stay with free sources; revisit if articles underperform |
| Photos and emotional imagery: allowed as a manual step? | Phase 1 | Yes, manual, with the licence check |
| Distribution platforms | Phase 5 | LinkedIn and X drafts, posted by you |
| Cadence after the pilot: 1 or 2 per week | Phase 0 | Decide from the measured Pro quota and your minutes per article |
| Repository lockdown options in P0-6 | Phase 0 | Apply the read-only default token, secret scanning and push protection; consider restricting Actions |

## Recommended order

1. **Phase 0** first. The hardening, alignment and draft-PR items come first; P0-1 (the live test) is the last step of the whole roadmap, not the first.
2. **Phase 1** next, because drafts are not publishable without visuals and a phone-readable preview.
3. **Phases 2 and 3** together next, since they are the quality bar. Build the deterministic gates (phase 2) before the AI reviewers (phase 3) so agents only judge what tools cannot.
4. **Phase 4** once articles flow, so ideas keep the queue full.
5. **Phases 5 and 6** last: distribution, feedback and long-term upkeep.
