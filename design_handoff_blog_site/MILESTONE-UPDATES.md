# Design Change Request — for the Product Manager Agent

> **File:** `MILESTONE-UPDATES.md`
> **Audience:** the PM agent that maintains probl.me's development milestones/backlog.
> **Purpose:** Translate the latest design updates into milestone-ready work items. Each item below is written as a self-contained backlog issue (summary · description · acceptance criteria · references · size). Create or update milestones and issues from these.
> **Authoritative design sources (in `design_handoff_blog_site/`):** `RESPONSIVE-SPEC.md`, `README.md`, `START-HERE-PROMPT.md`, and the five `*.dc.html` page references. Lift exact values from those; this file is the *what-changed-and-why*, they are the *how*.

---

## Summary of what changed this round

Four design changes were added on top of the original desktop-only handoff:

1. **Responsive layer** for the whole site (the original comps were desktop-only).
2. **New page: Credits & Thanks** (`/credits`) — open-source attribution, footer-linked.
3. **About page: PM experience / résumé** section added (this site doubles as an online résumé).
4. **About page: layout restructure** — intro + story merged into one narrative column with a sticky business card; page tightened.

Plus a site-wide footer change (a `credits` link) and one new asset to source (the résumé PDF).

Suggested milestone mapping: **M-Responsive**, **M-Credits**, **M-About/Résumé**, folded into the existing Step 1–4 build plan in `START-HERE-PROMPT.md`. Sizes are rough (S ≈ <½ day, M ≈ ½–1 day, L ≈ 1–2 days) for a single front-end implementer.

---

## Milestone: M-Responsive — "Make the site responsive"

> Depends on the base Layout/components existing (Step 1–2 of the build plan). Reference: `RESPONSIVE-SPEC.md` (the full contract).

### R-1 · Add global breakpoints + responsive primitives — **S**
- **Description:** Introduce the two breakpoints — tablet `@media (max-width:1023px)`, mobile `@media (max-width:639px)` — and the responsive gutter scale (32→24→20px) and mobile heading type-steps in the global layer.
- **Acceptance:** Resizing any page across 1280 / 768 / 390px reflows with no horizontal scroll; headings step down on mobile per `RESPONSIVE-SPEC.md §2.4`; body stays 18px.
- **Refs:** `RESPONSIVE-SPEC.md §1, §2.1, §2.4`.

### R-2 · Mobile header / hamburger nav — **M**
- **Description:** Below 639px, replace the inline nav with a 44×44px hamburger button that opens a full-width dropdown panel. Build it as a real `<button aria-expanded aria-controls>` + minimal JS (toggle, close on link-click and Escape), progressively enhanced. **Do not ship the CSS-checkbox toggle used in the prototypes** — that's a preview-only stand-in.
- **Acceptance:** Keyboard-operable; `aria-expanded` reflects state; menu closes on navigate/Escape; ≥44px targets; matches the panel spec (colors, dividers, active=amber).
- **Refs:** `RESPONSIVE-SPEC.md §2.2`.

### R-3 · Per-page reflow — **M**
- **Description:** Implement the per-page layout collapses: hero grids → single column; card grids 3→2→1; blog-listing featured card → stacked image-on-top; blog-post prev/next → stacked, author card wraps with full-width `about →`; About intro → single column; Credits manifest rows wrap; footers stack on mobile.
- **Acceptance:** Each page matches the prototype at 1280 / 768 / 390px. Verified live: the `*.dc.html` references reflow at those widths.
- **Refs:** `RESPONSIVE-SPEC.md §3.1–3.5`.

### R-4 · Touch / reduced-motion gating — **S**
- **Description:** Disable the business-card 3D tilt on coarse pointers / ≤1023px (render flat); keep `prefers-reduced-motion` handling (freeze marquee, drop cursor blink, no tilt).
- **Acceptance:** No stuck hover/tilt state on touch devices; reduced-motion users get a static page.
- **Refs:** `RESPONSIVE-SPEC.md §2.5`.

---

## Milestone: M-Credits — "Credits & Thanks page"

> New page. Reference: `probl.me Credits.dc.html`, `README.md` (Screens §5).

### C-1 · Generate /credits from THIRD-PARTY-NOTICES.md — **M**
- **Description:** Add a `/credits` route that is **generated at build time** by parsing `THIRD-PARTY-NOTICES.md` — do not hand-transcribe the list. Group dependencies into four buckets: **Framework & Runtime, Build & Test Tooling, Security & Quality, Fonts**. Render the manifest-ledger rows (name + version/short-SHA · purpose · color-coded license badge · source link), the warm intro, the MIT-license note, and the `↻ auto-generated from THIRD-PARTY-NOTICES.md` chip.
- **Acceptance:** Every dependency in the notices file appears (no "+ N more" elisions); license badge colors per spec (MIT→olive, Apache-2.0→amber, MPL-2.0→terracotta, OFL-1.1→neutral); page regenerates when the notices file changes.
- **Refs:** `probl.me Credits.dc.html`; `README.md § "Credits & Thanks"`; `START-HERE-PROMPT.md` Step 3.

### C-2 · Spectra Assure Community supplemental entry — **S**
- **Description:** The page must include one entry NOT in `THIRD-PARTY-NOTICES.md`: **Spectra Assure Community** (ReversingLabs, https://secure.software/) under **Security & Quality** — "scans our open-source packages for malware, tampering, and supply-chain risk before they ship," badge `Community`. Keep it through regenerations (small supplemental list merged into the generated output).
- **Acceptance:** Entry renders first in Security & Quality and survives a rebuild.
- **Note for PM:** consider a follow-up to add Spectra Assure to `THIRD-PARTY-NOTICES.md` itself (or a sibling notices section) so the Security Auditor agent tracks it like the rest.

### C-3 · Footer credits link, site-wide — **S**
- **Description:** Add a `credits` link to the site footer on **every** page (footer only — not the top nav).
- **Acceptance:** All pages' footers link to `/credits`; top nav unchanged.
- **Refs:** `RESPONSIVE-SPEC.md §5 checklist`; footers in all five `*.dc.html` references.

---

## Milestone: M-About/Résumé — "About page as online résumé"

> Reference: `probl.me About.dc.html`, `README.md` (Screens §4).

### A-1 · Experience / résumé section — **M**
- **Description:** Below the intro/story, add the PM experience section: a 4-up **metric stat band** ($859M Sophos · $1.5B BlackBerry · 100% 2024 MITRE · 20× CylancePROTECT), a reverse-chronological **role timeline** (mono date rail + nodes; 6 roles ReversingLabs→Cylance/BlackBerry, one-line summary + amber metric chips), a **core-competencies** mono tag row, and a CTA (Download résumé PDF + LinkedIn). Content is final in the prototype.
- **Acceptance:** Matches the prototype on desktop and reflows per `RESPONSIVE-SPEC.md §3.4` (stat band 4→2 col, timeline date-rail → single column on mobile).
- **Refs:** `probl.me About.dc.html`; `README.md §4`.

### A-2 · Intro + story sticky-card layout — **S**
- **Description:** Top of About is a single narrative column (intro + bio + "Why this blog exists" + "What I'm building now") on the left, with the business card in a right column set `position:sticky; top:96px`. Collapses to single column (card below, sticky off) at ≤1023px.
- **Acceptance:** No empty gap beside the intro on desktop; card tracks the narrative; stacks cleanly on tablet/mobile.
- **Refs:** `probl.me About.dc.html`; `RESPONSIVE-SPEC.md §3.4`.

### A-3 · Résumé PDF asset + download wiring — **S** *(blocked: needs the file)*
- **Description:** The About CTA links to `assets/Richard-Robitaille-Muffler-Resume.pdf`. Wire the link and place the PDF in the assets/public path once Richard provides it.
- **Acceptance:** Download button serves the current résumé PDF.
- **Blocker:** **Richard to supply the PDF.** Until then, keep the button wired to the path (or hide behind a flag).

---

## Cross-cutting acceptance (applies to all of the above)
- Dark-mode only; Workshop palette + Hanken Grotesk / JetBrains Mono only (no new fonts/colors).
- WCAG 2.1 AA carries forward at every breakpoint: ≥44px targets, amber focus rings, AA contrast, descriptive alt text (`README.md §Accessibility`).
- Verify against the prototypes at **1280 / 768 / 390px** — they reflow live at those widths.

## Open decisions for Richard / PM to confirm
- **Résumé PDF** — source file (A-3 blocker).
- **About "what I write about" strip** — currently duplicated from the homepage; optional to drop from About to shorten the page (design can trim on request).
- **Spectra Assure in notices file** — whether to add it to `THIRD-PARTY-NOTICES.md` so it's agent-tracked (see C-2 note).
