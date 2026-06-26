# probl.me — Responsive Spec (Tablet + Mobile)

> **File:** `RESPONSIVE-SPEC.md`
> **Purpose:** Adds the responsive layer to the four page designs. Read alongside `DESIGN-BRIEF.md` and `BRAND.md`. The desktop layouts in the `*.dc.html` prototypes are unchanged; this document defines how each page reflows below desktop.
> **Status:** The four prototypes (`probl.me Homepage / Blog Listing / Blog Post / About`) now implement everything below — **resize the browser to see each breakpoint live.** Lift exact values from here and from the prototypes; they agree.

---

## 0. Why this exists

The original handoff shipped **desktop-only** comps: every layout used fixed multi-column grids (`1.25fr 0.9fr` heroes, `repeat(3,1fr)` card rows, `1.1fr 1fr` featured card) at a 1120px max-width with 32px gutters, and the only `@media` query was `prefers-reduced-motion`. On a phone the desktop layout just shrinks/overflows. This spec defines the tablet and mobile layouts so the site can be built pixel-perfect at every width.

---

## 1. Breakpoints

Mobile-first is fine to author, but the design is specified as three bands:

| Band | Range | Notes |
|---|---|---|
| **Desktop** | `≥ 1024px` | The existing comps, unchanged. Max content width `1120px`. |
| **Tablet** | `640px – 1023px` | `@media (max-width: 1023px)`. Heroes stack; 3-col grids → 2-col; featured card → stacked. |
| **Mobile** | `≤ 639px` | `@media (max-width: 639px)`. Single column everywhere; hamburger nav; reduced type + gutters. |

Two query lines cover it:
```css
@media (max-width: 1023px) { /* tablet and below */ }
@media (max-width: 639px)  { /* mobile only */ }
```
In Astro/Tailwind terms: desktop = `lg:` and up, tablet = the default below `lg`, mobile = below `sm` (`sm` = 640px). The prototypes use plain `@media`; match those exact pixel values.

---

## 2. Global rules (all pages)

### 2.1 Gutters (horizontal padding)
| Container | Desktop | Tablet | Mobile |
|---|---|---|---|
| `1120px` content wrap (`.wrap`) | 32px | 24px | 20px |
| Reading column `680px` / hero image `920px` (`.col`) | 24px | 24px | 20px |

Vertical section padding is unchanged at tablet; on mobile, hero/section top padding drops (see per-page). Reading-column body width still caps at **680px (~65ch)** — it just gains full width with 20px gutters on small screens.

### 2.2 Header → mobile nav
- **Desktop + tablet (`≥640px`):** unchanged — logo left, full mono nav row right (`home / blog / about / github ↗`), active link amber.
- **Mobile (`≤639px`):** hide the inline nav; show a **44×44px hamburger button** on the right (1px `#3D3322` border, radius 8px, three 18×2px `#B6A88F` bars). Tapping it opens a **full-width dropdown** below the header:
  - Panel: `background #1C1812`, 1px `#2E261B` top border.
  - Each link: `display:block`, padding `15px 20px` (≥44px tall), JetBrains Mono 14px, 1px `#2E261B` divider between rows, last row no divider.
  - Active link amber `#F2A24B`; others `#B6A88F`. Hover/active row tint `#241E15`, text → `#F4EFE6`.
- **Prototype note:** the comps toggle the menu with a CSS checkbox hack (no JS) purely so the reference works offline. **In production, build it as a `<button aria-expanded="true|false" aria-controls="mobile-nav">` with a few lines of JS** (toggle a class, trap nothing, close on link click / Escape), progressively enhanced so it still works without JS. Keep the visual spec above exactly.
- Logo wordmark: 20px desktop → may drop to 18px on very narrow screens; the blinking cursor stays.

### 2.3 Footer
- Desktop/tablet: logo+tagline left, mono nav + `© 2026` right (already `flex-wrap`).
- Mobile: **stack** — `flex-direction:column; align-items:flex-start; gap:20px`. Nav links wrap to a row beneath the logo block.

### 2.4 Type scale — mobile steps
Only headings step down on mobile; body stays for readability.

| Role | Desktop | Mobile (`≤639px`) |
|---|---|---|
| Display (homepage hero H1) | 56px / lh 1.05 | **34px / lh 1.1** |
| Page/article H1 | 40px / lh 1.12 | **30px / lh 1.15** |
| About H1 | 44px | **32px** |
| Featured card title | 30px | **24px** |
| H2 | 26px | **22px** |
| H3 | 20px | **18px** |
| Body Large (article) | 18px / lh 1.75 | 18px *(unchanged)* |
| Blockquote | 20px | **18px** |
| Body / meta / mono labels | unchanged | unchanged |

Tablet keeps desktop type sizes (the single-column width is wide enough); only the layout reflows.

### 2.5 Motion on touch
- The **3D-tilt business card** is pointer-driven, so it's naturally static on touch — but explicitly **disable the tilt + hover transforms at `≤1023px` / on coarse pointers** (`@media (pointer: coarse)` or the touch check) so there's no stuck hover state. Card renders flat with its resting shadow.
- Card-hover lift, icon-strip pop, and link hovers are desktop niceties; keep tap states instant on mobile.
- `prefers-reduced-motion` still freezes the marquee and drops the cursor blink everywhere.

---

## 3. Per-page reflow

### 3.1 Homepage
- **Hero:** desktop 2-col `1.25fr 0.9fr`, gap 64 → **tablet & mobile: single column**, text block first, business card below. Tablet gap 40, card capped at `max-width:440px`. Mobile gap 32, card full width, hero top padding 88→48. Display headline 56→34. The two CTA buttons stay side-by-side (they fit ≥360px); let them wrap if narrower.
- **Icon strip:** unchanged behavior at all widths (marquee, pauses on hover). Eyebrow gutter follows `.wrap`. Fine as-is on mobile.
- **Latest:** card grid `repeat(3,1fr)` → **tablet 2-col → mobile 1-col**; gap 22→16 on mobile. Section top padding 80→48. The "Fresh from the workbench / all posts →" header row may wrap on mobile.

### 3.2 Blog Listing
- **Page head + filter pills:** filter row already `flex-wrap`; pills wrap to multiple rows on mobile. H1 40→30.
- **Featured card:** desktop 2-col `1.1fr 1fr` (image left) → **tablet & mobile: single column, image on top**. Image `min-height` 280→240 (tablet) / 200 (mobile); text padding 40→24 on mobile; featured title 30→24.
- **Post grid:** `repeat(3,1fr)` → **tablet 2-col → mobile 1-col**, gap 22→16.
- **Empty state / load-more:** unchanged; full-width, centered.

### 3.3 Blog Post
- **Reading column (680px) and hero image (920px):** gutters → 24/20 per `.col`. H1 40→30.
- **Hero image:** height 360 → **300 tablet / 220 mobile** (keep `object-fit:cover`, radius 14, 1px border).
- **Body:** 18px/1.75 unchanged; H2 26→22, H3 20→18, blockquote 20→18. Code block keeps `overflow-x:auto` (already correct — long lines scroll horizontally inside the block, never break the page).
- **Author card:** desktop = avatar + text + `about →` button in a row. **Mobile: allow wrap; the `about →` button goes full-width below** the avatar/text.
- **Prev/Next:** desktop `1fr 1fr` → **tablet 2-col → mobile single column** (cards stack; "next" card keeps right-aligned text).
- **Tags:** already `flex-wrap`; fine.

### 3.4 About
- **Intro + story:** desktop 2-col `1.5fr 0.82fr` — a single narrative column (intro + bio + story) on the left, **sticky business card** (`position:sticky; top:96px`) on the right — → **tablet & mobile single column**, narrative first, card below with sticky disabled (`.about-card-sticky{ position:static }`). About H1 44→32.
- **Experience / résumé section** (820px column):
  - **Stat band** — desktop `repeat(4,1fr)` with vertical dividers → **mobile `repeat(2,1fr)`**; drop the inner `border-right` and use uniform `18px 14px` padding on mobile (`.stat-band` / `.stat-band > div`).
  - **Role timeline** — desktop `grid-template-columns:150px 1fr` (date rail + bordered content) → **mobile single column** (`.role-rail` → `1fr`): the era label sits above the role, the left border + node rail stays, body padding 24→18. Section H2 30→24 (`.d-h2-xp`).
  - **Competency tags + CTA** — already `flex-wrap`; the two CTA buttons wrap on narrow screens.
- **"What I write about" strip:** unchanged marquee.
- **CTA:** centered, 680px column; two buttons stay centered, wrap if needed; H2 26→22.

### 3.5 Credits & Thanks
- Single centered column (`max-width:900px`, `.col` gutters 32→24→20). H1 40→30 on mobile.
- **Manifest rows** (`.lrow`): desktop = name (`flex:0 0 210px`) · purpose (`flex:1`) · license badge · source link on one line. **Mobile (≤639px):** the row's inner flex wraps — `.lname` and `.ldesc` go `flex:1 1 100%` (each on its own line), with the license badge + source link sharing the line beneath. No horizontal scroll.
- Category headers, hover tint, and footnote are width-agnostic.

---

## 4. Accessibility carries forward
Everything in `DESIGN-BRIEF.md §6` and the handoff README still holds at every breakpoint: **≥44×44px hit targets** (the hamburger and every mobile-menu row are sized for this), visible amber focus rings, AA contrast (the palette is unchanged so all verified ratios hold), descriptive alt text, never color-only signaling. The hamburger button must expose `aria-expanded` and label ("Open menu" / "Close menu").

---

## 5. Implementation checklist for Claude Code
- [ ] Add the two `@media` breakpoints (1023 / 639) to the global stylesheet / layout.
- [ ] Header: build the real `<button>`-based mobile menu (aria-expanded, JS toggle, closes on navigate/Escape), matching the panel spec in §2.2.
- [ ] Make the hero, featured card, and every card grid collapse per §3 (CSS grid `grid-template-columns` swaps, not display hacks).
- [ ] About experience: stat band 4→2 col; role timeline date-rail → single column (§3.4). Credits: manifest rows wrap name/purpose full-width with badge+link beneath (§3.5).
- [ ] Step heading type down on mobile per §2.4; keep body at 18px.
- [ ] Gate the business-card tilt behind `prefers-reduced-motion: no-preference` **and** a fine-pointer check; render flat on touch.
- [ ] Reduce gutters (32→24→20) and the hero/section top paddings on small screens.
- [ ] Stack the footer on mobile.
- [ ] Test at 1280 / 768 / 390px against the prototypes — they reflow live at those widths.

---

*Created June 2026 — responsive addendum to DESIGN-BRIEF.md (System A · Workshop), for Richard.*
