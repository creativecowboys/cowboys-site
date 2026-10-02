# The team desk lives at creativecowboys.co/admin

**October 2, 2026.** Dave: "How hard would it be to blow away the old admin page, and move this leads page to admin?
It seems like this has become more of an admin setup than just calling new leads." The desk (Sales / Onboarding /
Clients tabs) is now served at `/admin`. It was at `/leads` from September 21 to October 2, 2026.

Nothing about the desk itself changed: same tabs, same query parameters (`tab`, `lead`, `client`, `desk`, `backend`),
same owner rules, same APIs under `/api/team/*`. Only the browser title is new ("Admin"). What each tab does is still
described in `Docs/Leads-Page.md` (Sales), `Docs/Onboarding.md`, `Docs/Clients-Tab.md` and `Docs/Desk-on-GHL.md`.

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
  `src/lib/team-login.ts`, `src/lib/team-auth.ts`. There is no sign-out button on the desk (the only one was on the
  old admin screen); `POST /api/admin/logout` still clears the cookie.

## The old admin screen is gone
`/admin` used to be a "Clients" list that edited the logins of the old in-site client portal
(`src/data/clients.json`). Removed on October 2: `src/app/admin/layout.tsx`, `actions.ts`, `clients/new/page.tsx`,
`clients/[slug]/edit/page.tsx`, and the components only it used (`AdminSidebar`, `AdminDeleteButton`, `ClientForm` in
`src/components/dashboard/`). `/admin/clients` and anything under it now forwards to `/admin`. The sign-in page no
longer shows that screen's sidebar next to the card.

The client portal itself (`/clients/login`, `/clients/<slug>/seo` and `/ads`, `src/lib/clients.ts`, `src/lib/auth.ts`,
`/api/auth/*`, `/api/brightlocal/*`) was not changed by this move. With the admin screen gone its logins can only be
edited in `src/data/clients.json` (the password is a bcrypt hash).

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
- `src/components/TopBar.tsx` still hides the site's top bar on `/leads` as well as `/admin`; harmless.
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
