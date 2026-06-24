# probl.me — Brand & Design System

> **File:** `BRAND.md`
> **Purpose:** Defines the visual identity, design tokens, typography, and component standards for probl.me.
> **Authority:** Read at the start of every content session (for Image Creator Agent) and every design or code session.

---

## 1. Brand Identity

### Name and Domain

- **Brand name:** probl.me
- **Domain:** probl.me
- **Pronunciation:** "problem" — the domain is a wordplay on the `.me` TLD
- **Tagline (working):** *Building in public. One problem at a time.*

### Brand Personality

probl.me is **warm, personal, and technically credible**. It reflects a career built in cybersecurity and SaaS product management, now pivoting into building products independently with AI.

| Attribute | Description |
|---|---|
| **Warm** | Feels like a real person's blog, not a corporate publication |
| **Honest** | Shares mistakes and lessons, not just wins |
| **Technical** | Credible to developers and PMs — no fluff |
| **Approachable** | Clear writing, no unnecessary jargon, anyone curious is welcome |

---

## 2. Design Inspiration

The probl.me design takes inspiration from two Astro themes, combining the best of each:

### Primary layout inspiration: Chirping Astro
Source: [astro.build/themes/details/chirping-astro](https://astro.build/themes/details/chirping-astro)

- Clean blog layout with a warm, readable aesthetic
- Card-based article grid
- Strong typography hierarchy
- Light/dark mode support

### Component inspiration: Astro Neumorphism
Source: [astro.build/themes/details/astro-neumorphismt](https://astro.build/themes/details/astro-neumorphismt)

- **3D business card component** — used for Richard's personal info on the About page and homepage. Functions like a digital business card with subtle depth and shadow.
- **Scrolling icon strip** — used to display branded icons representing the probl.me content pillars and tools. Icons are created by Claude Design to match the probl.me brand.

The final design is an original implementation that draws from these sources — not a direct copy of either theme.

---

## 3. Color Palette

### Core Colors

| Name | Hex | Usage |
|---|---|---|
| **Background** | `#0F1117` | Page background (dark mode) |
| **Surface** | `#1A1D27` | Card backgrounds, elevated surfaces |
| **Surface Alt** | `#252836` | Hover states, subtle distinctions |
| **Border** | `#2E3147` | Card borders, dividers |
| **Text Primary** | `#F1F5F9` | Main body text |
| **Text Secondary** | `#94A3B8` | Subtext, meta information, captions |
| **Text Muted** | `#64748B` | Placeholder text, disabled states |
| **Accent Blue** | `#38BDF8` | Primary links, active states, CTAs |
| **Accent Teal** | `#2DD4BF` | Secondary accent, tags, highlights |
| **Success Green** | `#22C55E` | Positive indicators |
| **Warning Amber** | `#F59E0B` | Warning callouts |
| **Danger Red** | `#EF4444` | Error states |

### Neumorphism Shadow Palette

For the 3D business card and neumorphic components:

| Name | Value | Usage |
|---|---|---|
| **Shadow Dark** | `rgba(0, 0, 0, 0.5)` | Outer shadow (dark side) |
| **Shadow Light** | `rgba(255, 255, 255, 0.05)` | Outer shadow (light side) |
| **Inset Shadow Dark** | `rgba(0, 0, 0, 0.6)` | Inset shadow (pressed state) |
| **Inset Shadow Light** | `rgba(255, 255, 255, 0.04)` | Inset shadow (light side) |

Standard neumorphism box-shadow (light source: top-left):
```css
box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.05), 
             4px  4px 8px rgba(0, 0, 0, 0.5);
```

---

## 4. Typography

### Font Stack

| Role | Font | Fallback |
|---|---|---|
| **Body / UI** | Inter | system-ui, -apple-system, sans-serif |
| **Headings** | Inter (semibold/bold) | system-ui, sans-serif |
| **Code / Monospace** | JetBrains Mono | Fira Code, Consolas, monospace |

Both fonts are open source and available via Google Fonts / Bunny Fonts (privacy-friendly alternative).

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display** | 3rem (48px) | 700 | 1.1 | Hero headlines |
| **H1** | 2.25rem (36px) | 700 | 1.2 | Page titles, article titles |
| **H2** | 1.5rem (24px) | 600 | 1.3 | Section headings |
| **H3** | 1.25rem (20px) | 600 | 1.4 | Sub-section headings |
| **Body Large** | 1.125rem (18px) | 400 | 1.7 | Article body text |
| **Body** | 1rem (16px) | 400 | 1.6 | UI text, descriptions |
| **Small** | 0.875rem (14px) | 400 | 1.5 | Meta text, captions, tags |
| **Code** | 0.9rem (14.4px) | 400 | 1.6 | Inline code, code blocks |

### Reading Width

Article body text should be constrained to **65–75 characters per line** (approximately `65ch` in CSS). This is the optimal reading width for long-form content.

---

## 5. Component Standards

### 3D Business Card

The personal info business card is a neumorphic component used on the homepage and About page.

**Contents:**
- Photo or avatar (optional)
- Name: Richard Muffler
- Title / Tagline (short, updated as needed)
- Current focus: probl.me + Celly
- Links: GitHub (`rustymuffler`), LinkedIn, probl.me

**Design spec:**
- Rounded corners: `border-radius: 16px`
- Dark background with neumorphic depth (see shadow values in Section 3)
- Subtle hover animation: lifts slightly (`transform: translateY(-2px)`) with enhanced shadow
- Card dimensions: approximately 320px × 200px on desktop, responsive on mobile
- Accent line or divider using Accent Blue (`#38BDF8`)

### Scrolling Icon Strip

A horizontally scrolling strip of brand icons representing content categories, tools, and concepts covered on probl.me. Created by Claude Design.

**Icon set to create (with Claude Design):**
- PM Craft icon
- AI Development icon
- Tech Stack + Tools icon
- Astro icon (custom probl.me style)
- GitHub icon (custom probl.me style)
- Security icon
- Building in Public icon (a construction/blueprint metaphor)
- Celly icon (representing the sister project)

**Design spec:**
- Icons: 48×48px, SVG format
- Style: filled icons with Accent Blue (`#38BDF8`) and Accent Teal (`#2DD4BF`) palette
- Background: transparent or Surface (`#1A1D27`)
- Animation: continuous slow left scroll, pauses on hover
- Strip height: 80px with icon + label below
- Label: Small text (14px), Text Secondary color

### Article Cards

Blog post cards in the listing grid.

**Design spec:**
- Background: Surface (`#1A1D27`)
- Border: 1px solid Border (`#2E3147`)
- Border-radius: 12px
- Hover: slight lift + accent border color (`#38BDF8`)
- Contains: hero image (thumbnail), category badge, title, description excerpt, read time, publish date
- Category badge: colored pill — blue for pm-craft, teal for ai-development, amber for tech-tools

### Code Blocks

- Background: slightly lighter than page background (`#161921`)
- Border: 1px left accent line in Accent Blue for inline code context
- Font: JetBrains Mono 14px
- Syntax highlighting: a dark theme (Shiki `github-dark` or `tokyo-night`)
- Copy-to-clipboard button in top-right corner

---

## 6. Image Standards

### Hero Images

- **Dimensions:** 1200×630px (also used as OG image)
- **Style:** Abstract, conceptual, or illustrative — not stock photo clichés
- **Color palette:** Drawn from the probl.me palette (dark background, blue/teal accents)
- **Typography in images:** Use Inter if text is included. Keep text to a minimum.
- **Format:** PNG for Claude-generated images; WebP for photos
- **Attribution frontmatter:** `imageCredit: "AI-generated with Claude"`

### In-Article Images

- **Purpose:** Every image must add information. No decorative images.
- **Diagrams and flowcharts:** Dark background, blue/teal accent colors, clear labels
- **Screenshots:** Include a thin border (`#2E3147`) to frame light-background screenshots against the dark site
- **Alt text:** Always descriptive. Describe what the image shows, not what it is.

---

## 7. Dark Mode

probl.me is **dark mode by default**. The color palette is designed for dark mode.

Light mode support is optional and can be added in a future phase. If added, it must use a clearly defined light palette and never look broken or inconsistent. Until light mode is explicitly built and tested, do not write code that assumes a light theme.

**CSS variable convention:**
```css
:root {
  --color-bg: #0F1117;
  --color-surface: #1A1D27;
  --color-surface-alt: #252836;
  --color-border: #2E3147;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-accent-blue: #38BDF8;
  --color-accent-teal: #2DD4BF;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
}
```

---

## 8. Accessibility Standards

All design decisions must meet WCAG 2.1 AA standards at minimum.

- **Color contrast:** Body text on backgrounds must meet a 4.5:1 contrast ratio. Large text (18px+ bold or 24px+) must meet 3:1.
- **Verify:** `#F1F5F9` (Text Primary) on `#0F1117` (Background) = 16.9:1 ✅
- **Verify:** `#94A3B8` (Text Secondary) on `#0F1117` (Background) = 7.1:1 ✅
- **Verify:** `#38BDF8` (Accent Blue) on `#0F1117` (Background) = 6.2:1 ✅
- **Hit targets:** All interactive elements (links, buttons, cards) must be at minimum 44×44px.
- **Focus states:** All interactive elements must have a visible focus ring using the Accent Blue color.
- **No color-only information:** Never convey information using color alone. Pair color with text or icons.

---

## 9. Design Invariants — Never Violate

1. **Dark mode always.** Never ship a page that looks broken in dark mode. Light mode is optional and future-state.
2. **Brand palette only.** No ad-hoc colors. If a new color is needed, add it to this document first.
3. **Inter + JetBrains Mono only.** No other font families without updating this document and Richard's approval.
4. **Accessibility minimums.** WCAG 2.1 AA is the floor, not the ceiling. Check contrast ratios before implementing new color combinations.
5. **Hit targets: 44×44px minimum.** All interactive elements.
6. **Images require alt text.** No image can be committed without a descriptive `alt` attribute.
7. **Icons must be SVG.** No PNG icons (they don't scale cleanly).

---

*Last updated: June 2026 — Collaboratively defined by Richard and Claude (Cowork).*
