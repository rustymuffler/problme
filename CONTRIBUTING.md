# Contributing to probl.me

probl.me is a personal blog and the source for the site at [probl.me](https://probl.me). It is built with [Astro](https://astro.build), deployed to GitHub Pages, and maintained by one person (Richard Robitaille-Muffler) working with AI agents. Contributions are welcome, mainly as bug reports, accessibility or security fixes, and corrections to articles or documentation.

## Reporting bugs and suggesting changes

- **Bugs, broken links, accessibility problems, typos, factual corrections:** open an issue at <https://github.com/rustymuffler/problme/issues>. Include the page URL, what you expected, and what happened. For accessibility problems, mention the browser and any assistive technology.
- **Security vulnerabilities:** do not open a public issue. Follow [`SECURITY.md`](SECURITY.md) and report privately.
- Questions and discussion also go in Issues; there is no other channel.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Make a focused change. Read [`DEVELOPMENT_STANDARDS.md`](DEVELOPMENT_STANDARDS.md) for code conventions, and [`CONTENT_STANDARDS.md`](CONTENT_STANDARDS.md) and [`BRAND.md`](BRAND.md) if you touch articles or design.
3. Run the checks locally (below).
4. Open a pull request against `main` and describe what changed and why.

Pull requests are merged by the maintainer once the required CI checks pass. Code and workflow changes also get a separate review pass (see [`AGENTS.md`](AGENTS.md)). There is no guaranteed review time.

## Running the project and the tests

Requires Node.js 22.

```bash
npm ci               # install exact dependency versions
npm run dev          # local dev server at http://localhost:4321
npm run check        # Astro and TypeScript type check
npm run build        # production build into dist/
npm run test:a11y    # axe-core accessibility tests (WCAG 2.1 AA) plus layout checks; needs a built dist/
npm run test:lhci    # Lighthouse CI (performance, accessibility, best practices, SEO)
npm run test:links   # link checker (requires the lychee binary)
```

First time running `test:a11y`: `npx playwright install chromium`.

A change is expected to keep `npm run check`, `npm run build`, and `npm run test:a11y` passing. New behavior should come with a test where one is practical (for example, a new page type belongs in `tests/accessibility.spec.ts`). Lighthouse minimums are Performance 90, Accessibility 95, Best Practices 90, SEO 95.

## Dependencies and security

- Every dependency update, including those proposed by Dependabot, is scanned (see [`SECURITY_SCANNING.md`](SECURITY_SCANNING.md)). Do not add a dependency without a clear need.
- GitHub Actions are pinned to full commit SHAs, never tags.
- Never commit secrets. Gitleaks runs on every push and pull request.

## Licensing

By contributing you agree that your contribution is licensed under the same terms as the repository: code under the [MIT License](LICENSE), and written content under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (see the License section of [`README.md`](README.md)).
