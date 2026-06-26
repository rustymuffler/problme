# Changelog — probl.me

All notable changes to probl.me are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] — 2026-06-26

First public release. Site is live at [probl.me](https://probl.me) with full CI/CD, security scanning, design system, and one published article.

### Added

**Infrastructure**
- Astro 7.0.2 project with TypeScript strictest preset, Tailwind CSS 4.x via `@tailwindcss/vite`
- GitHub Pages deployment via GitHub Actions (`deploy.yml`) — all action refs SHA-pinned
- CI pipeline (`ci.yml`): Astro build, `astro check` type-checking, Lychee link checker
- Security pipeline (`security.yml`): Gitleaks secret scanning, Semgrep SAST, Trivy container scan, Checkov IaC scan
- Lighthouse CI pipeline (`lighthouse.yml`): 3-run average; thresholds enforced in CI
- Gitleaks pre-commit hook (v8.30.1) with `.gitleaks.toml` allowlist
- Custom domain `probl.me` with DNS A records, GitHub Pages HTTPS, TLS verified
- Playwright accessibility tests via axe-core (`tests/accessibility.spec.ts`)
- `@astrojs/check` + TypeScript for deep type-checking during CI
- `THIRD-PARTY-NOTICES.md` open-source attribution

**Design system**
- Full design token set in `src/styles/global.css`: Workshop palette, type scale, spacing, dark-mode-only background (`#15120E`)
- Hanken Grotesk + JetBrains Mono fonts via Bunny Fonts
- `Layout.astro`: sticky header, footer, dynamic Open Graph meta, RSS autodiscovery, sitemap link
- `BusinessCard.astro`: 3D tilt-and-glare card, homepage and about variants, email obfuscated via `data-*` attributes
- `IconStrip.astro`: marquee scroll, pauses on hover, accessible
- `ArticleCard.astro`: hero thumbnail, category badge, title, excerpt, reading time, date
- `CategoryPill.astro`, `Button.astro`
- `CodeBlock.astro`: Shiki syntax highlighting (`material-theme-palenight`) with copy button
- `Callout.astro`: MDX callout blocks — `note` (amber), `warning` (terracotta), `tip` (olive)

**Pages**
- Homepage: hero section, 3D business card, icon strip, latest posts grid
- Blog listing at `/blog`: article card grid with category filter
- Blog post template at `/blog/[slug]`
- About page at `/about`: bio, 3D business card, icon strip
- Credits page at `/credits`
- Tag pages at `/blog/tag/[tag]`

**Content features**
- MDX content collections with posts schema (`src/content.config.ts`)
- RSS feed at `/rss.xml` via `@astrojs/rss@4.0.18`
- XML sitemap at `/sitemap-index.xml` via `@astrojs/sitemap@3.7.3`

**Content pipeline**
- Four Claude scheduled tasks: Monday idea batch, Friday queue health check, Tuesday/Thursday PR reminder, monthly retrospective (first Monday of each month)
- `retros/` directory for retrospective documents
- Content calendar: 7 articles selected, 1 published

**Governance**
- `CLAUDE.md`, `AGENTS.md`, `DEVELOPMENT_STANDARDS.md`, `CONTENT_STANDARDS.md`, `BRAND.md`, `SECURITY_SCANNING.md`, `DECISIONS.md`, `BLOCKERS.md`, `MILESTONES.md` all committed to main

### Published

- **C4:** [How Context Limits Changed the Way I Build with AI](/blog/context-limits-design-constraint) — 2026-06-26

### Security

- `SEMGREP_APP_TOKEN` added to GitHub repository secrets — Semgrep CI job operational
- Aikido MCP plugin installed and authenticated at account level
- npm `overrides` added to pin three vulnerable transitive dependencies in `@lhci/cli`:
  - `js-yaml` 3.14.2 → 4.2.0 (Dependabot #70, medium: DoS via merge key aliases)
  - `tmp` 0.0.33 → 0.2.7 (Dependabot #69/#66, high/low: path traversal and symlink write)
  - `uuid` 8.3.2 → 11.1.1 (Dependabot #68, medium: missing buffer bounds check)
- Lighthouse production scores: Performance 96, Accessibility 100, Best Practices 100, SEO 100

### Fixed

- Hero image moved to `public/assets/posts/` with absolute path in frontmatter
- Interview notes and research briefs moved to `content-pipeline/` outside the Astro content collection
- Email address obfuscated via `data-*` attributes to prevent Vite from stripping it during bundle
- LinkedIn excluded from Lychee link checker (returns HTTP 999 bot-protection)
- `richard.png` converted to WebP, resolving Lighthouse LCP warning
- Community badge contrast fixed to pass WCAG 2.1 AA (4.5:1 ratio)

---

[0.1.0]: https://github.com/rustymuffler/problme/releases/tag/v0.1.0
