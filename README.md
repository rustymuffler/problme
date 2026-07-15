# probl.me

[![CI](https://github.com/rustymuffler/problme/actions/workflows/ci.yml/badge.svg)](https://github.com/rustymuffler/problme/actions/workflows/ci.yml)
[![Security](https://github.com/rustymuffler/problme/actions/workflows/security.yml/badge.svg)](https://github.com/rustymuffler/problme/actions/workflows/security.yml)
[![Deploy](https://github.com/rustymuffler/problme/actions/workflows/deploy.yml/badge.svg)](https://github.com/rustymuffler/problme/actions/workflows/deploy.yml)
[![Lighthouse CI](https://github.com/rustymuffler/problme/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/rustymuffler/problme/actions/workflows/lighthouse.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Personal blog by [Richard Robitaille-Muffler](https://probl.me) covering product management craft, AI-assisted development, and the tools and tech stack powering modern product work.

Built with [Astro](https://astro.build) and deployed on [GitHub Pages](https://pages.github.com).

---

## Tech Stack

- **Framework:** Astro (static site generator)
- **Content:** MDX
- **Styling:** Tailwind CSS
- **Deployment:** GitHub Pages
- **Analytics:** Umami (self-hosted, cookie-free)

---

## Content Categories

- **PM Craft** — strategy, prioritization, stakeholder work, and the craft of product management
- **AI-Assisted Development** — building with AI tools, agent workflows, and what actually works
- **Tech Stack + Tools** — the tools and setup powering probl.me and [Celly](https://celly.app)

---

## Local Development

```bash
npm install
npm run dev        # local dev server
npm run build       # production build to dist/
npm run preview     # serve the production build locally
npm run check        # type-check with astro check
```

---

## Security

Every push and pull request runs a layered security scanning stack: [Gitleaks](https://github.com/gitleaks/gitleaks) (secrets), [Semgrep](https://semgrep.dev) (SAST), [Trivy](https://aquasecurity.github.io/trivy) (dependency CVEs), [Checkov](https://www.checkov.io) (IaC misconfigurations), and [OpenSSF Scorecard](https://scorecard.dev) (supply-chain hygiene). All third-party GitHub Actions are pinned to a full commit SHA, kept current via Dependabot.

See [`SECURITY.md`](SECURITY.md) for how to report a vulnerability, and [`SECURITY_SCANNING.md`](SECURITY_SCANNING.md) for the full breakdown of what each tool covers and why.

---

## Built with AI Agents

The content pipeline for this blog, idea generation, interviews, research, drafting, image creation, SEO review, and proofreading, runs through a defined multi-agent workflow using Claude. Each stage is a distinct role with its own responsibilities, and no single agent both writes and approves its own work.

See [`AGENTS.md`](AGENTS.md) for the full roster and workflow, and [`CONTENT_STANDARDS.md`](CONTENT_STANDARDS.md) for the editorial standards every article is held to.

---

## License

The code, framework, layouts, and design elements of this repository are licensed under the [MIT License](LICENSE).

All written blog post content, articles, and prose are licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license. You are free to share and adapt the material, provided you give appropriate credit.
