# Creative Cowboys — Homepage Content Guide

**Status:** Finalized after verification round on 2026-05-28. All decisions resolved. Ready to push to dev.

A section-by-section playbook for finishing the homepage. Each section shows what's live now and what to change. Anywhere you see "OLD → NEW", swap the old copy for the new.

Page reference URL: https://www.creativecowboys.co/home-new

---

## Decision log — what got verified

| Item | Resolution |
|---|---|
| Hero stat: 300% AVG SITE TRAFFIC | ✓ Real cross-client average — keep as-is |
| Hero stat: 90 DAYS AVG PAYBACK TARGET | Drop "AVG" — change to "90-DAY PAYBACK TARGET" |
| Hero stat: 27+ BRANDS SHIPPED | Update to **100+ BRANDS SHIPPED** |
| Case study metrics (Harmonic 300% / JBJ $500K / McKinley 1000%) | ✓ All real and provable — keep as-is |
| Ryan Coffey at Harmonic Production | ✓ Confirmed — use as Slide 1 |
| Rob Goldin's company | Commercial Insurance Agency |
| Lance Day's company | Day Accounting |
| Team | Josh + Dave (drop "Matt" — Jackie's review was off) |
| Geographic positioning | "Southeast" (not West Georgia) |
| Franklin, TN top bar | ✓ Still active — keep |
| Portfolio cards 4–6 | Placeholders — remove until real client work is ready |
| Individual case study pages | Don't exist yet — remove "CASE STUDY" buttons from portfolio cards |
| CTV work for JBJ | ✓ Real — edit "CTV" to "streaming TV" for clarity |
| Pricing Packages footer link | Page coming soon — remove link temporarily |
| FAQ Q2–Q6 answers | Use Claude's drafts as final |
| Footer Direct Links | Being rebuilt — leave for now, audit when rebuild ships |

---

## Site-wide brand rules

### Voice rules

- **Audience.** Your prospects are insurance agents, lawyers, roofers, accountants, small-business owners across the Southeast. Not developers. Not designers. Write to them.
- **No internal/technical jargon in client-facing copy.** No "Next.js," "Indie Brutalist," "schema markup," "CRO," "GBP" without expansion. If you use a technical term, define it in the same sentence.
- **"No fluff" means no fluff.** Cut hedging words. Say what you do plainly.
- **First person plural — "we."** Not "Creative Cowboys is the agency that does..." → "We're the agency that..."

### Geography

Lead with **"the Southeast"** in the hero. Use **"Villa Rica, GA"** in the footer / contact info. Mention specific cities (Villa Rica, Carrollton, Douglasville, Cleveland TN, Franklin TN) as service area examples where natural.

### Team

The team is **Josh and Dave.** Multiple Google reviewers confirm Dave is a partner. Naming both in the Howdy Partner / About section adds free credibility.

### Page title (browser tab + Google search results)

OLD: `Creative Cowboys | Indie Brutalist Digital Marketing Agency | Creative Cowboys`
NEW: `Creative Cowboys — No-Fluff Digital Marketing Agency for the Southeast`

Fixes the CMS duplication bug AND drops "Indie Brutalist" (internal vocabulary your prospects don't know).

---

## Section 01 — Top utility bar

### Live

```
NOW SERVING FRANKLIN, TN          (470) 243-7517
```

### Final — no change

Keep as-is. Franklin TN is an active market. Phone number matches Google profile.

---

## Section 02 — Header / nav

### Live

```
[Creative Cowboys script logo]   CASE STUDIES   SERVICES   SELECTED WORKS   [GET A PROPOSAL]
```

### Final — no change

Header layout is working.

One open consideration (not blocking): "SELECTED WORKS" and "CASE STUDIES" are conceptually similar. If both stay, make sure "Selected Works" clearly links to a separate portfolio destination, not back to the case studies block.

---

## Section 03 — Hero

### Live

```
DIGITAL MARKETING THAT DRIVES RESULTS.

Creative Cowboys is the Southeast marketing agency that dumps the fluff.
We build fast, high-converting websites, run ROI-driven advertising
campaigns, and secure top search rankings.

[GET A PROPOSAL]  [EXPLORE SERVICES]
```

### Final

Headline — keep as-is.

Body copy — replace with:

OLD:
> Creative Cowboys is the Southeast marketing agency that dumps the fluff. We build fast, high-converting websites, run ROI-driven advertising campaigns, and secure top search rankings.

NEW:
> We're the Southeast's no-fluff marketing agency. We build fast, high-converting websites, run advertising that pays for itself, and get small businesses found on Google. Serving Villa Rica, Carrollton, Douglasville, Cleveland TN, Franklin TN, and beyond.

Three improvements: "ROI-driven advertising campaigns" → "advertising that pays for itself" (plain English), names actual cities (local SEO juice), and stays in the Southeast voice you chose.

Visual elements — keep the brutalist headline + ZERO WASTED SPEND poster + two-button CTA pair. All landing.

---

## Section 04 — Stats strip

### Live

```
300% ↑              90 DAYS              27+
AVG SITE TRAFFIC    AVG PAYBACK TARGET   BRANDS SHIPPED
```

### Final

| Element | OLD | NEW |
|---|---|---|
| First stat | `300% AVG SITE TRAFFIC` | Keep ✓ (real average, verified) |
| Second stat | `90 DAYS AVG PAYBACK TARGET` | `90-DAY PAYBACK TARGET` (drop "AVG") |
| Third stat | `27+ BRANDS SHIPPED` | `100+ BRANDS SHIPPED` |

The "90-DAY PAYBACK TARGET" reframe is cleaner — "TARGET" already implies goal-not-result, so the word "AVG" was creating an inconsistency. And bumping to "100+" is a stronger headline number while still being honest.

---

## Section 05 — Service marquee

### Live

```
LOCAL SEO MAPPING ★ CUSTOM WEB DESIGN ★ ROI PPC ADVERTISING ★
BRAND STRATEGY ★ SOCIAL MEDIA ADS ★
```

### Final — minor expansion recommended

The marquee currently lists 5 services. Your "Services" section below lists 8. Mirror them so the page is consistent:

NEW marquee items (in order):
`CUSTOM WEB DESIGN ★ SEO SEARCH ★ ROI PPC ADVERTISING ★ BRAND IDENTITY ★ SOCIAL MEDIA ADS ★ LOCAL SEO MAPPING ★ CONTENT + COPY ★ EMAIL + CRM ★`

---

## Section 06 — Case studies

### Card 1: Harmonic Production

```
04.15  // WEB DESIGN & SEO
HARMONIC PRODUCTION
Client: AV & EVENT CONCERT OUTFITS  •  Location: CLEVELAND, TN
[300% ENGAGEMENT]

✓ Delivered full brand rehaul and localized SEO keywords.
✓ Boosted customer retention metrics by 200% year-over-year.
✓ Cut servers launch downtime to 0 minutes during final domain transition.
```

### Card 1 — bullet copy fixes

| OLD | NEW |
|---|---|
| "Delivered full brand **rehaul** and localized SEO keywords." | "Delivered a full brand **overhaul** and localized SEO strategy." |
| "Boosted customer retention metrics by 200% year-over-year." | "Boosted year-over-year customer retention by 200%." |
| "Cut **servers launch** downtime to 0 minutes during **final** domain transition." | "Cut server downtime to **zero** during the domain transition." |

### Card 2: John B. Jackson & Assoc

```
05.20  // SEO & PPC ADS
JOHN B. JACKSON & ASSOC
Client: PERSONAL INJURY LAWYERS  •  Location: SOUTHEAST
[+$500K REVENUE]

✓ Achieved 22 #1 organic placements on Google in 12 months.
✓ Designed multi-platform lead funnels tracking phone queries.
✓ Launched integrated branding campaigns across CTV and paid social.
```

### Card 2 — bullet copy fixes

| OLD | NEW |
|---|---|
| "Achieved 22 #1 organic placements on Google in 12 months." | Keep ✓ |
| "Designed multi-platform lead funnels tracking **phone queries**." | "Designed multi-platform lead funnels with **phone-call tracking**." |
| "Launched integrated branding campaigns across **CTV** and paid social." | "Launched integrated brand campaigns across **streaming TV** and paid social." |

The "streaming TV" swap is for prospect clarity. "CTV" is real and you do the work — but your insurance agent / roofer prospects won't know what CTV stands for. "Streaming TV" is the same thing in plain English.

Also: tighten the location. JBJ is based in Douglasville, GA per public records. Recommended: `LOCATION: DOUGLASVILLE, GA + ACROSS THE SOUTHEAST`.

### Card 3: McKinley Roofing

```
06.15  // WEB & LOCAL SEO
MCKINLEY ROOFING
Client: ROOFING & RESTORATION  •  Location: DOUGLASVILLE, GA
[+1000% TRAFFIC]

✓ Built dynamic neighborhood service-area landing pages.
✓ Established C-level Google Profile SEO and schema metrics.
✓ Shipped custom storm intake insurance lead flows.
```

### Card 3 — bullet copy fixes

| OLD | NEW |
|---|---|
| "Built dynamic neighborhood service-area landing pages." | Keep ✓ |
| "Established **C-level** Google Profile SEO and schema metrics." | "Established **top-tier** Google Business Profile optimization and schema markup." |
| "Shipped custom **storm intake insurance lead** flows." | "Shipped custom **storm-damage intake forms** that feed straight to insurance leads." |

---

## Section 07 — Services

### Live — 8 numbered services, 2-column dark layout

Layout is working. Numbered rundown gives consistent rhythm with case studies.

### Capability bullet fixes

| # | Service | OLD | NEW |
|---|---|---|---|
| 02 | SEO SEARCH | Keywords · **GBP** · audits · links | Local keywords · **Google Business Profile** · audits · authority links |
| 03 | PPC ADVERTISING | Google · Meta · funnels · tracking | Google Ads · Meta · funnel optimization · lead tracking |
| 04 | BRAND IDENTITY | Logos · type · style guides · print | Logos · typography · style guides · print + vector |
| 06 | LOCAL SEO | Service-area pages · reviews · citations | Service-area pages · reviews · citations · maps ranking |

Other services (01 Web Design, 05 Social Ads, 07 Content + Copy, 08 Email + CRM) — keep current bullets.

Primary fix: spelling out "GBP" → "Google Business Profile." Acronyms are jargon to non-marketers.

### "OPEN FOR BUSINESS" badge

Keep ✓ — nice live-pulse detail.

---

## Section 08 — Custom marketing build CTA

### Live

```
NEED A CUSTOM MARKETING BUILD?

We formulate customized combinations of high-performing SEO campaigns,
fast Next.js templates, and tailored advertisement spend targets.
Reach out and secure a comprehensive digital analysis.

[PROPOSE A PROJECT]
```

### Final

Headline — keep ✓.

Body copy — replace with:

OLD:
> We formulate customized combinations of high-performing SEO campaigns, fast Next.js templates, and tailored advertisement spend targets. Reach out and secure a comprehensive digital analysis.

NEW:
> Every business is different. We build custom packages — combining the right mix of SEO, fast websites, and ad spend — to hit your specific growth target. Tell us what you're trying to do, we'll send you a plan.

Drops "Next.js" (developer jargon), drops "formulate customized combinations" (agency-speak), drops "secure a comprehensive digital analysis" (corporate-bot speak). Replaces with plain English a small-business owner actually responds to.

Button — change from `PROPOSE A PROJECT` to `GET A PROPOSAL` for consistency with the hero CTA. Two different buttons going to the same workflow creates needless friction.

---

## Section 09 — Portfolio / Selected works

### Live — 6 cards in 3×2 grid

```
Row 1:  HARMONIC WEB DESIGN  /  JBJ LAW AD CAMPAIGNS  /  MCKINLEY ROOFING SITE
Row 2:  CREATIVE BRANDING REELS  /  COWBOYS MERCHANDISE LAYOUT  /  LOCAL SEARCH OPTIMIZATION
```

### Major fix — remove cards 4, 5, 6

Cards 4 (Creative Branding Reels), 5 (Cowboys Merchandise Layout), and 6 (Local Search Optimization) are confirmed placeholders, not real client work. **Remove all three from the portfolio grid** until real client projects are ready to replace them.

A 3-card portfolio (Harmonic / JBJ / McKinley) is fine. The case studies section already shows the same three with deeper detail, so you're not losing anything by showing fewer cards here.

When new real client work is ready, drop it back into the same grid format.

### Remove all "CASE STUDY" buttons from all cards

Individual case study detail pages don't exist yet. The buttons currently go nowhere. **Remove the "CASE STUDY" buttons** until those pages are built. (When pages ship later, add buttons back.)

### Card 1: Harmonic Web Design — copy fixes

| Element | OLD | NEW |
|---|---|---|
| Top tag | `NEXT.JS / SEO` | `WEB DESIGN + SEO` |
| Title | `HARMONIC WEB DESIGN` | Keep ✓ |
| Subtitle | `AV & Concert production agency hub` | `Custom site for Cleveland, TN concert AV outfit` |
| Bullet 1 | `Custom Next.js Platform` | `Custom-built website` |
| Bullet 2 | `SEO Keywords Strategy` | `Localized SEO strategy` |
| Bullet 3 | `Event Calendar Integration` | Keep ✓ |
| Bullet 4 | `High-Speed Hosting Setup` | `High-performance hosting` |

### Card 2: JBJ Law Ad Campaigns — copy fixes

| Element | OLD | NEW |
|---|---|---|
| Bullet 1 | `Google PPC Strategy` | `Google Ads strategy` |
| Bullet 2 | `Retargeting Ad Design` | Keep ✓ |
| Bullet 3 | `Local Leads Funnels` | `Local lead funnels` |
| Bullet 4 | `Phone Conversions Tracking` | `Phone conversion tracking` |

### Card 3: McKinley Roofing Site — copy fixes

| Element | OLD | NEW |
|---|---|---|
| Bullet 1 | `Local Service Pages` | `Neighborhood service-area pages` |
| Bullet 2 | `Schema Markup Coding` | `Schema markup` |
| Bullet 3 | `Google Profile SEO` | `Google Business Profile optimization` |
| Bullet 4 | `Review Accumulator Pipeline` | `Review generation system` |

### Other polish

- "DELIVERED SERVICES" label appears on every card with no function. **Delete it** — the bullets self-explain.

---

## Section 10 — Testimonials carousel

The current Slide 3 ("Samantha Lee / Horizon Real Estate Group") is fabricated. Replace immediately. Slides 1 and 2 are real reviewers with verified company attributions.

### Slide 1 — Ryan Coffey

```
DATE CHIP:        04.15
SERVICE CHIP:     WEB DESIGN + SEO

BIG YELLOW:       HARMONIC PRODUCTION
SUBTITLE:         CONCERT AV · CLEVELAND, TN

QUOTE:            "Creative Cowboys provided us with a complete rehaul
                  of our website and optimized our SEO which has
                  provided our company with an almost 300% increase
                  in customer engagement with a 200% customer retention.
                  Cowboys always responded quickly to updates and needs
                  with zero downtime. Would recommend them to anyone
                  looking for SEO and market engagement."

ATTRIBUTION:      — Ryan Coffey

STARS:            ★★★★★

WEBSITE MOCKUP:   harmonicproduction.co
CAROUSEL TAB:     01 / HARMONIC
```

Same numbers as your Harmonic case study (300% engagement, 200% retention) — the section becomes mutually reinforcing.

### Slide 2 — Rob Goldin / Commercial Insurance Agency

```
DATE CHIP:        05.20
SERVICE CHIP:     WEB + SEO

BIG YELLOW:       COMMERCIAL INSURANCE AGENCY
SUBTITLE:         INSURANCE · BREMEN, GA

QUOTE:            "Top notch service. We have been with Josh and his
                  crew for 2 years and have seen GREAT ROI. Always
                  responsive when we have a question or issue.
                  Highly recommend."

ATTRIBUTION:      — Rob Goldin

STARS:            ★★★★★

WEBSITE MOCKUP:   [site you built for Commercial Insurance Agency]
CAROUSEL TAB:     02 / COMMERCIAL INSURANCE
```

All fields resolved.

### Slide 3 — Lance Day / Day Accounting

```
DATE CHIP:        06.15
SERVICE CHIP:     WEB DESIGN

BIG YELLOW:       DAY ACCOUNTING
SUBTITLE:         CPA · NEWNAN, GA · LOCAL GUIDE / 23 REVIEWS

QUOTE:            "If you need some help with your web work, these
                  guys can get it all together for you. No worries,
                  just solutions."

ATTRIBUTION:      — Lance Day

STARS:            ★★★★★

WEBSITE MOCKUP:   [site you built for Day Accounting]
CAROUSEL TAB:     03 / DAY ACCOUNTING
```

Note: Lance is a verified Google Local Guide with 23 reviews — surfacing that in the subtitle is a credibility signal that's worth the screen real estate. It shows he reviews a lot of businesses and you still got five stars.

### Reviews NOT used and why (for the record)

- **Jackie Waice** — reviewed your AV setup and security camera work for a restaurant, not marketing. Wrong service category.
- **Samantha Lee / Horizon Real Estate Group** — fabricated (placeholder from mockup data). Removed.

### Bench of additional real reviews (if slot opens later)

- **Daniel Hooper** — Local Guide, 76 reviews, 16 photos — highest reviewer authority, website-focused
- **Brett Mclaine** — branding-focused testimonial
- **Caitlyn Pank** — multi-year tenure proof
- **Andrew Dixon** — short and brand-voice perfect: "Best in the business. They will work hard for you. I would trust them with any size project. Yee Haw!!!!"
- **Josh Gentry** — claims to be from country band Alabama (verify, but a real celebrity nod would be rare social proof)

---

## Section 11 — FAQ

### Eyebrow label

OLD: `FAQ ACCORDION`
NEW: `FAQ`

Drop "ACCORDION" — UI vocabulary leaking into copy.

### Question 4 — already shortened on live site ✓

`Where are you located, and do you work with businesses outside of Villa Rica?` was correctly shortened to `WHERE Y'ALL LOCATED?`. Keep that.

### Final answer copy (paste these into the CMS)

#### Q1 — HOW DOES PRICING WORK?

Already authored — keep.

> Every project is different, so we don't do one-size-fits-all pricing. We'll talk through what you need and put together a custom proposal that fits your goals and budget.

#### Q2 — HOW LONG DOES A SITE TAKE?

> Most builds ship in 3 to 6 weeks. A custom landing page can be live in a week. Full e-commerce builds run 5 to 8 weeks. We send a fixed timeline with the proposal — no scope creep, no surprises.

#### Q3 — SMALL BUSINESSES?

> Yes — most of our clients are small or family-owned. We've worked with roofers, lawyers, AV companies, restaurants, churches, and accountants. If you're a local or regional business looking for real growth, you're the kind of client we built this agency for.

#### Q4 — WHERE Y'ALL LOCATED?

> Villa Rica, GA — about 35 miles west of Atlanta. We ride for clients across the Southeast. Currently serving Villa Rica, Carrollton, Douglasville, Cleveland TN, Franklin TN, and beyond. Distance is no issue; results are.

#### Q5 — WHAT RESULTS CAN I EXPECT?

> Results vary by business and starting point, but the goal we work toward on every engagement is the same: traffic that costs less than the revenue it brings in. Most of our long-term clients see traffic, lead volume, and revenue grow within the first 90 days. We send monthly reports so you can see the math yourself.

#### Q6 — HOW DO I GET STARTED?

> Hit "Get a Proposal" or call us at (470) 243-7517. We'll have a 20-minute conversation about what you're trying to do, what you've tried, and where you're stuck. If we're a fit, we'll send you a custom proposal within 3 business days. No high-pressure sales calls, no monthly retainer commitments before you've seen real work.

---

## Section 12 — Footer

### Live

```
HOWDY PARTNER
We operate out of Villa Rica, GA. No useless vanity metrics, just clean
strategies designed to optimize your return on investment.

MON - FRI: 9:00 AM - 5:00 PM
HOWDY@CREATIVECOWBOYS.CO
(470) 243-7517
VILLA RICA, GEORGIA

[COWBOYS logo]
© 2025 ALL RIGHTS RESERVED
[fb] [ig] [in]

DIRECT LINKS
- SEO Programs
- Web Design
- PPC Campaigns
- Brand Strategy
- Pricing Packages
- Privacy Policy
```

### Howdy Partner copy

OLD:
> We operate out of Villa Rica, GA. No useless vanity metrics, just clean strategies designed to optimize your return on investment.

NEW:
> We're Josh and Dave — based in Villa Rica, GA. No vanity metrics. Just websites, ads, and SEO built to make your phone ring.

Introduces the team (credibility — multiple Google reviewers already mention you both by name), replaces "optimize your return on investment" with "make your phone ring" (what small-business clients actually care about).

### Direct Links — remove "Pricing Packages" for now

Footer currently shows a "PRICING PACKAGES" link. The page doesn't exist yet (you said it's coming soon). Until then it would either 404 or contradict your FAQ answer ("we don't do one-size-fits-all pricing").

**Action:** Remove "PRICING PACKAGES" from the Direct Links list. Add it back when the pricing page ships.

### Direct Links — flagged for rebuild

The other Direct Links (SEO Programs / Web Design / PPC Campaigns / Brand Strategy / Privacy Policy) are being rebuilt. Leave them for now — re-audit when the rebuild ships to make sure each goes somewhere real.

### Social icons

Verify before publishing that fb / ig / in icons link to the real Creative Cowboys profiles. Your Google profile confirms Facebook and Instagram exist (@creativecowboyco on IG, 8.8K+ followers). Confirm LinkedIn exists or remove the "in" icon.

### Copyright year

`© 2025` — if publishing in 2026 or later, set to dynamic year or update.

---

## Quick-ship priority order

If you can only ship five fixes today, do these in order:

1. **Replace the fabricated Samantha Lee testimonial.** Slide 3 in the carousel. Legal/reputational risk — biggest priority.
2. **Fix the page title.** Visible in every Google search result for your name.
3. **Drop all "Next.js" references** from the Custom Marketing Build CTA + Portfolio card 1. Speaks the wrong language to your prospects.
4. **Fix the broken bullet:** "Cut servers launch downtime to 0 minutes during final domain transition."
5. **Author the missing 5 FAQ answers** (Q2–Q6). Drafts are in this guide — paste them in.

Everything else is polish that can ship in waves.

---

## Items still pending your input

All content fields are resolved. Two non-blocking items to handle before launch:

- Confirm Ryan Coffey, Rob Goldin, and Lance Day are OK being publicly named alongside their quotes on your homepage (standard ask for marketing-use of a Google review)
- Optional polish: Add Dave's last name + role title to the Howdy Partner section. Current draft uses first names only, which is fine. Adding "Josh Pack, Founder + Lead Strategist" / "Dave [Lastname], [Role]" reads more authoritative.

---

*End of guide. Ready to push to dev.*
