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

## GitHub Actions

These actions run in CI/CD pipelines on GitHub Actions. They are not bundled into the
site output. Source and license for each action is available at the linked repository.

| Action | Version (SHA pinned) | License | Repository |
|---|---|---|---|
| `actions/checkout` | `34e114876b0b11c390a56381ad16ebd13914f8d5` | MIT | https://github.com/actions/checkout |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | MIT | https://github.com/actions/setup-node |
| `actions/configure-pages` | `983d7736d9b0ae728b81ab479565c72886d7745b` | MIT | https://github.com/actions/configure-pages |
| `actions/upload-pages-artifact` | `56afc609e74202658d3ffba0e8f6dda462b719fa` | MIT | https://github.com/actions/upload-pages-artifact |
| `actions/deploy-pages` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` | MIT | https://github.com/actions/deploy-pages |
| `lycheeverse/lychee-action` | `82202e5e9c2f4ef1a55a3d02563e1cb6041e5332` | MIT | https://github.com/lycheeverse/lychee-action |
| `gitleaks/gitleaks-action` | `dcedce43c6f43de0b836d1fe38946645c9c638dc` | MIT | https://github.com/gitleaks/gitleaks-action |
| `semgrep/semgrep-action` | `713efdd345f3035192eaa63f56867b88e63e4e5d` | MIT | https://github.com/semgrep/semgrep-action |
| `bridgecrewio/checkov-action` | `fa9edf8f0a491c59a924ea6accd5bdcf07752cff` | Apache-2.0 | https://github.com/bridgecrewio/checkov-action |

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
