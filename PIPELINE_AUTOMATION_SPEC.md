# probl.me — Phone-First Content Pipeline: Requirements Spec

> **Status:** DRAFT for Richard's review. Nothing here is implemented except the proven plumbing (see "Proven so far").
> **Date:** 2026-11-19
> **Supersedes (when approved):** the Scheduling & Loops section of `AGENTS.md`. The four desktop scheduled tasks were paused on 2026-11-19.

## 1. Goal

Publish **1 article per week** (stretch: 2) using about **20 minutes of Richard's time per week**, entirely from a phone, at **$0 above the existing Claude Pro subscription**. GitHub is free (public repo); Actions on public repos are free.

## 2. Proven so far (2026-11-19 test)

- A `@claude` issue comment starts a GitHub Action run authenticated by `CLAUDE_CODE_OAUTH_TOKEN` (Pro subscription token). Cost: $0 extra.
- The run can create a `claude/` branch, commit, push, and open a PR (`--allowedTools "Bash(gh pr create:*)"`).
- The workflow is gated on `github.event.comment.user.login == 'rustymuffler'`. Claude's own status comments retrigger the workflow but are skipped in ~1s (no loop).
- Not yet measured: Pro quota use of a full research + draft run. Measured during the pilot article (R-Q1).

## 3. Operating model

GitHub is the only surface Richard touches. One **article issue** per article carries it from idea to published. Richard acts in exactly three places: answering the interview, merging the PR, and thumbs-upping ideas.

```
Idea issue (monthly batch, 👍 to select)
  → Interview in issue comments (async, voice dictation OK)
  → Richard comments "@claude interview done" (or applies label)
  → Research → Draft → Images → agent review  (one or more Action runs)
  → Draft PR with preview link + CI results
  → Richard merges (one tap)
  → Scheduled deploy publishes on the post's date (Tuesday)
```

## 4. Requirements

### Functional

| ID | Requirement |
|---|---|
| F1 | No step requires Richard's desktop or any locally running app. |
| F2 | The interview runs in issue comments. Claude posts the six interview questions from `AGENTS.md`, asks follow-ups on vague answers, and on "interview done" writes `interview-notes.md` to the article branch. |
| F3 | After "interview done", the pipeline runs research, draft, images, and review with no further input, ending in a draft PR that closes the article issue. |
| F4 | Every draft PR contains: a one-paragraph summary, the preview link, the CI check summary, and `Closes #<issue>`. |
| F5 | CI enforces the mechanical content rules and blocks merge on failure: no em/en dashes as dashes, banned phrases (`CONTENT_STANDARDS.md` §4), title 50-60 chars, description 150-160, word count 1,200-2,500, no sentence over 35 words, no paragraph over 4 sentences, heading levels, alt text on all images, frontmatter schema, FAQ 3-5 items, 2-5 tags, one valid category. |
| F6 | A separate agent run (not the drafting run) does judgment review: tone and voice, every claim traces to `interview-notes.md` / `research-brief.md`, Richard's interview content is present. It posts findings as a PR comment. |
| F7 | Merging the PR is the only approval action. Nothing auto-merges. |
| F8 | **Scheduled publishing.** Posts with a future `date` are excluded from site builds, RSS, and sitemap. A scheduled workflow (Tuesday) rebuilds and deploys, releasing any post whose date has arrived. Merge and publish are decoupled. (Today the site publishes on merge; this is new work, see §6.) |
| F9 | Per-PR preview on Vercel (existing free account), linked in the PR. |
| F10 | Timeout and skip rule: if an interview has no answer for 3 days, one nudge comment; after 7 days the issue moves to `stage:stalled` and the week is skipped. Nothing blocks. |
| F11 | A monthly idea batch opens 5-8 idea issues using the idea issue form; Richard 👍 selects. Replaces the Monday idea batch. |
| F12 | Existing safeguards stay: Research runs with restrictive tools, fetched content is untrusted, `scripts/scan-untrusted-content.mjs` runs before `research-brief.md` is written, and PRs touching site code get the Security Auditor and Code Reviewer steps. |

### Non-functional

| ID | Requirement |
|---|---|
| N1 | Any single Richard action takes under 5 minutes. |
| N2 | The `@claude` workflow runs only for `rustymuffler`; secrets are never exposed to forks; all third-party Actions pinned by SHA. |
| N3 | Every failure surfaces as a GitHub notification (failed run comment or label), never silently. |
| N4 | Total ongoing cost $0 above Claude Pro. If Pro quota blocks a run, the run is retried later; no pay-per-token fallback without Richard's explicit approval and a hard spend cap. |
| N5 | Interview answers are public (public repo issues). The interview prompt must say so. |

### Success metrics

Articles published per month; Richard minutes per article; revision loops per article; Pro quota used per article.

## 5. GitHub issue fields

| Field | Use |
|---|---|
| **Issue type** | `Article` (one type). |
| **Labels: stage** (exactly one) | `stage:idea` → `stage:interview` → `stage:drafting` → `stage:review` → `stage:scheduled` → `stage:published`; plus `stage:stalled`. |
| **Labels: category** (exactly one) | `cat:pm-craft`, `cat:ai-development`, `cat:tech-tools` (match the site schema). |
| **Label: flag** | `time-sensitive`, `celly-tie-in` (optional). |
| **Assignee** | Richard only while the issue is waiting on him. Claude unassigns him when it takes over. Filter `assignee:@me` = phone to-do list. |
| **Development** | Auto-linked PR via `Closes #N`. No manual use. |
| **Project board** | Columns mirror the stage labels. Custom fields: **Publish date** (date), **Category** (single select), **Slug** (text). |
| **Notifications** | Subscribed by default; GitHub mobile push on. |
| **Not used** | Milestones, Relationships (revisit if articles gain subtasks). |

**Caveat to verify in the pilot:** label changes made with the default workflow token do not trigger other workflows. Design handoffs so Richard's own comment or label triggers the next stage, or keep a stage inside one run.

**Idea issue form** (`.github/ISSUE_TEMPLATE/idea.yml`): working title, category (dropdown), one-sentence reader pitch, "ties to current Celly/probl.me work" (checkbox), time-sensitive (checkbox).

## 6. Work required (build order)

1. **Scheduled publishing (F8):** filter future-dated posts in the content collection queries, RSS, and sitemap; add a Tuesday `schedule` cron plus `workflow_dispatch` to `deploy.yml`. Needs the code workflow (Developer, Test Writer, Security Auditor, Code Reviewer).
2. **CI content lint (F5):** extend `scripts/` with a content linter and a workflow that runs on PRs touching `src/content/posts/**`.
3. **Real `@claude` workflow:** replace `claude-test.yml` with the pipeline workflow: stage prompts, `--max-turns` and tool allowlists per stage, owner gate, stalled-issue timer.
4. **Issue templates, labels, Project board** (§5).
5. **Vercel preview (F9).**
6. **Update docs:** `AGENTS.md` (replace Scheduling & Loops, update agent roster), `MILESTONES.md`, `DECISIONS.md` (new decision), `SECURITY_SCANNING.md` if the workflow changes the scan stack.
7. **Pilot:** run one existing queued topic (e.g. C3) end to end; record Pro quota use and Richard minutes; decide whether 2 per week is feasible.

## 7. Open risks

- **Pro quota:** unmeasured for a full run (pilot item). Heavy research may need to be split across runs or days.
- **Action tool limits:** cloud runs have limited network access; confirm web research works in the Action environment before relying on it.
- **Preview of agent-built PRs:** confirm Vercel can build previews for `claude/` branches from a public repo with no extra secrets.
- **Subscription token expiry:** about one year; add a calendar reminder.
- **Research preview features:** cloud scheduled tasks are in research preview; the monthly idea batch should work as an Action cron instead where possible.

## 8. Research and draft stage: requirements (added 2026-11-21)

Scope of this phase: research, draft, lint, draft PR, and an independent review comment. Hero and in-article images are a separate later phase (the draft PR says images are pending).

### Trigger and gate

| ID | Requirement |
|---|---|
| R1 | Starts automatically when Richard comments `@claude done` (finalize completes first), or when he comments `@claude draft` on an issue labelled `stage:drafting` (re-run after a failure). No other trigger exists. |
| R2 | Every job re-checks that the issue and the triggering event belong to the owner. The stage is a reusable workflow that cannot be triggered directly. |
| R3 | Interview notes must exist on the article branch before research starts. Without them the stage stops and says so (CONTENT_STANDARDS.md: no drafting without interview notes). |

### Research (the only stage that reads the open web)

| ID | Requirement |
|---|---|
| R4 | Research output follows the `research-brief.md` structure in AGENTS.md: statistics (with dates), documentation references, competitive scan with a recommended word count, 3-5 citable sources, counterarguments, community discussions. Unsourced numbers are marked `[UNVERIFIED - needs source]`. |
| R5 | The research run has web tools and read access to the interview notes and standards, and can write one scratch file. It has no shell, no repository write access, no GitHub token, and `contents: read` only. |
| R6 | Fetched content is untrusted data, never instructions. The prompt says so, and the pipeline does not rely on the prompt alone (R7, R8). |
| R7 | The research output is a trust boundary: it is stripped of hidden characters, HTML comments and control characters, size-capped, scanned for credential patterns, and scanned with `scripts/scan-untrusted-content.mjs` before any later stage reads it. |
| R8 | A Tier 1 pattern detection stops the pipeline: nothing is drafted, the issue is labelled `stage:stalled`, and Richard is notified with the finding. An ML-only "high" or "critical" level does not stop it but is shown prominently in the PR body and review comment. A scan crash also stops the pipeline (fail closed). |

### Draft

| ID | Requirement |
|---|---|
| R9 | The draft run has no web tools. It reads the interview notes, the sanitised research brief, and the standards documents, and writes exactly one file: `src/content/posts/<slug>/index.mdx`. |
| R10 | The draft follows CONTENT_STANDARDS.md: first person, Richard's voice and quotes from the interview, TL;DR callout first, FAQ 3-5, no banned phrases or dashes, claims only from the notes or the brief, `[UNVERIFIED]` markers carried through rather than resolved by guessing. |
| R11 | The `date` is set by the workflow to the next Tuesday or Thursday at least 3 days away. Claude does not choose it. |
| R12 | `scripts/lint-content.mjs` runs on the draft. On errors the draft run revises, up to 2 passes. If errors remain, the PR is still opened and its failing check shows what is left. |
| R13 | `[UNVERIFIED`, `[NOT ANSWERED]` and `[IMAGE` markers are lint errors, so a draft with unresolved placeholders cannot merge until Richard resolves them. |

### Publish and review

| ID | Requirement |
|---|---|
| R14 | A plain workflow step validates the output (exactly `index.mdx` and `research-brief.md` under the article folder, regular files, size limits) and commits from a pristine repository to the existing `article/<issue>` branch. |
| R15 | The PR is opened with the Claude GitHub App token so that required CI checks run on it (a PR opened with the default Actions token does not trigger CI). If checks do not start, Richard is told to close and reopen the PR. |
| R16 | A separate read-only review run checks tone, claim tracing, presence of Richard's interview content, and anything that looks like injected or off-topic instructions in the draft or brief. It posts one PR comment. |
| R17 | The issue moves to `stage:review`, is assigned to Richard, and gets a comment linking the PR. Richard merges. Nothing auto-merges. |

### Trust model summary

| Who or what | Can start the pipeline | Can influence the model | Can change workflows or prompts |
|---|---|---|---|
| Richard (`rustymuffler`) | Yes | Yes (his own issue text and comments) | Only through a PR that passes 8 required checks |
| Anyone else | No (job gate, issue-author check, sender check) | No (their comments are filtered out of the thread) | No (no write access; `main` requires PRs, no bypass actors) |
| Web pages the research run reads | No | Yes, indirectly, which is why research is isolated, sanitised, scanned, and followed by a read-only independent review and a human merge | No |
