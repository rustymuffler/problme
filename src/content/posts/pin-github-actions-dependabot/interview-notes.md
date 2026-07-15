# Interview Notes: Why I SHA-Pin Every GitHub Action (and How I Automate Keeping Them Current)

Date: 2026-07-12
Category: tech-tools
Interviewer: Interview Agent (Claude Code, conducted live in chat with Richard)

Note on sourcing: where Richard's own words are quoted or closely paraphrased, they are marked **[Richard]**. Where the agent proposed framing and Richard approved or lightly edited it, it is marked **[Agent draft, approved by Richard]**. The Writer Agent should preserve the distinction, Richard's actual opinions and experience must be identifiable in the final article, not rewritten into generic prose.

---

## 1. Opening — the one takeaway

**[Agent draft, approved by Richard, with his addition]**

A version tag on a GitHub Action is a mutable pointer someone else controls, not a security boundary. Pinning to the commit SHA closes that hole, but pinning alone creates a new problem: nothing updates automatically anymore. You need both halves, the pin and a way to keep it current, or you've just traded one risk (silent compromise) for a slower one (silent staleness).

Richard's addition **[Richard]**: working with Claude gives him a unique way to learn and reinforce security practices while building, not just an execution tool. He actively asks questions to expand his own understanding, and he deliberately challenges Claude to evaluate whether the correct practices are actually being followed, rather than assuming they are. (This became literally true during this session: asking about the "automate keeping them current" half of the title surfaced that Dependabot wasn't actually configured yet, see Q4.)

---

## 2. Personal experience

**[Richard, from a related but non-probl.me context]**

Richard worked on the CylancePROTECT agent team at Cylance. The team did not code-sign their Linux install packages. As a substitute for signing, they published the SHA values of the install packages and incremental update packages so customers could validate that what they pulled matched what Cylance's development team actually built.

Direct quote-level detail from Richard:
- "I cannot comment on whether or not other security vendors would provide customers with a published set of SHA values for their Linux install packages." (Do not claim this was industry-standard, frame as Cylance's own practice.)
- "We did not have any situations where a package did not match our SHA. This was done more as a preventative measure." (No incident to cite, this was defense-in-depth / integrity assurance, not a response to a known compromise.)

**[Agent draft, approved by Richard]** for the probl.me side: when Richard built the probl.me CI/CD pipeline (four workflows: `ci.yml`, `deploy.yml`, `security.yml`, `lighthouse.yml`), every third-party Action was pinned to its full commit SHA rather than a tag, per `SECURITY_SCANNING.md`, and confirmed clean via Checkov (176 checks passed, 0 failed on `.github/`). That part was already solid going into this article.

---

## 3. Opinion — agree or overstated?

**[Richard + Agent synthesis, discussed live and approved by Richard]**

Richard does not think SHA-pinning is overstated. He connected it directly to the Cylance precedent above: this is not a new idea, it's the same instinct (a cryptographic hash as ground truth so a consumer can verify what they're trusting matches what the vendor actually built) applied to a different threat model.

The agent proposed, and Richard agreed is worth including, the meaningful differences between the two cases:

1. **Manual vs. automatic.** At Cylance, verification was an active, optional step a customer could take (download, hash, compare), most probably never did. GitHub Actions SHA-pinning has no step to skip, the workflow cannot execute different code than the SHA specified. Verification is built into the mechanism, not a checklist item.
2. **Static artifact vs. moving target.** Cylance's SHA defended against tampering with a fixed, unsigned install package. GitHub Actions pinning defends against something that would otherwise be free to change later, a tag silently repointed after the fact (the real-world case: the `tj-actions/changed-files` compromise in 2025, [UNVERIFIED — needs source, Research Agent to confirm details before citing]).
3. **Why hashing existed at all.** Cylance published SHAs because the packages weren't signed, a substitute for a code-signing certificate. GitHub Actions pinning is the practical workaround the industry uses today for the same underlying gap.

Framing for the article: same underlying instinct Richard already had from his Cylance experience, applied to a different problem, unsigned software wanting to prove integrity vs. a mutable reference wanting to be made immutable.

---

## 4. Mistake or surprise

**[Richard]**

Richard was surprised that SHA-pinning (with the version comment) was implemented without Dependabot also being part of the original implementation. On reflection, he says he probably shouldn't have been surprised: "I like to reprioritize and pivot work as I build with Claude. This may have slipped my mind, but I am happy that Claude raised it as a missing need in the project."

This became a real, live example during the drafting of this article: the Interview Agent asked what "automate keeping them current" referred to, found no `dependabot.yml` existed, flagged it, and Richard had Dependabot for the `github-actions` ecosystem built and merged in the same session (PR #48, `chore/dependabot-github-actions` branch, Checkov-verified, 0 findings) before the interview even finished. Worth telling this story straight, including the gap, in the article itself. It is a better, more honest article for having a real gap-and-fix in it rather than a tidy retrospective.

---

## 5. Concrete example

**[Agent draft, using an example from probl.me's own repo, per Richard: "let's use your example or you can find an example from our project that is worth naming"]**

Two real examples to use, both from this repo:

1. **A representative pin:** `actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5  # v4` — this exact pattern repeats across all four workflow files. The trailing `# v4` comment is what keeps a 40-character hex string human-readable at a glance.
2. **The Dependabot fix itself, done live in this session:** `.github/dependabot.yml`, `github-actions` ecosystem, weekly schedule, `chore(deps)` commit prefix matching the repo's existing commit convention, labeled `dependencies` + `github-actions`. Verified with `checkov -d .github/ --quiet` (176 passed, 0 failed), committed on branch `chore/dependabot-github-actions`, opened and merged as PR #48 same day, 2026-07-12.

---

## 6. Advice for someone starting from zero

**[Agent draft, approved and extended by Richard]**

Don't stop at "pin to a SHA," that's the easy 80%. The part most articles skip is that pinning without an update mechanism just creates silent staleness instead of silent risk. Set up Dependabot for `github-actions` in the same sitting you do the pinning, it's a 10-line YAML file and it's free.

Richard's addition **[Richard]**: working with AI is itself an opportunity to learn new security practices, not just delegate them. His advice: don't hesitate to do personal research outside your AI sessions, and explicitly ask the AI to balance its own recommendations against that outside research, rather than taking either source as the final word on its own.

---

## Summary for Writer Agent

- Distribute Richard's Cylance experience and his framing of the Cylance-vs-GitHub-Actions comparison throughout the piece, it is the most distinctive, non-generic content in this article and should not be siloed into one section.
- Include the live gap-and-fix story (Dependabot was missing, got built mid-session) as a real, honest beat, this is exactly the kind of "honest about failure" content `CONTENT_STANDARDS.md` calls for.
- Include Richard's meta-point about using AI as a learning partner for security practices, not just an implementation tool, this fits the `ai-development` themes probl.me already covers and reinforces the site's overall thesis.
- `[UNVERIFIED — needs source]`: the `tj-actions/changed-files` 2025 supply-chain incident, Research Agent must confirm details (date, mechanism, impact) before it's cited in the article, or drop it if it can't be verified.
- Do not claim SHA-published install packages were industry-standard practice among endpoint security vendors, Richard was explicit he can only speak to Cylance's own practice.
