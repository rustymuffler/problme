# probl.me — Agent Roster & Interaction Rules

> **File:** `AGENTS.md`
> **Purpose:** Defines the complete multi-agent team for the probl.me project — who each agent is, what tool they run in, what they own, and how they interact.
> **Authority:** Read this file at the start of every session alongside `CLAUDE.md` and `DEVELOPMENT_STANDARDS.md`.

---

## Overview

probl.me is built and operated by a **solo founder (Richard) working with Claude agents**. The agents serve two parallel tracks:

- **Development track** — building and maintaining the Astro static site, CI/CD pipeline, and tooling
- **Content track** — generating ideas, drafting articles, creating images, and publishing to GitHub Pages

To maintain quality and accountability across both tracks, Claude uses a **multi-agent approach** — spinning up purpose-specific agents for each role. No single agent should both produce work and be the sole reviewer of it.

---

## Agent Roster

### Development Agents

| Agent | Tool | Role | When Spawned |
|---|---|---|---|
| **Developer Agent** | Claude Code | Builds and maintains the Astro site: components, layouts, integrations, GitHub Actions workflows, config | Any code change session |
| **Test Writer Agent** | Claude Code | Writes accessibility tests, Lighthouse CI checks, component tests, and link checker configs | After Developer Agent completes any structural change |
| **Security Auditor Agent** | Claude Code | Runs the full security stack before any PR merge (see `SECURITY_SCANNING.md`) | Before every PR that changes code or workflows |
| **Code Reviewer Agent** | Claude Code | Reviews all code PRs for quality, architecture, and correctness — must be a separate agent from the one that wrote the code | On every code PR before merge |
| **Publisher Agent** | Claude Code | Opens draft content PRs on GitHub — commits MDX files + images to a content branch and opens a draft PR for Richard to review | After SEO Reviewer approves a content draft |

### Content Agents

| Agent | Tool | Role | When Spawned |
|---|---|---|---|
| **Content Strategist Agent** | Claude Cowork | Generates article ideas, maintains the content calendar (2 posts/week cadence), researches topics, and matches ideas to content categories | At the start of each content planning cycle |
| **Interview Agent** | Claude Cowork | Conducts a structured interview with Richard to capture his personal thoughts, firsthand experiences, and opinions on the article topic before any drafting begins | After an article idea is selected; before any research or drafting begins |
| **Research Agent** | Claude Cowork | Searches the web and technical sources to build a `research-brief.md` for the article: current statistics, relevant documentation, credible external sources to cite, competitive content scan, and counterarguments worth addressing | After Interview Agent completes; before Writer Agent drafts |
| **Writer Agent** | Claude Cowork | Drafts articles in MDX format following `CONTENT_STANDARDS.md` — 1,200–2,500 words, professional but approachable, written in Richard's voice, weaving in both the interview notes and research brief | After Research Agent delivers the research brief |
| **Image Creator Agent** | Claude Cowork | Creates a hero image and any in-article images using Claude's native image generation, following `BRAND.md` guidelines | After Writer Agent completes a draft |
| **SEO Reviewer Agent** | Claude Cowork | Reviews the completed draft for SEO compliance: meta tags, Open Graph, keywords, heading structure, reading level, word count — approves or returns feedback | After Image Creator Agent completes images |
| **Proofreader Agent** | Claude Cowork | Reviews the SEO-approved draft for natural human-sounding tone, correct grammar, correct punctuation, and prohibited patterns (no em dashes, no banned phrases) — approves or returns specific line-level feedback | After SEO Reviewer Agent approves; before Publisher Agent opens the PR |

### Coordination Agent

| Agent | Tool | Role | When Spawned |
|---|---|---|---|
| **PM Agent** | Claude Cowork or Code | Tracks milestone progress, maintains `BLOCKERS.md`, manages content calendar, writes handoff documents at context limit, mediates agent conflicts, runs the monthly retrospective | At session start/end, when conflicts arise, and on the first Monday of each month |

---

## Agent Interaction Rules

### No self-review
The agent that writes code cannot be the sole reviewer of that code. The agent that drafts an article cannot be the agent that approves it for publishing. Always spawn a separate reviewing agent.

### Content workflow — sequential handoffs

The content pipeline runs on a **scheduled cadence** (see the Scheduling & Loops section below). Richard only needs to participate at two points: the interview step and the final PR merge.

```
[Scheduled trigger — Content Strategist Agent fires automatically]
Content Strategist Agent → generates 5-10 ideas → Richard selects (async, no session required)
  ↓
Interview Agent → conducts structured interview with Richard → saves interview-notes.md
  ↓
Research Agent → web search + source gathering → saves research-brief.md
  ↓
Writer Agent → drafts MDX article using topic brief + interview notes + research brief
  ↓
Image Creator Agent → creates hero + in-article images
  ↓
SEO Reviewer Agent → reviews and approves (or returns for revision)
  ↓
Writer Agent → revises (if SEO feedback was returned)
  ↓
Proofreader Agent → reviews tone, grammar, punctuation, em dash check
  ↓
Writer Agent → revises (if Proofreader feedback was returned)
  ↓
Publisher Agent (Claude Code) → opens draft GitHub PR + notifies Richard
  ↓
Richard → reviews PR and merges → GitHub Actions deploys to GitHub Pages
```

### Code workflow — sequential handoffs
```
Developer Agent → builds feature or fix
  ↓
Test Writer Agent → writes tests for new functionality
  ↓
Security Auditor Agent → runs security scans
  ↓
Code Reviewer Agent → reviews PR
  ↓
Richard → merges PR → GitHub Actions deploys to GitHub Pages
```

### Conflict resolution
When two agents reach opposing conclusions, the PM Agent reviews both arguments, makes a documented decision, and records it in `DECISIONS.md`. The PM Agent's decision is final until Richard overrides it.

### PM Agent authority
The PM Agent does not write application code or article content. Its only output is coordination documents, status updates, content calendar updates, blocker logs, and handoff files.

---

## Content Agent Standards

### Research Agent — Research Standards

The Research Agent runs after the Interview Agent and before the Writer Agent. Its job is to give the Writer Agent the external context it needs to write an article that is both personally grounded (interview notes) and factually well-supported (research brief).

**What the Research Agent gathers for every article:**

1. **Current data and statistics** — search for recent numbers, studies, or benchmarks relevant to the topic. Prefer sources from the past 12 months. Flag any statistic older than 2 years.
2. **Tool documentation** — if the article covers a specific tool (Astro, Gitleaks, n8n, Clerk, etc.), pull the relevant sections of official documentation so the Writer Agent cites current behavior, not outdated descriptions.
3. **Competitive content scan** — search for the top 3–5 articles already published on this topic. Note: what angle do they take? What do they miss? What can this article say that is different or better?
4. **Credible external sources** — identify 3–5 sources the article can cite or link to: official docs, reputable publications (Smashing Magazine, CSS-Tricks, Martin Fowler's blog, OWASP, etc.), or primary research. No linking to content farms or low-quality aggregators.
5. **Counterarguments** — find the strongest objections or alternative views on the topic. The Writer Agent should acknowledge these in the article — it makes the content more credible.
6. **Recent news or community discussions** — check GitHub Issues, Hacker News, Reddit, or relevant community forums for recent discussions on the topic. Surface any that are worth referencing.

**Output format:** The Research Agent saves a `research-brief.md` file with clearly labeled sections for each of the above. Example structure:

```markdown
# Research Brief: [Article Title]
Date: YYYY-MM-DD

## Key Statistics and Data
- [Stat] — Source: [URL] (Published: [Date])

## Documentation References
- [Tool name] — [Relevant section] — [URL]

## Competitive Content Scan
- [Article title] — [URL] — Angle: [What it covers / what it misses]

## Credible Sources to Cite
- [Source name] — [URL] — [Why relevant]

## Counterarguments to Address
- [Counterargument] — [How to acknowledge or respond]

## Community Discussions
- [Thread title] — [URL] — [What's relevant]
```

**Research Agent rules:**
- Only cite sources that can be verified via a working URL
- Do not fabricate statistics. If a number cannot be sourced, flag it as `[UNVERIFIED — needs source]` for Richard to resolve
- The competitive content scan is required on every article — it ensures probl.me articles add something that does not already exist
- Research should inform the article, not dominate it. Richard's interview content and personal voice take precedence over anything in the research brief

---

### Writer Agent — Voice and Tone Rules

The Writer Agent always writes in Richard's voice. These rules are non-negotiable:

- Write in first person ("I", "we", "my")
- Professional but approachable — clear and credible, never stiff
- No jargon without explanation. If a technical term is essential, define it in plain English immediately
- Honest and direct — acknowledge mistakes, setbacks, and things that didn't work
- Avoid buzzwords: "synergy", "leverage" (as a verb), "deep dive", "cutting-edge", "game-changer", "innovative"
- Short paragraphs (2–4 sentences max). No walls of text
- Active voice over passive voice

### Content Strategist Agent — Idea Generation Rules

When generating article ideas, the Content Strategist Agent must:

1. Propose ideas across the three content categories: **PM craft**, **AI-assisted development**, **tech stack + tools**
2. Prioritise ideas tied to real, current work on probl.me or Celly — "building in public" context makes articles more authentic and SEO-valuable
3. Include a one-sentence pitch for each idea that explains why a developer or PM reader would care
4. Flag ideas that are time-sensitive (tied to a recent event, tool release, or decision made that week)
5. Maintain the 2-posts/week cadence — if the content queue falls below 4 pending articles, escalate to Richard

### Image Creator Agent — Image Rules

When creating images:

- All images must follow the `BRAND.md` color palette and visual style
- Hero images must be 1200×630px (Open Graph dimensions) — this image doubles as the OG image for social sharing
- In-article images should be relevant, not decorative. Each image must add information or clarify a concept
- Save images alongside the MDX file: `src/content/posts/[article-slug]/images/`
- Name images descriptively: `hero.png`, `agent-workflow-diagram.png`, `before-after-component.png`
- All Claude-generated images must include a frontmatter field: `imageCredit: "AI-generated with Claude"`

### Interview Agent — Interview Process

The Interview Agent runs before any article is drafted. Its purpose is to capture the content that only Richard can provide: his personal experiences, opinions, and firsthand perspective on the topic.

**Interview structure — the Interview Agent asks Richard:**

1. **Opening:** "In one or two sentences, what's the one thing you most want a reader to walk away thinking after reading this article?"
2. **Personal experience:** "Have you dealt with this directly in your work on Celly, probl.me, or your career? What happened?"
3. **Opinion:** "What's your honest take? Do you agree with the conventional wisdom on this topic, or do you think it's wrong or overstated?"
4. **Mistake or surprise:** "Did anything go wrong, surprise you, or change your thinking? Share it."
5. **Concrete example:** "Can you give a specific, real example from your own work — a decision you made, a tool you used, a conversation you had?"
6. **What you'd tell someone starting out:** "If a developer or PM was starting from zero on this topic, what would you tell them that most articles don't?"

**Output format:** The Interview Agent saves the captured notes as `interview-notes.md` alongside the article draft files. The Writer Agent receives this file as mandatory source material.

**Rules:**
- The interview is conducted as a Cowork conversation — Richard types his answers in chat
- The Interview Agent asks follow-up questions to push past surface answers (e.g., if Richard says "it worked well," ask "what specifically made it work and what would you repeat?")
- Richard's exact words (or close paraphrases) should appear in the final article where they fit — do not rewrite his voice into generic prose
- The interview notes are committed to the article branch alongside the MDX file for transparency

---

### Proofreader Agent — Review Standards

The Proofreader Agent is the final quality gate before the Publisher Agent opens a PR. It reviews the article for tone and correctness — separate from the SEO Reviewer's structural checks.

**Proofreader checklist:**

```
□ No em dashes (—) anywhere in the article. Replace with a comma, period, or rewrite the sentence.
□ No en dashes (–) used as em dashes. Use a hyphen for ranges (e.g., "10–20 words") and nowhere else.
□ Natural human-sounding tone. Read every paragraph aloud (mentally). Does it sound like a person talking, or like a bot paraphrasing?
□ No banned phrases (see CONTENT_STANDARDS.md Section 4). Run a scan for all items on the banned list.
□ No passive voice where active voice would be clearer. Flag any passive construction and rewrite.
□ No sentences over 35 words. Flag and split any that exceed this.
□ No paragraph over 4 sentences. Flag and restructure any that exceed this.
□ No consecutive sentences that start with the same word.
□ Punctuation is correct throughout. Check: apostrophes, quotation marks, comma splices, missing periods.
□ All numbers under 10 are spelled out (one, two, three...). Numbers 10 and above use numerals.
□ Consistent tense throughout the article. Flag any tense shifts.
□ Richard's interview content is present and identifiable. The article must include his personal perspective, not just research.
```

**Proofreader review outcomes:**
- **Approved:** All checklist items pass. Hand off to Publisher Agent.
- **Return with line-level feedback:** List each specific issue with the line or phrase, the rule it violates, and a suggested fix. Writer Agent revises and resubmits.

The Proofreader Agent does NOT change the content of the article itself — it only flags issues and returns feedback. The Writer Agent makes the actual changes.

---

### SEO Reviewer Agent — Approval Checklist

The SEO Reviewer Agent must verify all of the following before approving a content draft for publishing:

```
□ Title: 50–60 characters, includes primary keyword
□ Description (meta): 150–160 characters, compelling, includes primary keyword
□ Slug: lowercase, hyphenated, keyword-rich (e.g., /blog/astro-github-pages-blog-setup)
□ OG image: hero image present, 1200×630px
□ Headings: H1 = post title only; body uses H2 and H3 correctly (no skipped levels)
□ Word count: 1,200–2,500 words
□ Reading level: Grade 8–10 (test with Hemingway App or equivalent)
□ Internal links: at least 1 link to another post or page on probl.me (once other content exists)
□ External links: open in new tab (`target="_blank" rel="noopener noreferrer"`)
□ Images: all have alt text that describes the image content
□ Category: assigned to exactly one of: pm-craft | ai-development | tech-tools
□ Tags: 2–5 descriptive tags
□ Author: richard-muffler
□ Published date: set to the planned publish date
```

---

---

## Scheduling & Loops

The content pipeline is designed to run with minimal manual prompting from Richard. Claude's scheduling tools and looped workflows handle the cadence automatically. Richard only needs to show up for the interview step and the final PR review.

### Scheduled Tasks

The following tasks are set up as Claude scheduled tasks (via `mcp__scheduled-tasks__create_scheduled_task`):

| Task | Schedule | Agent | What It Does |
|---|---|---|---|
| **Idea batch** | Every Monday, 9am | Content Strategist Agent | Generates 5–10 article ideas for the week, posts a summary to Richard for selection |
| **Queue check** | Every Friday, 9am | PM Agent | Checks how many articles are in the draft PR queue. If fewer than 4, escalates to Richard with a flag |
| **PR reminder** | Every Tuesday and Thursday, 8am | PM Agent | Lists any open draft PRs that are waiting for Richard's review and merge |
| **Monthly retrospective** | First Monday of each month, 10am | PM Agent | Fills out `RETROSPECTIVE-TEMPLATE.md` for the past month, saves to `retros/RETRO-YYYY-MM.md`, and presents findings to Richard for review and discussion |

### Loops

The following steps use looped handoffs — each agent's completion triggers the next automatically, without Richard having to prompt:

| Loop | Trigger | What Happens |
|---|---|---|
| **Draft loop** | Richard selects an article idea | Interview Agent is spawned → Writer Agent → Image Creator Agent → SEO Reviewer Agent → Proofreader Agent → Publisher Agent. Each handoff is automatic. |
| **Revision loop** | SEO Reviewer or Proofreader returns feedback | Writer Agent receives the feedback and revises. If the revision passes on the next review, the loop continues forward. Maximum 3 revision passes before escalating to Richard. |
| **Publish loop** | Richard merges a PR | PM Agent updates `MILESTONES.md` content calendar, logs the published article, and checks if the next article in the queue should enter the draft loop |

### Setting Up the Scheduled Tasks

In the first content session after the site is live, the PM Agent sets up the three scheduled tasks using the Claude scheduling tool. The task prompts are:

**Monday idea batch:**
> "You are the Content Strategist Agent for probl.me. Generate 5–10 article ideas across the three content categories (PM Craft, AI-Assisted Development, Tech Stack + Tools). For each idea include: a working title, the category, a one-sentence pitch, and a flag if it ties to current work on Celly or probl.me. Format as a clean list for Richard to review."

**Friday queue check:**
> "You are the PM Agent for probl.me. Check MILESTONES.md or the current list of open draft PRs on GitHub. Count how many articles are in the queue (draft PRs not yet merged). If fewer than 4, alert Richard: 'Content queue is low — only [N] articles pending. Start new drafts this week to maintain the 2x/week cadence.'"

**Tuesday/Thursday PR reminder:**
> "You are the PM Agent for probl.me. List any open draft PRs on the probl.me GitHub repository that are waiting for Richard's review. Format as: PR title, article category, date opened, and a direct link. If no PRs are waiting, confirm: 'No draft PRs pending — content queue is clear.'"

**Monthly retrospective (first Monday of each month):**
> "You are the PM Agent for probl.me. Run the monthly retrospective for [Month YYYY]. Copy `RETROSPECTIVE-TEMPLATE.md` to `retros/RETRO-[YYYY-MM].md`. Fill in every section using: the list of articles published this month, the draft PR history, the number of revision loops each article required, the scheduled task logs, and any analytics data available. Where data is not available, note it as 'Data not available — configure analytics to track this.' Present the completed retrospective to Richard and ask him to review Section 7 (summary, what worked, what did not, experiments). After Richard reviews, update any standards documents that need changing and log significant process decisions in DECISIONS.md."

### Writing About Loops and Scheduling

The scheduling and looped agent workflow is itself a topic for the blog. Once the pipeline is running, the Content Strategist Agent should include article ideas in the **AI-Assisted Development** category that document:
- How the scheduled content pipeline was built
- What a Claude scheduling loop looks like in practice
- What worked, what broke, and how it was fixed

These articles are valuable precisely because they are authentic — the process being described is the actual process running the site.

---

## Session Start Checklist — Content Session

At the start of every content session:

```
□ Read CLAUDE.md
□ Read AGENTS.md (this file)
□ Read CONTENT_STANDARDS.md
□ Read BRAND.md
□ Check MILESTONES.md for content calendar status
□ Check BLOCKERS.md for any active blocks on content work
```

## Session Start Checklist — Code Session

At the start of every code session:

```
□ Read CLAUDE.md
□ Read AGENTS.md (this file)
□ Read DEVELOPMENT_STANDARDS.md
□ Read SECURITY_SCANNING.md
□ Read the most recent HANDOFF-*.md file
□ Run `npm run build` to confirm site builds before touching anything
```

---

*Last updated: June 2026 — Collaboratively defined by Richard and Claude (Cowork).*
