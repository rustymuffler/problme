# probl.me — GEO / AEO Measurement Guide

> **File:** `GEO_MEASUREMENT.md`
> **Purpose:** How to measure whether probl.me is being found, cited, and described accurately by search engines and AI answer engines (Google AI Overviews and AI Mode, ChatGPT, Perplexity, Bing Copilot). Written 2026-11-18 from an audit of the site against Aleyda Solis's AI Search Optimization Checklist (updated Sep 2026) and Google's guidance on AI features in Search.
> **Owner:** Richard. The PM Agent runs the monthly review (see `AGENTS.md` → Scheduled Tasks) and records results in `retros/RETRO-YYYY-MM.md`.

---

## What the sources say (so we do not over-engineer)

- **Google:** no special markup, schema, or `llms.txt` is needed for AI Overviews or AI Mode. A page needs to be indexed and eligible for a snippet; the rest is standard SEO (crawlable, internal links, good page experience, key content in text, structured data that matches visible text). AI features traffic is counted in Search Console's Performance report under the "Web" search type.
- **Aleyda Solis's checklist:** a 12-step process. Steps 1-2 measure presence, 3-10 diagnose readiness, 11-12 report and validate. For a personal blog the relevant steps are 1-2 (prompt library and baseline), 4 (retrievable and extractable pages), 5 (consistent entity and naming), 6 (content that still earns a visit or citation after the AI answer), 11-12 (report honestly, run a loop). Steps about product feeds, local markets, and commerce do not apply.
- **Do not game it.** The checklist explicitly warns against exploiting AI systems' weaknesses (prompt injection, fabricated reviews, manufactured signals, citation gaming). Consistent with `CONTENT_STANDARDS.md`: firsthand specifics are the strongest citation signal we have.

## What the site already provides (no action needed)

`BlogPosting` + `BreadcrumbList` (+ `FAQPage` when `faq` frontmatter exists) JSON-LD on every post, `Person` + `ProfilePage` on `/about`, canonical URLs (trailing slash everywhere), sitemap with post `lastmod`, `robots.txt` allowing all crawlers, `llms.txt`, RSS, TL;DR and FAQ structure per `CONTENT_STANDARDS.md`.

## One-time setup

1. **Google Search Console:** already verified (meta tag in `Layout.astro`). Submit `https://probl.me/sitemap-index.xml`. Check **Pages** for tag pages moving to "Excluded by noindex tag" (expected, see `DECISIONS.md`).
2. **Bing Webmaster Tools:** add the site (import from Search Console). Use its AI performance / citation reports when available for the account.
3. Confirm the fact sheet below matches `/about`, the `Person` JSON-LD, and the LinkedIn/GitHub profiles.

## Entity fact sheet (step 5: keep every source consistent)

Review quarterly. If any line changes, update `/about`, `src/lib/schema.ts`, `llms.txt`, and external profiles in the same sitting.

| Fact | Value (source of truth) |
|---|---|
| Site name | probl.me |
| Author | Richard Muffler (byline); full name Richard Robitaille-Muffler on GitHub |
| Role | Director of Product Management, cybersecurity and SaaS (`src/lib/schema.ts`) |
| What the site is | Personal blog, building in public: PM craft, AI-assisted development, tech stack and tools |
| Related project | Celly (celly.app) |
| Canonical profiles | https://probl.me/about/, LinkedIn, GitHub (`rustymuffler`) |
| License | Content CC BY 4.0, code MIT |

## Prompt library (steps 1-2)

Start with about 30 tagged prompts; keep experimental ones separate. Tag each with **topic** and **intent** (learn, compare, how-to, decide). Seed list, one row per post topic plus brand queries:

| Tag | Prompt |
|---|---|
| brand | Who is Richard Muffler, the author of probl.me? |
| brand | What is probl.me? |
| spec-writing | How do I write a spec an AI coding agent will keep following? |
| spec-writing | Why do AI agents ignore my AGENTS.md instructions across sessions? |
| context | How do context window limits affect AI coding quality, and what should I do about it? |
| context | When should I start a new Claude Code session? What is a handoff document? |
| supply-chain | Should I pin GitHub Actions to a commit SHA instead of a tag? |
| supply-chain | What happened in the tj-actions/changed-files compromise and how do I protect against it? |
| prompt-injection | How does prompt injection against AI agents work? |
| prompt-injection | How do I audit my own AI agent pipeline for prompt injection? |
| pipeline | How do I build a multi-agent content pipeline with Claude? |

Add 15-20 more as new posts ship. Prefer natural phrasing a real reader would type.

## Measurement protocol

Run monthly (first Monday, alongside the retrospective). Keep conditions comparable: same platforms, logged-out or fresh session, same country, run each prompt 3 times within a 24-72 hour window.

Record per prompt per platform:

| Field | Meaning |
|---|---|
| Appeared | Is probl.me or Richard named or cited? |
| Linked | Is there a link to a probl.me URL? Which page? |
| Accurate | Does the description match the fact sheet? Note errors verbatim |
| Competing sources | Who is cited instead (domains)? |
| Date / platform / mode | For reproducibility |

Summarize as: prompts with an appearance, linked citation rate, accuracy rate, and the top competing domains. Label every number as **observed** (from these runs), not modelled. Small sample sizes are expected; report counts, not just percentages. Combine with Search Console (impressions and clicks for the same topics) and Umami referrers (traffic from AI domains, e.g. chatgpt.com, perplexity.ai).

## Diagnose and act (steps 3, 4, 6)

For each gap, pick one primary hypothesis and one action, then retest next cycle:

| Observation | Likely cause | Action |
|---|---|---|
| Not cited for a topic we wrote about | Page not extractable or answer buried | Tighten TL;DR and first 200 words; make each H2 a standalone answer; add or fix FAQ |
| Cited but described wrong | Entity inconsistency | Fix the conflicting source, update the fact sheet |
| Competitors cited, we are not | Less specific or less sourced | Add firsthand specifics and linked sources (our differentiator) |
| Cited but no clicks | Answer fully satisfied the query | Add something the summary cannot: tools, templates, code, a worked example |
| Page missing from Google | Crawl or index issue | Search Console URL Inspection; check sitemap, canonical, noindex |

## Loop (step 12)

Log each change (what, why, which prompt group, expected lead time), rerun the same prompts next cycle, and decide keep, expand, revise, or stop. Record in the monthly retro file under a "GEO" heading. After a platform change (new AI Mode behavior, new Search Console report), re-verify these steps against current documentation.

## Known limitations

- AI answers vary run to run; one run proves little. Use repeated runs and trends.
- Platform behavior and reporting change often. Aleyda's checklist and Google's AI features page were verified 2026-09 and 2026-11; recheck before relying on them.
- This is a small personal site: expect low absolute numbers. The goal is accuracy and a rising trend, not volume.
