# Giveaway call desk — creativecowboys.co/leads

Dave requested `creativecowboys.co/leads` on September 21, 2026 and, later that day, chose it as the ONE call desk (the
`/team/calls` build in local-seo-engine PR #1 is not being used; its Monday backend was ported here instead).

## What it is
A private page for Dave, Josh and Keaton to work Christmas in September entrants: pick a lead from the Monday
**Giveaway Leads** board (`18430997894`), follow the four-step conversation guide, save a call note plus outcome /
interest / follow-up / quote back to Monday, and **assign the lead to Dave, Josh or Keaton** (writes the board's
Owner people column).

## Sign-in (email-only since Sep 24 2026)
`/admin/login` asks for a work email. Any **@creativecowboys.co** address (plus any outside address listed in
`TEAM_LOGIN_EMAILS`) gets a one-time link from howdy@ via Resend (`src/lib/team-login.ts`, tokens hashed in private Blob,
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

## Follow-up time and per-rep calendar feeds (September 26, 2026)
Dave: "we should add a loose time to the client. So while we personally are looking at our calendar, we can say to them, does around 9am work?" and follow-ups should land "on a calendar for each of us that we subscribe to — not the normal Cowboys calendar."

- **Wrap-up step** has "Around what time?" next to the follow-up date: half-hours 8:00am–5:30pm Eastern, or "No set time (all-day)". The banner reads "Follow-up booked for Monday, September 28 around 9:00am". The time is written into the board's **Next Follow-up** date column (Monday stores date-column times in UTC; `src/lib/calls/followup-time.ts` converts both ways, DST-aware). The lead detail shows `date · time`.
- **Feeds**: `GET /api/team/followups/<dave|josh|keaton>.ics?key=…` — private iCalendar, no cookie (calendar apps can't sign in). The key is an HMAC of the rep slug under `NEXTAUTH_SECRET`, so nothing is stored and rotating that secret rotates every feed. Timed follow-ups are a 30-minute block with a 15-minute alarm; date-only ones are all-day with an 8:30am alarm. Leads marked Not Interested / Bad Contact Number / Won are skipped. Event UID = `followup-<leadId>@creativecowboys.co`, so a changed date moves the event instead of duplicating it. Monday errors return 503 + Retry-After so the calendar app keeps the subscription.
- **Where to get the link**: the roster's "📅 My follow-up calendar" button calls `GET /api/team/followups` (cookie) and shows the signed-in rep's link with Copy and an Apple Calendar `webcal:` link; Dave and Josh see all three. Google Calendar: Other calendars → + → From URL. Google refreshes subscribed feeds every few hours (not adjustable); Apple/iPhone can refresh hourly. Reps whose email is not one of the three (Madison) get "No calendar for this sign-in."
- **Deep link**: events link to `/leads?lead=<id>`; the desk selects that lead after the first load.
- Code: `src/lib/calls/followups.ts` (REPS, feed key, ICS builder), `src/lib/calls/followup-time.ts` (client-safe: HOUR_OPTIONS, prettyTime, ET↔UTC — keep `node:crypto` out of anything the desk imports or the webpack client build fails), routes under `src/app/api/team/followups/`. Tests in `followups.test.ts` (`npm run test:call-owner`).

## Leads on GoHighLevel — the `LEADS_BACKEND` switch (October 1, 2026)
Dave: "I need to change where all these leads are coming from. I think we will get away from monday… Can you swap the
leads coming in to GHL? Also, we need a dropdown that lets us pick where they came from." Phase 1 moves the **Sales tab**
onto GoHighLevel behind a switch; the Onboarding and Clients tabs stay on Monday (Phase 2).

### Model
A lead is a **GHL contact** (location `puV58eAAseerZcp5nxVM`). The desk's columns are contact **custom fields**, resolved
by name at runtime (`src/lib/ghl/fields.ts`, cached 10 min) so nothing in code depends on a field id:
Lead Source (dropdown), Outreach Status (dropdown, same labels as the Monday board), Interest (Cold/Warm/Hot), Last Contact
(date), Next Follow-up (date) + Next Follow-up Time (text, `HH:MM` Eastern), Quoted Monthly (money), Interested In, Sales
Notes, Monday Lead ID, and the two that already existed from the LSE audit flow: Audit Score, Audit Report URL.
Owner = `assignedTo` (GHL user ids in `src/lib/ghl/reps.ts`, override `GHL_REP_IDS`). Call notes = GHL **notes** carrying the
same `[CC-CALL:…] [CC-PAYLOAD:…]` markers Monday updates did (idempotent retries). Version token = the contact's
`dateUpdated`. "Won" on handoff = Outreach Status Won + Last Contact + tag `sales-won` + one handoff note.
Which contacts count as leads: anything tagged `giveaway-entrant`, `playbook-lead`, `website-form` or `sales-lead` (add
that tag in GHL to push any contact onto the desk), or anything with a Lead Source. On Oct 1 2026 that is 802 contacts
(787 giveaway entrants + 15 ebook leads) against the 264 Josh had put on the Monday board. To show a narrower roster set
`LEADS_GHL_TAGS` on Vercel to a comma list of tags — e.g. `sales-lead,playbook-lead,website-form` = the leads imported
from the Monday board (the import tags each one `sales-lead`) plus new ebook and website leads; when it is set the tags
are the whole rule. Not chosen: an Opportunities pipeline — it needs nothing the contact model can't do for Phase 1, and
it can be layered on later. Outreach Status carries all 11 labels of the Monday column.

### Lead Source
A GHL dropdown custom field, options seeded as `The Big Giveaway`, `Facebook`, `Ebook download`, `Website form`, `Referral`,
`Other`. **The desk reads the option list from GHL every time** — add "Big Giveaway 2" in GHL → Settings → Custom Fields →
Lead Source and it appears on the desk with no deploy. Set automatically at intake: `/api/giveaway` → The Big Giveaway,
`/api/playbook` → Ebook download, `/api/contact` (contact page, proposal popup, industry offer forms) → Website form (new:
those forms also upsert the contact into GHL with tag `website-form` and a note carrying the message; the Resend email
is unchanged). **The website-form push is off until `LEADS_BACKEND=ghl`** (override: `WEBSITE_FORMS_TO_GHL=on|off`) —
a new GHL contact can enroll in whatever published workflow fires on contact creation, and GHL's API does not expose
triggers, so before the flip a person checks that nothing unintended would message a website inquirer ("Wrangler - New
Lead" is the workflow to look at). On the desk: tag on every roster row, "Lead source" filter, and a select on the lead
that writes it back.

### Code
- `src/lib/ghl/client.ts` — the ONE GHL client (timeout, 429 backoff, typed `GhlError`); `src/lib/packages/ghl.ts` re-exports it.
- `src/lib/ghl/fields.ts` (field catalog + resolver + `ensureSalesFields`), `src/lib/ghl/reps.ts`, `src/lib/ghl/admin.ts`.
- `src/lib/calls/ghl.ts` — the GHL desk backend (same surface as `monday.ts`); `src/lib/calls/switch.ts` + `backend.ts` — the
  switch and dispatch. Routes import from `backend.ts` only. Lead ids pick their system by shape (digits = Monday, else GHL),
  so drafts, calendar deep links and handoffs keep working across the cutover.
- Owner-only tooling: `GET /api/team/ghl/diag` (read-only probe), `POST /api/team/ghl/setup` `{dryRun}` (create missing
  fields), `POST /api/team/ghl/backfill` `{dryRun, limit}` (Lead Source for existing tagged contacts), `POST
  /api/team/ghl/migrate` `{dryRun, offset, limit, force, onlyIds}` (Monday Giveaway Leads → GHL, idempotent on Monday Lead ID).
- Tests: `npm run test:call-owner` (Monday + GHL backends, switch, client, fields, admin) and `npm run test:onboarding`.

### Cutover
1. `POST /api/team/ghl/setup {dryRun:false}` once (creates the missing fields). 2. `POST /api/team/ghl/backfill {dryRun:false}`
until `remaining` is 0. 3. `POST /api/team/ghl/migrate {dryRun:true}`, read the rows, then `{dryRun:false}` with `offset`
until `nextOffset` is null. 4. Preview at `/leads?backend=ghl`. 5. Set `LEADS_BACKEND=ghl` on Vercel (Production) and
redeploy. Follow-up calendar feeds re-issue events under the GHL ids after the flip. GHL search results lag writes by a few
seconds, so a roster refresh right after a save can briefly show the old status; the lead detail is always fresh.
