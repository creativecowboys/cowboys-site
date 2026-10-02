# Onboarding and Clients on GoHighLevel — the `DESK_BACKEND` switch

Dave, October 1, 2026: "We need to cut the link to Monday and use just go high level. Especially for the ones in the
onboarding tab and active clients. But we need the ability to add notes and comments in the active state."

Phase 1 moved the **Sales** tab to GoHighLevel (`LEADS_BACKEND`, see `Docs/Leads-Page.md`). This is Phase 2: the
**Onboarding** and **Clients** tabs. It is built and on main, and it is **off**: with `DESK_BACKEND` unset every route
takes the same Monday code path as before. Nothing has been created in GoHighLevel and nothing has been imported.

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
**Custom fields (43, all new, all named "Desk …"; resolved by name at runtime, no field id in code):**
Desk Packages (multi-select, the package labels byte-for-byte), Desk Custom Monthly, Desk Notes, Desk GBP Access,
Desk GBP Last Checked, Desk GBP URL, Desk Search Atlas Listing, Desk Drive Folder, Desk Last Touch ·
Desk Onboarding Stage, Desk Onboarding Health, Desk Onboarding Owner, Desk Build Owner, Desk Sales Owner,
Desk Business Type, Desk Signed, Desk Target Launch, Desk Profile Complete, Desk Baseline Captured, Desk DNS Path,
Desk Next Action, Desk Next Action Due, Desk Setup Amount, Desk Agreement, Desk Onboarding Payment, Desk Intake,
Desk Handoff ID, Desk Checklist, Desk Link, Desk Monday Onboarding ID · Desk Client Status, Desk Client Health,
Desk Account Manager, Desk Pay Status, Desk Pay Method, Desk Billing Day, Desk Next Bill, Desk Last Payment,
Desk Client Since, Desk Term Ends, Desk Last Report Sent, Desk Stripe Customer ID, Desk Monday Client ID.

**Tags added:** `desk-onboarding`, `desk-client`, and `monday-import` (the desk's own Phase-1 tag, on contacts the import
creates). A handoff from a lead also does what the Sales tab already did: Outreach Status → Won, Last Contact, tag `sales-won`.

**The contact's own fields:** first / last name, company, email, phone, website, city — filled **only where blank** at
handoff and import (the business name the rep types at handoff is the one exception), and edited on purpose from the
Clients panel's contact fields (email and phone can be corrected there, never blanked). `assignedTo` only when empty.

**Notes** (handoff summary, desk notes, imported Monday updates) and **one task** when a payment turns Card Failed or
Overdue (see Stripe below).

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
  (`src/lib/desk/money.ts`, prices from the package catalog, label for label what the formulas gave; a Giveaway Winner is
  $0). Owners-only visibility is unchanged, and on the Clients tab it covers the notes timeline too: the package
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

0. **Look first, in GoHighLevel.** Settings → Tags: `desk-onboarding` and `desk-client` must not exist. Settings → Custom
   Fields: nothing named "Desk …". Automation → Workflows: note the "Total enrolled" count of every published workflow (the
   LSE set above all), and open any whose trigger could be a bare *Contact Changed*, *Note Added*, *Task Added* or
   *Contact Tag* with no filter. The API cannot show triggers.
1. `GET /api/team/ghl/diag` → read `desk.fields` (43 missing), `desk.tags`, `desk.writes`.
2. `POST /api/team/ghl/setup {"scope":"desk"}` (dry), then `{"scope":"desk","dryRun":false}` → `created: 43, failed: []`.
3. `POST /api/team/ghl/desk-selftest {"dryRun":false}` → `passed: 43`, `failed: []`, `clearFailed: []`, tag ok, filter
   accepted, restored, `version` says the token moved on the field write, the note was kept whole, and `searchCarries`
   shows `tags yes, customFields yes` (the lists need those two; a `NO` on website or the name pair only thins a list row). Compare the enrollment counts again: writing desk fields, a desk tag and a note on the test contact
   must have enrolled nothing. **Stop here if any field fails** — that is a value-shape problem to fix before a client is touched.
   The one known way out without a code change: if `Desk Packages` is the field that fails (a comma inside a label is the
   likely reason), delete that one field in GoHighLevel and add it again by hand as a single-line **Text** field with the
   same name. The desk shapes every value by the field's live type, so a text `Desk Packages` holds the labels joined
   with commas and is read back label for label. Run the self-test again.
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

## Environment
`DESK_BACKEND` (the switch) · `DESK_PAYMENT_ALERTS=off` (no payment task) · `DESK_EXTRA_TEAM="Name:email,…"` (more people in
the owner lists) · `GHL_REP_IDS="Madison:<GoHighLevel user id>"` (lets that person author notes as themselves; same
variable the Sales tab reads) · `ONBOARDING_EXTRA_OWNERS` (already set; the import uses it to map Monday people to names).
`MONDAY_API_TOKEN` is needed by the import and by nothing else on the GoHighLevel path.

## Code
- `src/lib/desk/` — `switch.ts` (the switch, id and scope shapes), `fields.ts` (field catalog, resolver, write guard,
  LSE overlaps), `team.ts`, `money.ts`, `checklist-text.ts`, `record.ts` (contact ↔ rows, lists, writes), `notes.ts`,
  `onboarding.ts` (list, panel, patches, handoff, retry, graduation), `clients.ts` (list, panel, patches, Stripe),
  `intake.ts`, `winners.ts`, `validation.ts`, `http.ts`, `migrate.ts`, `admin.ts` (setup, diag, self-test).
- Routes: each existing handler under `/api/team/onboarding`, `/api/team/clients`, `/api/stripe/webhook`,
  `/api/team/packages` and `/api/onboarding/[token]` gained an early GoHighLevel branch; the Monday code below it is
  unchanged. New: `/api/team/ghl/desk-migrate`, `/api/team/ghl/desk-selftest`.
- UI: `src/app/leads/notes.tsx` (the timeline), `onboarding.tsx`, `clients.tsx`, `handoff.tsx`, `shell.tsx`, `page.tsx`,
  `packages.tsx` — the server names the system with every list and the copy follows it.
- Tests: `npm run test:desk` (77) — an import-following runner with an in-memory GoHighLevel
  (`src/lib/desk/testing/fake-ghl.ts`) and Blob; every flow ends by asserting that only desk fields and tags were written
  and Monday was never called. `npm run test:call-owner` and `npm run test:onboarding` are unchanged and still cover the
  Monday path.

## Known limits and things found on the way
- Nothing here has run against the real GoHighLevel API (no production credentials on the build machine). The self-test
  exists to close exactly that gap before a client is touched: multi-select and number shapes, clearing a field, the size
  of the checklist field, the tag endpoints.
- GoHighLevel has no compare-and-set: two people changing the same client in the same second can race. The version check
  and the read-back reduce it, as on Monday.
- Any change to the contact by anyone (a GoHighLevel automation, the Sales tab, a person) bumps its version, so "someone
  changed this client — reload" will appear more often than on Monday. The panel reloads itself on that answer.
- One business is one contact. Two businesses that share one email or phone cannot both be desk records on that contact;
  the second needs a contact of its own in GoHighLevel. A second onboarding for a launched client continues the same
  record (its earlier checklist rows and intake carry over) — see "A second handoff" above.
- An unlinked Active Clients row whose files were added on the Clients tab keeps them under `c` + its row id. If the
  same business also has an onboarding record, the contact's files live under the onboarding key and those would not
  show; the import warns when that is the case (none on Oct 2 2026).
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
