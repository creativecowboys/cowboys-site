# Giveaway call desk — creativecowboys.co/leads

Dave requested `creativecowboys.co/leads` on September 21, 2026 and, later that day, chose it as the ONE call desk (the
`/team/calls` build in local-seo-engine PR #1 is not being used; its Monday backend was ported here instead).

## What it is
A private page for Dave, Josh and Keaton to work Christmas in September entrants: pick a lead from the Monday
**Giveaway Leads** board (`18430997894`), follow the four-step conversation guide, save a call note plus outcome /
interest / follow-up / quote back to Monday, and **assign the lead to Dave, Josh or Keaton** (writes the board's
Owner people column).

## Sign-in (email-only since Sep 24 2026)
`/admin/login` asks for a work email. Team addresses (dave@, josh@, keaton@, madison@creativecowboys.co, plus any in
`TEAM_LOGIN_EMAILS`) get a one-time link from howdy@ via Resend (`src/lib/team-login.ts`, tokens hashed in private Blob,
15-minute expiry, single use, 1 link per minute per address). The link hits `/api/admin/verify`, which sets the same
`cc_admin_token` cookie as before (issuer `cc-admin`, now 30 days, `sub` = the email). `src/middleware.ts` still sends
unauthenticated visitors from `/leads` to `/admin/login?next=/leads`; the APIs still check the cookie via
`src/lib/team-auth.ts`. ADMIN_USERNAME / ADMIN_PASSWORD are no longer used. The rep name on a call note is still self-selected.

## Code
- `src/app/leads/` — page + desk UI (desk.tsx now calls the real API; `demo` prop kept for local review).
- `src/app/api/team/calls/route.ts` — GET list (paginated, signed cursor).
- `src/app/api/team/calls/[id]/route.ts` — GET lead + history, POST save call, **PATCH assign** `{ owner: "Josh", expectedUpdatedAt: "..." }`.
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

## Caller / Monday owner synchronization
Selecting Dave, Josh or Keaton under Calling as immediately assigns that person in Monday’s Owner
column. The Assigned to selector uses the same action and synchronizes the caller. An unassigned
lead shows Choose caller so selecting Dave is an explicit action, not an invisible default.

Both controls wait for confirmation. During assignment, lead switching and note saving are blocked.
Existing typed notes survive; a successful assignment carries its refreshed Monday version into the
draft so a subsequent note save does not conflict with that assignment. A stale draft gets409 and
must review the latest record before assigning. A failed assignment retains the prior caller/draft.
Existing saved-call attribution is kept until Start another conversation. Monday does not provide
atomic compare-and-set; the precheck and returned-owner check reduce, but cannot eliminate, races.

## Call outcomes (September 22, 2026)
The call-outcome selector offers No answer / left voicemail, Booked followup, Not interested,
and Bad contact number. New drafts require an explicit selection. Restored drafts with retired
outcomes keep their text but must choose a current outcome before saving; already-saved notes
retain their historic attribution and outcome. No existing Monday records are relabeled.
The three new labels are added to Outreach Status; Not interested reuses Monday’s existing
Not Interested label. Saving records the selected outcome in the update and the board status.

## Queue and saved context
The roster puts never-contacted leads first, then active contacted leads (oldest contact first),
then closed/bad-number leads. Refreshing or changing an owner does not promote a contacted lead.
The stage filter offers All leads, Not contacted yet, Contacted / working on, and Closed / bad number.
Owner filters always include Dave, Josh, Keaton and Unassigned, using Monday person IDs rather
than display names. Every assigned person can match a multi-owner lead. Filters/sorting apply
to loaded entries; the count and Load more control identify remaining Monday pages.

The latest saved call update is visible above the guide, with author/date and original text.
If no call update exists in the returned history, the latest Monday update or Notes column appears.
Full returned history remains under Before you call. New-call fields stay separate from saved
notes so earlier conversations are not silently overwritten or submitted twice. Successful live
saves refresh detail/history and move the lead into the contacted queue.
