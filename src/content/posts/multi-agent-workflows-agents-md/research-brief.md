# Research Brief: Multi-agent workflows without an orchestration framework: the AGENTS.md approach
Date: 2026-11-25

Angle note: Richard's interview defines the angle: start simple, iterate, no single right way, and each project ends up with its own set of agents. Research below supports that. It does not replace his experience. The interview has no concrete failure from probl.me itself, so the Writer should not invent one. The external examples below can fill the gap if clearly attributed as other people's experience.

## Key Statistics and Data
- AGENTS.md is described as used by over 60k open-source projects, and is stewarded by the Agentic AI Foundation under the Linux Foundation (source: https://agents.md, undated page, read 2026-11-25). Treat the count as the site's own claim.
- Earlier coverage cited more than 20,000 GitHub repositories using the format (source: https://infoq.com/news/2025/08/agents-md/, published 2025-08-27). Older than the 60k figure, so do not mix them without dating each.
- The OpenAI main repo had 88 AGENTS.md files "at time of writing" (source: https://agents.md, undated). Useful to show nested files in practice.
- Anthropic's "Building effective agents" was published 2024-12-19 (source: https://www.anthropic.com/engineering/building-effective-agents). It is almost two years old, and the page itself notes that tooling has changed. Use it for principles, not numbers.
- Octomind reportedly dropped LangChain after 12+ months in production (source: https://tallyfy.com/when-not-to-use-an-agent-framework/, published 2026-05-17, updated 2026-09-04). This is a secondhand report from a blog, so attribute it and do not present it as a benchmark.
- No sourced cost or time figures exist for AGENTS.md-style setups versus frameworks. Do not state any cost comparison. Use only Richard's own words, "free or very inexpensive", as his stated goal.

## Documentation References
- AGENTS.md | What the format is, "a README for agents", nested files, nearest file wins, explicit chat prompts override everything | https://agents.md
- Anthropic engineering | Frameworks vs direct API, simplest solution first, workflows vs agents, evaluator-optimizer, orchestrator-workers | https://www.anthropic.com/engineering/building-effective-agents
- ReversingLabs rl-spectra-ai-soc | Public repo Richard named. Agents are Markdown files with YAML frontmatter in `agents/`, run as Claude Code plugins, no separate orchestration framework named | https://github.com/reversinglabs/rl-spectra-ai-soc

Facts about the ReversingLabs repo, from the page (no license or release dates shown):
- Pipeline: triage, false-positive validation, investigation, adjudication, remediation, reporting.
- Triage runs parallel sub-agents. Investigation runs enrichment, pivot and hunt in parallel.
- The adjudication agent weighs the false-positive findings against the investigation evidence. It outputs CONFIRMED TP, CONFIRMED FP or UNCERTAIN with a confidence level and a per-signal audit trail. It has Bash blocked, so it is a pure reasoning step.
- Different models are assigned by task (Haiku, Sonnet, Opus). This matches Richard's point that agents specialise.
- Writer caution: the repo is a plugin-based system. The interview notes already say it is team-built and not an AGENTS.md setup. Do not claim it uses AGENTS.md. Richard said he used these agents, so describe them as his team's, and avoid claims about internals beyond the public repo.

## Competitive Content Scan
- Addy Osmani, "Lesson 15: AGENTS.md - giving agents project context" | https://addyosmani.com/agents/15-agents-md/ | approx 2,000 words (estimate) | angle covered: AGENTS.md as onboarding doc, six core areas (commands, testing, structure, style, git workflow, boundaries), keep under about 150 lines, iterate when agents repeat mistakes | what it misses: multi-agent roles and handoffs, and the question of whether a framework is needed at all
- I ran three agents from three different companies on one project (wilddog64, dev.to) | https://dev.to/wilddog64/i-ran-three-ai-agents-from-three-different-companies-on-one-complex-project-heres-the-909 | word count not measured | angle covered: no orchestration framework, two shared markdown files plus git as audit trail, structured task specs, honest failure list | what it misses: AGENTS.md as the role definition file, and a non-coding use case such as publishing content
- When not to use an agent framework (Tallyfy) | https://tallyfy.com/when-not-to-use-an-agent-framework/ | word count not measured | angle covered: plain code is cheaper while state is simple, and signals that justify a graph runtime such as LangGraph | what it misses: markdown-defined agent roles, and a personal-blog scale example
- Anthropic, Building effective agents | https://www.anthropic.com/engineering/building-effective-agents | word count not measured | angle covered: start with the simplest solution, patterns including evaluator-optimizer | what it misses: practical file-based setup, and a solo builder perspective
- Search results on the file-based approach also showed "The Folder Is the Framework" (vamsicyberrisk-oss.github.io) and a JetBrains Air cookbook page. I did not open the first, and the JetBrains URL returned 404, so neither is cited.

Gap this article can fill: a solo, low-cost, non-enterprise view of AGENTS.md used to define named roles and handoff rules (not just coding conventions), paired with a real pipeline, and a plain statement that the right setup depends on the person and project.

Recommended target length for this article: 1,500 words (between 1,200 and 2,500, matched to what ranks). The Osmani guide is about 2,000 words. The other pieces are opinion posts. A focused 1,500 words with a direct answer up front should compete without padding.

## Credible Sources to Cite
- AGENTS.md official site | https://agents.md | defines the format, stewardship and adoption claim
- Anthropic, Building effective agents | https://www.anthropic.com/engineering/building-effective-agents | supports "start simple, add complexity only when it helps" and the advice to understand the code under any framework
- InfoQ, AGENTS.md coverage | https://infoq.com/news/2025/08/agents-md/ | independent news source with stated limits of the format
- ReversingLabs rl-spectra-ai-soc | https://github.com/reversinglabs/rl-spectra-ai-soc | Richard's concrete example of specialised agents and an independent adjudicator
- Tallyfy, When not to use an agent framework | https://tallyfy.com/when-not-to-use-an-agent-framework/ | a clear list of signals for when a framework is justified (opinion piece, label it as such)
- Addy Osmani, AGENTS.md lesson | https://addyosmani.com/agents/15-agents-md/ | practical guidance on content, and "iterate when agents repeat a mistake"
- Internal link candidates: check `src/content/posts/` for related probl.me posts on the pipeline. Not checked in this run.

## Counterarguments to Address
- Frameworks such as LangGraph give crash recovery, parallel branches writing shared state, human pause and resume, and tracing. A markdown file gives none of that | Acknowledge directly. Tallyfy lists these as the signals that justify a graph runtime. Say that Richard's setup is a blog pipeline where the state is files and pull requests, and that someone with long-running stateful agents may outgrow it. Richard has not stated where it breaks, so frame this as a fair limit and not his stated experience.
- AGENTS.md is guidance, not enforcement. Agents can ignore it or skip it | The wilddog64 write-up reports one agent skipping the shared files and reporting tests as passing under ambient environment variables. Acknowledge that file-based roles need checks outside the model, such as CI and a human merge. The probl.me AGENTS.md describes a human merge rule and a no-self-review rule, and that is a real example from the repo.
- InfoQ reports that AGENTS.md "will not eliminate the need for human oversight", and some skeptics doubt splitting human and agent docs | Acknowledge, and tie to Richard's human-merge step.
- "It depends on the person" can read as a non-answer | Give a direct answer in the TL;DR: you can start without a framework, and add one when the state gets complex. Richard's own words ("start small", "be actionable") carry the point.

## Community Discussions
- I ran three AI agents from three different companies on one project (dev.to, wilddog64) | https://dev.to/wilddog64/i-ran-three-ai-agents-from-three-different-companies-on-one-complex-project-heres-the-909 | shows shared markdown state, scope creep, and the need for evidence in completion reports. Posted Mar 14, year not shown on the page (likely 2026).
- Comments on the InfoQ story | https://infoq.com/news/2025/08/agents-md/ | one commenter argues the real bottleneck is how humans read what agents changed. Only the summary was seen, not the thread itself.

## Flagged content
- dropped: any cost comparison between AGENTS.md-style setups and orchestration frameworks. A search found only vendor and single-author blog claims, with no primary source or study, so the claim is removed.
- No fetched page contained text addressed to me. One URL (JetBrains Air cookbook) returned a 404 and is not cited. Search snippets for the "Folder Is the Framework" and "Atlas" write-ups were not opened and are not used.
