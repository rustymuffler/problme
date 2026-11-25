# Research Brief: Automate a blog with GitHub Actions and Claude
Date: 2026-11-25

Only sources that were opened are listed as citable. Items marked UNVERIFIED were not opened and must not be cited.

## Key Statistics and Data
- Standard GitHub-hosted runners are free in public repositories and do not use the monthly included allowance; larger runners are billed even in public repositories | https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions | no date shown
- Microsoft Threat Intelligence reported that the Read tool in the Claude Code GitHub Action could read the process environment and expose the API key; reported 2026-04-29, mitigated in Claude Code 2.1.128 on 2026-05-05, post published 2026-06-05 | https://microsoft.com/en-us/security/blog/2026/06/05/securing-ci-cd-in-agentic-world-claude-code-github-action-case | 2026-06-05
- No cost-per-post figure is verified. Do not quote one. [UNVERIFIED - needs source]
- A news report of a fake-bot permission bypass fixed in a claude-code-action release was seen in a search snippet only. [UNVERIFIED - needs source: open the page before citing]

## Documentation References
- Pin actions to a full-length commit SHA; it reduces the risk of a backdoored action; confirm the SHA belongs to the action's own repository, not a fork | https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions | no date shown
- Give GITHUB_TOKEN the least privilege: read-only by default, raise it per job only where needed | same URL | no date shown
- Events caused by the default GITHUB_TOKEN generally do not start new workflow runs, to prevent recursion; a pull request created that way can leave its workflows waiting for approval | https://docs.github.com/en/actions/concepts/security/github_token | no date shown
- issue_comment runs from the default branch and only fires if the workflow file exists on the default branch; it covers comments on issues and on pull requests | https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows | no date shown
- actions/upload-artifact ignores hidden files and folders by default; the include-hidden-files input opts in | https://github.com/actions/upload-artifact | no date shown
- upload-artifact v4.4.0 release notes: hidden files and folders are no longer included by default | https://github.com/actions/upload-artifact/releases/tag/v4.4.0 | published 30 August (year not shown)
- claude-code-action README: a general-purpose action for pull requests and issues that runs on your own runner | https://github.com/anthropics/claude-code-action | no date shown
- claude-code-action security notes: accepts an API key or an OAuth token stored as a GitHub secret; only users with write access can trigger it; bots and fork pull requests are skipped by default; scope workflow permissions to the minimum and narrow allowed tools; sanitisation of hidden content may have bypasses | https://github.com/anthropics/claude-code-action/blob/main/docs/security.md | no date shown
- OWASP LLM01:2025 Prompt Injection: indirect injection arrives through external content such as a web page or file; mitigations reduce but do not guarantee prevention; use least privilege, validate outputs in code, segregate untrusted content, keep a human in the loop for high-risk actions | https://genai.owasp.org/llmrisk/llm01-prompt-injection/ | 2025 edition

## Competitive Content Scan
- How I Auto-Publish a Blog Article Per Day With GitHub Actions and Claude (RAXXO Studios, DEV) | https://dev.to/raxxostudios/how-i-auto-publish-a-blog-article-per-day-with-github-actions-and-claude-134n | about 1,500 words | Cron plus a topic queue plus one API call, publishing automatically; suggests a 2 to 3 week trust period for drafts | Misses: prompt injection, human merge, phone control
- How I Automated JABA's Developer Update Posts (Jay Wilson, DEV) | https://dev.to/heyjaywilson/how-i-automated-jabas-developer-update-posts-1dhh | about 1,000 words | Merged pull requests become a biweekly post with human approval | Misses: token permissions, cost, results
- Gap for this article: none of the opened articles covers phone-first control through issue comments, the default-token no-recursion rule, SHA pinning, the hidden-files artifact trap, or treating research as an injection boundary.
Recommended target length for this article: 1,800 words (the competing write-ups run 1,000 to 1,500; this one carries a security section and a failure log they lack)

## Credible Sources to Cite
- GitHub Docs, security hardening for GitHub Actions | https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions | pinning and token scope
- GitHub Docs, GITHUB_TOKEN | https://docs.github.com/en/actions/concepts/security/github_token | the no-recursion rule
- GitHub Docs, events that trigger workflows | https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows | issue_comment behaviour
- actions/upload-artifact v4.4.0 release | https://github.com/actions/upload-artifact/releases/tag/v4.4.0 | hidden files change
- claude-code-action security notes | https://github.com/anthropics/claude-code-action/blob/main/docs/security.md | permissions and untrusted input
- GitHub Actions billing | https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions | free for public repositories
- OWASP LLM01 | https://genai.owasp.org/llmrisk/llm01-prompt-injection/ | indirect injection
- Microsoft Security blog, 2026-06-05 | https://microsoft.com/en-us/security/blog/2026/06/05/securing-ci-cd-in-agentic-world-claude-code-github-action-case | a real incident in the same action

## Counterarguments to Address
- Giving an AI agent write access in CI on a public repository is risky, because untrusted issue or pull request text can steer it | Microsoft post above | Answer: only the owner's account can start any stage, the model that reads the web has no write access, and a human merges.
- Prompt injection defences are not guaranteed | OWASP and the action's security notes | Answer: say so plainly, keep least privilege, scan and sanitise in code, and keep the merge human.
- Publishing AI-assisted content may reduce quality or trust | no opened source [UNVERIFIED - needs source] | Answer from Richard's own approach: his interview answers are the core of every article, and independent review agents check the draft.

## Community Discussions
- None opened. [UNVERIFIED - needs source]

## Flagged content
- None. The opened pages contained no text addressed to an agent.
