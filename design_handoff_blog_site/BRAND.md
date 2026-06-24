# probl.me — Brand &amp; Design System

> **File:** `BRAND.md`
> **Purpose:** Defines the visual identity, design tokens, typography, and component standards for probl.me.
> **Authority:** Read at the start of every content session (for Image Creator Agent) and every design or code session.
> **Direction:** **System A — Workshop** (selected June 2026). The full visual brief lives in `DESIGN-BRIEF.md`; this file is the canonical token reference.

---

## 1. Brand Identity

### Name and Domain

- **Brand name:** probl.me
- **Domain:** probl.me
- **Pronunciation:** "problem" — the domain is a wordplay on the `.me` TLD
- **Tagline:** *Building in public. One problem at a time.*

### Brand Personality

probl.me is **warm, personal, and technically credible** — a maker's workbench, not a corporate publication. It reflects a career in cybersecurity and SaaS product management, plus personal projects tinkered on with AI in off-hours.

| Attribute | Description |
|---|---|
| **Warm** | Feels like a real person's blog. Warm charcoal surfaces, amber accents, comfortable reading. |
| **Honest** | Shares mistakes and lessons, not just wins. |
| **Technical** | Credible to developers and PMs. Monospace is the brand's signature. |
| **Approachable** | Clear writing, no jargon. Welcoming to anyone curious about AI, including non-technical readers. |

The one bit of swagger is the terminal-prompt logo and the monospace accents — small signals that a builder lives here.

---

## 2. Design Inspiration

The probl.me design is **System A — Workshop**, chosen from three explored directions. It draws on two Astro themes without copying either:

### Layout inspiration: Chirping Astro
Clean, warm, readable blog layout; card-based article grid; strong typographic hierarchy; dark mode.

### Component inspiration: Astro Neumorphism (restrained)
- **3D business card** — Richard's digital business card on the homepage and About page. In System A this uses **crisp flat surfaces plus one moment of real depth** (an interactive tilt on hover), not heavy neumorphism.
- **Scrolling icon strip** — branded icons for the content pillars and tools.

The final design is an original implementation. References calibrated against gkoberger.com, marco.fyi, and cofounder.co for warmth and personality.

---

## 3. Color Palette

### Core Colors

| Name | Hex | Token | Usage |
|---|---|---|---|
| **Background** | `#15120E` | `--color-bg` | Page background (warm charcoal) |
| **Surface** | `#1C1812` | `--color-surface` | Card backgrounds, elevated surfaces |
| **Surface Alt** | `#241E15` | `--color-surface-alt` | Hover states, subtle distinctions |
| **Border** | `#2E261B` | `--color-border` | Card borders, dividers |
| **Border Strong** | `#3D3322` | `--color-border-strong` | Focused / emphasized borders |
| **Text Primary** | `#F4EFE6` | `--color-text-primary` | Main body text + headings (warm off-white) |
| **Text Secondary** | `#B6A88F` | `--color-text-secondary` | Subtext, meta, captions, descriptions |
| **Text Muted** | `#8A7B64` | `--color-text-muted` | Labels, placeholders, timestamps |
| **Accent Amber** | `#F2A24B` | `--color-amber` | PRIMARY: links, CTAs, active states, the prompt |
| **Accent Terracotta** | `#E8674A` | `--color-terracotta` | SECONDARY: highlights, cursor, hovers |
| **Accent Olive** | `#9DB066` | `--color-olive` | TERTIARY: third category, fresh contrast |
| **Success Green** | `#7FB069` | `--color-success` | Positive indicators (warm-shifted) |
| **Warning Amber** | `#E8B04B` | `--color-warning` | Warning callouts (distinct from accent) |
| **Danger Red** | `#D64933` | `--color-danger` | Error states (distinct from terracotta) |

### Category Colors (one per content pillar)

| Category | Color |
|---|---|
| `pm-craft` | Amber `#F2A24B` |
| `ai-development` | Terracotta `#E8674A` |
| `tech-tools` | Olive `#9DB066` |

Badges are pills: tinted text on a 12%-opacity same-hue background. Always pair color with the category text — never color alone.

> **Note:** This palette supersedes the earlier cool blue/teal-on-slate palette. The change was made deliberately to give probl.me a warmer, more ownable identity. See `DESIGN-BRIEF.md` §0 for the full rationale and the old→new token mapping.

### Depth & Shadow

System A is **flat and crisp**: surfaces separate via a 1px `#2E261B` border and a one-step background lift, not soft neumorphism. Reserve elevation for two cases:

```css
/* Card / interactive hover */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
transform: translateY(-2px);

/* Business card — the one moment of real depth (interactive 3D tilt) */
box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.7);
```

---

## 4. Typography

### Font Stack

| Role | Font | Weights | Fallback |
|---|---|---|---|
| **Headings / Display** | Hanken Grotesk | 700, 800 | system-ui, -apple-system, sans-serif |
| **Body / UI** | Hanken Grotesk | 400, 500, 600 | system-ui, sans-serif |
| **Brand / labels / Code** | JetBrains Mono | 400, 500, 600 | ui-monospace, Consolas, monospace |

Both are open source and available via Google Fonts / Bunny Fonts.

### The monospace signature

JetBrains Mono is the brand's tell. Use it for, and **only** for: the logo, eyebrow labels (uppercase, `letter-spacing: 0.14em`), category tags, meta lines, and code. Never body copy or headings.

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display** | 3.5rem (56px) | 800 | 1.05 | Homepage hero |
| **H1** | 2.5rem (40px) | 800 | 1.12 | Page + article titles |
| **H2** | 1.625rem (26px) | 700 | 1.25 | Section headings |
| **H3** | 1.25rem (20px) | 700 | 1.35 | Sub-section headings |
| **Body Large** | 1.125rem (18px) | 400 | 1.75 | Article body text |
| **Body** | 1rem (16px) | 400 | 1.6 | UI text, descriptions |
| **Small** | 0.875rem (14px) | 500 | 1.5 | Meta text, captions |
| **Label (mono)** | 11–12px | 500 | 1.4 | Eyebrows, tags (caps, 0.14em) |
| **Code** | 0.875rem (14px) | 400 | 1.65 | Inline code, code blocks |

### Reading Width

Article body text constrained to **65ch** (~680px). Optimal for long-form reading.

---

## 5. Component Standards

### Logo

Terminal-prompt concept: `>` prompt (amber) + `probl` + `.me` (terracotta) + a blinking block cursor. Assets in `assets/logo/`: `logo-full.svg`, `logo-wordmark.svg`, `logo-mark.svg` (the `>_` glyph), `logo-mark-tile.svg` (favicon tile). The cursor blink is a live-site flourish only. `.me` is always terracotta; the prompt is always amber; the wordmark is always JetBrains Mono.

### 3D Business Card

Neumorphic-adjacent card for Richard's info on homepage + About.
- `border-radius: 16px`, `#1C1812` on `#15120E`, 1px `#2E261B` border.
- Amber `#F2A24B` divider line.
- **Depth:** strong drop shadow plus an **interactive 3D tilt** that follows the cursor (perspective rotateX/rotateY) with a subtle glare highlight — this is the design's signature depth moment.
- Contents: avatar (optional), **Richard Muffler**, short title, current focus (probl.me + Celly), links (GitHub `rustymuffler`, LinkedIn, probl.me).
- ~360×220px desktop, responsive.

### Scrolling Icon Strip

Horizontally scrolling strip of the 8 pillar icons + labels.
- Continuous slow left scroll, **pauses on hover**.
- Each icon is a **link to its filtered post list** (`/blog?tag=<slug>`), and **animates on hover** (scale + slight rotate "pop").
- Strip height 80px; icon (44–48px) above a mono 12–14px `#B6A88F` label.
- Respect `prefers-reduced-motion`: freeze the scroll.

### Article Cards

- Background `#1C1812`, 1px `#2E261B` border, `border-radius: 12px`.
- Hero thumbnail, category pill, title (Hanken 700), excerpt (`#B6A88F`), mono meta (date · read time).
- Hover: lift + border → amber `#F2A24B`, title → `#F4EFE6`. Whole card is the link target (≥44px).

### Category Pill

Mono 11px, radius `999px`, padding `3px 10px`. `color: <hue>; background: <hue> @ 12%`. Always includes the category text.

### Code Blocks

- Background `#161310` (one notch off page bg), `border-radius: 10px`, 1px `#2E261B` border.
- JetBrains Mono 14px. Warm dark syntax theme. Copy-to-clipboard button top-right.
- Inline code: `#241E15` background, `#F2A24B` text, radius `5px`.

### Buttons & Links

- **Primary CTA:** amber `#F2A24B` bg, `#15120E` text, radius `10px`, weight 600. Hover `#F4B468`.
- **Secondary:** transparent, 1px `#3D3322` border, `#F4EFE6` text. Hover: border amber.
- **Inline links:** amber, underline on hover.
- **Focus ring (all interactive):** `2px solid #F2A24B`, `2px` offset.

---

## 6. Image Standards

### Hero Images

- **Dimensions:** 1200×630px (also the OG image).
- **Style:** Abstract, conceptual, or illustrative on the warm palette — never stock-photo clichés.
- **Color:** warm charcoal base, amber/terracotta/olive accents.
- **Format:** PNG for Claude-generated images; WebP for photos. SVG placeholders during design live in `assets/og/`.
- **Attribution frontmatter:** `imageCredit: "AI-generated with Claude"`.

### In-Article Images

- Every image must add information. No decorative images.
- Diagrams: warm background, amber/teal-free accent colors, clear labels.
- Light screenshots: thin `#2E261B` frame.
- **Alt text:** always descriptive.

### Third-party / tool marks

GitHub (octocat), Astro, and other tool logos are shown in their recognizable marks to **credit the tools used** (nominative use), rendered monochrome `#F4EFE6` on dark. Source official press-kit / Simple Icons SVGs at build; keep them un-stretched and in correct aspect ratio.

---

## 7. Dark Mode

probl.me is **dark mode by default**. The palette is designed for dark mode. Light mode is optional and future-state; do not write code that assumes a light theme until it is explicitly built.

```css
:root {
  --color-bg:            #15120E;
  --color-surface:       #1C1812;
  --color-surface-alt:   #241E15;
  --color-border:        #2E261B;
  --color-border-strong: #3D3322;
  --color-text-primary:   #F4EFE6;
  --color-text-secondary: #B6A88F;
  --color-text-muted:     #8A7B64;
  --color-amber:      #F2A24B;
  --color-terracotta: #E8674A;
  --color-olive:      #9DB066;
  --color-success: #7FB069;
  --color-warning: #E8B04B;
  --color-danger:  #D64933;
}
```

---

## 8. Accessibility Standards

All design decisions meet WCAG 2.1 AA at minimum.

- **Color contrast:** body text ≥ 4.5:1; large text (18px+ bold or 24px+) ≥ 3:1.
- **Verify:** `#F4EFE6` on `#15120E` = **16.1:1** ✅
- **Verify:** `#B6A88F` on `#15120E` = **8.0:1** ✅
- **Verify:** `#F2A24B` on `#15120E` = **8.9:1** ✅
- **Verify:** `#E8674A` on `#15120E` = **5.0:1** ✅
- **Hit targets:** interactive elements ≥ 44×44px.
- **Focus states:** visible amber `#F2A24B` focus ring on every interactive element.
- **No color-only information:** pair color with text or icons.
- **Reduced motion:** honor `prefers-reduced-motion` — freeze the icon strip, drop the cursor blink, keep state changes instant.

---

## 9. Design Invariants — Never Violate

1. **Dark mode always.** Warm charcoal base. Light mode is optional and future-state.
2. **Warm palette only.** Tokens in §3/§7. New colors get added to this document first.
3. **Hanken Grotesk + JetBrains Mono only.** No other families without updating this document and Richard's approval.
4. **Monospace is a signature, not body text.** Logo, labels, tags, meta, code — nothing else.
5. **Flat &amp; crisp.** Borders + background-lift for separation; depth reserved for hover and the business card.
6. **Accessibility minimums.** WCAG 2.1 AA is the floor. Check contrast before new color combos.
7. **Hit targets: 44×44px minimum.** All interactive elements, with visible amber focus rings.
8. **Images require alt text.** No image ships without descriptive `alt`.
9. **Icons must be SVG.** No PNG icons.

---

*Last updated: June 2026 — System A (Workshop). Collaboratively defined by Richard and Claude (Cowork). Full visual brief: `DESIGN-BRIEF.md`.*
