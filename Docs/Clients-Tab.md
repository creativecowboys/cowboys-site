# Clients tab — creativecowboys.co/leads?tab=clients

Built Sep 24 2026 (Claude). Dave: "a third tab that is current clients… keep track of clients that are onboarded, but also
keep showing if they don't have their GBP linked, or they have stopped paying thru Stripe."

## Source of truth
Josh's **Active Clients** board (`18432563557`). Reused, not duplicated. Five columns added Sep 24 2026:
`Team desk` checkbox (boolean_mm7hemnq), `Stripe Customer ID` (text_mm7h51ps), `GBP Access` status (color_mm7hxmhp:
Not Requested / Requested / Verified / No GBP Exists / Lost-recheck), `Onboarding Item ID` (text_mm7he8kn),
`GBP Last Checked` date (date_mm7hzkw). Groups = Payment issue / Active / At risk / Paused / Churned.

**Only rows with "Team desk" checked appear** (Dave, Sep 24: start with Choice Pressure Washing and Squirrel Made; the
other 17 rows stay Josh's bookkeeping). Graduating a client from the Onboarding tab checks it automatically.

## What the tab shows
Table sorted problems-first: payment issue → most flags → name. Flags (computed in `src/lib/clients/board.ts` `flagsFor`):
- **Payment issue** — group is Payment issue, or Payment Status is Overdue / Card Failed.
- **GBP not verified** — GBP Access is anything but Verified / No GBP Exists.
- **GBP recheck due** — Verified but last checked > 90 days ago (or never).
- **No report 35+ days** — Last Report Sent older than 35 days (skipped for Paused / Churned).
- **Term ends soon** — Term Ends within 30 days.
- **No Stripe link** — Stripe method but no customer id yet.

Client panel: billing (Monday fields + live Stripe subscription/invoice when connected, **Sync from Stripe**, Stripe
customer id, manual payment status/method, billing day, next bill, term end), GBP (access state, listing URL,
"I just confirmed we still have access" which stamps GBP Last Checked), account (manager, group, health, contact,
"Report sent today"), append-only notes.

## Graduation
Onboarding panel → **Mark launched → Clients** (`POST /api/team/onboarding/<id>/graduate`). Refused while the record is
still in New handoff / Collecting. Idempotent on Onboarding Item ID: one row per onboarding record. Carries contact,
email, phone, website, GBP URL, packages, GBP state (Verified also stamps GBP Last Checked), sets Payment method Stripe via
GHL, Payment Status No Billing Set Up, Health Too New, Client Since = signed date, Team desk ✔. Then moves the onboarding
record to Launched with a note linking the client row.

## Stripe
`src/lib/clients/stripe.ts` — REST over fetch, read-only. Needs two Vercel env vars **Dave sets**:
- `STRIPE_SECRET_KEY` — a **restricted** key: read on Customers, Subscriptions, Invoices (Stripe → Developers → API keys →
  Create restricted key). Never a full secret key.
- `STRIPE_WEBHOOK_SECRET` — from the webhook endpoint below.

Three ways state reaches Monday, all through the same `syncClientFromStripe()`:
1. **Sync from Stripe** button (`POST /api/team/clients/<id>/sync`). Finds the customer by the stored id, else by the
   client's email (then stores the id).
2. **Webhook** `POST https://www.creativecowboys.co/api/stripe/webhook` — add it in Stripe → Developers → Webhooks with
   events `invoice.paid`, `invoice.payment_failed`, `invoice.marked_uncollectible`, `customer.subscription.*`,
   `charge.refunded`. Signature-verified; the event body is not trusted, the customer is re-read from Stripe.
3. **Nightly reconcile** `GET /api/team/clients/reconcile` at 10:15 UTC (vercel.json cron), protected by `CRON_SECRET`
   (set Sep 24 2026). Re-syncs every Team-desk client with a Stripe id or an email.

Mapping (`paymentFromSnapshot`, unit-tested): active/trialing → Paid / Current (+ Last Payment, Next Bill); open invoice
attempted → Card Failed → group Payment issue; past_due/unpaid or open invoice past due → Overdue → Payment issue;
open invoice not yet due → Due Soon; canceled → group Churned. Sync never moves a client out of At risk / Paused on its own.

If GHL runs the subscriptions with Stripe as processor, the same Stripe events fire, so nothing changes here.

## GBP — honest limits
Phase one is what ships: the state carried from onboarding plus a staff "I confirmed access" stamp every 90 days.
Actually verifying manager access automatically needs Google's Business Profile API (application + approval) or a
Search Atlas GBP connection per client. Not built.

## Code
`src/lib/clients/{config,types,stripe,board,validation}.ts` + `clients.test.ts` (in `npm run test:onboarding`),
`src/app/api/team/clients/{route,[id]/route,[id]/sync/route,reconcile/route}.ts`, `src/app/api/stripe/webhook/route.ts`,
`src/app/api/team/onboarding/[id]/graduate/route.ts`, `src/app/leads/clients.tsx`, `vercel.json` (cron).
