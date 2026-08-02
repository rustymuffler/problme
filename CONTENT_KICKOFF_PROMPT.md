# probl.me — Content Pipeline Kickoff Prompt

> **File:** `CONTENT_KICKOFF_PROMPT.md`
> **Purpose:** A reusable prompt template to start the content agent pipeline for a single article. Copy the block below as-is and paste it into a new Claude Cowork session — no fields to fill in, Claude reviews the Content Calendar and asks you which article to work on.
> **Source of truth:** This prompt only points to `AGENTS.md`, `CONTENT_STANDARDS.md`, `BRAND.md`, and `MILESTONES.md` — it doesn't restate their rules, so if those docs change, this prompt stays valid without editing.

---

## How to use this

1. Copy the prompt block below, unedited, into a fresh Cowork session.
2. Send it. Claude reads the Content Calendar in `MILESTONES.md`, lists the queued articles, and asks you which one to work on this session (or whether to start a new one not yet on the calendar).
3. Once you pick, the Interview Agent should be the next thing that responds, asking you the structured interview questions.
4. Stay available for the interview step and the final PR review — those are the only two points you're required for (see `AGENTS.md` → Scheduling & Loops).

---

## The Prompt

```
You are kicking off the probl.me content pipeline for one article.

Before doing anything else, read these files in the repository and follow them exactly:
- CLAUDE.md
- AGENTS.md
- CONTENT_STANDARDS.md
- BRAND.md
- MILESTONES.md
- BLOCKERS.md (check for anything that would block content work, e.g. missing credentials or accounts)

Read the Content Calendar table in MILESTONES.md. List every row that is not yet Published, showing working title, category, pitch, and current pipeline status. Then ask me which article to work on this session — offer the option to start a new article not yet on the calendar if I'd rather do that. Wait for my answer before doing anything else. Do not guess or auto-select one for me.

Once I've picked an article, confirm back to me:
- Working title
- Category (pm-craft | ai-development | tech-tools)
- Pitch / why now
- Target publish date (or TBD)

Then run the full content workflow defined in CONTENT_STANDARDS.md Section 7 and AGENTS.md, in order, with no steps skipped:

1. Interview Agent — conduct the structured interview with Richard (see AGENTS.md → Interview Agent for the six-question framework). Do not proceed to drafting until interview-notes.md exists and is saved.
2. Research Agent — build research-brief.md (stats, tool docs, competitive scan, credible sources, counterarguments, community discussion). Flag anything unverifiable as [UNVERIFIED — needs source]. Do not proceed to drafting until this file exists.
3. Writer Agent — draft the full MDX article using the topic brief + interview-notes.md + research-brief.md. Follow the article structure, voice rules, banned phrases/punctuation, and frontmatter schema in CONTENT_STANDARDS.md exactly. Distribute Richard's interview content throughout the piece, not in one isolated section. Use [IMAGE: ...] placeholders, [VERIFY] flags on unconfirmed claims, and carry forward any [UNVERIFIED] flags from the research brief.
4. Image Creator Agent — create the hero image (1200x630px) and any in-article images per BRAND.md and AGENTS.md, replacing the Writer Agent's placeholders. Use Claude Design if connected; otherwise use the hand-built SVG + rasterization pipeline (AGENTS.md → Image Creator Agent — Image Rules, source #2), the proven method behind C2's article images and the README's animated diagram. Runtime images go in public/assets/posts/[article-slug]/ (referenced as /assets/posts/[article-slug]/hero.png), source SVGs/scripts are kept alongside the article at src/content/posts/[article-slug]/images/ for provenance. Set imageCredit: "AI-generated with Claude" in frontmatter.
5. SEO Reviewer Agent — run the full SEO checklist from AGENTS.md. Approve, or return specific feedback to the Writer Agent for revision (max 3 passes).
6. Proofreader Agent — run the full proofreading checklist from AGENTS.md, including a hard scan for em dashes (—) and en dashes (–) used incorrectly. Approve, or return line-level feedback to the Writer Agent for revision (max 3 passes).
7. Publisher Agent — once both reviews pass, open a draft PR: branch content/[article-slug], commit the MDX file + interview-notes.md + research-brief.md + images, PR title = article title, PR body includes word count, category, primary keyword, SEO/proofreading pass counts, and confirmation that Richard's interview content is present.

Never violate these invariants (from CONTENT_STANDARDS.md Section 10 and MILESTONES.md):
- Write as Richard — first person, his voice, his opinions.
- No article drafts without interview-notes.md, and his personal content must be identifiable in the final piece.
- No em dashes, anywhere, ever.
- No fabricated quotes.
- No unlicensed images — Claude-generated, personal screenshots, or personal photos only.
- No unresolved [VERIFY] flags at publish time.
- SEO checklist 100% complete and Proofreader approval both required before the Publisher Agent opens a PR.
- Only recommend tools actually used in the probl.me or Celly stack.

At the end of this session, update the Content Calendar row in MILESTONES.md for this article to reflect its current pipeline status (Interview / Research / Draft / Review / Proofread / PR Open / Published), and note in BLOCKERS.md anything that stopped the pipeline from finishing.
```

---

*Last updated: 2026-08-01 — fixed the Image Creator Agent step, which pointed images at the wrong path (src/content/posts/[slug]/images/, a source-file location, not what the site serves) and didn't mention the hand-built SVG + rasterization fallback formalized in Decision 15.*
