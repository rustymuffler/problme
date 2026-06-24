# probl.me — Monthly Retrospective Template

> **File:** `RETROSPECTIVE-TEMPLATE.md`
> **Purpose:** Template for the monthly retrospective. The PM Agent copies this file to `retros/RETRO-YYYY-MM.md`, fills it in, and presents it to Richard for review and discussion.
> **Cadence:** First Monday of each month, triggered by the monthly retrospective scheduled task.
> **Output:** A completed `retros/RETRO-YYYY-MM.md` + any updates to standards documents that the retrospective identifies as needed.

---

## How the Retrospective Works

1. The monthly retrospective scheduled task fires on the first Monday of the month
2. The PM Agent fills out this template using data from the past month: published articles, draft PR history, pipeline timing, agent revision counts, and any analytics data available
3. The PM Agent presents the completed retrospective to Richard in a Cowork session
4. Richard and the PM Agent discuss findings and agree on any changes to the process
5. The PM Agent updates the relevant standards documents (AGENTS.md, CONTENT_STANDARDS.md, DEVELOPMENT_STANDARDS.md, etc.) to reflect agreed changes
6. Any significant process changes are logged in DECISIONS.md
7. The completed retrospective is saved to `retros/RETRO-YYYY-MM.md` and committed to the repository

---

## Retrospective — [Month YYYY]

**Date completed:** YYYY-MM-DD
**Prepared by:** PM Agent
**Reviewed by:** Richard Muffler
**Retrospective period:** [First day of month] to [Last day of month]

---

## 1. Content Output

*How much did we publish? Did we hit the goal?*

| Metric | Goal | Actual | Delta |
|---|---|---|---|
| Articles published | 8 (2x/week) | [N] | [+/- N] |
| Articles in PM Craft | — | [N] | — |
| Articles in AI-Assisted Development | — | [N] | — |
| Articles in Tech Stack + Tools | — | [N] | — |
| Average word count | 1,200–2,500 | [N] | — |
| Articles with [VERIFY] flags resolved before publish | 100% | [N%] | — |

**Notes:**
[What happened with output this month? Were we ahead, behind, or on track? What caused any shortfall?]

---

## 2. Pipeline Performance

*How did the content pipeline run? Where did articles get stuck?*

| Metric | Observation |
|---|---|
| Average days from idea selection to draft PR | [N days] |
| Average days from draft PR open to Richard merge | [N days] |
| Articles that required 1 revision loop | [N] |
| Articles that required 2 revision loops | [N] |
| Articles that required 3 revision loops (escalation threshold) | [N] |
| Scheduled tasks that fired correctly | [N of 3] |
| Queue health alerts triggered | [N] |

**Where did articles get stuck most often?**
[ ] Interview step — Richard availability
[ ] Research Agent — topic research was thin or took too long
[ ] Writer Agent — draft quality required multiple passes
[ ] SEO Reviewer — recurring SEO issues
[ ] Proofreader — recurring tone or grammar issues
[ ] Publisher Agent — technical issues opening PRs
[ ] Richard review — PRs sat too long before merge

**Notes:**
[Which step caused the most friction? Was there a pattern across multiple articles?]

---

## 3. Agent Quality Review

*How did each agent perform? Were there recurring problems?*

| Agent | Quality this month | Recurring issues |
|---|---|---|
| Content Strategist | [Good / Needs improvement] | [Any patterns?] |
| Interview Agent | [Good / Needs improvement] | [Any patterns?] |
| Research Agent | [Good / Needs improvement] | [Any patterns?] |
| Writer Agent | [Good / Needs improvement] | [Any patterns?] |
| Image Creator Agent | [Good / Needs improvement] | [Any patterns?] |
| SEO Reviewer Agent | [Good / Needs improvement] | [Any patterns?] |
| Proofreader Agent | [Good / Needs improvement] | [Any patterns?] |
| Publisher Agent | [Good / Needs improvement] | [Any patterns?] |
| PM Agent | [Good / Needs improvement] | [Any patterns?] |

**Most common Proofreader flags this month:**
[List the top 3 issues the Proofreader Agent flagged most often. If the same issue appears repeatedly, it suggests the Writer Agent prompt or standards need updating.]

**Most common SEO Reviewer flags this month:**
[List the top 3 SEO issues flagged most often.]

---

## 4. Content Quality

*Are the articles good? Are they what we intended when we defined the content mission?*

**Strongest article this month:**
[Title, category, why it worked — what made it land well?]

**Weakest article this month:**
[Title, category, what fell short — was it the topic, the depth, the voice, or something in the pipeline?]

**Voice check — did articles sound like Richard?**
[ ] Yes, consistently
[ ] Mostly, with occasional AI-sounding passages
[ ] No, a noticeable gap between Richard's interview voice and the published article

**Research quality check — were articles well-supported?**
[ ] Yes, external sources added genuine value
[ ] Sometimes — some articles had thin research
[ ] No, research briefs were weak or repetitive

**Umami Analytics — reader engagement data** (from the Umami dashboard at the Vercel instance):

| Metric | This month | Last month | Trend |
|---|---|---|---|
| Total page views | [N] | [N] | [↑ / ↓ / →] |
| Unique visitors | [N] | [N] | [↑ / ↓ / →] |
| Total sessions | [N] | [N] | [↑ / ↓ / →] |
| Bounce rate | [N%] | [N%] | [↑ / ↓ / →] |
| Average session duration | [N min] | [N min] | [↑ / ↓ / →] |
| Most-read article | [Title] | [Title] | — |
| Top traffic source | [Organic / Direct / Social / Referral] | — | — |
| Top referrer domain | [Domain] | [Domain] | — |
| Top country | [Country] | [Country] | — |

**What the data tells us about content performance:**
[Which articles drove the most traffic? Did any article punch above its word count in engagement? Were there drop-off patterns that suggest a content or UX issue?]

**Traffic source analysis:**
[Is organic search growing? Are social posts (LinkedIn, X) driving meaningful referrals? Is direct traffic (repeat visitors) increasing — a sign of audience building?]

---

## 5. Scheduling and Automation

*Did the automated pipeline run as intended?*

| Scheduled task | Fired correctly? | Issues? |
|---|---|---|
| Monday idea batch | [ ] Yes / [ ] No | [Notes] |
| Friday queue health check | [ ] Yes / [ ] No | [Notes] |
| Tuesday/Thursday PR reminders | [ ] Yes / [ ] No | [Notes] |
| Monthly retrospective trigger | [ ] Yes / [ ] No | [Notes] |

**Automation wins this month:**
[What did the scheduling and looping save Richard from having to do manually?]

**Automation gaps or failures:**
[Where did the automation break down or require Richard to intervene manually?]

---

## 6. Standards Review

*Are our written standards still accurate and useful? Do any need updating?*

Review each document and mark whether it needs an update:

| Document | Still accurate? | Needs update? | What to change |
|---|---|---|---|
| AGENTS.md | [ ] Yes / [ ] No | [ ] Yes / [ ] No | [Notes] |
| CONTENT_STANDARDS.md | [ ] Yes / [ ] No | [ ] Yes / [ ] No | [Notes] |
| DEVELOPMENT_STANDARDS.md | [ ] Yes / [ ] No | [ ] Yes / [ ] No | [Notes] |
| SECURITY_SCANNING.md | [ ] Yes / [ ] No | [ ] Yes / [ ] No | [Notes] |
| BRAND.md | [ ] Yes / [ ] No | [ ] Yes / [ ] No | [Notes] |
| MILESTONES.md | [ ] Yes / [ ] No | [ ] Yes / [ ] No | [Notes] |

**Standards that caused friction this month:**
[Any rule that agents consistently struggled with or that produced bad outcomes should be reviewed and either clarified, changed, or removed.]

---

## 7. Retrospective Summary

### What worked well — keep doing
1. [Item]
2. [Item]
3. [Item]

### What did not work — stop or change
1. [Item and proposed change]
2. [Item and proposed change]

### Experiments to try next month
1. [Specific, testable experiment with a clear success criterion]
2. [Specific, testable experiment with a clear success criterion]

### Agreed process changes
[List any changes that Richard and the PM Agent agreed to make. Each item should reference which document will be updated.]

1. Change: [What changes]
   Document: [Which file]
   Owner: [PM Agent / Developer Agent / etc.]
   By when: [Before next month's retrospective / immediately]

---

## 8. Next Month Focus

*One sentence on what next month is primarily about.*

**Primary focus:** [e.g., "Improve research brief quality so Writer Agent needs fewer revision loops" or "Publish the first Building in Public series article"]

**Secondary focus:** [e.g., "Set up Distribution Agent" or "Improve image quality and consistency"]

**Content calendar direction:** [Which category or topic area should get more attention next month and why?]

---

*Retrospective completed by PM Agent. Reviewed and approved by Richard Muffler.*
*Filed at: `retros/RETRO-[YYYY-MM].md`*
