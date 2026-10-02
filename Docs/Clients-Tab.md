# Clients tab — creativecowboys.co/admin?tab=clients

> **October 2, 2026:** the desk is served at `/admin`; `/leads` forwards there with its query string (`Docs/Admin.md`).

> **October 2, 2026:** this page describes the Clients tab on **Monday**, which is what production runs while
> `DESK_BACKEND` is unset. The same tab on GoHighLevel — the client is the same contact as the lead and the onboarding
> record, Stripe state in desk-owned fields, notes and comments in every client group — is built behind that switch:
> see `Docs/Desk-on-GHL.md`.

> **October 2, 2026:** a client in the **Churned** group is off the default view and out of the counts (the group
> filter still lists them), and a contact that only repeats the business name is no longer printed under it. Both are
> display rules, on either system: `Docs/Desk-on-GHL.md`, "Names on the lists, and clients that have left".

Built Sep 24 2026 (Claude). Dave: "a third tab that is current clients… keep track of clients that are onboarded, but also
keep showing if they don't have their GBP linked, or they have stopped paying thru Stripe."

## Source of truth
Josh's **Active Clients** board (`18432563557`). Reused, not duplicated. Five columns added Sep 24 2026:
`Team desk` checkbox (boolean_mm7hemnq), `Stripe Customer ID` (text_mm7h51ps), `GBP Access` status (color_mm7hxmhp:
Not Requested / Requested / Verified / No GBP Exists / Lost-recheck), `Onboarding Item ID` (text_mm7he8kn),
`GBP Last Checked` date (date_mm7hzkw). Groups = Payment issue / Active / At risk / Paused / Churned.

**One place at a time** (Dave, Sep 25 2026): a Team-desk row whose linked onboarding record is not yet Launched is hidden here and stays on the Onboarding tab; the Onboarding tab hides Launched records unless "Show launched" is ticked.

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

## GBP — live from Search Atlas (Sep 30 2026)
Each client (Onboarding Pipeline and Active Clients) has a **Search Atlas listing** text column (`text_mm7pjpc1` /
`text_mm7p124g`) holding the numeric Search Atlas GBP location id. The panels offer "Link to Search Atlas listing"
(every listing on our account) and then show a live card: name, connected/verified, rating, review count, unanswered,
last review, last post, profile completeness, "Open in Search Atlas" (`dashboard.searchatlas.com/gbp-galactic/overview?id=<id>`),
"Refresh live". Rules: a connected **and verified** listing writes GBP Access → Verified (+ GBP Last Checked → today on
Active Clients) on its own; connected-but-unverified shows as not verified and flags `gbp` even if Monday says Verified;
a failed Search Atlas read changes nothing and the Monday state is used. The Clients list reads the whole account listing
once per load (cached 10 min) so the GBP column and flags are live for linked rows; the 90-day recheck flag does not
apply while a live read succeeds. Nothing is ever written to Search Atlas or Google.

Code: `src/lib/gbp/{types,state,searchatlas}.ts` (+ `gbp.test.ts`), `src/app/leads/gbp-card.tsx`,
`src/app/api/team/gbp/{locations,card/[listing]}/route.ts`. Search Atlas REST (docs.searchatlas.com):
`https://sa.searchatlas.com/api/gbp/v2/locations/`, `/api/gbp/v1/reviews/star-rating-count/?location=`, `/api/gbp/v1/reviews/?location=`,
`/api/gbp/v1/posts/?location=`, header `X-API-Key`. **Needs on Vercel:** `SEARCH_ATLAS_API_KEY` (Search Atlas → avatar →
Settings → API Keys; any plan). Optional: `SEARCH_ATLAS_API_BASE`, `SEARCH_ATLAS_LOCATION_URL` (`{id}` placeholder).
Until the key is set the panels say "Search Atlas not connected" and the old manual dropdown + 90-day stamp still work.

## Code
`src/lib/clients/{config,types,stripe,board,validation}.ts` + `clients.test.ts` (in `npm run test:onboarding`),
`src/app/api/team/clients/{route,[id]/route,[id]/sync/route,reconcile/route}.ts`, `src/app/api/stripe/webhook/route.ts`,
`src/app/api/team/onboarding/[id]/graduate/route.ts`, `src/app/leads/clients.tsx`, `vercel.json` (cron).
