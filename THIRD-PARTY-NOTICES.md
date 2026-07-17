# Third-Party Notices

This file lists the open-source software used in the probl.me project,
along with their licenses and copyright notices.

probl.me is released under the MIT License. See [LICENSE](LICENSE) for details.

---

## npm Packages

### Framework and runtime

**astro** `7.0.2`
Framework for building this static site.
License: MIT
Copyright: © The Astro Technology Company
Source: https://github.com/withastro/astro

**@astrojs/mdx** `7.0.0`
MDX integration for Astro — used for blog post authoring.
License: MIT
Copyright: © The Astro Technology Company
Source: https://github.com/withastro/astro/tree/main/packages/integrations/mdx

**@astrojs/rss** `4.0.18`
RSS feed generation for Astro — powers `/rss.xml`.
License: MIT
Copyright: © The Astro Technology Company
Source: https://github.com/withastro/astro/tree/main/packages/astro-rss

**@astrojs/sitemap** `3.7.3`
Sitemap generation for Astro — powers `sitemap-index.xml`.
License: MIT
Copyright: © The Astro Technology Company
Source: https://github.com/withastro/astro/tree/main/packages/integrations/sitemap

**tailwindcss** `4.3.1`
Utility-first CSS framework.
License: MIT
Copyright: © Tailwind Labs Inc.
Source: https://github.com/tailwindlabs/tailwindcss

**@tailwindcss/vite** `4.3.1`
Vite plugin for Tailwind CSS v4.
License: MIT
Copyright: © Tailwind Labs Inc.
Source: https://github.com/tailwindlabs/tailwindcss

**rehype-external-links** `3.0.0`
Rehype plugin that opens external links in a new tab site-wide.
License: MIT
Copyright: © Titus Wormer
Source: https://github.com/rehypejs/rehype-external-links

---

### Build tooling and type checking

**@astrojs/check** `0.9.9`
TypeScript type-checking for Astro files.
License: MIT
Copyright: © The Astro Technology Company
Source: https://github.com/withastro/language-tools/tree/main/packages/astro-check

**typescript** `6.0.3`
TypeScript compiler used for strict type checking.
License: Apache-2.0
Copyright: © Microsoft Corporation
Source: https://github.com/microsoft/TypeScript

---

### Test and quality

**@playwright/test** `1.61.0`
End-to-end testing framework — used for accessibility tests.
License: Apache-2.0
Copyright: © Microsoft Corporation
Source: https://github.com/microsoft/playwright

**@axe-core/playwright** `4.11.3`
Playwright integration for axe-core accessibility engine.
License: MPL-2.0 (Mozilla Public License 2.0)
Copyright: © Deque Systems, Inc.
Source: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright

Note: MPL-2.0 requires that modifications to MPL-licensed source files remain available
under MPL-2.0. This project uses @axe-core/playwright unmodified.
The source is available at the link above.

**@lhci/cli** `0.15.1`
Lighthouse CI — runs Lighthouse audits in CI.
License: Apache-2.0
Copyright: © Google LLC
Source: https://github.com/GoogleChrome/lighthouse-ci

---

### Content pipeline security

**@stackone/defender** `0.7.2`
Prompt-injection detection — scans content the Research Agent fetches from external sources before it's written to a research brief. Content-pipeline tooling only, never bundled into the site output.
License: Apache-2.0
Copyright: © StackOne
Source: https://github.com/StackOneHQ/defender

**@huggingface/transformers** `3.8.1`
ONNX-based model loading for `@stackone/defender`'s ML classification tier.
License: Apache-2.0
Copyright: © Hugging Face
Source: https://github.com/huggingface/transformers.js

**onnxruntime-node** `1.21.0`
Native ONNX model runtime, pinned to match `@huggingface/transformers`'s exact requirement (see Accepted Risk Log in `SECURITY_SCANNING.md` for the version-conflict this resolves).
License: MIT
Copyright: © Microsoft Corporation
Source: https://github.com/microsoft/onnxruntime

**fasttext.wasm** `1.0.1`
WASM-compiled language detection, used in `@stackone/defender`'s preprocessing.
License: MIT
Copyright: © DreamOfIce
Source: https://github.com/DreamOfIce/fasttext.wasm

---

## GitHub Actions

These actions run in CI/CD pipelines on GitHub Actions. They are not bundled into the
site output. Source and license for each action is available at the linked repository.

| Action | Version (SHA pinned) | License | Repository |
|---|---|---|---|
| `actions/checkout` | `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0` | MIT | https://github.com/actions/checkout |
| `actions/setup-node` | `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` | MIT | https://github.com/actions/setup-node |
| `actions/configure-pages` | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` | MIT | https://github.com/actions/configure-pages |
| `actions/upload-pages-artifact` | `fc324d3547104276b827a68afc52ff2a11cc49c9` | MIT | https://github.com/actions/upload-pages-artifact |
| `actions/deploy-pages` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` | MIT | https://github.com/actions/deploy-pages |
| `actions/upload-artifact` | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | MIT | https://github.com/actions/upload-artifact |
| `lycheeverse/lychee-action` | `e7477775783ea5526144ba13e8db5eec57747ce8` | MIT | https://github.com/lycheeverse/lychee-action |
| `gitleaks/gitleaks-action` | `dcedce43c6f43de0b836d1fe38946645c9c638dc` | MIT | https://github.com/gitleaks/gitleaks-action |
| `semgrep/semgrep-action` | `713efdd345f3035192eaa63f56867b88e63e4e5d` | MIT | https://github.com/semgrep/semgrep-action |
| `bridgecrewio/checkov-action` | `fa9edf8f0a491c59a924ea6accd5bdcf07752cff` | Apache-2.0 | https://github.com/bridgecrewio/checkov-action |
| `ossf/scorecard-action` | `4eaacf0543bb3f2c246792bd56e8cdeffafb205a` | Apache-2.0 | https://github.com/ossf/scorecard-action |
| `github/codeql-action` | `02c5e83432fe5497fd85b873b6c9f16a8578e1d9` | MIT | https://github.com/github/codeql-action |

Note (2026-07-15): `actions/checkout`, `actions/setup-node`, `actions/configure-pages`, and `actions/upload-pages-artifact` SHAs above were bumped by Dependabot since this file was last updated. `.github/workflows/scorecard.yml` was pinning a stale `actions/checkout` SHA (added after Dependabot's last scan of it, so it was never caught); fixed directly to match the current SHA above.

---

## Security Scanning Binaries (CI only)

These tools are downloaded at CI runtime and are not distributed with the site.

**Gitleaks** `v8.30.1`
Secret scanning for git repositories.
License: MIT
Copyright: © Zachary Rice
Source: https://github.com/gitleaks/gitleaks

**Trivy** `v0.71.2`
Filesystem and dependency vulnerability scanner.
License: Apache-2.0
Copyright: © Aqua Security Software Ltd.
Source: https://github.com/aquasecurity/trivy

**Lychee**
Link checker (invoked via lychee-action).
License: MIT
Copyright: © Matthias Endler and contributors
Source: https://github.com/lycheeverse/lychee

**Semgrep** `1.169.0`
Installed directly via pip in `security.yml` to generate SARIF output for GitHub code scanning (separate from the semgrep-action invocation above, which does not support SARIF).
License: LGPL-2.1-or-later
Copyright: © Semgrep Inc.
Source: https://github.com/semgrep/semgrep

---

## Self-Hosted Analytics

Runs on its own infrastructure (Vercel + Supabase), separate from this repository.
The tracking script it serves is the one approved third-party script on the site
(see DECISIONS.md Decision 8).

**umami** `3.2.0`
Privacy-first, cookie-free analytics — self-hosted on Vercel with a Supabase Postgres database (both free tier).
License: MIT
Copyright: © Umami Software, Inc.
Source: https://github.com/umami-software/umami

---

## Fonts

Fonts are loaded from [Bunny Fonts](https://fonts.bunny.net) at runtime and are not
bundled into the repository. They are used under the SIL Open Font License 1.1.

**Hanken Grotesk**
License: SIL Open Font License 1.1 (OFL-1.1)
Copyright: © 2021 The Hanken Grotesk Project Authors (Alfredo Marco Pradil)
Source: https://github.com/marcologous/hanken-grotesk

**JetBrains Mono**
License: SIL Open Font License 1.1 (OFL-1.1)
Copyright: © 2020 The JetBrains Mono Project Authors (Philipp Nurullin, Konstantin Bulenkov)
Source: https://github.com/JetBrains/JetBrainsMono

The full text of the SIL Open Font License 1.1 is available at:
https://openfontlicense.org/open-font-license-official-text/

---

## Keeping this file up to date

Update this file whenever:
- A new npm dependency is added (add it to the relevant section above)
- A GitHub Actions SHA is updated (update the SHA in the table)
- A font is added or changed

The Security Auditor Agent checks this file on every PR that adds a new dependency.
