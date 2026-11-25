# Interview notes: Automate a blog with GitHub Actions and Claude

Source: Richard's own requests and decisions during the build session (2026-11-19 to 2026-11-25), plus facts taken from the repository history, the workflow logs and the pull requests. Richard's words are quoted exactly where they appear in quotation marks. Everything under "Facts" can be checked against the public repository (rustymuffler/problme).

## What Richard wanted (his words)

- The starting request: "I do not have time to work on the blog regularly. I am also not always able to access Claude Desktop. My phone is easier to access and is more available for me to use when reviewing work, answering interview questions, and merging PRs."
- The target: "post new articles weekly on a one or two article per week basis."
- The budget: "My goal has been to spend as little money as possible on this blog website." The repository is public, so GitHub Actions on standard runners costs nothing, and the only paid piece is the existing Claude Pro subscription.
- On security: "I want the stricter GitHub option so that we are protected as much as possible to only my personal user account having access."
- On quality: "Every blog article that we create should be the highest possible quality content so that we give our readers the best value."
- On sequencing: "I don't want to prompt a pilot article to be created until we have everything built to produce a fully completed article that has passed through the entire pipeline. I want to do a test run once everything is built and ready to test."
- On the interview: a real interview with real answers is the one piece of content that cannot be automated. He answers questions in an issue thread, from a phone, in his own words.
- A question he asked at the end: "If I have requests for changes or fixes to the article content or images, how would I do that using my phone?" That question led to the `@claude revise` command.

## Decisions Richard made

1. Use GitHub issues and GitHub Actions as the workflow engine, with the Claude Pro subscription token, instead of the Claude Desktop scheduled sessions.
2. Pause all four scheduled Cowork tasks (idea batch, queue check, PR reminder, monthly retro) before building the replacement.
3. Lock the repository down to his account only: a ruleset on main that requires pull requests and eleven passing checks with no bypass, a read-only default workflow token, an allowlist of GitHub Actions, pinning to commit SHAs, secret scanning with push protection.
4. Do not run a pilot article until every stage exists (images, quality gates, review agents), then run the first full test once.
5. Merge every PR himself. The pipeline never merges.
6. Keep the stricter options even where they cost convenience: for example, pull requests opened by the pipeline do not start CI by themselves, so he closes and reopens the PR once.

## Facts from the build (checkable)

- The build started on 2026-11-19 with a throwaway test workflow (PR 148) and the pipeline spec (PR 152).
- Between 2026-11-19 and 2026-11-25, 28 pull requests were merged for the pipeline, its hardening and its fixes.
- The feature work (interview stage, research and draft, image stage, quality gates, review agents, stalled timer, publish tracking, second research pass) merged on 2026-11-19 and 2026-11-21.
- Every pull request that changed workflow code was reviewed by a separate agent before merge. Those reviews found real bugs before they ran, for example: a rename bypass in the path guard, a regular expression that hung on hostile input, a validator that could be slowed down, alt text that could inject MDX, and artifact uploads that would have silently skipped hidden folders.
- The pipeline has these stages: an interview in an issue thread, research with web access and a read-only token, drafting with no web and no shell, SVG images checked by an allowlist, up to three review passes (proofreader, SEO, answer-engine, voice, fact-check), a pull request, a Vercel preview, publish tracking after merge, and a stalled-interview timer.
- The first full test used issue 165 and the topic "Multi-Agent Workflows Without a Framework: Try AGENTS.md". It failed six times before it succeeded. Two failures were in saving the interview notes. Four were in opening the pull request.
- The six failures had three different causes. (1) The check that the notes were the only changed file counted the runner's own scratch folder. (2) After the pipeline starts a clean repository for its commit, every tracked file looks untracked, so a plain branch switch refused to run. (3) The step that opened the pull request kept returning HTTP 401, and three fixes aimed at the Claude App token did not help. The real cause: the publish step checks the article branch out into the working folder, which replaced the pipeline's own scripts with an older copy from the branch, so the old script ran. The fix was to copy the tools aside before that checkout and run them from the copy.
- A reviewer reading the failed run's logs found cause 3. The first three theories about it (a dead token, a probe that passed, the wrong kind of API call) were wrong.
- Once the fixes were in, the run from the `@claude draft` comment to the "Ready for you" comment took 11 minutes 24 seconds (06:22:34 to 06:33:58 UTC on 2026-11-25). All automated reviews passed on the second review pass.
- Richard merged the pull request from his phone. Merging closed the issue because the pull request body said "Closes #165". That broke publish tracking, which only watches open issues, so the body now uses a plain reference.
- The merged article was scheduled for 2026-12-01. It goes live on the first Tuesday or Thursday deploy on or after its date.
- After the test, the `@claude revise` command was added: an owner-only comment on an open article pull request that applies text and image changes, checks them, and commits them to the same branch.
- Not measured yet: Claude Pro usage per article, wall time per stage, the number of revision loops over many articles, Richard's minutes per week. The failure drills (missed interview answer, poisoned research brief, resume after a forced failure) have not been run yet.

## Why Richard built it (the through-line)

- He has a day job and a product (Celly). A blog that depends on a long desktop session does not get written.
- Phones are where he has spare minutes: answering a few questions, reading a preview, tapping merge.
- The blog is part of how he builds in public, so the process has to be cheap, repeatable and safe enough to leave running.
- He wants readers to get the best value, so the pipeline spends effort on checks and independent review instead of speed.

## Additional build facts used in the article (checkable in the repository)

- The interview stage asks six questions in the issue thread (the one thing a reader should take away, direct experience, an honest take, a mistake or surprise, a concrete example, and advice for a beginner). Rough, partial and dictated answers are accepted, in any order. Richard ends the interview with the comment `@claude done` on its own line. The comment `@claude draft` re-runs drafting after a failure.
- The pipeline has nine stages: idea, interview, research, draft, images, reviews, pull request with preview, merge, and a live check. Richard acts in three: opening the idea issue, answering the interview, and merging.
- After a merge, publish tracking moves the issue to the scheduled stage. On or after the publish date it confirms the live page, the sitemap, the RSS feed and llms.txt, marks the issue published and closes it.
- Owner gate: every job checks that the issue author and the event sender are Richard's account before any step with a secret runs, and the interview agent only reads comments written by him.
- The research output is cleaned by a script (hidden characters, tags, images and credential-like strings removed) and scanned for prompt injection by code before the Writer reads it. If the scan flags it, nothing is drafted.
- The Writer agent has no shell and no web access and can edit one file (the article). Plain scripts, not a model, commit the result from a clean repository.
- If the Claude Pro usage limit is reached, the Claude step fails and the workflow posts a comment asking him to retry later. There is no automatic fallback to a paid API key; using one needs his approval.
- The `@claude revise` command: a separate Image Creator step draws new or redrawn diagrams and heroes as SVG, validated by the same allowlist used for drafting; it cannot make photos or screenshots; it works only on open pull requests from article branches; the review agents do not re-run on a manual revision. It was merged on 2026-11-25 and had not been used on a real article when the article was written.
- Three theories about the HTTP 401 were tried in order and none of them fixed it: a dead Claude App token, a token probe that passed, and a REST versus GraphQL difference. The cause was the stale script (see above).

- Publishing decision (Richard, 2026-11-25): publish this article today, and mention in it that the first article from the test run goes live next Tuesday (1 December 2026).
