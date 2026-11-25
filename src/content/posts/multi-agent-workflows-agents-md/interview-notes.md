# Interview Notes: Multi-agent workflows without an orchestration framework: the AGENTS.md approach
Issue: #165
Date: 2026-11-25
Slug: multi-agent-workflows-agents-md

## The one takeaway
"It is okay to start simple, test, and iterate as you find new challenges or ways to improve." There is no single right way to run a pipeline. "The right answer is to be actionable and make progress on your objectives." For Richard, the objective is "to find a simple and flexible way to write my own personal blog."

## Personal experience
"I have tried roughly defining agents to build Celly, Probl.me, and in my professional work as well." He says he continues to learn from the projects he takes on, "both big and small."

## Honest take
He does not give a flat yes or no on whether multi-agent work needs an orchestration framework. "I feel that it is dependent upon the person or team, and upon the project." He compares it to organizations: "no two organizations function exactly the same." His view: "Everyone can benefit from finding their own groove and sweet spot for whatever helps them be actionable and build momentum on their work."

## Mistake or surprise
He was surprised that "each major project like Celly or probl.me has a unique set of agents." Some agent types overlap between projects, but some work "require[s] unique agents for that specific project." He also finds new agents to add as he iterates and expands. "I'd like to say that it all feels organic and is adjustable as needed and as I build."

No specific failure or mistake was described.

## Concrete example
Richard used a set of threat investigation agents built by his team at ReversingLabs. He found it "exciting to see an endpoint security event work through various stages of an investigation pipeline with agents that have specializations in specific tasks so that they can independently work and identify if they reach the same or different conclusions." An adjudication agent "also performed the role of evaluating the evidence collected by the investigation agents so that it could function as an independent reviewer."

He shared the public repository as the example: https://github.com/reversinglabs/rl-spectra-ai-soc (the AI SOC investigation pipeline with its agents).

## Advice for someone starting from zero
He expects many people would give the same answer. His advice: "not over think or wait for the perfect timing or scenario," and instead "start small with something like I did and see if it works for them." He wanted an approach "that is free or very inexpensive" because probl.me is a personal blog driven by his interest in trying new things and sharing the experience. "I'm not making money or monetizing the probl.me blog site, it hasn't crossed my mind." He wanted to "experience working with AI as my teammate to see what is possible and where I can go with it." His summary: "So far, the experience is interesting and fun because I am learning."

## Key quotes
- "It is okay to start simple, test, and iterate as you find new challenges or ways to improve."
- "There isn't one right way or answer to run a pipeline."
- "The right answer is to be actionable and make progress on your objectives."
- "no two organizations function exactly the same."
- "Everyone can benefit from finding their own groove and sweet spot for whatever helps them be actionable and build momentum on their work."
- "each major project like Celly or probl.me has a unique set of agents."
- "it all feels organic and is adjustable as needed and as I build."
- "not over think or wait for the perfect timing or scenario"
- "I just wanted to experience working with AI as my teammate to see what is possible and where I can go with it."

## Gaps (not covered in the interview)
- No specific example from the probl.me AGENTS.md pipeline itself (a handoff that worked or failed). The concrete example is the ReversingLabs pipeline, which is a team-built system and not an AGENTS.md setup.
- No concrete mistake, failure, or thing that went wrong.
- No detail on what Richard's agents on Celly or in his professional work actually are, or what happened when roles were defined.
- No stated view on where the AGENTS.md approach breaks or when someone would outgrow it, and no direct comparison with LangGraph, CrewAI, or similar frameworks.
- No numbers (cost, time, quota) were given. "Free or very inexpensive" is the only cost statement.
