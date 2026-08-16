# Interview Notes: C9 — What I Actually Changed After Reading My Own Prompt-Injection Article

Date: 2026-08-15
Interviewer: Interview Agent (Claude Cowork)
Subject: Richard Robitaille-Muffler

---

## 1. Opening

**Q: In one or two sentences, what's the one thing you most want a reader to walk away thinking after reading this article?**

Writing about a security problem doesn't count for much if you haven't checked whether your own systems have it. I want readers to walk away and go actually audit their own pipelines and not fear finding issues.

## 2. Personal experience

**Q: Have you dealt with this directly in your work on Celly, probl.me, or your career? What happened?**

While I was researching and writing C8, I found a real gap in my own process: a content PR that touched site code (a table CSS fix in the blog template, PR #72) shipped without Aikido or Semgrep ever running on it, even though my own security doc required both for any code change. The content workflow and code workflow were documented as separate tracks, and that PR slipped through the seam between them. I also realized I had no documented rule for how much untrusted content an agent should be allowed to process versus how much capability it should have while doing it, which is exactly the risk C8 is about.

## 3. Opinion

**Q: What's your honest take? Do you agree with the conventional wisdom on this topic, or do you think it's wrong or overstated?**

Honestly, I think a lot of security advice is written by people who care and have experienced past challenges. They have run into the walls and encountered the pitfalls. It's a nice public service to write "watch out for X" as a general principle, but it can be a challenge to go find X in your own repo and fix it. I didn't want to be the guy who wrote the prompt-injection article and then didn't live the experience of fixing the issue that was exposed.

## 4. Mistake or surprise

**Q: Did anything go wrong, surprise you, or change your thinking? Share it.**

The scarier one wasn't the missing security scan, it was the missing rule. The scan gap was a process bug, easy to fix. The bigger issue was that I'd never actually written down what a Research Agent is allowed to do with content it fetches from the open web. It was implicitly trusted. That's the exact mechanism the article is about, and it was sitting undocumented in my own AGENTS.md the whole time.

## 5. Concrete example

**Q: Can you give a specific, real example from your own work — a decision you made, a tool you used, a conversation you had?**

The clearest before/after is `scripts/scan-untrusted-content.mjs`. Before: the Research Agent fetched web content, and whatever it returned went straight into `research-brief.md`, no check in between. After: that same output gets scanned by `@stackone/defender` first, and I read the result myself before the file gets written. It's advisory, not a hard gate, it never blocks the pipeline on its own, but it's a real second set of eyes that wasn't there before. Setting it up also surfaced its own lesson: it false-positived on my own already-published research brief, flagging a totally benign sentence about Checkov check IDs. Good reminder that these tools need a human reading the flag, not blind trust in the score either way.

## 6. What you'd tell someone starting out

**Q: If a developer or PM was starting from zero on this topic, what would you tell them that most articles don't?**

Go look at the seam between your workflows, not just inside them. My gap wasn't in the content pipeline and it wasn't in the code pipeline, it was in the boundary between the two, where a PR could cross both and get neither's checks. If you're running multiple agent workflows, ask what happens when a task touches both, that's usually where the untested path is.

---

## Reference material (for the Research Agent / Writer Agent)

- [Decision 12](../../../../DECISIONS.md) — Prompt-Injection Defenses Added to probl.me's Own Agent Pipeline (2026-07-16)
- [Decision 13](../../../../DECISIONS.md) — Adopt @stackone/defender for Content-Pipeline Prompt-Injection Scanning (2026-07-16)
- PR [#72](https://github.com/rustymuffler/problme/pull/72) — the table CSS fix that shipped without a security scan
- PR [#73](https://github.com/rustymuffler/problme/pull/73) — the follow-up PR that closed the two gaps
- `SECURITY_SCANNING.md` §9 — `@stackone/defender` tool documentation
- `AGENTS.md` — Agent Interaction Rules (workflow-seam rule) and Research Agent — Untrusted Content Rules
- Source article: `src/content/posts/prompt-injection-ai-agents/` (C8, published 2026-07-16)
