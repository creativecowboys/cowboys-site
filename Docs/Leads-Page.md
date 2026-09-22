# Giveaway call desk — creativecowboys.co/leads

Dave requested `creativecowboys.co/leads` on September 21, 2026 and, later that day, chose it as the ONE call desk (the
`/team/calls` build in local-seo-engine PR #1 is not being used; its Monday backend was ported here instead).

## What it is
A private page for Dave, Josh and Keaton to work Christmas in September entrants: pick a lead from the Monday
**Giveaway Leads** board (`18430997894`), follow the four-step conversation guide, save a call note plus outcome /
interest / follow-up / quote back to Monday, and **assign the lead to Dave, Josh or Keaton** (writes the board's
Owner people column).

## Sign-in
Reuses the site's existing admin sign-in: `/admin/login` (ADMIN_USERNAME / ADMIN_PASSWORD, 12-hour `cc_admin_token`
cookie). `src/middleware.ts` redirects unauthenticated visitors from `/leads` to `/admin/login?next=/leads`; the API
routes check the same cookie via `src/lib/team-auth.ts`. One shared login; the rep name on a call note is self-selected.

## Code
- `src/app/leads/` — page + desk UI (desk.tsx now calls the real API; `demo` prop kept for local review).
- `src/app/api/team/calls/route.ts` — GET list (paginated, signed cursor).
- `src/app/api/team/calls/[id]/route.ts` — GET lead + history, POST save call, **PATCH assign** `{ owner: "Josh" }`.
- `src/lib/calls/monday.ts` — Monday client (API 2026-07), board-locked, append-only notes, retry/conflict guards,
  `assignOwner()`. Team user ids live in `TEAM` and must match `repIds` in desk.tsx.
- `src/lib/calls/validation.ts` — input limits, same-origin + JSON checks.

## Runtime connection (required before the page shows real leads)
- `MONDAY_API_TOKEN` — server-only Vercel variable on project `cowboys-site` (Production). Create it in Monday:
  avatar → Developers → My access tokens (or Administration → API). Never `NEXT_PUBLIC_`, never committed, never
  pasted into chat. Until it exists the page loads and says Monday isn't connected yet.
- Existing `NEXTAUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` are already set.

## Known limits
- The board only shows what Josh's intake has put on it (20 items on Sep 21 vs 326+ Sheet entries). The desk does not
  import from the Sheet.
- Monday has no atomic compare-and-set; two people saving the same lead at the same instant can race. The desk detects
  stale records and reused call ids and refuses rather than double-writes.
- `/leads` is noindex and not in navigation or the sitemap.

## Founder Playbook call guidance (September 22, 2026)
Dave requested incorporating the reference Josh shared into this guide and Burt’s business advice.
The call copy adapts Mom Test’s emphasis on recent behavior and SPIN’s problem/impact/next-step structure
to brief small-business calls. Optional Discover prompts explore a specific event, its effect, and the
customer’s priority. Recommend confirms the need and concerns before suggesting a service. Wrap up
records an agreed action, owner and date, including no-next-step outcomes.

All existing draft keys, session-storage keys and Monday payloads stay compatible. Examples and impact
go into `challenge`/`notes`, attempts into `currentMarketing`, and commitments into `nextStep`.
Prices, offers, permissions and API behavior are unchanged. The scripts do not impose question quotas,
invent urgency, guarantee returns, or equate politeness with buying intent.

Reference: https://github.com/getagentseal/founder-playbook at
`05e29d2ea1f8bf3c7dd97351f8c71e9b3da2a2fd`, `mom-test/SKILL.md` and `spin-selling/SKILL.md`.
These are third-party study frameworks, used selectively; they are not validated predictions for a lead.
Upstream MIT attribution is preserved in `Docs/Founder-Playbook-LICENSE.txt`.
