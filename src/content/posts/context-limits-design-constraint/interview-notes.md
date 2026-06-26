# Interview Notes — C4
# "Context limits as a design constraint: how handoff documents changed the way I build"
Date: 2026-06-26
Interviewed by: Interview Agent
Subject: Richard Muffler

---

## Q1 — One-sentence takeaway

"I would like the article to give the reader ideas and help them try new methods for collaborating with AI."

**Intent:** Not prescriptive. Inspire experimentation, not gospel. Reader should leave curious and motivated to try something, not follow a rigid playbook.

---

## Q2 — Personal experience

Richard first encountered the context problem while working on Celly (his B2C SaaS app). Sessions would slow down and feel like being "bogged down in mud." After researching how other AI users were working — videos, articles — he learned about context window limits and made the connection.

His response drew on his PM background: carve work into bite-size chunks. He then defined:
- **Agents** with specific areas of focus and responsibility (treated as peers)
- **A strict development process** from brainstorming to release
- **Milestones with defined success criteria** that the AI can measure against

This structure enabled the entire probl.me blog launch and the content publishing pipeline now in place.

**Follow-up — what did the symptoms look like?**

"I was getting inconsistent answers and AI had forgotten some of the tasks that we had completed early in the sessions. I was having to remind the AI of things we accomplished."

First solution: an MD file as an audit log so the AI could look back. Then research revealed the same file could also free up context at defined thresholds during sessions — periodic handoffs at ~90% context.

---

## Q3 — Opinion

Richard sees a spectrum of AI users:
- Power users are doing well; Anthropic shares good knowledge publicly
- Many new users are still learning
- Some existing users are "power prompters" who haven't advanced to newer techniques (loops, schedules, agent workflows)

Key observation: "It is crazy to think that what I share now is likely outdated tomorrow because AI power users are moving from prompting to loops and schedules."

**Tone note:** Not preachy. Richard explicitly does not want to position this as the correct way — he wants to document one approach that worked and invite people to iterate.

---

## Q4 — Mistake or surprise

Richard transferred his Celly development process (built for a secure, deeper B2C SaaS app) to probl.me. During the build he noticed there was no test-driven development (TDD) in the probl.me process and was surprised.

He asked Claude why TDD wasn't being used. Claude explained that probl.me uses a separate Test Writer Agent that tests after the code is written — not during.

The site launched successfully and matched the product requirements and design specs exactly. But Richard still believes in TDD as an additional validation point and wants the Developer Agent to lean on tests during code writing, not just after.

**Tone note:** Acknowledge the success honestly. But don't drop the reservation — "even with the success of probl.me thus far, I still feel strongly about TDD." That tension is what makes this credible.

---

## Q5 — Concrete example

Richard chose the session that implemented responsive layouts across the probl.me site (the session that produced HANDOFF-2026-06-25-2301.md).

That session required the Developer Agent to:
- Read the old design files
- Read the project files in depth
- Read the new design files
- Evaluate what was new, what was the same, and what was outdated

Richard describes himself as "technical enough to create problems and break things" — which is why working with AI is valuable. Claude steers him away from problems while he pursues his goals.

The session was a heavy context lift — effectively a full project re-review to avoid breaking the site during a design direction change. It produced:
- A responsive website
- A Credits & Thanks page (open source acknowledgement)
- His personal resume on the About page

**The handoff file itself** (HANDOFF-2026-06-25-2301.md) contained:
- Complete file manifest (created + modified)
- What was fully complete (Steps 1–3 broken down)
- What was in progress / partially done
- Exact next steps with numbered sub-tasks
- Critical invariants (never violate)
- Key decisions made that session with rationale
- Commands needed to resume

**Richard's experience of the handoff:** "The context refreshing during that session was seamless. I did not experience any challenges during the session."

---

## Q6 — What to tell someone starting out

"Test and try new approaches. Similar to my experiences at different organizations, there is no 'correct' gold plated process to follow."

Key points:
- Celly uses a different process than probl.me, and both can succeed
- Richard acknowledges there are likely errors or issues in his own approach
- He wants to inspire learning, research, and trial and error — not position himself as an authority
- Direct quote: "I am not here to self-crown as the AI guru, so please like with AI, know that what you read here can contain errors."

**Tone note:** This closing humility is essential to the article's voice. It disarms the reader's skepticism and makes everything else more credible.

---

## Key Themes for the Writer Agent

1. **The mud metaphor** — use it early. "Bogged down in mud" is vivid and relatable.
2. **PM instinct as the unlock** — the connection between context limits and PM-style milestone thinking is Richard's original insight. It's the spine of the article.
3. **The audit log → handoff document evolution** — this is a two-step story. First he built an MD log. Then he learned it could also trigger context refreshes at thresholds. That progression matters.
4. **The TDD tension** — don't resolve it. The article is more honest if it acknowledges the probl.me process works AND Richard still has reservations.
5. **The Celly-to-probl.me transfer** — shows the approach is repeatable across projects, not a one-off.
6. **Humility as a feature** — the closing quote is the article's most important line. End there or near there.

---

## Richard's Exact Quotes (use or paraphrase closely)

- "Bogged down in mud"
- "I was having to remind the AI of things we accomplished"
- "Technical enough to create problems and break things"
- "It is crazy to think that what I share now is likely outdated tomorrow because AI power users are moving from prompting to loops and schedules"
- "There is no 'correct' gold plated process to follow"
- "I am not here to self-crown as the AI guru, so please like with AI, know that what you read here can contain errors"
