# probl.me — Content Standards

> **File:** `CONTENT_STANDARDS.md`
> **Purpose:** Defines the article format, writing voice, SEO requirements, image standards, and publishing workflow for all blog content on probl.me.
> **Authority:** Read at the start of every content session alongside `AGENTS.md` and `BRAND.md`.

---

## 1. Content Mission

probl.me exists to share the honest experience of building products together — the decisions, the tools, the mistakes, and the lessons. The audience is developers, product managers, and founders who appreciate candid, technically credible writing.

Every article must answer the reader's implicit question: **"Why should I spend 10 minutes reading this?"** If the answer isn't clear in the first two paragraphs, the article needs editing.

### Human Content vs. Agent-Assisted Content

Each article has two distinct content sources that readers can recognize:

- **Richard's content** — his firsthand experience, opinions, mistakes, and specific examples, captured in a structured interview before drafting begins. This is the content only Richard can provide.
- **Agent-assisted content** — research, structure, background context, and synthesis that the Writer Agent contributes using the interview notes as a foundation.

Both are valuable. The goal is not to hide the agent's role — it is to ensure that Richard's genuine perspective is always the core of every article, with the agent amplifying and organizing around it, not replacing it. Readers should feel they are reading Richard's thoughts, supported by well-researched context.

---

## 2. Content Categories

All articles are assigned to exactly one of three categories:

| Category | Slug | Description | Examples |
|---|---|---|---|
| **PM Craft** | `pm-craft` | Product management skills, frameworks, and lessons from practice | PRD writing, user research, prioritization, stakeholder communication |
| **AI-Assisted Development** | `ai-development` | How AI tools (especially Claude) change the development and content workflow | Using Claude as a PM co-pilot, agentic workflows, prompt engineering |
| **Tech Stack + Tools** | `tech-tools` | Honest takes on tools used in building probl.me and Celly — what works, what doesn't | Astro, GitHub Pages, Coolify, n8n, Clerk, Gitleaks, Trivy |

---

## 3. Article Format

### Length

- **Standard:** 1,200–2,500 words
- **Minimum:** 1,000 words (exceptions require Richard's approval)
- **Maximum:** 3,000 words (split into a series if longer content is needed)

### Structure

Every article must follow this structure:

```
# Title (H1) — only one H1 per article, matches the post title exactly

[Opening hook — 1–2 paragraphs that establish the problem or question]

[Optional: TL;DR callout block — 3–5 bullet points for readers who skim]

## Section One (H2)
[Body content — 2–4 paragraphs, supported by examples or data]

### Subsection (H3) — only if needed within a section
[Keep H3 usage intentional — not every paragraph needs a heading]

## Section Two (H2)
...

## Key Takeaways (or Conclusion)
[Summary paragraph — what you learned, what the reader should walk away with]

[Optional: What's next — brief preview of related work or upcoming articles]
```

### Callout Blocks

Use callout blocks sparingly to highlight important notes or warnings. Import the `Callout` component and use it directly, there is no `:::` container syntax support:

```mdx
import Callout from '../../../components/Callout.astro';

<Callout type="note">This is important context the reader shouldn't miss.</Callout>

<Callout type="warning">A common mistake to avoid.</Callout>

<Callout type="tip">You can also do this instead.</Callout>
```

The relative import path depends on the article's location. From `src/content/posts/[slug]/index.mdx` it is `../../../components/Callout.astro`.

### Code Blocks

When referencing code, commands, or config, always use fenced code blocks with the language specified:

```bash
npm create astro@latest
```

```typescript
// Example TypeScript
const post = await getEntry('blog', slug);
```

---

## 4. Voice and Tone

The Writer Agent drafts every article in Richard's voice. These rules are absolute.

### Voice Principles

- **First person.** "I decided to use Astro because..." not "One might consider Astro because..."
- **Professional but approachable.** Informed and credible, but never stiff or corporate.
- **Honest about failure.** Things go wrong. Share it. Readers trust writers who admit mistakes more than those who only show highlights.
- **Concrete and specific.** "I spent 3 hours debugging a GitHub Actions workflow" beats "the setup took some time."
- **No jargon without explanation.** Technical terms are fine — define them on first use if there's any chance a reader won't know them.

### Banned Phrases

The Writer Agent must never use these:

- "In today's fast-paced world..."
- "It's no secret that..."
- "Leverage" (as a verb — use "use" instead)
- "Synergy", "paradigm shift", "game-changer", "cutting-edge", "innovative", "seamless"
- "Deep dive" (use "detailed look" or just say what you're doing)
- "Best practices" without explaining what the practice actually is
- Any phrase that sounds like marketing copy

### Banned Punctuation

**Em dashes (—) are not permitted anywhere in any article or page content.** This applies to the Writer Agent, the Proofreader Agent's review, and any human editing.

When an em dash would be used, rewrite using one of these alternatives:

| Instead of... | Use... |
|---|---|
| "The tool worked — but only sometimes." | "The tool worked, but only sometimes." |
| "Three things matter — speed, clarity, and honesty." | "Three things matter: speed, clarity, and honesty." |
| "It was the best decision — and the riskiest." | "It was the best decision. It was also the riskiest." |
| "Claude — my AI co-writer — drafted it first." | "Claude, my AI co-writer, drafted it first." |

En dashes (–) may only be used for numeric ranges (e.g., "1,200–2,500 words"). They may not be used as a substitute for an em dash.

The Proofreader Agent must scan for both `—` and `–` in every draft before approving.

### Reading Level

- Target: Grade 8–10 (Flesch-Kincaid or Hemingway App)
- Short sentences. Average sentence length should be 15–20 words.
- Short paragraphs. Maximum 4 sentences per paragraph. Never more than 6.

---

## 5. MDX Frontmatter Requirements

Every article file must include complete frontmatter matching the schema defined in `src/content.config.ts`, which is the actual source of truth. Keep this section in sync with that file if the schema ever changes.

**Correction (2026-07-12):** an earlier version of this section described a frontmatter schema that did not match `content.config.ts`, and following it would have broken the build. The schema below is verified against the real implementation.

```yaml
---
title: "Your Article Title — Clear and Keyword-Rich"
description: "A 150–160 character description that summarizes the article and includes the primary keyword. This appears in Google and social previews."
category: tech-tools        # pm-craft | ai-development | tech-tools
tags:
  - astro
  - github-pages
  - static-site
date: 2026-06-25
readTime: "7 min"           # estimated reading time, matches the site's existing display convention
heroImage: /assets/posts/[article-slug]/hero.png
imageCredit: "AI-generated with Claude"   # or "Stock photo — [Source name], royalty-free" or "Personal screenshot" or "Personal photo"
---
```

### Required Fields

`title`, `description`, `category`, `tags`, `date`, `readTime`. The Astro build fails outright if any of these are missing or malformed, this is enforced by the Zod schema in `content.config.ts`, not just a style convention.

### Optional Fields

`heroImage`, `imageCredit`.

### Fields that do not exist in the schema

An earlier version of this document referenced `publishDate`, `updatedDate`, `author`, `slug`, `imageAlt`, `draft`, and `featured` as frontmatter fields. None of these exist in the real content collection schema:

- **Slug** is derived automatically from the article's folder name (`src/content/posts/[slug]/index.mdx`), not a frontmatter field.
- **Author** is hardcoded in the site template, this is a single-author blog, not a frontmatter field.
- **Alt text** for the hero image is derived automatically from `title`. There is no separate `imageAlt` field. In-article images set their own alt text directly in markdown image syntax (`![descriptive alt text](url)`).
- **Draft status:** there is no `draft` field or build-time gate. An article is unpublished simply by not existing on `main` yet, the Publisher Agent's draft PR is the real gate. Do not merge an article's PR until it's ready to go live.

---

## 6. SEO Standards

Every article must meet these requirements before the Publisher Agent opens a PR.

### Title

- 50–60 characters (including spaces)
- Contains the primary keyword
- Compelling — someone should want to click it
- Does not start with a number if avoidable (exceptions for list articles: "5 Things I Learned...")

### Description (meta)

- 150–160 characters
- Contains the primary keyword
- Reads as a complete, compelling sentence — not a keyword dump
- Different from the title — adds information

### URL Slug

- Lowercase, hyphen-separated
- Contains the primary keyword
- 3–6 words max
- No dates in the slug (slugs should be evergreen)
- Example: `/blog/astro-github-pages-blog-setup` not `/blog/2026-06-22-how-i-set-up-my-blog-with-astro-and-github-pages`

### Headings

- One H1 only — the article title (set automatically from frontmatter)
- H2 for major sections
- H3 for sub-sections within H2 sections
- No H4 or deeper (restructure the content instead)
- No skipped heading levels (H2 → H4 is not allowed)
- Headings should be informative, not generic ("How I Fixed It" is weak; "Fixing the GitHub Actions Deploy Conflict" is strong)

### Images

- Every article must have a hero image, plus at least one in-article image — no article ships as pure text
- Every image must have descriptive alt text (not "image" or "photo" — describe what is shown)
- Hero image doubles as the OG image (1200×630px)
- Compress all images before committing (use `astro:assets` optimization or WebP format)
- Every stock image's royalty-free license must be confirmed before use, with the source recorded in `imageCredit`

### Internal Linking

- Every article should link to at least one other article or page on probl.me once other content exists
- Use descriptive anchor text ("how I set up GitHub Actions" not "click here")

### External Linking

**Correction (2026-07-12):** this section previously stated that all external links must include `target="_blank" rel="noopener noreferrer"`, phrased as if it were already enforced. It isn't. Standard markdown link syntax (`[text](url)`) is what's actually used across the site today; external links open in the same tab and carry no `rel` attribute. If opening external links in a new tab is wanted, it needs a site-wide fix (e.g. a rehype plugin such as `rehype-external-links` in `astro.config.mjs`), not something each article handles by hand. Logged as a real follow-up rather than silently dropped.

---

## 7. Content Workflow

The complete workflow from idea to published article:

### Step 1: Content Strategist Agent — Idea Batch (Scheduled)

This step runs automatically on a Monday morning schedule — Richard does not need to prompt it.

The Content Strategist Agent generates a batch of 5–10 article ideas. Each idea includes:

- Working title
- Category (pm-craft, ai-development, tech-tools)
- One-sentence pitch (why a developer or PM reader would care)
- Estimated word count
- Whether it ties to current work on probl.me or Celly (preferred)
- Time-sensitivity flag (if tied to a recent event or tool release)

Richard selects which ideas to pursue and in what order. Selection can happen asynchronously — Richard does not need to be in an active session.

### Step 2: Interview Agent — Capture Richard's Content

Before any drafting begins, the Interview Agent conducts a structured interview with Richard about the selected topic. See `AGENTS.md` — Interview Agent section for the full question framework.

The interview captures:

- Richard's personal experience with the topic
- His honest opinion (does he agree with conventional wisdom?)
- A specific, real example from his own work
- A mistake, surprise, or lesson learned
- What he'd tell someone starting from zero

Output: `interview-notes.md` saved alongside the article files. This file is committed to the article branch for transparency.

**The Writer Agent must not begin drafting until interview notes exist.** An article without Richard's personal input does not meet the content standards.

### Step 3: Research Agent — Gather Supporting Material

After the interview is complete, the Research Agent runs a targeted search before any drafting begins. It saves a `research-brief.md` alongside `interview-notes.md` in the article files.

The research brief covers: current statistics and data points, relevant tool documentation, a competitive content scan (what already exists on this topic and what angle they take), 3–5 credible external sources to cite, counterarguments worth addressing, and any relevant recent community discussions.

See `AGENTS.md` — Research Agent section for the full standards and output format.

**The Writer Agent must not begin drafting until both `interview-notes.md` and `research-brief.md` exist.**

### Step 4: Writer Agent — Draft

The Writer Agent drafts the full article in MDX format using all three inputs: the topic brief, the interview notes, and the research brief.

The draft includes:

- Complete frontmatter (except `publishDate`, which may be TBD)
- Full article body, weaving in Richard's interview content throughout and supporting it with data and sources from the research brief
- External source citations linked inline where relevant
- `[UNVERIFIED]` flags carried forward from the research brief for any statistics without a confirmed source
- `[VERIFY]` flags on any other factual claims that need Richard's confirmation
- Image placeholders: `[IMAGE: description of what should go here]`

Richard's personal content from the interview notes should be distributed throughout the article — not cordoned off in a single "my experience" section — so that his voice runs through the entire piece. The research brief provides supporting evidence, not a replacement for his perspective.

### Step 5: Image Creator Agent — Images

The Image Creator Agent creates or sources:

- Hero image (1200×630px, follows `BRAND.md`)
- At least one in-article image replacing Writer Agent's image placeholders

Every article must ship with a hero image plus at least one in-article visual (diagram, chart, artwork, screenshot, or photo) — no article publishes as pure text. Each image is either generated with Claude Design or sourced as a royalty-free stock image (license confirmed and source recorded — see `AGENTS.md` → Image Creator Agent — Image Rules).

Images are saved to `src/content/posts/[article-slug]/images/` with descriptive names.

### Step 6: SEO Reviewer Agent — SEO Review

The SEO Reviewer Agent checks all items on the SEO approval checklist (see `AGENTS.md`). It either:

- **Approves:** Passes to Proofreader Agent
- **Returns with feedback:** Sends specific revision notes to Writer Agent, who revises and resubmits (maximum 3 passes)

### Step 7: Proofreader Agent — Tone and Correctness Review

The Proofreader Agent reviews the SEO-approved draft against the full proofreading checklist (see `AGENTS.md`). It either:

- **Approves:** Passes to Publisher Agent
- **Returns with line-level feedback:** Lists each issue, the rule violated, and a suggested fix. Writer Agent revises and resubmits (maximum 3 passes).

The Proofreader Agent specifically checks for and rejects any em dash (—) or en dash (–) used in place of an em dash.

### Step 8: Publisher Agent — Draft PR (Automated)

The Publisher Agent (Claude Code) creates automatically after Proofreader approval:

- A branch named `content/[article-slug]`
- Commits: MDX file, `interview-notes.md`, `research-brief.md`, and all images
- Opens a **draft pull request** on GitHub with:
  - The article title as the PR title
  - A brief summary: word count, category, primary keyword, SEO and proofreading pass counts, Richard's interview content flag (confirming it is present)
  - A preview link (if GitHub Pages preview deployments are configured)

### Step 9: Richard — Review and Merge

Richard reviews the draft PR at his own pace (Tuesday/Thursday reminders run automatically). He may:

- **Merge:** Article deploys to probl.me automatically via GitHub Actions
- **Request changes:** Leave comments on the PR; the relevant agent makes revisions and pushes to the branch
- **Close without merging:** Article is abandoned or deferred

After Richard merges, the PM Agent updates `MILESTONES.md` and checks if the next article in the queue should enter the draft loop automatically.

---

## 8. Content Calendar

The publishing cadence is **2 articles per week**.

The PM Agent maintains the content calendar and flags Richard when the queue (articles in draft PRs or pending draft) falls below 4.

Suggested publishing schedule: **Tuesday and Friday** (both are high-traffic days for technical content).

---

## 9. Article Updates and Corrections

### Minor edits (typos, formatting)

Open a `fix/` branch with the change. No new SEO review required. PR is still required.

### Significant updates (adding new information, major rewrites)

- Update the `updatedDate` field in frontmatter
- Add a visible "Updated [Month Year]" note at the top of the article
- If the update is substantial, the SEO Reviewer Agent re-reviews the article

### Corrections

If a factual error is found after publishing:

- Fix it immediately in a `fix/` branch
- Add a brief correction note at the bottom of the article: "Correction (Date): [What was wrong and what the correct information is]"
- Never silently edit published articles in a way that could mislead readers about the original content

---

## 10. Content Invariants — Never Violate

1. **Write as Richard.** First-person, Richard's voice, Richard's opinions.
2. **Interview notes are required.** No article may enter the drafting step without `interview-notes.md`. Richard's personal content must be present and identifiable in the final draft.
3. **No em dashes.** Never. The Proofreader Agent will reject any draft containing `—`. Rewrite the sentence instead.
4. **No fabricated quotes.** Every attributed quote must be real and verifiable.
5. **No unlicensed images.** Claude-generated, personal screenshots, personal photos, or confirmed royalty-free stock images only. Every article must include a hero image plus at least one in-article visual.
6. **[VERIFY] flags must be resolved before publishing.** Never publish an article with unresolved `[VERIFY]` flags.
7. **SEO checklist must be 100% complete** before the Publisher Agent opens a PR.
8. **Proofreader must approve** before the Publisher Agent opens a PR.
9. **Only recommend tools we use.** Do not write positively about paid tools not used in the probl.me or Celly stack.

---

*Last updated: June 2026 — Collaboratively defined by Richard and Claude (Cowork).*
