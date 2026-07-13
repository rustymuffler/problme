# Security Policy

probl.me is a static site (Astro, deployed via GitHub Pages) with no database, no authentication, and no user data. The attack surface is small, but the CI/CD pipeline still holds things worth protecting: deploy tokens, GitHub Pages permissions, and repository secrets.

## Reporting a Vulnerability

If you find a security issue in this repository, please report it privately rather than opening a public issue.

- **Preferred:** email richard.muffler@gmail.com with a description of the issue and steps to reproduce.
- Please do not disclose the issue publicly until it has been addressed.

I'll acknowledge reports within a few days and follow up once the issue is resolved or if I need more information.

## Scope

This policy covers the probl.me source repository (`rustymuffler/problme`) and its CI/CD workflows. It does not cover third-party dependencies, if you find a vulnerability in a dependency itself, please report it to that project directly.

## Security Practices

This repository runs a layered security scanning stack (Gitleaks, Semgrep, Trivy, Checkov, and OpenSSF Scorecard) on every push and pull request. See `SECURITY_SCANNING.md` for the full breakdown.
