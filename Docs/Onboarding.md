# Sales → onboarding — creativecowboys.co/leads

Built Sep 24 2026 (Claude) from Burt's handoff brief (`Staff/Dave/Burt/Handoffs/2026-09-24-Leads-Onboarding-Claude.md`).
The call desk (`Docs/Leads-Page.md`) is unchanged; it now sits on a **Sales** tab, and an **Onboarding** tab works the
Monday **Onboarding Pipeline** board for Madison. One sign-in (`/admin/login`), one page.

## What was reused (inspected, not assumed)
- **Onboarding Pipeline board `18431157561`** (Josh, Sep 15) — groups are the stages (`1 · Signed` … `5 · Launched`,
  `Stalled / At Risk`), subitems board `18431157564` is the checklist, columns for health, owners, GBP access, DNS path,
  gates, next action, package (same labels as the leads board, with a Monthly $ formula). No automations existed.
  **Added Sep 24** (additive, nothing renamed): `Lead ID` (text_mm7gm53r), `Handoff ID` (text_mm7g2d9k),
  `Sales Owner` (multiple_person_mm7g746w), `Setup $` (numeric_mm7g28df), `Agreement` (color_mm7g32e6),
  `Payment` (color_mm7gz9ng), `Intake` (color_mm7gmf8r). The template row (group `topics`) is never shown or written.
- **Giveaway Leads `18430997894`** — unchanged schema. A handoff sets Outreach Status = `Won`, moves the item to the
  `Won` group and appends a note with the pipeline link. `Won` already sorts as closed in the call desk, so the client
  drops out of the calling queue while every call note stays on the lead.
- **Monday users**: Dave 39848115, Josh 39848217, Keaton 116679004 (+ Matt Cillo, Victor as guest). **Madison has no
  Monday seat.** She cannot be the Onboarding Owner until Josh invites her; then set
  `ONBOARDING_EXTRA_OWNERS="Madison:<her id>"` on Vercel (no code change). Until then "Madison" appears only as the
  next-action owner text.
- **Storage**: the project already had `@vercel/blob` with `BLOB_READ_WRITE_TOKEN` in Production (used by the giveaway
  draw list). Private Blob is the file store and the durable state store; Monday only ever holds references. A Google
  shared drive / Dropbox mirror can be added later without touching the client flow.
- `MONDAY_API_TOKEN` (server-only) is reused as-is. Nothing new is required to deploy.

## Staff workflow
**Sales tab** → pick a lead → **Start onboarding →** (top right of the contact card). The handoff panel is prefilled
from the lead; the rep enters packages sold (same names as the Package dropdown), the monthly and setup amounts
*actually agreed* (blank means not recorded — nothing is inferred from list prices), scope, exclusions, goals, call
context, start date, agreement and payment status (Unknown is the default), and the next action. A review screen shows
everything before **Confirm handoff**. The draft (with a fixed `handoffId`) lives in sessionStorage per lead.

Confirming does five things, each recorded durably so a retry only repeats what is missing:
1. creates the pipeline item in `1 · Signed` (with Lead ID, Handoff ID, Sales Owner, agreed setup, statuses, notes);
2. posts the handoff summary as a note on it (marker `[CC-HANDOFF:<id>]`);
3. creates the checklist rows for those packages (`src/lib/onboarding/checklist.ts`; skips names that already exist);
4. marks the source lead Won and links it;
5. seeds the client's intake record.

**Onboarding tab** → table of every client (search; filters by owner, stage, overdue, missing requirements,
stalled), overdue and incomplete first. Clicking a row opens the client panel: what was sold and the handoff summary,
assignment (Onboarding Owner separate from Sales Owner), stage, health, agreement and payment, next action with due
date, **intake link** (issue / copy once / revoke; 45-day expiry), what the client filled in and their files
(downloadable), GBP access state, DNS path, the checklist with required rows flagged, **Mark ready for production**
(refused with the list of problems until every required item is done), and append-only notes.

**Readiness** is a staff decision. Required checklist rows must be Done; for SEO packages GBP must be `Verified` or
`No GBP Exists`; agreement must be Signed / Not required; payment Deposit paid / Paid; intake Client submitted /
Reviewed. "Instructions sent" and "client says they invited us" are recorded separately and never count as access.

## Client intake — `/onboarding/<token>`
Issued from the client panel. The token is 32 random bytes; only its SHA-256 lives in storage; it expires after 45
days and can be revoked or replaced (old link dies immediately). The page shows only that client's own form and files.
Autosaves; the client can leave and come back. Uploads go browser → Blob directly with a per-client, per-category,
10-minute upload token (25 MB, allow-listed types); the server indexes each finished upload under
`onboarding/files/<itemId>/<Category>/`. Staff download through `/api/team/onboarding/<id>/file?key=…` (sign-in
required; key must be in that client's index). No search indexing (`X-Robots-Tag`, `Referrer-Policy: no-referrer`).

GBP instructions on the page ask the client to add **`GBP_AGENCY_EMAIL`** (default `howdy@creativecowboys.co`, the
address Josh's checklist already uses) as a **Manager**. Confirm that address before sending the first link; never ask
for a Google password.

## Data & idempotency
- `onboarding/handoffs/<leadId>.json` — handoff record: item id/url, per-step state, the form as submitted.
- `onboarding/intake/<itemId>.json` — token hash + expiry, client form, submitted/reviewed timestamps, file index.
- `onboarding/tokens/<hash>.json` — token hash → item id.
- Start onboarding is idempotent on the lead: process-local lock → stored record → **Monday search by Lead ID** →
  create. A second click, reload or retry adopts the existing record. Monday has no atomic create-if-absent, so two
  people on two warm instances in the same second could still both create; the second sees "already has a record" on
  its next retry and the duplicate is visible by Lead ID on the board. Partial failures return HTTP 202 with `pending`
  and the panel offers **Retry pending steps**.
- One onboarding per lead. A later, separate purchase for the same client is a new pipeline item made in Monday (or a
  future "new engagement" action), not a second handoff of the same lead.
- Every staff change sends `expectedUpdatedAt`; a 409 means reload and look before changing.

## Code
- `src/lib/onboarding/` — `config.ts` (ids, stages, labels), `checklist.ts` (templates, readiness), `validation.ts`,
  `pipeline.ts` (Monday reads/writes), `handoff.ts` (orchestration + retry), `intake.ts` (tokens, form, files),
  `store.ts` (Blob), `api.ts`, `http.ts`, tests `*.test.ts`.
- `src/app/api/team/onboarding/` — list/start, `[id]` detail/patch, `[id]/retry`, `[id]/intake-link`, `[id]/file`.
- `src/app/api/onboarding/[token]/` — client read/save/submit, `upload` (Blob token), `files` (index/remove).
- `src/app/leads/` — `shell.tsx` (tabs), `handoff.tsx`, `onboarding.tsx`, `onboarding.css`; `desk.tsx` gained one
  optional prop and one button. `src/app/onboarding/[token]/` — client page.
- `src/middleware.ts` — `/onboarding/*` gets noindex + no-referrer headers (no sign-in; the token is the credential).

## Tests
`npm run test:onboarding` (validation, checklist/readiness, Monday payload shaping and row mapping) alongside the
existing `npm run test:call-owner`. Neither touches Monday or Blob.

## Open decisions (carried from the brief, not blocking the build)
1. Madison's Monday seat (Josh invites → `ONBOARDING_EXTRA_OWNERS`).
2. Which address clients invite on GBP (`GBP_AGENCY_EMAIL`, default howdy@).
3. Commercial gate: today readiness requires agreement Signed/Not required **and** payment Deposit/Paid. Loosen or
   tighten in `readinessProblems()` once Dave and Josh settle it.
4. Final package prices/scope per package — checklist templates are editable in `checklist.ts`.
5. Shared staff login stays; the rep on a handoff is self-reported.
6. Optional later: mirror client files to a Google shared drive / Dropbox folder and fill `Drive Folder`.
