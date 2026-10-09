# The team desk lives at creativecowboys.co/admin

**October 2, 2026.** Dave: "How hard would it be to blow away the old admin page, and move this leads page to admin?
It seems like this has become more of an admin setup than just calling new leads." The desk (Sales / Onboarding /
Clients tabs) is now served at `/admin`. It was at `/leads` from September 21 to October 2, 2026.

Nothing about the desk itself changed: same tabs, same query parameters (`tab`, `lead`, `client`, `desk`, `backend`),
same owner rules, same APIs under `/api/team/*`. Only the browser title was new ("Admin"; "Back Office" since October 4,
next section). What each tab does is still
described in `Docs/Leads-Page.md` (Sales), `Docs/Onboarding.md`, `Docs/Clients-Tab.md` and `Docs/Desk-on-GHL.md`.

## Named "Back Office" (October 4, 2026)
Dave, asked what to call it: "ill just say backoffice for now." The visible name only:
- the browser tab reads "Back Office | Creative Cowboys" (`metadata.title` in `src/app/admin/page.tsx`);
- the bar that holds the tabs starts with **BACK OFFICE** at its left end (`.team-name` in `src/app/leads/shell.tsx`
  and `onboarding.css`; on a phone it shares the top row with Sign out, and the tabs sit below);
- the sign-in card's small heading says "Back Office" (it said "Admin Access").
Not changed: the address (`/admin`, and `/leads` still forwards), every route and file name, the code's own words
("desk"), and the sign-in email, which still says "the Creative Cowboys team desk".

## Links tab (October 9, 2026)
Dave: "can you make a new tab for links? next to these. Then give us the ability to name and post links that we use
often." A fourth tab, **LINKS**, after Clients: `/admin?tab=links`.
- **What it is:** one shared list for the whole team, A to Z by name. Each link has a name, the address, an optional short
  note, and who added it and when (and "edited by …" once changed). The name opens the link in a new tab
  (`target="_blank" rel="noopener noreferrer"`); **Copy link** puts the address on the clipboard. A search box filters by
  name, address, note or who added it. Under the add form: links only, never passwords, API keys or logins.
- **Edit and Delete work like the notes on the client panels** (Dave, Oct 4 2026): Edit turns the row into boxes with
  Save and Cancel (Escape cancels); Delete is immediate, no question, and sits apart at the far right.
- **Who can change it:** anyone signed in to the Back Office (same team cookie as every `/api/team/*` route). No owner gate.
- **Where it is stored:** one private JSON document, `team/links.json`, in the site's existing Vercel Blob store
  (`BLOB_READ_WRITE_TOKEN`, the same store as the onboarding handoffs and client files). No new service. Writes are
  read → change → write-if-unchanged (Blob `ifMatch`; the first ever write is create-only), so two people saving at the
  same moment cannot lose each other's change. The ETag a write names comes from `head()`, read on both sides of an
  uncached `get()` and trusted only when the two agree: the ETag that `get()` itself returns did not match what
  `put({ ifMatch })` checks on production (the first build refused every delete with "Someone else is saving links"). Each link carries a `rev`; an edit made from a
  stale screen gets a 409 and the list reloads. The adder's email is kept in storage but never sent to the browser.
- **Rules (server-side, `src/lib/desk/link-rules.ts`):** http and https only (`javascript:`, `data:`, `mailto:`, `file:`
  and the rest are refused); an address typed without a scheme gets `https://`; a link carrying `user:password@` is
  refused; no spaces or control characters; name ≤ 120, link ≤ 2048, note ≤ 500 characters; 500 links at most; the same
  address cannot be saved twice ("That link is already saved, as …").
- **Code:** `src/app/leads/links.tsx` + `links.css` (the tab), `src/lib/desk/links.ts` (storage), `src/lib/desk/link-rules.ts`
  (pure checks, used by the browser and the server), `src/app/api/team/links/route.ts` (GET list, POST add) and
  `src/app/api/team/links/[id]/route.ts` (PATCH edit, DELETE). Tests: `src/lib/desk/links.test.ts` (`npm run test:desk -- links`).
- **Phones:** with four tabs the tab row is a little tighter below 560px wide and scrolls sideways on the narrowest
  screens (`onboarding.css`, last rule). Desktop is unchanged.

## How it is wired
- `src/app/admin/page.tsx` is a thin page: metadata (title, noindex) and the shell. The desk's own files are still in
  `src/app/leads/` (`shell.tsx`, `desk.tsx`, `onboarding.tsx`, `clients.tsx`, …). That folder has no `page.tsx` any
  more, so it is not a route. Moving the files under `src/app/admin/` is a later cleanup; nothing depends on it.
- `src/lib/desk-path.ts` is the one place that knows the address. It has no imports, so the middleware, the server,
  the browser and the tests can all read it: `DESK_PATH`, `deskHref()` / `deskUrl()` for links, `safeNext()` for where
  sign-in may land, `deskGate()` for the sign-in gate. Build every new desk link with `deskUrl()`.
- `next.config.ts` forwards `/leads` and anything under it to the same path under `/admin`, query string kept
  (`/leads?tab=clients&client=abc` → `/admin?tab=clients&client=abc`). It is a 307 on purpose: browsers cache a
  permanent redirect indefinitely, and a team tool gains nothing from that. The forward stays for good, because old
  links are everywhere: bookmarks, the October 2 team email, calendar events already in people's calendars, and the
  "Desk Link" values stored on GoHighLevel contacts. Nothing stored was rewritten.
- `src/middleware.ts` gates `/admin` and everything under it with the team cookie (`cc_admin_token`) and adds
  `X-Robots-Tag: noindex, nofollow` to every `/admin` response. `/leads` never reaches the middleware; the forward runs
  first.

## Sign-in
- Signed out, `/admin` (with or without a query) goes to `/admin/login?next=<path and query>`. The sign-in page posts
  that `next` with the email, the one-time link carries it, and `/api/admin/verify` lands the person back on the same
  record. Before October 2 the query was dropped.
- Signed in, `/admin/login` goes to the desk (to `next` when the page was opened with one).
- `safeNext()` only honours a place on the desk: `/admin…` or the old `/leads…`. Anything else lands on `/admin`.
- The sign-in itself is unchanged: `/admin/login`, `/api/admin/login`, `/api/admin/verify`, `/api/admin/logout`,
  `src/lib/team-login.ts`, `src/lib/team-auth.ts`. Signing out is on the desk's own bar now (next section).

## Sign out (October 2, 2026)
The bar that holds the three tabs ends, on the right, with the name of whoever is signed in and a quiet **Sign out**
(on a phone the pair sits above the tabs). The old admin sidebar had the only sign-out, and it went with that screen.
- **What it does:** `POST /api/admin/logout` (unchanged: it clears `cc_admin_token`), then a full load of
  `/admin/login`. A full load on purpose, so nothing the desk had on screen stays in memory. Other desk tabs that are
  already open keep what they show until their next request, which answers 401.
- **Who is signed in** has no endpoint of its own. `GET /api/team/calls` (the Sales roster, which the desk asks for on
  every load whatever tab is open) carries `me: { name, email }`: the same name a note is saved under (`signedInAs` in
  `src/lib/desk/team.ts`). The bar shows the name; the full address is its tooltip. A session with no address, or an
  answer from an older build, shows Sign out alone.
- **Unsaved call notes.** The Sales desk holds the drafts, so the shell asks it first (`DeskLeave` in
  `src/app/leads/types.ts`). With a draft that is not saved there is one question ("... Sign out anyway?"), and after a
  yes the browser's own "leave site?" prompt stays quiet. While a save or an assignment is still running, Sign out waits
  and says so. The drafts are not cleared: they stay in that tab's session storage, as they do when a session expires,
  and are there again after signing in in the same tab.
- **If the request fails** the desk says so under the bar for a few seconds and nothing changes.
- Code: `src/app/leads/shell.tsx` (the bar and `signOut`), `desk.tsx` (`onWho`, `leaveRef`), `onboarding.css`
  (`.team-bar`, `.team-session`, `.team-signout`, `.team-bar-alert`). `signedInAs` is unit-tested; the flow itself was
  run in a browser against a local build (sign out; cancel with a draft; a failed request; a save in flight).

## The old admin screen is gone
`/admin` used to be a "Clients" list that edited the logins of the old in-site client portal
(`src/data/clients.json`). Removed on October 2: `src/app/admin/layout.tsx`, `actions.ts`, `clients/new/page.tsx`,
`clients/[slug]/edit/page.tsx`, and the components only it used (`AdminSidebar`, `AdminDeleteButton`, `ClientForm` in
`src/components/dashboard/`). `/admin/clients` and anything under it now forwards to `/admin`. The sign-in page no
longer shows that screen's sidebar next to the card.

The old client portal was retired later the same day (Dave, October 2: "delete the old one"). Gone: the pages
(`/clients/login`, `/clients/<slug>`, `/seo`, `/ads`), its logins (`src/data/clients.json`, `src/lib/clients.ts`),
its sign-in (`src/lib/auth.ts`, `/api/auth/*`, the `next-auth` and `bcryptjs` packages), its report routes
(`/api/brightlocal/*` and `/api/brightlocal-lrt/*` — the second answered without a sign-in), `src/lib/brightlocal.ts`,
`src/components/dashboard/*`, and two captures of a client's rank tracker that sat in `public/`. `/clients` and
anything under it now forwards to the home page (`next.config.ts`, 307). `jose` is a direct dependency now — the
team cookie is signed and verified with it and it used to arrive only through `next-auth`. `NEXTAUTH_SECRET` is still
the team cookie's signing key; do not remove it. `BRIGHTLOCAL_API_KEY` is no longer read by anything. The three
logins were two demos and one real but unused client login; the files are in git history before this commit.
Do not confuse `src/lib/clients.ts` (the portal, gone) with the directory `src/lib/clients/` (the desk, live).

## Kept out of search engines
The page carries `robots: noindex, nofollow` (as `/leads` did), every `/admin` response carries the same in an
`X-Robots-Tag` header (new: this also covers the sign-in page, which used to be indexable), `admin` is a private
segment in `src/app/sitemap.ts`, and `/leads` dropped out of the generated sitemap when its page file went (it had
been listed there by mistake).

## Still written as /leads, on purpose
These work through the forward and were left because the files belonged to work in flight on October 2:
- `src/lib/desk/migrate.ts`: the Desk Link the Monday import writes on a contact (two places).
- `src/app/leads/clients.tsx`: the "Onboarding record: open" link in a client panel.
- Comments in `src/lib/desk/switch.ts` and `src/lib/desk/basics.test.ts`, the test expectations in
  `src/lib/desk/migrate.test.ts`, and `Docs/Desk-on-GHL.md`.
- (`src/components/TopBar.tsx`, which hid the site's top bar on `/leads` and `/admin`, was removed with that bar on October 4.)
- Import paths such as `@/app/leads/types` are file locations, not addresses. They change only if the folder moves.

## Check it (signed out)
```
curl -sI https://www.creativecowboys.co/admin                          # 307 → /admin/login?next=%2Fadmin
curl -sI "https://www.creativecowboys.co/leads?tab=clients&client=x"   # 307 → /admin?tab=clients&client=x
curl -sI https://www.creativecowboys.co/admin/clients/new              # 307 → /admin
curl -sI https://www.creativecowboys.co/admin/login                    # 200, x-robots-tag: noindex, nofollow
curl -s  https://www.creativecowboys.co/api/team/calls                 # 401
```
Tests: `src/lib/desk-path.test.ts` (in `npm run test:call-owner`).

## If the build fails in next/font
On October 2, 2026 Google Fonts was intermittently answering with font URLs that have no file extension
(`https://fonts.gstatic.com/l/font?kit=…`), which Next 16.1.6 cannot parse: the build stops with
"An error occurred in `next/font`" and `TypeError: Cannot read properties of null (reading '1')` on a page nobody
touched. It is the network, not the code. Run the build again, or redeploy on Vercel; a failed deploy leaves the
previous one serving.
