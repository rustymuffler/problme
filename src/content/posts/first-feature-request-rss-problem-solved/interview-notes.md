# Interview Notes: Our First Feature Request Was RSS. Problem Solved.

Date: 2026-11-18
Category: ai-development
Interviewer: Interview Agent (Claude Code, conducted live in chat with Richard)

Note on sourcing: where Richard's own words are quoted or closely paraphrased, they are marked **[Richard]**. Where the agent proposed a draft answer and Richard approved it as written, it is marked **[Agent draft, approved by Richard]**. The Writer Agent should prefer **[Richard]** material for voice and treat **[Agent draft, approved by Richard]** as approved content that still came from a proposal, not unprompted speech.

Working title (chosen by Richard from four options): **Our First Feature Request Was RSS. Problem Solved.**
Planned slug and branch: `first-feature-request-rss-problem-solved` / `content/first-feature-request-rss-problem-solved`.
Target publish date: TBD (not specified by Richard).

Privacy decisions made by Richard during the interview:
- Name the person who asked for RSS by first name only: **Srikar**, met at a cybersecurity event both attended.
- Use the **full** version of the personal reason for the gap: kids' winter hockey seasons and the loss of two family dogs one month apart. **Do not name Richard's sons.**

---

## 1. Opening: the one takeaway

**[Richard]**

"While life can become busy, we need to find time to still discover and build. Speaking with someone about the blog and receiving a feature request from them helped spark the return from this pause from working on the website."

Follow-up, what actually happened **[Richard]**: He showed the person the blog and talked about working with AI as a method of augmentation of his abilities to research, build, and do various other things. That led them to be interested in following his blog by adding it to their RSS reader, and they asked whether there was an RSS capability. He did not see an RSS button on the website, so in that moment he thought it wasn't built into the website yet.

---

## 2. Personal experience: the first feature request

**[Richard]**

Receiving the request made him feel excited "because I had an improvement to build that would add value for someone who wants to follow my work." As a product manager, he gets enjoyment out of understanding jobs to be done and looking at ways to address those problems.

**[Richard]** on who: "Srikar", whom he met at a cybersecurity event they both attended. First name only (see privacy decisions).

---

## 3. The surprise: the feature already existed

**[Richard]**

He asked Claude to help him build the RSS capability. Claude reviewed the website and told him it already existed.

He was a bit embarrassed that he had forgotten it existed from the original website requirements and build. He was also happy that the fix wasn't a missing feature but a user experience issue: there was no visible indication that the feature existed.

Claude suggested the improvements and they worked on adding them in the same Claude Code session.

(Fact record for the Writer, verified in the repo: `src/pages/rss.xml.ts` and a `<link rel="alternate" type="application/rss+xml">` autodiscovery tag already existed. The improvements added were a visible "rss" link in the footer, `<category>` elements per item, an Atom self link, and README documentation. See research-brief.md, firsthand session record.)

---

## 4. The gap and Richard's honest take

**[Richard]** on the gap: He had been busy with his kids and their winter hockey seasons starting up. Two family dogs passed away one month apart, which meant he took time with his sons to be there through their first experience losing family pets "who were like brothers to them." (Use the full version, no names for his sons.)

**[Richard]** on his honest view: "Time needs to be committed to regularly posting. If you are passionate about something, then time will be made for it. In life and in work, we may not feel like we always put time to the most important items, but things derive their importance from how much time we dedicate to them. So dedicate time to your priorities, otherwise they are not actually priorities."

**[Richard]** on the plan: He will investigate and research how to further build out his work with Claude Code and use his smartphone to work on the website remotely, so he can do it in the flexible moments available each day. There is still research and setup to be done to make this possible, "but it looks like I can do it and make it that much more accessible to work on the blog website at any moment." (The article must present this as in progress and not promise a schedule or specific tooling that Richard has not confirmed.)

---

## 5. A surprise or lesson from the session

**[Agent draft, approved by Richard]**

"The thing that surprised me most was that the accessibility tests I thought were protecting the site had never actually run in CI. They existed, and they had even started to fail against the current site, but nothing was running them, so nothing told me. Once we wired them in, they found real problems: some text didn't meet contrast standards, and there was no skip link for keyboard and screen reader users. It changed how I think about 'done.' A check that exists but never runs is a false sense of security. The same lesson showed up with RSS. The feature was there, but because nobody could see it, it effectively wasn't."

---

## 6. A concrete moment, and advice for someone starting out

**[Agent draft, approved by Richard]** concrete moment:

"The moment that stuck with me was seeing the finished result in a preview of the site. After all that work, the fix for Srikar's request was a single small link in the footer, between 'github' and 'credits.' It's one word, 'rss,' and it took one afternoon of other work to get to the point where that word could matter. The feature had been there for months. The only thing missing was a way for someone to find it."

**[Agent draft, approved by Richard]** advice:

"If you've fallen behind on your blog and feel guilty, don't try to make up for lost time. Start with one small thing that adds value for someone who reads your work. I came back because someone asked for something, not because I forced a posting schedule. And be honest with yourself about priorities: if something matters, you give it time, and the time can be small and flexible. For me that may mean working from my phone in the gaps in my day, which I'm still setting up."

---

## Writer Agent guidance (from the interview)

- Lead with the answer: Richard is back, the blog was not forgotten, and the first reader request (RSS) is shipped.
- Richard's strongest lines to keep close to verbatim: "dedicate time to your priorities, otherwise they are not actually priorities"; the jobs-to-be-done framing; "the fix wasn't the lack of the feature, but ... a user experience issue."
- Tone: honest and direct. Include the embarrassment about forgetting RSS existed. Treat the dogs and the hockey season with warmth and brevity, not as a bid for sympathy. No sons' names.
- Do not state a posting cadence or a finished mobile workflow. Both are unsettled.
- The two lessons that tie the article together: a feature nobody can find effectively does not exist (RSS), and a check that never runs is a false sense of security (the a11y tests).

---

## 7. Addendum (added 2026-11-18, after the first draft): the rl-protect GitHub Action

Richard asked for the article to mention that the ReversingLabs Spectra Assure Community rl-protect GitHub Action was added to the probl.me CI/CD pipeline. His stated reason **[Richard]**: he likes to use the products his company builds and delivers so he can experience the value they provide, and he is excited to include it as part of his GitHub CI/CD workflow.

**Disclosure decision [Richard]:** include an explicit disclosure that he works at ReversingLabs, which builds rl-protect. (His employer is also in the site's author structured data.)

**[Agent draft, corrected before use, approved by Richard]** The article uses this combined answer. Note: the first version of the agent draft said rl-protect found no vulnerabilities and that recency was the only thing flagged. The agent re-ran the scan before publication and found that was wrong (a high-severity warning on astro 7.4.13 from the http-cache-semantics dependency, plus other warnings), so the draft was corrected and Richard approved the corrected version. The agent also offered a third "honest take" draft (advisory-only setting, package.json-not-lockfile limit); Richard chose to use drafts 1 and 2 only, so those limits are not in the article.

"I like to use the products my company builds and delivers, because that is how I experience the value they provide, not just describe it. I work at ReversingLabs, which builds rl-protect, so I have a stake in it working well. Running the Spectra Assure Community GitHub Action in my own CI/CD workflow lets me see supply chain scanning from the user's side, on a real project that is not a demo. I am excited to have it in my GitHub pipeline.

Getting it running took two steps. The Action needs a Community token stored as a repository secret, and I added it again as a Dependabot secret so Dependabot-triggered runs can read it. On its first run it scanned my 17 direct dependencies. It failed three because they had been published only days earlier, which is what the baseline profile's recency rule is built to catch, and it raised warnings on a few others. One was a high-severity vulnerability on astro, traced to a dependency called http-cache-semantics. GitHub lists that advisory as withdrawn, and npm audit and Trivy report nothing, so I am treating it as something to look into, not an emergency."

**Wording adjustment after proofreading (2026-11-18):** the approved sentence "it raised warnings on a few others. One was a high-severity vulnerability on astro" was changed to "it raised warnings too. They included a high-severity vulnerability flag on astro" because astro was itself one of the three packages that failed the recency rule, so "others" was inaccurate, and the scan reported six warnings, not "a few". The meaning Richard approved is unchanged. Richard should confirm this wording in the PR review.
