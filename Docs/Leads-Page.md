# Giveaway call desk — creativecowboys.co/admin (Sales tab)

> **October 2, 2026:** the desk is served at `/admin`. `/leads` and anything under it forwards there with its query
> string, so every older link still works. Where this page says `/leads` in a dated section, read `/admin`. The move,
> the forward and the sign-in rules are in `Docs/Admin.md`.

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
`cc_admin_token` cookie as before (issuer `cc-admin`, now 30 days, `sub` = the email). `src/middleware.ts` sends
unauthenticated visitors from `/admin` to `/admin/login?next=<where they were going>` (path and query, since Oct 2
2026); the APIs still check the cookie via `src/lib/team-auth.ts`. ADMIN_USERNAME / ADMIN_PASSWORD are no longer used. The rep name on a call note is still self-selected.

## Code
- `src/app/leads/` — desk UI (desk.tsx now calls the real API; `demo` prop kept for local review). The page that
  mounts it is `src/app/admin/page.tsx` since Oct 2 2026.
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
- `/admin` is noindex (meta and `X-Robots-Tag`) and not in navigation or the sitemap.

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
- **Feeds**: `GET /api/team/followups/<dave|josh|keaton>.ics?key=…` — private iCalendar, no cookie (calendar apps can't sign in). The key is an HMAC of the rep slug under `NEXTAUTH_SECRET`, so nothing is stored and rotating that secret rotates every feed. Timed follow-ups are a 30-minute block with a 15-minute alarm; date-only ones are all-day with an 8:30am alarm. Leads marked Not Interested / Bad contact number are skipped, and so is anything else off the call list (see "Off the call list" below); Won leads stay on the calendar (Dave, Sep 28 2026). Event UID = `followup-<leadId>@creativecowboys.co`, so a changed date moves the event instead of duplicating it. Monday errors return 503 + Retry-After so the calendar app keeps the subscription.
- **Where to get the link**: the roster's "📅 My follow-up calendar" button calls `GET /api/team/followups` (cookie) and shows the signed-in rep's link with Copy and an Apple Calendar `webcal:` link; Dave and Josh see all three. Google Calendar: Other calendars → + → From URL. Google refreshes subscribed feeds every few hours (not adjustable); Apple/iPhone can refresh hourly. Reps whose email is not one of the three (Madison) get "No calendar for this sign-in."
- **Deep link**: events link to `/admin?lead=<id>` (events issued before Oct 2 2026 say `/leads?lead=<id>`, which
  forwards); the desk selects that lead after the first load.
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
  fields; `{scope:"sales-options"}` adds a missing dropdown option, see "In progress" below), `POST /api/team/ghl/backfill` `{dryRun, limit}` (Lead Source for existing tagged contacts), `POST
  /api/team/ghl/migrate` `{dryRun, offset, limit, force, onlyIds}` (Monday Giveaway Leads → GHL, idempotent on Monday Lead ID).
- Tests: `npm run test:call-owner` (Monday + GHL backends, switch, client, fields, admin) and `npm run test:onboarding`.

Phase 2 — the Onboarding and Clients tabs on GoHighLevel, behind their own switch `DESK_BACKEND` — is described in
`Docs/Desk-on-GHL.md` (built October 2, 2026; off until Dave says go).

### Cutover
State on Oct 1 2026: the code is on main with `LEADS_BACKEND` unset (Monday). The 10 desk fields were created in GHL by
`/api/team/ghl/setup` (plus the 2 that already existed). The whole GHL write path — assign, lead source, save call,
idempotent retry, clear owner — was run on production against the test contact `C8FHl1LIfXEMI9isByB2` (never shown on
the roster). Dry runs: backfill would set Lead Source on 802 contacts (787 The Big Giveaway, 15 Ebook download); the
import would bring 264 Monday leads over — 254 matched by the board's GHL Contact link, 6 by email, 1 created (Geektopia),
3 created from their name alone (no email or phone on the board), 0 skipped — with 12 Monday updates copied as notes.

1. Check in GHL that no published workflow messages a contact on a bare "Contact Created" ("Wrangler - New Lead" is the
   one to open) — website forms start creating GHL contacts at step 5.
2. `POST /api/team/ghl/backfill {dryRun:false, limit:400}` until `remaining` is 0 (3 calls).
3. `POST /api/team/ghl/migrate {dryRun:false, offset:0, limit:50}`, repeat with each `nextOffset` until it is null.
4. Preview at `/admin?backend=ghl`; decide between the full roster (802) and a narrower one (`LEADS_GHL_TAGS`).
5. Set `LEADS_BACKEND=ghl` on Vercel (Production) and redeploy. Stop adding leads to the Monday board from then on.
Each of steps 2 and 3 is safe to repeat. Follow-up calendar feeds re-issue events under the GHL ids after the flip (a
subscribed calendar shows the old Monday-id events until its next refresh). GHL search results lag writes by a few
seconds, so a roster refresh right after a save can briefly show the old status; the lead detail is always fresh.
To go back: unset `LEADS_BACKEND` and redeploy — the Monday board is untouched by all of the above.

## Off the call list — Not Interested and do-not-call leads (October 1, 2026)
Dave: "when we mark a client we followed up with as not interested. I want to keep their contact in go high level for
email campaigns and news letters. But I don't want them in the sales list to call again."

- **Rule** (`src/lib/calls/roster.ts`, `offListReasons`): a lead is off the call list when its Outreach Status is
  **Not Interested**, or its GHL contact carries the tag **`do-not-contact`** or **`fake-lead`** (Dave's own tags from his
  calling). Tags nobody has explained (`concept-*`, `spoke-to-ai`, `ai-booked`) are not acted on.
- **Nothing changes in GoHighLevel.** No delete, no DND, no tag added or removed. Saving a call as Not interested writes
  what it always did — the call note, Outreach Status and Last Contact — so the contact stays available to email campaigns
  and newsletters.
- **Desk**: an off-list lead is in none of the normal "Show leads" views (All leads, Not contacted yet, Contacted / working
  on, Closed / bad number), and a search there never returns one — it only says "N more matches are off the call list".
  The view **Not interested / do not call** lists exactly those leads, each with a reason badge (Not interested / Do not
  contact / Fake lead), and search works inside it. The count line reads `N shown · N loaded · N off the call list`.
- **Saving a call as Not interested** drops the row at once and the saved notice adds "Off the call list. Still in
  GoHighLevel for email." A refresh inside GHL's search lag cannot bring the row back: `mergeRoster` keeps the newer copy
  of a lead (by `updatedAt`) when the search hands back an older one.
- **Undo**: open the lead under Not interested / do not call → Start another conversation → save with a different outcome,
  or change Outreach Status on the contact in GHL. A `do-not-contact` / `fake-lead` tag is removed in GHL, never from the
  desk; a lead with a tag stays off the list until the tag is gone, whatever its status.
- **Calendar feeds** skip off-list leads (`buildFeed`), whatever their status.
- **Safety net**: the tag rule needs GHL to return each contact's tags with the roster search. The roster response carries
  `noCallTagsRead`; if a roster ever comes back with no tags at all the desk shows a warning instead of quietly listing
  a do-not-contact lead.
- **Unchanged**: Won and Bad contact number. Both still show under All leads (sorted last) and under Closed / bad number;
  the calendar feeds still skip Bad contact number and still keep Won. The roster API still returns every lead (with
  `noCallTags` on each) and the split happens in the browser, so the Not Interested rule applies on the Monday backend too.
- Tests: `roster.test.ts` (rule, views, search, undo, reload merge), `followups.test.ts` (feeds), `ghl.test.ts` (tags on the
  lead, read-only roster search, the Not interested save writes no tag or DND).

## In progress — a fifth call outcome (October 2, 2026)
Dave: "We need to add one that says something like, in progress. Cause most of these we are still working on." The wrap-up
step offers **In progress** first, for a lead the rep talked to and is still working. Saving it writes the call note,
Outreach Status **In progress** and Last Contact; the follow-up date and time stay optional. The lead stays on the call
list under Contacted / working on, and shows in the status filter and, with a follow-up date, on the rep's calendar feed.
The GoHighLevel dropdown has to have the option: owner-only `POST /api/team/ghl/setup {"scope":"sales-options"}` says
which option it would add to which field, and `{"scope":"sales-options","dryRun":false}` appends it. It looks at Outreach
Status and Interest only (never Lead Source) and adds only the options the desk itself writes (`WRITTEN_OPTIONS` in
`src/lib/ghl/fields.ts`), sending the existing options back in their order and reading the field back. That update call is
not in GoHighLevel's published spec, so if it is refused the report says so and the option is added by hand in GoHighLevel
(Settings → Custom Fields → Outreach Status); the desk reads the list live, no deploy, and either capitalisation works.
Every save checks its status against the options the live field has (`outcomeOption` in `src/lib/calls/ghl.ts`) and
refuses a missing one in plain words before anything is written, then reads the status back after the write and warns if
GoHighLevel did not keep it. On the Monday rollback path In progress is recorded with the board's existing **Contacted**
label (`mondayOutcome`), so nothing new is written to the frozen board.

## Names on the roster, and Sign out (October 2, 2026)
The roster is built from GoHighLevel's contact search, which returns names lower-cased. A roster row now shows the
contact's name with its capitals back (`displayName` in `src/lib/desk/names.ts`), the lead header does the same, and so
does the first name in the opener. A lead with no business name has the contact's name as its title; it is shown once,
not again underneath. Business names are shown exactly as stored. Nothing is written: the record keeps the name as
GoHighLevel holds it. Details: `Docs/Desk-on-GHL.md`, "Names on the lists, and clients that have left".

The roster answer (`GET /api/team/calls`) also carries `me`, who is signed in, for the Sign out control on the desk's
bar: `Docs/Admin.md`, "Sign out".

## What they told us — the form answers on a lead (October 2, 2026)
Dave: "if I click on Ansel … he came from an ebook download. I can't see what he was interested in from our page." The
answers were already in GoHighLevel; the desk now shows them. An opened lead starts with a **What they told us** block,
above the Lead Source strip: an ebook lead reads "Downloaded the HVAC playbook (7-Day Google Business Profile Fix)" with
Crew, Typical job, Website and Fit (the tier in plain words: A = best fit: a crew of 2 to 15, jobs of $2,000+, no
website · B = a crew, or jobs of $500+ · C = solo, small jobs), plus the campaign it came from when the link carried one;
a giveaway entrant reads "Entered the Big Giveaway" with the business type, website or "None yet", the campaign, the site
audit score with its report, and Interested In; a website form lead reads "Filled out a form on our website" with the form,
the service, the industry, the day it was sent and their message. "Came in" is the day the contact was created in
GoHighLevel. Only answers that exist are shown, and a lead with none (a referral typed in by hand, any Monday lead) has no
block. The roster row carries a small chip beside the Lead Source tag: trade and tier for an ebook lead ("HVAC · Tier C"),
a short business type and whether they have a site for an entrant ("Trades · no site").

- **Where the answers live.** Ebook: the contact fields Playbook Trade, Playbook Crew Size, Playbook Typical Job, Playbook
  Has Website, Playbook Tier and Playbook City, GoHighLevel's own source line ("Playbook: HVAC GBP Fix (facebook / fall)"),
  and the tags `playbook-lead`, `playbook-<trade>-gbp`, `pb-tier-<a|b|c>` (written by `src/lib/ghl-playbook.ts`). Giveaway:
  Giveaway Business Type, Giveaway Source and the `giveaway-has-site` / `giveaway-no-site` tags (`src/lib/ghl-giveaway.ts`).
  Website form: the source line "Website form: Contact Page", the `website-form` tag, and the note
  `src/lib/ghl-website-form.ts` writes with the service, industry and message; the block reads that note from the lead's
  history, where it also shows under Latest saved notes / Before you call.
- **Read by name, never written.** The intake fields are a read-only catalog (`INTAKE_FIELDS` in `src/lib/ghl/fields.ts`),
  resolved by field key or name with the desk's own fields and cached the same way, so the roster and the lead make
  exactly the requests they made before. They are not in `SALES_FIELDS`, so the field setup never creates or edits them,
  and nothing on the desk writes a field, a tag or a note for this. When a field is blank (an older contact) the tags and
  the source line stand in. "direct" (ebook) and "organic" (giveaway) are what the forms write when the link had no
  campaign; they are left out.
- **Code.** `src/lib/calls/told.ts` builds the values from a contact (`toldFromContact`, called by `mapLead`, so the
  roster, the lead and the lead an assignment returns all carry `told`) and words the block and the chip (`toldView`,
  `toldChip`); it is pure, so the desk imports it. Tests: `src/lib/calls/told.test.ts` (each source, empty answers, tag
  and source-line fallbacks, tier wording, ordering, the chip, and that the roster and lead requests are unchanged).

## The people list scrolls on its own (October 2, 2026)
Dave: "I want to be able to scroll down through that list, but I want the content on the page to stay where it is. So I
need the sidebar to be scrollable."

- **Two-column widths (761px and up).** The roster on the left is pinned: it stays in the window while the page scrolls,
  and it is exactly as tall as the window below whatever part of the header is still on screen (the whole window once the
  header has scrolled away). Its heading, search and filters stay put at the top; only the list of people scrolls, with
  its own scrollbar, and reaching either end of the list never moves the page. The open lead on the right scrolls with
  the page as before.
- **The opened lead stays in sight in the list.** After a filter change the list shows that lead's card if the new list
  has it, otherwise it starts from the top. While a search is typed, results start from the top (a search is looking for
  someone else); clearing it brings the opened lead back into sight. A calendar link (`/admin?lead=<id>`) scrolls the
  list to that lead's card. Only the list moves, never the page, and a card picked by clicking stays where it is. This
  also applies to the phone's list box.
- **Room for the list.** In the pinned roster the Lead source and Show leads captions sit beside their selects, "My
  follow-up calendar" opens its box above the button (over the list), and the "01 — People first" note that closed the
  roster is gone. On a short window at the top of the page the list starts small under the header; scroll the page
  anywhere outside the list and the roster pins to the top at full height.
- **Phones (760px and under)** are unchanged: the roster sits above the lead and the list scrolls in its 270px box.
- **Code.** The "Pinned roster" block at the end of `src/app/leads/calls.css`. `desk.tsx` measures how much of the
  header is on screen and hands it to the CSS as `--call-roster-gap` on `.call-layout` (kept current on scroll and
  resize; without the script the roster is simply a full window tall), and holds the rules for keeping the opened lead
  in sight. The Onboarding and Clients tabs share nothing with it.

## Businesses on Onboarding or Clients are not on Sales (October 9, 2026)

Dave: "if a lead is moved to the active clients or even in the onboarding part, they get removed from the column where it says 'sales'
… Once they move to onboarding and active clients, we don't need to be able to find those people in the sales section."

- **Rule** (one definition, `src/lib/desk/record.ts`): `onOnboardingTab` = an onboarding record (the `desk-onboarding` tag or a
  Desk Onboarding Stage), any stage; `onClientsTab` = a client record (the `desk-client` tag or a Desk Client Status) that is not still
  onboarding; `deskTabOf` = which of the two a contact is on, or null. The Clients tab's own list filters with `onClientsTab`, the
  Onboarding tab lists exactly the onboarding records, and the Sales roster leaves out every contact `deskTabOf` places — so the three
  tabs cannot disagree. Every client status counts (active, at risk, paused, payment issue, churned, legacy), and so does a launched
  onboarding record.
- **Where it is applied**: on the server, in the roster itself (`GET /api/team/calls` → `getCallsPage(…, { hideDeskRecords })` in
  `src/lib/calls/backend.ts` → the `hide` hook in `src/lib/calls/ghl.ts`). Hidden businesses are not in `leads` at all, so the list,
  search (names and phone digits), owner / status / source filters, the "Show leads" views and every count leave them out. They come
  back only as `deskHidden: [{ id, name, tab }]`. No extra GoHighLevel request: the same definitions cache and the same search.
  Applied when the desk is on GoHighLevel (`DESK_BACKEND=ghl`, or `?desk=ghl` on the page); the Monday path is unchanged.
- **On screen**: one quiet line in the count, e.g. `804 shown · 809 loaded · 5 off the call list · 5 hidden (in Onboarding or Clients)`.
  No toggle. A handoff made from this tab hides its lead at once (GoHighLevel's search takes a few seconds to catch up).
- **Calendar links**: a follow-up feed still lists a handed-off client's booked call (Dave, Sep 28 2026 — the feeds do not ask for
  the rule). Its `/admin?lead=<id>` link now opens the business on the Onboarding or Clients tab instead of an empty Sales panel.
- **Unsaved call notes** for a lead that moved on (handed off with notes still open, or by a teammate) are reached from a line under
  the count, "Unsaved call notes for X, now on the Onboarding tab. Open the notes", until they are saved.
- **Not changed**: nothing is written to GoHighLevel (no tag, stage, owner or status), the Onboarding and Clients tabs, the package
  builder's customer search (GoHighLevel's own search), and the calendar feeds.
