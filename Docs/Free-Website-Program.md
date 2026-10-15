# Free Website Program — creativecowboys.co/free-website

Decided by Josh and Dave on October 15, 2026. The full spec (funnel, pricing, chat service, client portal, build
order, open decisions) is the shared "Free Website Program" page; this file is what lives in the repo.

**The offer:** we design, build and launch a custom site for free. The client pays hosting monthly, first month at
checkout, and picks add-ons. The site stays on our platform (moving it off is $297). Most websites go live within
2 weeks; we take 10 builds a month.

## Prices (one list, three places that read it)
`src/lib/packages/catalog.ts` is the price list. The claim page (`src/app/free-website/offer.ts`), the Sales tab
package builder and the desk's monthly totals all read it. Change a price there and only there.

| Item | Catalog key | Price | Rule |
|---|---|---|---|
| Hosting & Support | `website-hosting` | $30/mo | 10 update credits a month |
| Website Pro | `website-pro` | $69/mo | Hosting + 50 credits + AI chat + lead texts + custom domain + priority requests + monthly report. Can't be billed with hosting or the add-ons it includes |
| AI Chat | `ai-chat` | $19/mo | Needs hosting; included in Pro |
| Lead Text Alerts | `lead-text-alerts` | $5/mo | Form leads; needs hosting; included in Pro |
| Custom Domain | `custom-domain` | $5/mo | Needs hosting; included in Pro |
| Online Booking | `online-booking` | $19/mo | Needs hosting or Pro |
| AI SEO | `ai-seo` | $97/mo | Needs an SEO plan, hosting or Pro (`Docs/AI-SEO.md`) |
| Google Business Profile Optimization | (one-time, `offer.ts`) | $97 once | Needs a verified profile |

Existing clients on the old $47 "AI Chat only" label stay at $47 (`src/lib/desk/money.ts`).

## The page — `src/app/free-website/`
- `page.tsx` — the claim page. Dead end by design (no nav), noindex, prices from `offer.ts`.
- `offer.ts` — plans, add-ons, one-time items, the terms line, Wix/Squarespace comparison prices (checked Oct 15
  2026; re-check before each campaign), the cart maths and the checkout link. Tested in `offer.test.ts`
  (`npm run test:onboarding`).
- `ClaimBuilder.tsx` — pick a plan, tick add-ons, see "Today / Then", claim.

### Two ways the claim button can work
1. **GoHighLevel order form** (the plan): set on Vercel
   - `NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_BASIC` — the order form for Hosting & Support
   - `NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO` — the order form for Website Pro

   The button becomes a link to the form for the chosen plan, carrying `plan`, `addons` (comma-separated keys from
   the table above), `one_time` and any ad parameters (`utm_*`, `fbclid`, `gclid`…) as query parameters. GoHighLevel
   can prefill custom fields from URL parameters, so a hidden "Add-ons picked" field on the form gets the cart.
   The add-ons themselves are sold as order bumps on the form. The Meta pixel fires `InitiateCheckout` on click.
2. **No URL set (today):** the button opens a four-field claim form. It posts to `/api/contact` like every other
   form (honeypot, time trap, team email, GoHighLevel contact when `LEADS_BACKEND=ghl`) with the cart as the
   message, e.g. `Claimed: Website Pro + Online Booking · $88 today, then $88/mo. Send the checkout link.` A
   person then sends the checkout link. The pixel fires `Lead`.

**Before building the order forms, test this in GoHighLevel:** its changelog for order bumps in forms says only one
product on a form can be recurring (the main product or a bump). If funnel order forms are the same, one form
can't sell $30 hosting plus a $19/mo chat bump. Fallbacks: preset bundles as single products, or Stripe Checkout
for payment with the sale pushed into GoHighLevel.

### The VSL
`NEXT_PUBLIC_FREE_SITE_VSL_URL` — the embed URL (YouTube `https://www.youtube.com/embed/<id>`, Vimeo, Wistia).
Until it is set, the hero shows the "what you get" card in its place.

## Phase 1 launch checklist (sites built by hand)
Phase 1 proves the offer before the automation is built. Per client:
1. First month paid (order form, or an invoice from the Sales tab package builder: hosting or Pro + add-ons).
2. Onboarding: business details, services, area, hours, tone, logo, photos, palette, domain status, who gets
   form leads. (The onboarding chat's Site Brief, once it outputs one; the intake link until then.)
3. Domain: registered in Hostinger (custom-domain add-on or Pro), or DNS instructions sent for their own.
4. Build from a template with Claude Code in a new repo `creativecowboys/site-<slug>`, one Vercel project.
5. Preview link to the client; one revision round.
6. Launch: domain attached, SSL up, every form submitted once and the lead confirmed in the client's inbox
   and in GoHighLevel, mobile checked.
7. Launch email with the dashboard login once the portal exists; until then, the Howdy address for changes.
8. Review request at day 14.

## Still outside this repo
- The GoHighLevel order forms (and the recurring-bump test above).
- The onboarding chat's Site Brief and its copy of the price list (`creativecowboys/local-seo-engine`).
- A Monday / GoHighLevel package label for $19 chat clients ("AI Chat only" stays 47).
- Terms of service: the platform rule, the $297 move-off, the refund rule, domain ownership.
- Twilio: confirm the campaign covers lead-alert texts; lead-alert opt-in wording.
