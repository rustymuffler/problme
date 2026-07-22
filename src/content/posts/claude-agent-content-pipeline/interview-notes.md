# Interview Notes: How I Built a Fully Automated Content Pipeline with Claude Agents (and What Broke First)

Date: 2026-07-21
Category: ai-development

## Opening — the one thing to walk away thinking

This is a first pass at a pipeline of roles (interview, research, writer, SEO reviewer, proofreader, publisher) built to help research and write the probl.me blog. There's still a lot to learn and improve. The takeaway for readers: start somewhere with something, even if you aren't fully well-versed with AI yet, and let real experience over time refine your capability with it. Don't wait for expertise before starting.

## Personal experience — building the pipeline

The pipeline isn't as hardened as Richard would like it to be yet. He hasn't fully worked out how to ensure the process is strictly followed, no deviation. He believes there are likely settings or setup changes that could harden the process further. This week (2026-07-15 through 2026-07-17) gave the pipeline a real ending, three concrete incidents that all trace back to the pipeline being imperfect but the guardrails inside it catching real problems:

1. **The injection bug caught by the no-self-review rule.** Writing the C8 prompt-injection article surfaced two real gaps in probl.me's own defenses (a content PR that shipped a code change without a security scan running, and no documented rule for how agents should treat untrusted fetched content). These were closed in a follow-up PR (#73) that also adopted `@stackone/defender` for content-pipeline scanning. See Decisions 12 and 13 in `DECISIONS.md`.
2. **The supply-chain gate override.** Covered in detail below.
3. **The article-date mismatch.** Covered in detail below.

## Supply-chain gate override — the moment, in detail

The rl-protect (Spectra Assure) scan flagged a package as failing governance because it had been published too recently to clear the standard maturity window. The package was a necessary dependency for the project, an older version wouldn't work because of dependency constraints, and waiting several weeks for the package to "age" wasn't a good option.

Richard made the call to override the failure verdict himself, not by disabling the check, but by reviewing the evidence: the scan showed no indication of malware, and the maintainer community behind the package had a clean track record on previous releases. The override was a deliberate, evidence-based judgment call, not a decision to ignore or weaken the gate.

## Opinion — on AI agent pipeline conventional wisdom

Richard doesn't have a settled opinion here yet, and says so directly rather than posturing one. He knows the pipeline landscape spans people just getting started up through power users who have likely graduated past a plain markdown-file approach (like his AGENTS.md-based system) to something more structured and capable. His stance is: start with something simple enough to investigate, test, and learn from over time, rather than waiting to build the "right" system first. He's genuinely interested in hearing what others are doing, specifically to improve his own structure, setup, and process.

## Mistake / surprise — the article-date bug

Richard preps and lists article content ideas in markdown planning files, each with a proposed publish date. He didn't realize that this proposed date would also become the *actual* published date shown on the live site once the article's PR merged, regardless of when the merge actually happened. When a PR merged on a different day than the date recorded in the planning file, the article went live showing the wrong date. It wasn't a technical failure so much as a broken step in his own process, a gap in how he and the AI agents were collaborating, not a tooling bug.

## Concrete example

Article: ["Why I SHA-Pin Every GitHub Action (and Automate Updates)"](https://probl.me/blog/pin-github-actions-dependabot/) (C7).

Verified against the repository history: the article's PR (#55) merged on 2026-07-15, but the frontmatter `date` field still carried the originally planned publish date of 2026-07-17, so the live site briefly showed the post as published two days in the future. It was caught and fixed the same day in a follow-up commit that corrected the date to match the actual merge date.

## Advice for someone starting from zero

Some rules are meant to be broken depending on the situation, and things won't always go as planned, in product management and in life generally. Richard paraphrases Mike Tyson: "people have a plan until they get punched in the mouth." He still believes in structure and planning, but not rigid structure. Flexibility and the willingness to pivot make people more actionable. People who act are usually ahead of people who are stuck perfecting the plan.

This ties back to the opening message: build the imperfect pipeline, expect it to break in specific, catchable ways, and treat those breaks as the actual learning process rather than evidence you weren't ready to start.
