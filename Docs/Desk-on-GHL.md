# Onboarding and Clients on GoHighLevel — the `DESK_BACKEND` switch

Dave, October 1, 2026: "We need to cut the link to Monday and use just go high level. Especially for the ones in the
onboarding tab and active clients. But we need the ability to add notes and comments in the active state."

Phase 1 moved the **Sales** tab to GoHighLevel (`LEADS_BACKEND`, see `Docs/Leads-Page.md`). This is Phase 2: the
**Onboarding** and **Clients** tabs.

> **Status — live since October 2, 2026.** The cutover below was run that day and `DESK_BACKEND=ghl` is set on Vercel
> Production: both tabs run on GoHighLevel. The runbook is kept as the record of how it was done (and of how to go back).
> Added the same day, after the cutover: **legacy clients** — see the section of that name near the end.

As first shipped it was built and on main but **off**: with `DESK_BACKEND` unset every route takes the same Monday code
path as before, nothing is created in GoHighLevel and nothing is imported.

## The switch
- `DESK_BACKEND=ghl` (Vercel, Production) puts both tabs on GoHighLevel. Anything else, or unset, is Monday.
- **One switch for both tabs.** Graduation, the "one place at a time" rule, the giveaway-winner billing guard and the
  Stripe sync all read across onboarding and clients; a half-flipped desk would need cross-system code nobody wants to run.
- **Preview before the flip:** `/leads?tab=onboarding&desk=ghl` and `/leads?tab=clients&desk=ghl`. The `desk`
  parameter is kept while moving between tabs and clients. Anyone on the team can look; until the flip **only an owner**
  (dave@ / josh@, `TEAM_OWNER_EMAILS`) can change a GoHighLevel desk record. The parameter is `desk`, not `backend`:
  `/leads?backend=ghl` is the Sales roster's own preview from Phase 1 and does not move these two tabs.
- List routes follow the switch (or `?desk=`). A record route follows the **id's shape**: a GoHighLevel contact id
  always goes to GoHighLevel; an all-digit Monday item id goes to Monday while the switch says Monday, and after the flip
  it is looked up among the imported records (never sent to Monday) — old links and open tabs keep working.
- The Stripe webhook, the nightly reconcile, the package builder's winner guard and the client intake "Submit" follow the switch.
- **After the flip nothing reaches Monday unless someone asks to look back.** `?desk=monday` still lists the two old
  boards (read-only, and the only thing that still needs `MONDAY_API_TOKEN` besides the import); opening a row from that
  list opens its GoHighLevel record; and a handoff or Add client from that view is refused rather than written to Monday.

## Model — one contact per business
A business is **one GoHighLevel contact for its whole life**: lead → onboarding → client. The Sales tab already works the
contact; the Onboarding and Clients tabs read and write the same contact through desk-owned custom fields. So the notes
history is continuous from the first sales call to the active account, on one record.

- An **onboarding record** is a contact with a `Desk Onboarding Stage` (or the tag `desk-onboarding`). A **client** is a
  contact with a `Desk Client Status` (or the tag `desk-client`). A contact can be both; graduation does not copy anything.
- The record id on the desk is the contact id. The version token is the contact's `dateUpdated`.
- Owners (onboarding owner, build owner, account manager, sales owner) are stored **by name** in desk fields, so someone
  with no GoHighLevel user (Madison) can own a client. The contact's own GoHighLevel owner (`assignedTo`) stays the sales
  owner and is only ever set when the contact has none.

**Why not an Opportunities pipeline** (native kanban in GoHighLevel, and the token has the scope): Josh's Local SEO Engine
already runs a pipeline there (`Local SEO — Clients`) with published automations on stage changes — LSE-02 (onboarding
reminders), LSE-05 (launch emails), LSE-10x (exit interview). Their trigger filters were set by hand after GoHighLevel's AI
builder left them blank ("trigger filters (pipeline/stage/field never set)" — `local-seo-engine`
`docs/LSE-Workflow-Build-Sheet.md`), and the API does not expose triggers, so the desk cannot prove that creating or moving
an opportunity in a second pipeline would fire nothing. A contact-only model touches no opportunity at all. A kanban view
can be had in GoHighLevel with a Smart List grouped on `Desk Onboarding Stage`; an opportunity mirror can be layered on
later if Dave and Josh want it, once someone has read those triggers.

## What the desk writes in GoHighLevel — and what it never does
**Custom fields (44, all new, all named "Desk …"; resolved by name at runtime, no field id in code — the 43 the cutover
created, plus `Desk Legacy Client`, added after it and the one field the desk can run without):**
Desk Packages (multi-select, the package labels byte-for-byte), Desk Custom Monthly, Desk Notes, Desk GBP Access,
Desk GBP Last Checked, Desk GBP URL, Desk Search Atlas Listing, Desk Drive Folder, Desk Last Touch ·
Desk Onboarding Stage, Desk Onboarding Health, Desk Onboarding Owner, Desk Build Owner, Desk Sales Owner,
Desk Business Type, Desk Signed, Desk Target Launch, Desk Profile Complete, Desk Baseline Captured, Desk DNS Path,
Desk Next Action, Desk Next Action Due, Desk Setup Amount, Desk Agreement, Desk Onboarding Payment, Desk Intake,
Desk Handoff ID, Desk Checklist, Desk Link, Desk Monday Onboarding ID · Desk Client Status, Desk Client Health,
Desk Account Manager, Desk Pay Status, Desk Pay Method, Desk Billing Day, Desk Next Bill, Desk Last Payment,
Desk Client Since, Desk Term Ends, Desk Last Report Sent, Desk Stripe Customer ID, Desk Monday Client ID,
Desk Legacy Client.

**Tags added:** `desk-onboarding`, `desk-client`, and `monday-import` (the desk's own Phase-1 tag, on contacts the import
creates). A handoff from a lead also does what the Sales tab already did: Outreach Status → Won, Last Contact, tag `sales-won`.

**The contact's own fields:** first / last name, company, email, phone, website, city — filled **only where blank** at
handoff and import (the business name the rep types at handoff is the one exception), and edited on purpose from the
Clients panel's contact fields (email and phone can be corrected there, never blanked). `assignedTo` only when empty.

**Notes** (handoff summary, desk notes, imported Monday updates) and **tasks**: one when a payment turns Card Failed or
Overdue (see Stripe below), and the ones the team adds on a client's Tasks list (see "Tasks" below).

**Never:** any field named `LSE …`, any `lse:` tag, opportunities, pipelines, workflows, conversations, emails or texts.
A write guard in `src/lib/desk/fields.ts` refuses any custom field whose live name does not start with "Desk", and
`ensureTag` refuses any tag that is not one of the three above. Every desk test ends by asserting exactly this.

### Look-alikes that are deliberately NOT wired together
Josh's LSE automations email and text clients when these change. The desk keeps its own field for each and never writes
the LSE one. Connecting any of them is a decision for Dave and Josh.

| Desk | LSE | What the LSE one triggers |
|---|---|---|
| Desk Client Health / Desk Onboarding Health | LSE Health | LSE-08: red → tag `lse:red`, At risk, call task; yellow → Loom task; green → back to Active |
| Desk Pay Status (Card Failed / Overdue) | tag `lse:payment-failed` | LSE-09: emails and texts the client about the card, then At risk / pause tasks |
| Desk Term Ends | LSE Term End | LSE-10: 30 days before, moves to Renewal and emails the client |
| Desk Last Report Sent | LSE Report URL / LSE Last Report Sent | LSE-06: a new report URL emails the monthly results |
| Desk Profile Complete | LSE Profile Complete | LSE-03: emails "you're in the build queue", moves to Ready to build |
| Desk Baseline Captured | LSE Baseline Captured At / LSE Base Review Count | LSE-05: launch guard and "you're live" emails |
| Desk Target Launch | LSE Build Week | LSE-04: emails the client their build week |
| Desk GBP Access, Desk DNS Path, Desk Packages | LSE GBP Access, LSE DNS Path, LSE Plan / LSE Active Addons | none known (profile / billing fields) |
| Desk Link, the client intake link | LSE Onboard Link | merged into the LSE welcome and reminder emails |
| Desk Onboarding Stage / Desk Client Status | opportunity stage in `Local SEO — Clients` | LSE-02, LSE-05, LSE-10x |

`GET /api/team/ghl/diag` lists every field and tag on the location grouped desk / sales / LSE / other, so the list above can
be checked against the live account before the cutover.

## How each piece works on GoHighLevel
- **Lists.** One contact search per tab ("has the desk tag OR has the stage field"; if GoHighLevel rejects the custom-field
  clause the list falls back to the tag). No cursor: the whole list comes back at once. Search results lag writes by a few
  seconds, so anything that must be fresh — a panel, a patch, "does this lead already have a record?" — reads the contact by id.
  The designated test contact never shows in a list.
- **Looking is not changing.** Before the flip, a non-owner who opens a GoHighLevel desk record reads only: the two things
  a panel can write on its own (GBP access → Verified from a live Search Atlas read, and the intake-status repair) are
  skipped for them. After the flip they work for everyone, as on Monday.
- **Handoff from a won lead.** The lead's own contact becomes the onboarding record (desk fields + `desk-onboarding`), the
  summary is posted as a note, the checklist is built, the lead is marked Won on the same contact, the intake record is
  seeded. Same durable step record in Blob and the same Retry as before. Duplicate protection is a fresh read of the
  contact, not a search. **Add client** reuses the contact GoHighLevel already has for that email or phone, else creates one.
  A handoff that stops part-way (GoHighLevel fails after the contact is created, or between the fields and the tag) is
  finished by pressing the button again — same contact, the missing tag added, nothing written twice.
- **What a handoff never overwrites.** A contact that already carries desk data (it is a client, or was onboarded before)
  keeps it: packages are **added to**, notes are appended, GBP access and the intake status are never stepped back. A
  package that GoHighLevel's `Desk Packages` list does not have is refused before anything is saved, and after the save
  the contact is read back: if a package did not stick the handoff is an error until it does. Both exist for one reason —
  a Giveaway Winner label that goes missing would let a winner be billed.
- **A second handoff for the same business.** While its onboarding is still open, a new draft is *adopted* ("this client
  already has an onboarding record") and changes nothing. Once it is **Launched**, a new handoff is new work (an upsell):
  it starts a new round on the same contact — stage back to New handoff, the new packages added, a new summary note, the
  checklist rows the new packages need — and, by the one-place-at-a-time rule, the client is on the Onboarding tab until
  it is launched again. (On Monday this made a second pipeline row. Dave and Josh may want it different; it is one function.)
- **Checklist.** Lives on the contact in `Desk Checklist`, one readable line per item
  (`[x] Done · [~] Working on it · [!] Stuck · [ ] not started`, then `| phase | @owner | due YYYY-MM-DD`). Chosen over
  GoHighLevel tasks (twenty tasks per client would flood the assignee, and tasks have no "stuck" or phase) and over Blob
  (saved in the same request and under the same version check as everything else; the list view gets "what is missing"
  with no extra read; and it keeps the record in GoHighLevel). An item's id is a hash of its name. Every checklist write
  is read back and compared whole; anything GoHighLevel did not keep restores the previous text and is reported as an error.
- **Intake links, files, tokens.** Nothing in storage moves. The intake record, the hashed token, the token → record index
  and the files stay in the private Blob store under the same keys; a client imported from Monday keeps its Monday-era key
  (the pipeline item id, or `c` + the client item id) and the import stamps that record with its contact id. So a link a
  client was sent before the switch opens the same record and files. A record born on GoHighLevel is keyed by the contact
  id. Only the status the desk shows ("Link issued", "Client submitted") moves to `Desk Intake`. Storage is the truth for
  a submit: if the status write was missed (GoHighLevel down at that moment, or a submit that landed on the old board
  between the import and the flip), opening the panel shows "Client submitted" and puts it on the contact.
- **Graduation.** Same contact: stage → Launched, tag `desk-client`, and whatever client fields are still blank get their
  starting values (Active, Too New, No Billing Set Up, Stripe via GHL unless a giveaway winner, Client Since, account
  manager). A client that was already on the Clients tab keeps every value it has. Safe to press twice.
- **One place at a time.** A client whose onboarding stage is not Launched shows on the Onboarding tab only.
- **Money.** Monthly $ and MRR were Monday formulas; they are now computed from the package labels plus Custom $/mo
  (`src/lib/desk/money.ts`, prices from the package catalog, label for label what the formulas gave). One deliberate
  difference: a Giveaway Winner is $0 here whatever else is ticked — the Monday formulas only add up labels, so a winner
  with Local Growth may still show the list price there. Owners-only visibility is unchanged, and on the Clients tab it covers the notes timeline too: the package
  builder's notes (plan line items and totals) are shown to owners only.
- **Stripe.** Sync button, webhook and nightly reconcile write the same things as before, into desk fields. Because Josh's
  two Monday automations (Payment Status → Card Failed / Overdue: move to Payment Issue and notify Josh) stop firing once
  the desk no longer writes to Monday, the desk moves the client to Payment issue itself and adds **one GoHighLevel task**
  on the contact for the account manager (Josh when the manager has no GoHighLevel user), with the same wording. Internal
  only; one per failure (a burst of Stripe events, or an open task with the same wording, does not make a second).
  `DESK_PAYMENT_ALERTS=off` turns the task off.
- **Giveaway winners.** A winner is a contact whose Desk Packages includes Giveaway Winner. The package builder reads the
  contact itself first (fresh, no lag), then every winner on the desk (same email, phone or exact name on another
  contact). If either read fails it refuses to bill, as before — and it also refuses if GoHighLevel will only answer the
  weaker tag-only list (which could miss a winner), rather than work from a list that may be short.
- **Search Atlas / GBP.** Unchanged: a linked, verified listing sets Desk GBP Access to Verified (and stamps Desk GBP Last
  Checked for a client, once a day).

## Notes and comments
Both panels have a **Notes** section. On GoHighLevel it is the contact's notes, newest first, each with who wrote it, when,
and a small label: Sales call, Handoff, Onboarding, Client, Billing, Imported, GoHighLevel (typed in GoHighLevel itself),
Desk (system events such as "Launched"). Adding a note saves a normal GoHighLevel contact note authored as the signed-in
team member (as the integration, still carrying the name, when that person has no GoHighLevel user). It works in every
client group — Active, Payment issue, At risk, Paused, Churned. A note is idempotent on a browser-minted id (a retry after
a dropped connection finds the note instead of posting it twice) and needs no record version. Markers
(`[CC-NOTE:…] [CC-SRC:…] [CC-BY:…]`) are stripped before anyone sees the text, on the Sales tab too.

**Changing and deleting a note (October 4, 2026).** Dave: notes must be editable, and deleting one is one click. Each note
on the GoHighLevel desk has two small text controls at the far right of its header line, **Edit** then **Delete**, set apart.
- **Edit** turns the text into a box with **Save** and **Cancel**. Save sends the new text to GoHighLevel
  (`PUT /contacts/{id}/notes/{noteId}`, the body only), so the note keeps its author and its date there; the timeline shows
  "· edited" (hover for when and by whom). Every marker the note carried is kept (a sales call's `[CC-CALL]`, a desk
  note's `[CC-NOTE]`…), plus `[CC-KIND:<label>]` (what it was: an edit never changes its label, so an edited billing note
  stays owners-only) and `[CC-EDITED:<when>|<name>]`. Saving the same text writes nothing. The note is read back: a change
  GoHighLevel did not keep is an error. The Sales tab strips the two new markers as well.
- **Delete** deletes the note at once, no question asked (Dave's call), in GoHighLevel itself
  (`DELETE /contacts/{id}/notes/{noteId}`), so it is gone there too. Permanent: GoHighLevel keeps no copy. The notes are
  read back afterwards: a note GoHighLevel kept is an error, never shown as deleted.
- Who may: the same people who may add a note (everyone on the team now the desk is on GoHighLevel), on any note on the
  contact. One exception: on the Clients tab, billing notes (the package builder's) are shown to owners only, and only an
  owner can change or delete one. Only a note that is on THIS contact can be touched through its panel.
- Requests: `PATCH /api/team/onboarding/<id>` or `/api/team/clients/<id>` with `{ "action": "editNote", "id", "text" }` or
  `{ "action": "deleteNote", "id" }` (no record version needed, like adding one). Code: `editDeskNote` and
  `deleteDeskNote` in `src/lib/desk/notes.ts`; the controls in `src/app/leads/notes.tsx`.

## Tasks (October 4, 2026)
Dave: "we need a running task list for each client, while onboarding. something we can add to.. like now, i have to ask
Chad to setup stripe.. but not all clients need that." Both panels (Onboarding: under Next action; Clients: first, under
the flags) have a **Tasks** section, laid out like Notes.
- **A task is a native GoHighLevel contact task** (`/contacts/{id}/tasks`), so it shows in GoHighLevel on the contact too,
  and a task typed in GoHighLevel (or left by the package builder or a payment alert) shows on the desk. The desk keeps no
  copy of its own.
- **Add:** a short title (up to 200 characters), an optional due date, an optional assignee (everyone on the desk with a
  GoHighLevel user: Dave, Josh, Keaton; anyone added with `GHL_REP_IDS` joins the list). Enter in the box adds it.
- **Check it off** with its box; open it again by unticking it. Done tasks fold into "N done" at the foot, struck through.
  Open tasks are listed by due date (overdue in red, "Due today"), the ones with no due date last.
- **Due dates.** GoHighLevel's API will not save a task without one (its spec lists `dueDate` as required). A date is saved
  as 5:00 pm Eastern on that day. **No due date is saved as Dec 31, 2099, 5:00 pm Eastern**, the task's description says
  so in plain words, and the desk reads any date in 2099 or later as "No due date" (it never lets anyone pick one).
  In GoHighLevel such a task shows "Dec 31, 2099" and sorts last.
- **What a desk task carries:** its description reads "Added in the Back Office by Dave on Oct 4, 2026." (plus the
  no-due-date line when there is none), then markers the desk reads back: `[CC-TASK:<id>]` (a browser-minted id; a retry
  after a dropped connection finds the task instead of adding a second one), `[CC-SRC:onboarding|client]`, `[CC-BY:<name>]`
  (a task made through the API records no author in GoHighLevel). The panel shows "added by Dave"; a task from anywhere
  else says "from GoHighLevel" and shows its own description (three lines at most).
- **Who it is on:** `assignedTo` only when someone is picked. An unassigned task notifies nobody. A task assigned to
  someone may get them GoHighLevel's own "task assigned" notice if their GoHighLevel settings send one; the desk itself
  sends nothing.
- **What it never does:** delete a task, edit a task's title, date or assignee (do that in GoHighLevel), write a field or
  a tag, or touch Monday. Adding or ticking a task writes nothing to the contact itself, so no workflow keyed on a field
  or a tag can start from it.
- **Version.** If a task write moves the contact's `dateUpdated`, the route answers with the version right before and
  right after the change, and the panel takes the new one only if its copy was current before, so the next change in
  the panel is not refused as "someone changed this client". The "after" version is only ever new when nothing the desk
  shows or writes on the contact changed in between, so a change someone else saved during the task write is still
  caught by the panel's next save. The panel sends one task request at a time (each answer replaces the whole list).
- **Known limit:** the same add sent at the same moment to two server instances (a double click that lands on two warm
  functions) could make two copies; on one instance, and on any retry after a dropped answer, it makes one.
- **Routes:** `GET /api/team/tasks/<contact id>` (the list and who can be assigned), `POST` (add), `PATCH`
  (`{ taskId, completed }`). Team sign-in; changes follow the desk's write rule (everyone, now the desk is on
  GoHighLevel). A task can only be changed through the contact it is on. Any contact on the location can carry tasks
  (Blue Ridge Golf Carts, still a Sales lead, was seeded this way); the panels show them for onboarding records and
  clients. Each panel's first load carries the list (`tasks` on the detail answer), and a GoHighLevel hiccup on the list
  never hides the client: the section says so and offers Try again.

## Operator tooling (owner-only; every write is a dry run unless the body says `dryRun: false`)
- `GET /api/team/ghl/diag` → `desk` (owners; everyone else gets the Phase-1 part only): desk fields present / missing,
  every field and tag on the location by who owns them, record counts, and the exact write list.
- `POST /api/team/ghl/setup` `{ "scope": "desk" }` → the missing "Desk …" fields and whether a desk tag name is already
  taken; `{ "scope": "desk", "dryRun": false }` creates the fields. Never edits an existing field.
- `POST /api/team/ghl/desk-selftest` `{ "dryRun": false }` → on the designated test contact only: writes a sample to every
  desk field (a life-size checklist and notes block, and the awkward labels on purpose — an em dash and a dollar sign, a
  comma inside a package label, parentheses, a slash), reads it back, clears it, restores what was there, round-trips a
  desk tag, checks the list filter, leaves one labelled note per day — as long as the longest note the desk accepts, to
  prove the marker at its end survives. If GoHighLevel refuses the batch it writes one field at a time, so the report
  names the field it refused (`checks[].error`) instead of failing on the first one. It also reports `version` (does the
  contact's `dateUpdated`, the desk's version token, move on a field write and on a tag add) and `searchCarries` (which of
  the fields the lists read a search result actually has).
- `POST /api/team/ghl/desk-selftest` `{ "scope": "tasks", "dryRun": false }` → the task list on the same test contact:
  sends one raw task with no due date (to record what GoHighLevel does with it: `noDueDate`), adds a desk task with no due
  date and one due in a week (both unassigned), sends the second again (must not add another), reads both back, ticks one
  off and opens it again, reports the field names GoHighLevel returns on a task (`taskFields`) and whether the contact's
  version moved (`version`), then removes every task the run created and only those (`cleanup`; a task that was on the
  test contact before the run is never removed, whatever an answer says). Unknown body keys are refused, so a typo never
  runs the field self-test for real.
- `POST /api/team/ghl/desk-selftest` `{ "scope": "notes", "dryRun": false }` → note edit and delete on the test contact:
  adds one labelled note, changes its text the way the panel does (new text, same author and date, marked edited),
  deletes it (gone in GoHighLevel, every other note still there), and checks that deleting it again is refused. A note it
  could not delete is removed at the end.
- `POST /api/team/ghl/desk-migrate` → the two Monday boards to GoHighLevel. Body: `dryRun` (default true), `onlyIds`
  (Monday item ids, for a one-row trial), `offset` / `limit`, `force` (re-write a row already imported), `map`
  (`{ "<monday item id>": "<contact id>" }` to pin a row), `boards` (`["onboarding"]` / `["clients"]`), `includeOffDesk`
  (also Active Clients rows without "Team desk"), `createNameOnly`. Match order for an onboarding row: already imported →
  `map` → the board's GHL Contact link → the lead it was handed off from → email → phone → exact business name (one
  candidate) → create. For a client row: already imported → `map` → its onboarding record's contact → GHL Contact link →
  Stripe customer → email → phone → exact business name → create. A client row never gets a second contact while its
  onboarding record is still to be imported. The report lists every row with its match, the fields and contact details it
  writes, warnings, and what it did in storage; it contains no secrets.
  - Every matched contact is **read fresh by id** before anything is decided (search results lag, and can come without
    the name pair), so "fill only what is blank" and "keep the owner" are decided on what the contact really holds.
  - **One contact is never two onboarding records (or two clients).** Two rows of one board that reach the same contact —
    two businesses sharing an email, or the same business listed twice — the second is `unmatched` with the reason, in the
    dry run too; it needs its own contact and `map`.
  - **`BLOCKED`** in a dry run (an error in a real run): the row carries Giveaway Winner and the live `Desk Packages` field
    has no such option. A winner never arrives without the label.
  - After each write the contact is read back: the checklist must be there whole and every package must have stuck, or
    the row is an error. A new contact is made with a plain create; if GoHighLevel says that email or phone already
    exists (its search had not caught up), that contact is matched instead and only its blanks are filled.
  - **Imported means finished.** A run that stopped after the fields were written (tag, notes or storage link missing)
    is completed by the next real run (`counts.finished`); a dry run says what is left.
  - `winners` lists every row on either board tagged Giveaway Winner with `imported` (it is on a contact) and
    `protected` (that contact's Desk Packages carries the label). After the flip the billing guard reads GoHighLevel
    only, so **every winner must be `protected: true` before the flip** (a winner on an Active Clients row without "Team
    desk" is brought over with `{"onlyIds":["<id>"],"includeOffDesk":true}`).
  - `force` re-writes fields from the board; it never removes a package the contact already has, never copies a note
    twice, and never replaces a checklist that is already on the contact. After the flip it is refused unless
    `overwriteLiveDesk: true` comes with it (it would put the old boards' values over work done on the desk since).
  - The import reads the field definitions fresh, so an option added in GoHighLevel a moment ago (Giveaway Winner, a
    business type such as "Referral") counts on the next run.
  An email or phone on the board that another contact already holds is left off the matched contact, with a warning
  (GoHighLevel refuses duplicates, and that refusal would fail the row). Monday hands over the newest 50 updates of an
  item; the report warns when an item has that many.
- These reports contain no `=`, `?` or `&` in their own text (the browser tool Claude reads them with redacts anything
  shaped like a query string). Error text passed through from GoHighLevel has those characters replaced with spaces.
  Names that come from the account (a custom field called "How did you hear about us?") can still carry one, so read a
  report as text with those three characters replaced: `r.text().then(t => t.replace(/[=?&]/g, " "))`.

## Cutover runbook
State on Oct 2 2026: code on main, `DESK_BACKEND` unset, no desk field exists in GoHighLevel, nothing imported.
On the boards that day: 4 onboarding rows (Choice Pressure Washing, Bourbon Leather Company, Arctic Law, Ladybug Hot
Sauces) and 2 Team-desk client rows (Squirrel Made Products, Choice Pressure Washing).

Precondition: the Sales tab is already on GoHighLevel (`LEADS_BACKEND=ghl`, done Oct 1 2026). With the desk on
GoHighLevel a lead that only exists on the old Monday board cannot be handed off — the lead and the onboarding record are
the same contact.

Every call below is made from Dave's signed-in Chrome on `/leads` (same origin, his cookie; a POST needs
`Content-Type: application/json`). Park the answer and read it in slices, with the three characters the browser tool
redacts taken out:
`await fetch('/api/team/ghl/desk-migrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).then(r => r.text()).then(t => { window.__x = t.replace(/[=?&]/g, ' '); return window.__x.length })`

**Before anything else:** open `/leads?tab=onboarding` and `/leads?tab=clients` on production with no parameter and
confirm they are the Monday desk exactly as before this code landed (the build was checked on production only as far as
the sign-in wall; nobody has looked at the signed-in Monday tabs since). Open one client panel and watch the network
tab: one detail request, not a stream of them.

0. **Look first, in GoHighLevel.** Settings → Tags: `desk-onboarding` and `desk-client` must not exist. Settings → Custom
   Fields: nothing named "Desk …". Automation → Workflows: note the "Total enrolled" count of every published workflow (the
   LSE set above all), and open any whose trigger could be a bare *Contact Changed*, *Note Added*, *Task Added* or
   *Contact Tag* with no filter. The API cannot show triggers.
1. `GET /api/team/ghl/diag` → read `desk.fields` (43 missing), `desk.tags`, `desk.writes`.
2. `POST /api/team/ghl/setup {"scope":"desk"}` (dry), then `{"scope":"desk","dryRun":false}` → `created: 43, failed: []`.
3. `POST /api/team/ghl/desk-selftest {"dryRun":false}` → `passed: 43`, `failed: []`, `clearFailed: []`, tag ok, filter
   accepted, restored, `version` says the token moved on the field write, the note was kept whole, and `searchCarries`
   shows `tags yes, customFields yes` (the lists need those two; a `NO` on website or the name pair only thins a list
   row). Compare the enrollment counts again: writing desk fields, a desk tag and a note on the test contact must have
   enrolled nothing. **Stop here if any field fails** — that is a value-shape problem to fix before a client is touched.
   The one known way out without a code change: if `Desk Packages` is the field that fails (a comma inside a label is the
   likely reason), delete that one field in GoHighLevel and add it again by hand as a single-line **Text** field with the
   same name. The desk shapes every value by the field's live type, so a text `Desk Packages` holds the labels joined
   with commas and is read back label for label. Run the self-test again.
   If the note comes back **CUT SHORT**, stop as well: desk notes and the handoff summary keep their markers at the end
   of the note, and a marker that is cut off means a retry could post the note twice. That needs a small code change
   (markers on the first line, as imported notes already have) before the import.
4. `POST /api/team/ghl/desk-migrate {}` (dry) → six rows. Read every match and warning. A row reported `unmatched` needs
   `map` (Squirrel Made Products has no email or phone on the board: it matches only if exactly one contact carries that
   business name). No row may say `BLOCKED`.
5. **Canary, twice.** First a business the LSE automations do not know:
   `POST /api/team/ghl/desk-migrate {"dryRun":false,"onlyIds":["13149876739"]}` (Bourbon Leather). Open
   `/leads?tab=onboarding&desk=ghl`, open the record, read the panel and the notes; open the contact in GoHighLevel;
   compare the enrollment counts; give it a few minutes. Then the one they are most likely to know — Choice Pressure
   Washing's board row was made from the LSE template, so its contact is the likeliest to carry `lse:` tags and LSE
   fields, which makes it the real test of "the desk writes to a contact those automations watch":
   `{"dryRun":false,"onlyIds":["13052279909","13125631264"]}` (its onboarding row and its client row). Compare the LSE
   workflows' enrollment counts before and after, and again a few minutes later. Nothing may have enrolled.
6. `POST /api/team/ghl/desk-migrate {"dryRun":false}` (with `map` if step 4 asked for one) → every row `done`. Run the dry
   run again a minute later → every row `imported` with "already imported — skipped", and every entry in `winners` is
   `protected: true`. A row that says "an earlier run did not finish" is completed by running step 6 once more.
7. Compare `/leads?tab=onboarding&desk=ghl` and `?tab=clients&desk=ghl` with the Monday tabs, row by row.
8. **Flip:** add `DESK_BACKEND=ghl` on Vercel (Production) and redeploy (the redeploy rebuilds, which the static `/leads`
   page needs). If anything changed on the boards between step 6 and now, run step 6 again with `"force": true` first
   (fields are re-written from Monday; notes are never copied twice; a checklist already on the contact is kept).
9. Check live: both tabs say GoHighLevel; open a client, add a note, see it in GoHighLevel under your name. Tell the team
   to stop editing the two Monday boards — anything typed there after the flip is invisible to the desk.

**Rollback:** remove `DESK_BACKEND` and redeploy. The Monday boards were never written by any of this, so the Monday desk
is exactly where it was at step 6; work done on the GoHighLevel desk after the flip stays in GoHighLevel. Intake links
issued on the GoHighLevel desk keep working either way.

## Legacy clients (added Oct 2 2026, after the cutover)
Dave: "our old clients.. we can call them legacy clients. We can bring them into the active clients tab on the leads page."
(The desk moved from `/leads` to `/admin` the same day; `/leads` forwards there. The API routes did not move.)

A **legacy client** is a long-standing client that was never onboarded through the desk and is billed outside
GoHighLevel (QuickBooks). On Oct 2 2026 that is the 17 Active Clients rows that never had "Team desk" ticked.

- **The marker** is one desk-owned contact field, `Desk Legacy Client` (single select, Yes / No). Yes is legacy; No or
  blank is a normal desk client. Resolved by name like every desk field, created by the same setup call, and covered by
  the same write guard. It is the one **optional** desk field (`OPTIONAL_DESK_FIELDS` in `src/lib/desk/fields.ts`): on a
  location where it does not exist yet every desk route works as before and nobody is legacy; only marking a client asks
  for it, by name.
- **Who sets it.** The import, for an Active Clients row without "Team desk" — and only where the field is blank. An
  owner (dave@ / josh@), from the client's panel: *Make this a desk client* on a legacy client, *Mark as legacy client*
  (one quiet line under Account) on a desk client. The panel always writes an explicit Yes or No, so a later re-import
  (even with `force`) never puts back a marker an owner took off. Nobody else can change it (403, checked on the server).
- **The Clients tab.** A `Legacy` badge beside the name, a kind filter (All clients / Desk clients / Legacy clients)
  that appears once there is a legacy client, and the header count: "18 on the desk · 17 legacy". Problems still come
  first; among rows with the same flags the desk's clients are listed before the legacy ones. With no legacy client on
  the list the tab is exactly what it was. Desk clients are not changed by any of this (the one addition: an owner sees
  a single line, "Mark as legacy client", at the foot of a desk client's Account section).
- **Money** is the same for everyone: a legacy client's packages and Custom $/mo count in the owners' monthly total, and
  amounts stay owners-only.
- **Quiet flags** (`flagsFor`, `src/lib/clients/board.ts`). A legacy client is only flagged for what its record tracks;
  a blank is "not tracked here", not a problem. Every rule for a desk client is unchanged.

  | Flag | Desk client | Legacy client |
  |---|---|---|
  | Payment issue | group Payment issue, or status Overdue / Card Failed | the same — someone set that on purpose |
  | GBP not verified | anything but Verified / No GBP Exists (a blank counts) | only when it is tracked: a linked Search Atlas listing that reads unverified, or access set to Requested or Lost / recheck. Blank or Not Requested is quiet |
  | GBP recheck due | Verified and never checked, or checked over 90 days ago | only when a check was stamped and is over 90 days old |
  | No report 35+ days | never sent, or over 35 days ago | only when a report was logged here and is over 35 days old |
  | Term ends soon | within 30 days | the same |
  | No Stripe link | Stripe method and no customer id | the same — so never while the method is QuickBooks invoice |

  The list also words the two blanks plainly for a legacy client: GBP "Not tracked", and — while nobody has set a payment
  status — how it is billed ("QuickBooks invoice · billed outside the desk") instead of the board's default "No Billing
  Set Up". The stored values are not changed.
- **Stripe leaves it alone** unless Stripe is part of its record (a stored customer id, or a Stripe payment method): the
  nightly reconcile skips it and a Stripe event is never matched to it by email. Otherwise a QuickBooks-billed client
  whose email is also a Stripe customer would be flipped to "Stripe via GHL". The panel hides "Sync from Stripe" for
  such a client; setting the method to Stripe via GHL, or pasting a customer id, brings all of it back.
- **A payment status someone sets by hand** still does what it does for any client: Overdue / Card Failed moves it to
  Payment issue and leaves the one task for the account manager. The **import never creates a task**.
- **Not changed:** the Sales roster (a legacy client's contact has no lead tag and no Lead Source), the giveaway-winner
  billing guard (a legacy client is a winner only if its packages say so, like anyone), onboarding, graduation.

### Bringing the old Active Clients rows over
None of the 17 rows has an email, a phone or a contact person on the board, and no contact in GoHighLevel carries any of
the business names (checked Oct 2 2026 with the dry run below against all 1,216 contacts: no exact name, and no
look-alike either). So each gets a **new contact made from the business name**: company name
= the business name, website where the board has one, nobody as the contact person, source "Team desk (Monday import)",
tags `desk-client` + `monday-import`, and the desk fields the row carries (status, health, payment status and method,
account manager, packages, notes, the Monday row id) plus `Desk Legacy Client` = Yes. A row's Monday updates, if it has
any, are copied as notes like every other import. No onboarding stage, no checklist, no Lead Source, no task.

**One board row, one contact — whatever goes wrong.** A contact with no email and no phone is the one kind GoHighLevel
will create twice, and its search — how a re-run finds "already imported" — runs a few seconds behind writes. So for a
contact made from a name alone the import does not lean on that search. It keeps its own records in private storage,
written **before** the create is sent and completed after it (`onboarding/import/client-<monday row id>.json` and
`onboarding/import/name-<business name>.json`), and reads them before it would create anything:
- a finished record → the contact is read by id, fresh, and the row is `imported` (running a row again straight away
  finds the contact instead of making a second);
- an **unfinished** record — the create was sent and its answer never came back (a timeout, a 5xx) — means the contact
  may exist, so the row is **held**: `BLOCKED … an earlier run started creating this contact at …`. If GoHighLevel did
  create it, its search lists it within a minute or two and the row then reads `imported` and is finished; if it did
  not, the row is free again ten minutes after the attempt. A create GoHighLevel *refused* (a 4xx) leaves nothing
  behind and can be run again at once;
- records that cannot be read → the row is `BLOCKED`, never created blind. With no storage at all a real run is refused.
- A real run takes a lock (`onboarding/import/lock.json`, gone when the run ends): a second run posted while one is
  going answers 409 before it reads a row. A run the platform cut off frees the lock six minutes after it started.
- The same business name is one contact across runs too (the name record), however short the name; two rows with one
  name are refused as one business, and a dry run compares the rows of that run with each other.
- **A pin (`map`) never puts one row on two contacts:** if the row was already imported it is refused (or, once the
  search lists the import, ignored with a warning).
- **A row never lands on a live desk client by accident.** A contact that is already a client on the desk and did not
  come from this row is refused (`unmatched`, with the reason) whether it was reached by name, email or phone. Pinned to
  it on purpose with `map`, the row joins it and everything the client holds is kept — status, health, payment, manager —
  the row only fills what was blank, and the client is **not** marked legacy (an owner does that from the panel). The
  designated test contact is never imported onto.
- **The request is checked strictly.** `onlyIds` that is not a list of item ids, a `map` entry that is not an id → an id
  (a pasted link, say), a misspelt option name: each answers 400 "Nothing was run" — a filter that is malformed is never
  quietly dropped, because "no filter" with `createNameOnly` means a new contact for every unmatched row.

Each row that would create a contact also lists the contacts already in GoHighLevel that **look like** it (`similar`,
strongest reason first, five at most: the same name apart from Inc / LLC / The — however short; one whole business
name inside the other; a spelling a letter or two apart; an email or website that spells the business name; the row's
website or email domain, sub-domains included; a business name that starts with the same uncommon word) — and the rows
earlier in the same run. It is a hint to pin the row with `map` instead of creating a duplicate; it never changes a
match. Another church is not a look-alike for a church, nor a person called Chris for a Christian academy: only the part
of a name that is the business's own counts.

**"Imported" means finished, and says what the contact holds.** A row answered `already imported` reports `legacy` as it
is on the contact. If GoHighLevel did not keep the marker the first time, the next real run puts it right ("finished
what an earlier run left: marked a legacy client") — only where the field is blank, never over an owner's Yes or No. A
package the board has and the contact lacks is said in a warning and never written back (the desk is live; the board is
history); for a Giveaway Winner label that warning starts "NOT PROTECTED".

Every call is made from an owner's signed-in Chrome on the desk (see the cutover runbook above for how to post and read
a report). They are all dry runs unless the body says **`apply: true`**.

> **Why `apply: true` and not `dryRun: false`.** Production is whatever was deployed last, and on Oct 2 2026 a deployment
> made by hand from a checkout fifteen commits behind main took production over for a few minutes — the desk was back at
> `/leads` and none of this code was there. That older import would have taken `dryRun: false` and created seventeen
> contacts with no legacy marker, no records and no lock. It does not know the word `apply`, so it can only answer such
> a request with a dry run. Before a real call, and in its answer, check two things in the report: **`build`** is the
> commit on main you expect (the older code has no `build` at all), and the answer to a real call says `dryRun: false`.
> (`dryRun: false` still works on the current code, for the cutover runbook above; do not use it here.)

State on Oct 2 2026: step 1 is done (the field
exists, id `nMtC0XKwmnr9dUbs9E0s`, and the self-test passes 44 of 44 on the test contact); step 2 was run and answered
exactly as written; nothing has been imported.

1. **The field, once (done Oct 2 2026).** `POST /api/team/ghl/setup {"scope":"desk"}` → `missing` is exactly
   `Desk Legacy Client`, `present` 43. Then `{"scope":"desk","dryRun":false}` → `created` is that one field, `failed`
   empty. Now the dry call answers `missing: []`, `present` 44, and `GET /api/team/ghl/diag` → `desk.fields.deskPresent`
   44, `desk.legacyClients` 0.
2. **Dry run.** `POST /api/team/ghl/desk-migrate {"boards":["clients"],"includeOffDesk":true,"createNameOnly":true}`
   → `build` the commit on main, `dryRun: true`, `total` 19; `counts`: `imported` 2 (Squirrel Made Products and Choice Pressure Washing, "already imported —
   skipped"), `create-name-only` 17, `unmatched` 0, `failed` 0. Every one of the 17: `legacy: true`, `detail` "creates a
   new contact from the business name alone…", `contact` = `companyName` (+ `website` on four of them), `values` = the
   eight desk fields it writes (nine for Defoor Plumbing and Sconyers Concrete Inc, which carry `Desk Packages`
   Local Growth), `tags` `desk-client` + `monday-import`, `similar` empty, no `warnings`, `winners` empty. No row may
   say `BLOCKED` (step 1 skipped, or the import's records unreadable). **A non-empty `similar` is the thing to stop on:** look at those
   contacts in GoHighLevel, and if one is the same business add `"map":{"<monday row id>":"<contact id>"}` so the row
   uses it.
3. **One row as a trial.** The same body plus `"apply":true,"onlyIds":["13125631516"]` (Whiten Pools, Inc.) →
   `dryRun: false`,
   `written` 1, the row `done`, `detail` "wrote 8 fields, 0 of 0 updates copied as notes", `storage` "import record:
   this row created contact …". Then look: the Clients tab (`/admin?tab=clients`) reads "2 on the desk · 1 legacy"
   (GoHighLevel's search can take ~20 seconds to list a new contact; `/admin?tab=clients&client=<contact id>` opens
   its panel at once), the row has the Legacy badge and no flags, its panel opens; the contact in
   GoHighLevel has the company name, the two tags and no owner; the Sales tab does not list it; the published workflows'
   "Total enrolled" counts have not moved. Running the same trial call again must answer `imported`, not create.
   If GoHighLevel refuses a contact that has a company name and nobody's name, the row says so and nothing is created:
   run it again with `"businessAsContactName":true` (the business name also goes in the contact's own name). The same
   option is the answer if the trial contact turns out hard to tell apart in GoHighLevel's own lists, where a contact
   with no name shows blank: decide on the trial contact before running the rest (its own name can be set from the
   panel's Contact field).
4. **The rest.** The same body with `"apply":true` (no `onlyIds`) → `dryRun: false`, `written` 16, `imported` 3,
   `failed` 0.
5. **Dry run again a minute later** → all 19 `imported`, "already imported — skipped". The tab: "18 on the desk · 17
   legacy". **Whenever a real run reports a failed row, the next call is a dry run, not a retry:** it says whether the
   row is `imported` (the contact exists — a real run then finishes it), held (`BLOCKED … an earlier run started creating
   this contact`: wait, the row sorts itself out or frees itself in ten minutes) or free to run again.

The two Team-desk rows (Squirrel Made Products, Choice Pressure Washing) are in every one of these runs only to be
answered "already imported — skipped"; nothing is written to them. To leave them out of the run altogether, add
`"onlyIds"` with the 17 legacy rows (the counts then read `total` 17, `imported` 0):
`["13125586889","13125631489","13125592629","13125561826","13125631516","13125631517","13125659187","13125596207","13125659954","13125593927","13125586601","13125562410","13125561403","13125595526","13125594270","13125595528","13125595851"]`
— Chapelhill Church, Dunwoody Christian Academy, Law Office of John B. Jackson and Associates, Met Lane and Associates,
P.C., Whiten Pools, Inc., Commercial Insurance Agency, Innovative Construction Group, McKinley Roofing and Restoration,
The Grove at DeFoor Farm, Harmonic Production Services, Defoor Plumbing, Sconyers Concrete Inc, CDM Systems, Georgia
Truck Parking, LEUCO, Southeastern PCG, Fire Bible. The names come over exactly as the board spells them; a company name
is edited in GoHighLevel, a contact person from the panel's Contact field.

After this the Monday Active Clients board holds nothing the desk does not. An owner un-marks a legacy client from its
panel the day it becomes a normal desk client; nothing is automatic about that, including a later handoff or graduation.

## Names on the lists, and clients that have left (Oct 2 2026)
Display only. None of this writes to GoHighLevel, and no API answer changed.

**Contact names.** GoHighLevel's contact search returns a name lower-cased ("samuel johnson"); the same contact read by
its id carries the name as it was typed ("Samuel Johnson"). The lists are built from the search and the panels from the
read, so a row and its panel disagreed. `src/lib/desk/names.ts` (pure; the Sales, Onboarding and Clients tabs use it):
- `displayName`: a name with no capital anywhere gets one back per word (also after a hyphen or a full stop; O'Brien;
  McKay; a trailing "III"; "and" stays small). A name that carries a capital is shown exactly as stored. It is a best
  guess for a row that has not been opened: opening the record puts the stored spelling on the row, and the helper then
  leaves it alone. Checked against the 812 names on the production roster on Oct 2 2026.
- `sameName`: two spellings of one name. Letters and digits only, capitals ignored, "&" read as "and".
- **A contact that only repeats the business name is not printed.** The row leaves the line out, the panel header leaves
  the name out, and the Clients panel shows its Contact box empty ("No contact person yet"). This is the 17 legacy
  clients: the import named each contact after its business. Left empty, the box sends the stored name back unchanged
  on blur, exactly what it sent before, so nothing is written; a real name typed in saves as it always did (first and
  last name on the contact).
- **Business names are never re-cased.** One exception, on the Sales tab: a lead with no business name has the
  contact's name as its title (the server puts it there, the two are the same text), so that title is shown as a
  contact's name and is not repeated underneath.

**Churned clients** (`src/lib/desk/clients-view.ts`, pure). Dave: "on the legacy list, we can remove CDM, we can remove
Georgia Truck Parking." A client moved to the Churned group leaves the Clients tab's default view, the same idea as a
Not Interested lead leaving the call list:
- "All groups" lists current clients only. A search there does not surface a churned client; it says how many matches
  are churned and offers "Show churned".
- Churned clients are not in "N on the desk", in the legacy count or in the kind filter's counts, and were never in the
  monthly total. The header adds "· 2 churned" only when there are any.
- The Churned choice in the group filter (it carries the count) lists them. Changing a client's group in its panel
  brings it back; nothing was deleted.
- A churned client still opens by its link: the panel reads the record by id, whatever the list shows.
- With nobody churned the list, the counts and the header are exactly what they were (tested against the old filter
  line). The rule is the same on the Monday desk.

## Environment
`DESK_BACKEND` (the switch) · `DESK_PAYMENT_ALERTS=off` (no payment task) · `DESK_EXTRA_TEAM="Name:email,…"` (more people in
the owner lists) · `GHL_REP_IDS="Madison:<GoHighLevel user id>"` (lets that person author notes as themselves; same
variable the Sales tab reads) · `ONBOARDING_EXTRA_OWNERS` (already set; the import uses it to map Monday people to names).
`MONDAY_API_TOKEN` is needed by the import and by nothing else on the GoHighLevel path.

## Code
- `src/lib/desk/` — `switch.ts` (the switch, id and scope shapes), `fields.ts` (field catalog, resolver, write guard,
  LSE overlaps), `team.ts`, `money.ts`, `checklist-text.ts`, `record.ts` (contact ↔ rows, lists, writes), `notes.ts`,
  `onboarding.ts` (list, panel, patches, handoff, retry, graduation), `clients.ts` (list, panel, patches, Stripe),
  `intake.ts`, `winners.ts`, `validation.ts`, `http.ts`, `migrate.ts`, `admin.ts` (setup, diag, self-test),
  `legacy.ts` (legacy clients: what the marker means on the Clients tab — pure, shared with the browser),
  `clients-view.ts` (what the Clients tab lists and counts: churned clients are off the default view — pure, shared
  with the browser), `names.ts` (how names are shown on the three tabs — pure, shared with the browser),
  `task-text.ts` (tasks: due dates, the stand-in, markers, order and labels — pure, shared with the browser),
  `tasks.ts` (tasks on GoHighLevel: list, add, tick off, the task self-test).
- Routes: each existing handler under `/api/team/onboarding`, `/api/team/clients`, `/api/stripe/webhook`,
  `/api/team/packages` and `/api/onboarding/[token]` gained an early GoHighLevel branch; the Monday code below it is
  unchanged. New: `/api/team/ghl/desk-migrate`, `/api/team/ghl/desk-selftest`, `/api/team/tasks/[id]` (Oct 4).
- UI: `src/app/leads/notes.tsx` (the timeline), `tasks.tsx` (the task list), `onboarding.tsx`, `clients.tsx`, `handoff.tsx`, `shell.tsx`, `page.tsx`,
  `packages.tsx` — the server names the system with every list and the copy follows it.
- Tests: `npm run test:desk` (149 since the task list and note edit/delete) — an import-following runner with an in-memory GoHighLevel
  (`src/lib/desk/testing/fake-ghl.ts`) and Blob; every flow ends by asserting that only desk fields and tags were written
  and Monday was never called. `npm run test:call-owner` and `npm run test:onboarding` are unchanged and still cover the
  Monday path.

## Known limits and things found on the way
- Nothing here has run against the real GoHighLevel API (no production credentials on the build machine). The self-test
  exists to close exactly that gap before a client is touched: multi-select and number shapes (a comma inside a label
  above all), clearing each field type, the size of the checklist and notes fields, how long a note may be, the tag
  endpoints, whether the version token moves on a write, and what a search result carries. Not covered by it, and first
  exercised by the import or by real use: creating a contact, the duplicate answer on create, the task list and task
  create for a payment alert, and the Stripe paths (Stripe is not connected on production yet).
- GoHighLevel has no compare-and-set: two people changing the same client in the same second can race. The version check
  and the read-back reduce it, as on Monday.
- Any change to the contact by anyone (a GoHighLevel automation, the Sales tab, a person) bumps its version, so "someone
  changed this client — reload" will appear more often than on Monday. The panel reloads itself on that answer.
- One business is one contact. Two businesses that share one email or phone cannot both be desk records on that contact;
  the second needs a contact of its own in GoHighLevel. A second onboarding for a launched client continues the same
  record (its earlier checklist rows and intake carry over) — see "A second handoff" above.
- An unlinked Active Clients row whose files were added on the Clients tab keeps them under `c` + its row id. If the
  same business also has an onboarding record, the contact's files live under the onboarding key and those would not
  show; the import warns when that is the case. (It cannot happen with the rows on the boards on Oct 2 2026: Choice's
  client row is linked to its onboarding row, and Squirrel Made has no onboarding row.)
- Packages have no editor on the desk (they never did; on Monday people edited the dropdown on the board). On GoHighLevel
  they are changed in the contact's `Desk Packages` field.
- **Found on the Monday desk, not changed:** "Mark launched → Clients" sends a JSON content type with no body, and the
  Monday branch of `/api/team/onboarding/<id>/graduate` answers 400 "Invalid call details" — graduation from the button
  has not worked there since it shipped. The GoHighLevel branch accepts the same request.
- **Fixed for both systems:** an open client panel refetched itself in a loop — the row-update callback was a new
  function on every render, so every load triggered the next one. Measured on the build before this change with the API
  stubbed to answer instantly: 6,517 detail requests in five seconds from one open Onboarding panel (on production each
  one is a Monday + Blob + Search Atlas read, so roughly one a second for as long as a panel stayed open). The callback is
  now stable: a panel loads once, and again only after a change. On GoHighLevel the loop would have run into the API's
  rate limit.
- `Docs/Onboarding.md` and `Docs/Clients-Tab.md` still describe the Monday desk; they stay accurate until the flip.
