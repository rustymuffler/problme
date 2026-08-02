# Interview Notes: Writing a spec your AI agent can actually follow

Date: 2026-08-01
Category: pm-craft

## 1. Opening — the one takeaway

Collaborating with engineers to define a project's requirements and success criteria has helped Richard throughout his career in product management. Working with AI has been very similar because requirements and a clear specification give the AI context into what you're focused on in a given session. He recommends using specs at all levels: long-term guidelines and short-term, session-based guidelines.

## 2. Personal experience

Richard spent roughly twelve years as a technical writer, and has now spent over twelve years in product management. Across both professions his work has had a heavy focus on documentation, whether that's end-user documentation after engineers release a new capability, or the product requirements specs engineers use to implement new capabilities. That background gave him comfort writing specs to collaborate with AI. He sees it as an opportunity to turn his own ideas into reality with AI agents functioning as his production team.

## 3. Opinion — agrees or pushes back on conventional wisdom

Richard agrees with spec writing and believes in using agile practices with AI. He finds it exciting to research an idea and have AI perform research in parallel, then create specific agents to focus on different areas of that idea so they can swarm on building it out. As part of building out an idea, he's found it useful to have AI poke holes in his own spec and help refine it further. He also finds it interesting to watch AI agents review each other's work and challenge each other for further refinement (this is exactly the probl.me multi-agent model: no self-review, separate reviewing agents).

## 4. Mistake or surprise

Richard has found it's important to clearly communicate expectations to AI so that it follows the spec and doesn't drift from the guardrails defined in it.

## 5. Concrete example

Most recently, [PR #92](https://github.com/rustymuffler/problme/pull/92) caught a real instance of this: the Content Calendar row for article C2 was never flipped from "Queued" to "Published" in `MILESTONES.md` after its PR merged, the same class of drift that had already surfaced once before with article C8. The instruction to update the status existed in the spec, but nothing in the spec forced a session-end check against it, so the same gap happened twice.

## 6. What to tell someone starting from zero

Write your spec so the AI's next self can verify compliance without re-reading the whole conversation. It's not enough to say what to do, you need to say how a fresh session checks that it was done. The C2 calendar drift happened twice because the instruction to update the status existed, but nothing forced a session-end check against it. Build the verification step into the spec itself, not just the task.
