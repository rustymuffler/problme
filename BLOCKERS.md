# probl.me — Active Blockers

> Living log maintained by the PM Agent. Update when blockers are found or resolved.
> Last updated: 2026-06-25

---

## Active Blockers

| # | Blocker | Blocked Item | Owner | Date Added | Status |
|---|---|---|---|---|---|
| 1 | ~~GitHub repository not yet created~~ | ~~All of Phase 1~~ | Richard | 2026-06-22 | ✅ Resolved |
| 2 | probl.me DNS: CNAME needs to point to rustymuffler.github.io | M1.14 — Custom domain configuration | Richard | 2026-06-22 | ⬜ Not started |
| 3 | Aikido API key not yet configured | SECURITY_SCANNING.md — Tool 1 (Aikido) | Richard | 2026-06-22 | ⬜ Not started |
| 4 | Semgrep App Token not yet configured | SECURITY_SCANNING.md — Tool 2 + CI | Richard | 2026-06-22 | ⬜ Not started |
| 5 | Supabase account + project not yet created | M3.17 — Umami analytics database | Richard | 2026-06-22 | ⬜ Not started |
| 6 | Vercel account not yet created | M3.19 — Umami analytics hosting | Richard | 2026-06-22 | ⬜ Not started |
| 7 | Umami data-website-id not yet generated | M3.22 — Tracking script in Layout.astro | Richard | 2026-06-22 | 🔑 Waiting on M3.21 (Umami deploy) |

---

## Resolved Blockers

| # | Blocker | Resolved Date | Resolution |
|---|---|---|---|
| 1 | GitHub repository not yet created | 2026-06-23 | Repo transitioned from old Jekyll resume to probl.me Astro project. All governance docs committed to `main`. Branch renamed from `master` to `main`. |

---

## How to Use This File

The PM Agent adds a row to the Active Blockers table when:
- A milestone item cannot proceed without an external action by Richard
- A credential, API key, or account is needed and not yet available
- An agent identifies a dependency or decision that must be made before work can continue

When a blocker is resolved, move it to the Resolved Blockers table with the resolution date and a brief note on what unblocked it.

Format for new blocker rows:
```
| [next #] | [What is blocking] | [What milestone item or feature it blocks] | [Who owns the resolution] | [Date Added] | [Status emoji + description] |
```

Status emojis:
- ⬜ Not started — blocker not yet actioned
- 🔄 In progress — Richard is working on it
- 🔑 Waiting on credentials — waiting for an API key, login, or account access
- ✅ Resolved — move to Resolved table
