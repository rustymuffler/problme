# Handoff: probl.me Blog Site

## Overview
This package contains the complete visual design system and pixel-level page designs for **probl.me** — a personal blog about product craft, building with AI, and the stack behind the site. The goal of the build session is to implement these designs as a real, deployable **Astro static site** (hosted on GitHub Pages) in the `rustymuffler/problme` repository.

The blog's content is produced by a pipeline of scheduled Claude agents (see the repo's `AGENTS.md`). This handoff covers the **visual/front-end layer only** — the look, layout, components, and interactions.

## About the Design Files
The files in this bundle (`*.dc.html`) are **design references created in HTML** — high-fidelity prototypes that show the intended look and behavior. **They are not production code to copy verbatim.** They use a small custom rendering runtime (`support.js`) for live-preview purposes only; do **not** port that runtime.

Your task is to **recreate these designs in Astro** using its native `.astro` components, layouts, content collections, and scoped styles — following the patterns already established in the `problme` repo (read `AGENTS.md` and any existing `src/` first). Lift the exact values (hex, spacing, type, radii) from `DESIGN-BRIEF.md` and the prototypes.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, and interactions are final. Recreate the UI pixel-perfectly. The canonical token reference is **`DESIGN-BRIEF.md`** (full visual brief) and **`BRAND.md`** (brand system); where they differ, `DESIGN-BRIEF.md` §0 explains the merge and wins.

---

## Design Tokens

### Color (dark-mode only — "Workshop" palette)
```
--color-bg:            #15120E   /* page background (warm charcoal) */
--color-surface:       #1C1812   /* cards, elevated surfaces */
--color-surface-alt:   #241E15   /* hover / subtle distinction */
--color-border:        #2E261B   /* card borders, dividers */
--color-border-strong: #3D3322   /* focused / emphasized borders */
--color-text-primary:   #F4EFE6  /* body + headings (warm off-white) */
--color-text-secondary: #B6A88F  /* meta, captions, descriptions */
--color-text-muted:     #8A7B64  /* labels, timestamps */
--color-amber:      #F2A24B      /* PRIMARY accent: links, CTAs, active, prompt */
--color-terracotta: #E8674A      /* SECONDARY accent: highlights, cursor, .me */
--color-olive:      #9DB066      /* TERTIARY accent: third category */
--color-success: #7FB069  --color-warning: #E8B04B  --color-danger: #D64933
```

### Category → color
- `pm-craft` → amber `#F2A24B`
- `ai-development` → terracotta `#E8674A`
- `tech-tools` → olive `#9DB066`
Badge style: `color: <hue>; background: <hue> @ 12% opacity`, pill radius `999px`, mono 11px. Always include the category text (never color alone).

### Typography
- **Headings/Display & Body/UI:** Hanken Grotesk (400/500/600/700/800)
- **Brand / labels / code:** JetBrains Mono (400/500/600) — the signature face
- Both via Google Fonts / Bunny Fonts.
- **Monospace is reserved** for: logo, eyebrow labels (uppercase, `letter-spacing:0.14em`), category tags, meta lines (`date · read-time`), and code. **Never** body or headings.

Scale (size / weight / line-height / tracking):
```
Display  56px / 800 / 1.05  / -0.025em   (homepage hero)
H1       40px / 800 / 1.12  / -0.02em    (page + article titles)
H2       26px / 700 / 1.25  / -0.015em
H3       20px / 700 / 1.35  / -0.01em
Body Lg  18px / 400 / 1.75  / 0          (article body)
Body     16px / 400 / 1.60  / 0
Small    14px / 500 / 1.50  / 0
Label    11–12px / 500 / 1.4 / 0.14em    (mono, uppercase)
Code     14px / 400 / 1.65  / 0
```
Article reading column: **680px (~65ch)**, centered. Content max width: **1120px**.

### Spacing scale (8px base)
`4, 8, 12, 16, 24, 32, 48, 64, 96`. Section rhythm: 96px desktop / 64px mobile.

### Radius & depth
- Radius: cards `12px`, business card / feature `14–16px`, pills `999px`, buttons `10px`, code `10px`, inline code `5px`.
- **Flat & crisp by default:** separate surfaces with a 1px `#2E261B` border + one bg step (`#15120E`→`#1C1812`). No ambient neumorphism.
- Card hover lift: `translateY(-2px)` + border→`#F2A24B` + `box-shadow:0 8px 24px rgba(0,0,0,0.35)`.
- Business-card 3D tilt shadow (resting): `0 32px 64px -22px rgba(0,0,0,0.78), 0 4px 14px rgba(0,0,0,0.4)`.

---

## Screens / Views

> Pixel-level markup for every element is in the matching `*.dc.html` file. Summaries below; read the file for exact values.

### 1. Homepage — `probl.me Homepage.dc.html`
- **Sticky header** (all pages): `rgba(21,18,14,0.85)` + `backdrop-filter:blur(12px)`, 1px bottom border. Left: logo lockup. Right: mono nav (`home / blog / about`) + a bordered `github ↗` button. Active link is amber. Hit targets ≥44px.
- **Hero** (2-col grid `1.25fr / 0.9fr`, gap 64px): left = mono eyebrow `// building in public`, Display headline "Building in public. / One **problem** at a time." (the word "problem" amber), 18px secondary intro, two buttons (primary amber CTA + secondary outline). Right = the **3D business card**.
- **Icon strip** (full-bleed band, bg `#181410`, 1px top/bottom border): mono eyebrow `// what I write about · click a topic`; a continuously left-scrolling marquee of the 8 pillar icons (44px) above mono labels. **Pauses on hover.** Each icon links to `/blog?tag=<slug>` and "pops" (scale + slight rotate) on hover.
- **Latest** (max 1120px): section head + `all posts →`; 3-up card grid of article cards (OG hero image, category pill, H3 title, excerpt, mono meta).
- **Footer** (all pages): logo + tagline left; mono nav + `© 2026` right.

### 2. Blog Listing — `probl.me Blog Listing.dc.html`
- Page head: mono eyebrow `// the blog`, H1, intro.
- **Filter pills** (mono): `all / pm-craft / ai-development / tech-tools`. Active pill = filled in its category color with `#15120E` text; others outlined.
- **Filtering is URL-driven** via `?tag=<slug>` (see Interactions). When unfiltered: a full-width **featured** card (2-col) for the newest post + a 3-up grid of the rest + a "load older posts" affordance. When filtered: heading becomes "Tagged <tag>" with a count and "clear filter ×"; featured + load-more hide; grid shows only matching posts; an **empty state** (dashed border) appears for tags with no posts.
- A post matches a tag if `post.category === tag` OR `post.tags` includes it.

### 3. Blog Post — `probl.me Blog Post.dc.html`
- `← all posts` back link; category pill; H1; mono byline row (`author | date | read-time`).
- Full-width hero image (max 920px, radius 14px), then the **680px reading column**: body at 18px/1.75, H2/H3, a left-amber-border **blockquote**, **code block** (header bar with filename + copy button, body bg `#161310`, warm syntax), inline code (`#241E15` bg, amber text). Article links: amber with a faint underline that solidifies on hover.
- Tag chips; **author card** (reuses business-card styling with the photo); prev/next nav cards.

### 4. About — `probl.me About.dc.html`
- Intro (2-col): left = eyebrow `// about`, H1 "Hi, I'm Richard. / I build in public.", bio paragraph. Right = the **3D business card** (photo portrait variant + name/title + github/linkedin/email link rows).
- Long-form story in the 680px column (H2 + body). Then the **icon strip** band ("what I write about"). Then a centered CTA ("Read along, or reach out") with two buttons.

### Reference sheet (not a site page)
- `probl.me Brand Assets.dc.html` — logo lockups, the 8 icons, and the palette, for quick visual reference.

---

## Interactions & Behavior

- **Header:** sticky, translucent, blur. Nav links brighten to `#F4EFE6` on hover; active = amber.
- **Logo cursor:** a solid amber block after `probl.me` blinks (`@keyframes blink`, `1.1s steps(1) infinite`) in header + footer. Static (no blink) in any exported/OG/favicon use.
- **Cards:** hover lift + border→amber + title→`#F4EFE6`; whole card is one link.
- **Icon strip:** CSS marquee (duplicated track, `translateX(-50%)`), pauses on `:hover` of the strip; each item links to its filtered list and animates (scale ~1.14 + brief rotate) on hover.
- **3D business card:** on `mousemove`, compute pointer offset from center and apply `perspective(1100px) rotateX/rotateY` (~±16–17°) + `translateY(-8px) scale(1.03)`, deepen the shadow, and move a radial-gradient **glare** highlight to the pointer. Reset on `mouseleave`. Inner blocks use `translateZ` (25–55px) for parallax depth. **Gate the whole effect behind `prefers-reduced-motion: no-preference`.**
- **Tag filtering (important):** drive it entirely from the URL query `?tag=<slug>`, read at render — in Astro this is natural (SSG can pre-render `/blog` + `/blog/tag/<slug>` routes, or read `Astro.url.searchParams`). Filter links are real `<a href>`. This keeps filters shareable, SSR/SSG-friendly, and working without JS. *(In the HTML prototype, an attempt at in-place SPA re-render exposed a runtime limitation where list items didn't re-style on update — the URL-driven approach is the correct pattern here and what the prototype now uses; you won't hit that issue in Astro.)*
- **Buttons/links:** primary CTA hover `#F2A24B`→`#F4B468`; secondary/outline hover border→amber; link/card hover transitions ~150–250ms, easing `cubic-bezier(0.2,0,0,1)`.
- **Reduced motion:** honor `prefers-reduced-motion` everywhere — freeze the marquee, drop the cursor blink, disable the tilt, keep state changes instant.

## State / Data
- Content as Astro **content collections** (Markdown/MDX): frontmatter `title, description, category (pm-craft|ai-development|tech-tools), tags[], date, readTime, heroImage, imageCredit`.
- Listing: derive featured (newest) + the grid; filter by `category`/`tags` from the URL.
- No client state framework needed. The only JS is: the marquee (CSS), the 3D tilt (a few lines, progressively enhanced), and the code-block copy button.

## Accessibility (floor = WCAG 2.1 AA)
- Verified contrasts (on `#15120E`): text `#F4EFE6` 16.1:1; secondary `#B6A88F` 8.0:1; amber `#F2A24B` 8.9:1; terracotta `#E8674A` 5.0:1. Re-check any new combo.
- ≥44×44px hit targets; visible amber focus ring (`2px solid #F2A24B`, 2px offset) on every interactive element; descriptive `alt` on every image; icons as SVG; never color-only signaling.

---

## Assets (in `./assets/`)
- `logo/` — `logo-full.svg`, `logo-wordmark.svg`, `logo-mark.svg` (the `>_` glyph), `logo-mark-tile.svg` (favicon tile). Logo concept = a terminal prompt; `.me` always terracotta, prompt always amber, JetBrains Mono only.
- `icons/` — 8 pillar icons. Original line/two-tone (amber + one terracotta accent): `pm-craft.svg` (compass), `ai-development.svg` (chip), `tech-tools.svg` (layers), `security.svg` (shield+check), `building-in-public.svg` (eye). **Real third-party/product marks** (use as-is for attribution): `github.svg` (octocat), `astro.svg` (official rocket, red→purple gradient), `celly.png` (Celly logo, 180×180 — doubles as an apple-touch-icon).
- `og/` — 1200×630 hero/OG **placeholders** (`hero-pipeline.svg`, `hero-pm-skill.svg`, `hero-astro.svg`, `og-default.svg`). Replace with AI-generated heroes (`imageCredit: "AI-generated with Claude"`).
- `richard.png` — profile photo (867×867), used in all three business cards.

External marks (`github.svg`, `astro.svg`, `celly.png`) are shown to credit the tools/products used. Keep them un-stretched and in correct aspect ratio.

## Known follow-ups
- **Celly** will live at **celly.pro** (not live yet) — the Celly icon currently links to its blog topic; repoint to `https://celly.pro` at launch.
- **Email** link uses `mailto:richard.muffler+problme@gmail.com` but displays `richard.muffler@gmail.com` (intentional, for inbox filtering).

## Files in this bundle
- `BRAND.md`, `DESIGN-BRIEF.md` — canonical brand + visual spec.
- `probl.me Homepage.dc.html`, `probl.me Blog Listing.dc.html`, `probl.me Blog Post.dc.html`, `probl.me About.dc.html` — the four page designs.
- `probl.me Brand Assets.dc.html` — logo/icon/palette reference sheet.
- `assets/` — all logos, icons, OG placeholders, and the photo.
- `support.js` — preview runtime for the `.dc.html` files (reference only; **do not port**).
- `START-HERE-PROMPT.md` — the prompt to begin the Claude Code session.

To preview a `.dc.html` locally: serve this folder over HTTP (e.g. `npx serve .`) and open the file — they need `support.js` and `assets/` alongside them (both are included).
