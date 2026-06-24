# probl.me — Design Brief (System A: Workshop)

> **File:** `DESIGN-BRIEF.md`
> **Purpose:** Expands `BRAND.md` into a complete, build-ready visual brief. This is the source of truth for the visual layer of probl.me.
> **Direction:** **System A — Workshop.** Chosen by Richard from three explored directions (June 2026).
> **Authority:** Read alongside `BRAND.md` at the start of every design or code session. Where this brief and the original `BRAND.md` token tables disagree, **this brief wins** — see §0.

---

## 0. What changed from the original BRAND.md

The original `BRAND.md` documented a cool blue/teal-on-slate palette with Inter. The chosen direction keeps every *principle* of BRAND.md (dark-mode-first, warm + technical personality, JetBrains Mono, accessibility floor, SVG icons) but moves the palette to **warm charcoal + amber/terracotta** and the body face to **Hanken Grotesk**. Per BRAND.md's own invariants (#2 "add new colors to the document first", #3 "no new fonts without updating the document"), update `BRAND.md` to match the tokens below before shipping code.

| Token | Old (BRAND.md) | New (this brief) |
|---|---|---|
| Background | `#0F1117` (cool slate) | `#15120E` (warm charcoal) |
| Surface | `#1A1D27` | `#1C1812` |
| Border | `#2E3147` | `#2E261B` |
| Text primary | `#F1F5F9` | `#F4EFE6` (warm off-white) |
| Text secondary | `#94A3B8` | `#B6A88F` |
| Primary accent | `#38BDF8` (blue) | `#F2A24B` (amber) |
| Secondary accent | `#2DD4BF` (teal) | `#E8674A` (terracotta) |
| Body font | Inter | Hanken Grotesk |
| Mono font | JetBrains Mono | JetBrains Mono *(unchanged)* |

Everything else in BRAND.md (Sections 5–9: component standards, image standards, dark mode rule, accessibility, invariants) carries forward unchanged except for the color/font values.

---

## 1. Personality, in one paragraph

probl.me is a **maker's workbench**, not a corporate publication. Warm and human first: comfortable to read, honest about mistakes, written by a real person. Technically credible second: monospace does the brand talking, the layout is precise, nothing is decorative for its own sake. The one bit of swagger is the terminal-prompt logo and the mono accents — small signals that a builder lives here. Approachable enough that a non-technical reader curious about AI feels welcome; sharp enough that an employer or client is impressed.

**Voice cues for the visual layer:** lived-in, not slick. Crisp, not cold. Confident, not loud.

---

## 2. Color System

### 2.1 Core tokens

```css
:root {
  /* Surfaces — warm charcoal */
  --color-bg:            #15120E;  /* page background */
  --color-surface:       #1C1812;  /* cards, elevated surfaces */
  --color-surface-alt:   #241E15;  /* hover / subtle distinction */
  --color-border:        #2E261B;  /* card borders, dividers */
  --color-border-strong: #3D3322;  /* focused / emphasized borders */

  /* Text — warm off-white ramp */
  --color-text-primary:   #F4EFE6; /* body + headings */
  --color-text-secondary: #B6A88F; /* meta, captions, descriptions */
  --color-text-muted:     #8A7B64; /* labels, disabled, timestamps */

  /* Accents — warm */
  --color-amber:      #F2A24B;  /* PRIMARY: links, CTAs, active, prompt */
  --color-terracotta: #E8674A;  /* SECONDARY: highlights, cursor, hovers */
  --color-olive:      #9DB066;  /* TERTIARY: third category, fresh contrast */

  /* Functional — warm-shifted */
  --color-success: #7FB069;  /* positive */
  --color-warning: #E8B04B;  /* caution (distinct from amber accent) */
  --color-danger:  #D64933;  /* error (distinct from terracotta) */
}
```

### 2.2 Category colors (one per content pillar)

| Category | Color | Token |
|---|---|---|
| `pm-craft` | Amber | `--color-amber` `#F2A24B` |
| `ai-development` | Terracotta | `--color-terracotta` `#E8674A` |
| `tech-tools` | Olive | `--color-olive` `#9DB066` |

Category badges are pills. Default style: tinted text on a faint same-hue background (`color: <hue>; background: <hue>/12%`). Never rely on color alone — the badge always carries the category text (BRAND.md invariant #6-adjacent, accessibility §6).

### 2.3 Contrast (WCAG 2.1 AA — re-verified for the warm palette)

- `#F4EFE6` on `#15120E` = **16.1:1** ✅ (body text)
- `#B6A88F` on `#15120E` = **8.0:1** ✅ (secondary)
- `#8A7B64` on `#15120E` = **4.6:1** ✅ (muted — body-size minimum met)
- `#F2A24B` on `#15120E` = **8.9:1** ✅ (amber links)
- `#E8674A` on `#15120E` = **5.0:1** ✅ (terracotta — fine for text + large)
- Pill text `#9DB066` on `#15120E` = **7.4:1** ✅

Always re-check any new combination before shipping. AA is the floor.

---

## 3. Typography

### 3.1 Stack

| Role | Font | Weights | Fallback |
|---|---|---|---|
| **Headings / Display** | Hanken Grotesk | 700, 800 | system-ui, sans-serif |
| **Body / UI** | Hanken Grotesk | 400, 500, 600 | system-ui, sans-serif |
| **Brand / labels / code** | JetBrains Mono | 400, 500, 600 | ui-monospace, monospace |

Both are open-source (Google Fonts / Bunny Fonts). Hanken Grotesk is a warm humanist grotesque — friendly and highly readable. JetBrains Mono carries the brand: the logo, eyebrow labels, category tags, meta lines, and all code.

### 3.2 The monospace signature

Monospace is the brand's tell. Use it for, and **only** for:
- The logo / wordmark
- Eyebrow labels (uppercase, letter-spacing `0.14em`, `#8A7B64`)
- Category tags and meta lines (`// category · 6 min read`, dates, read-time)
- Inline code and code blocks

Do not set body copy or headings in mono. Overusing it kills the signal.

### 3.3 Type scale

| Name | Size | Weight | Line height | Letter-spacing | Usage |
|---|---|---|---|---|---|
| Display | 56px / 3.5rem | 800 | 1.05 | -0.025em | Homepage hero |
| H1 | 40px / 2.5rem | 800 | 1.12 | -0.02em | Page + article titles |
| H2 | 26px / 1.625rem | 700 | 1.25 | -0.015em | Section headings |
| H3 | 20px / 1.25rem | 700 | 1.35 | -0.01em | Sub-sections |
| Body Large | 18px / 1.125rem | 400 | 1.75 | 0 | Article body |
| Body | 16px / 1rem | 400 | 1.6 | 0 | UI, descriptions |
| Small | 14px / 0.875rem | 500 | 1.5 | 0 | Captions, secondary meta |
| Label (mono) | 11–12px | 500 | 1.4 | 0.14em (caps) | Eyebrows, tags |
| Code | 14px | 400 | 1.65 | 0 | Inline + blocks |

### 3.4 Reading width

Article body constrained to **65ch** (~680px). Never wider. Headings inside an article may break the column for emphasis but body text never does.

---

## 4. Logo

### 4.1 Concept

A terminal prompt. `>` is the shell prompt (amber), `probl` is the command, `.me` is terracotta, and a solid block **cursor** blinks after it. The read is literal — *working through the problem at the prompt* — and ownable. Files live in `assets/logo/`.

### 4.2 Assets

| File | Use |
|---|---|
| `logo-full.svg` | Primary lockup: `>_` mark + `probl.me` wordmark. Header, footer, OG. |
| `logo-wordmark.svg` | Wordmark only, where the mark is redundant. |
| `logo-mark.svg` | The `>_` prompt glyph alone. Inline, small spaces. |
| `logo-mark-tile.svg` | Rounded charcoal tile with the glyph. Favicon / app icon / avatars. |

### 4.3 Rules

- The blinking cursor (`@keyframes blink`, 1.1s `steps(1)`) is a **live-site** flourish on the in-page logo only. Static exports (OG, favicon) use no cursor or a static block.
- Minimum wordmark height: 22px. Below that, use `logo-mark` only.
- Clear space around the lockup ≥ the cap height of the wordmark on all sides.
- Never recolor the wordmark. `.me` is always terracotta; the prompt is always amber.
- Never set the wordmark in anything but JetBrains Mono.

---

## 5. Iconography

8 content-pillar icons in `assets/icons/`, drawn to one system:

- **Grid:** 24×24 viewBox, exported at 48×48.
- **Style:** line / outline. `fill: none`, `stroke-width: 1.6`, round caps + joins.
- **Two-tone:** primary stroke amber `#F2A24B`; one secondary element per icon in terracotta `#E8674A` to give each a focal point. No third color inside an icon.
- **Set:** `pm-craft` (kanban), `ai-development` (chip), `tech-tools` (layers), `astro` (rocket), `github` (git-branch — original, not the trademarked octocat), `security` (shield + check), `building-in-public` (tower crane), `celly` (grid cell).
- On surfaces, icons sit in a `#1C1812` tile with a `#2E261B` border; transparent background also valid.
- New icons must match weight, caps, corner radii, and the single-terracotta-accent rule.

> **Note on Celly:** drawn as a highlighted grid cell (reads as both "cell" and a software/spreadsheet tile). If Celly has its own mark or a more specific metaphor, swap it and keep the system.

---

## 6. Components

### 6.1 Depth philosophy — flat & crisp

System A is **flat**: surfaces are separated by a 1px `#2E261B` border and a one-step background lift (`#15120E` → `#1C1812`), not by soft shadows. This keeps the warm palette clean and modern and avoids dated neumorphism. Reserve real elevation for two cases only:
- **Hover lift:** `transform: translateY(-2px)` + border brightens to `#3D3322` + a low, warm shadow `0 8px 24px rgba(0,0,0,0.35)`.
- **The business card** (§6.4) may carry one subtle warm drop-shadow as its single moment of depth.

### 6.2 Article card

- Background `#1C1812`, 1px `#2E261B` border, radius `12px`.
- Contents: hero thumbnail, category pill, title (Hanken 700), description excerpt (`#B6A88F`), and a mono meta line (date · read-time).
- Hover: lift + border → amber `#F2A24B`, title → `#F4EFE6`. Whole card is the link target (≥44px, invariant #5).

### 6.3 Category pill

- Mono, 11px, radius `999px`, padding `3px 10px`.
- `color: <category hue>`, `background: <category hue> @ 12%`. Always includes the category text.

### 6.4 Business card (neumorphism, restrained)

Richard's digital business card, on homepage + About.
- Radius `16px`, `#1C1812` on `#15120E`, 1px `#2E261B` border.
- One soft warm shadow for presence: `0 10px 30px rgba(0,0,0,0.4)`. No inset/pressed neumorphism.
- Amber `#F2A24B` divider line. Hover: `translateY(-2px)` + slightly deeper shadow.
- Contents per BRAND.md §5: avatar (optional), name **Richard Muffler**, short title, current focus (probl.me + Celly), links (GitHub `rustymuffler`, LinkedIn, probl.me).
- Desktop ~360×220px, responsive down.

### 6.5 Scrolling icon strip

- The 8 pillar icons + labels, continuous slow left scroll, **pauses on hover**.
- Strip height 80px; icon (48px) above a mono 14px `#B6A88F` label.
- Respect `prefers-reduced-motion`: freeze the strip and let it scroll manually.

### 6.6 Code block

- Background `#161310` (one notch off page bg), radius `10px`, 1px `#2E261B` border.
- JetBrains Mono 14px. Syntax theme: a warm dark scheme (e.g. Shiki `material-theme-palenight` or a custom warm map). Copy button top-right, mono label.
- Inline code: `#241E15` background, `#F2A24B` text, `2px 6px` padding, radius `5px`.

### 6.7 Buttons & links

- **Primary CTA:** amber `#F2A24B` background, `#15120E` text, radius `10px`, weight 600. Hover: `#F4B468`.
- **Secondary:** transparent, 1px `#3D3322` border, `#F4EFE6` text. Hover: border amber.
- **Inline links:** amber, underline on hover. Visited never dimmed below AA.
- **Focus ring (all interactive):** `2px solid #F2A24B`, `2px` offset. Required (accessibility, invariant adjacent).

---

## 7. Layout & spacing

- **Grid:** max content width `1120px`; article reading column `680px` (65ch) centered.
- **Spacing scale (8px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Use these, not arbitrary values.
- **Section rhythm:** 96px between major homepage sections on desktop, 64px on mobile.
- **Header:** sticky, `#15120E` at 85% opacity + backdrop blur, 1px bottom border on scroll. Logo left, nav right (mono labels), all hit targets ≥44px.
- **Footer:** mono, muted. Logo, nav repeat, social links, `© probl.me`, build-in-public note.

---

## 8. Motion

Motion is small and purposeful. Warm, never bouncy.
- **Durations:** 150ms (hover/state), 250ms (card lift, reveals).
- **Easing:** `cubic-bezier(0.2, 0, 0, 1)` for entrances; `ease` for hovers.
- **Signature moments:** the logo cursor blink; the icon strip scroll; card hover lift.
- **Reduced motion:** honor `prefers-reduced-motion` everywhere — freeze the strip, drop the blink, keep instant state changes.

---

## 9. Imagery (carries BRAND.md §6)

- **Hero / OG:** 1200×630px. Abstract/conceptual on the warm dark palette with amber/terracotta accents — never stock-photo clichés. Frontmatter `imageCredit: "AI-generated with Claude"`.
- **In-article:** every image must add information. Diagrams use the warm palette + clear labels. Light screenshots get a 1px `#2E261B` frame. Descriptive alt text always (invariant #6).
- **Placeholders during design:** diagonal warm-stripe block (`#241E15` on `#1C1812`) with a mono caption of what belongs there.

---

## 10. Page-level direction

- **Homepage:** prompt-logo hero with the tagline (Display) + a one-line "who I am"; the business card as a warm focal object; the scrolling icon strip for pillars; latest 3 articles in a card row. Hierarchy: identity → proof (pillars) → latest writing.
- **Blog listing:** category filter row (mono pills), responsive 2–3 col card grid, the featured/newest post optionally spanning full width.
- **Blog post:** 680px reading column, mono meta header under an H1, generous body leading (1.75), warm code blocks, an author footer reusing the business card, prev/next links.
- **About:** business card up top, then long-form story in the reading column, the icon strip as a "what I write about" band, and contact links.

All four pages: dark-mode only, sticky mono header, 44px hit targets, visible amber focus rings, descriptive alt text. AA is the floor.

---

## 11. Invariants (extends BRAND.md §9)

1. **Dark mode always.** Warm charcoal base. No light mode until explicitly built.
2. **Warm palette only.** Tokens in §2. New colors get added here first.
3. **Hanken Grotesk + JetBrains Mono only.** No third family without updating this brief + Richard's approval.
4. **Mono is a signature, not body text.** Logo, labels, tags, meta, code — nothing else.
5. **Flat & crisp.** Borders and bg-lift for separation; depth reserved for hover + the business card.
6. **AA is the floor.** Re-check contrast on every new combination.
7. **44×44px hit targets, visible amber focus rings, descriptive alt text on every image, SVG-only icons.**

---

*Created June 2026 — System A (Workshop), expanding BRAND.md. Author: Image Creator Agent (Claude Cowork), for Richard.*
