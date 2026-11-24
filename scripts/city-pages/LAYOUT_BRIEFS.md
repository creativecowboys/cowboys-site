# City page layout options: build briefs (Nov 20 2026)

Josh asked for three different layouts for the city landing pages to pick from:
"visually catching and engaging … it needs to make us look very professional."
Each option is one file, `src/components/city/layouts/Layout{A,B,C}.tsx`, previewed at
`/city-layout-preview/{a,b,c}` (optionally `?city=sandy-springs-ga` etc.) with real content.

## Shared requirements (all three)

**Props:** `{ page: CityPage; preview?: boolean }`. Pass `preview` through to `CityLeadForm`.

**Data (import, never hard-code):**
- `@/lib/city-pages`: `CityPage`, `proofFor(page)` (3 real clients, `.local` true when one is within 75 mi), `nearbyLinks(page)`, `milesBetween(HQ, page)`, `HQ`.
- `@/lib/offer`: `LOCAL_PACKAGE` (name, monthly 297, term "Month to month. No contracts.", websiteValue 3500, includes[3]), `OTHER_SERVICES` (5, some with href), `usd()`.
- `@/lib/seo`: `NAP` (address, phone), `BUSINESS_ID`, `SITE_URL`.
- `@/components/city/CityLeadForm`: lead form. Style it with the `theme` prop (form/label/input/button/note/success class strings).
- Team photos: `/team/josh-tee.jpg` and `/team/dave-tee.jpg` (portrait 1000×1490, faces in the top ~40%). Names "Josh" and "Dave", role "Co-founder". Use `next/image` with real `sizes`.
- Client logos (black art on transparent; on dark backgrounds use `brightness-0 invert`): `/Client Logos/johnbjackson-dark-Blue.png`, `/Client Logos/McKinley (Black).png`, `/Client Logos/Harmonic Logo (Black).png`, `/Client Logos/big-MetLane_logo_full.png`, `/Client Logos/Leuco transparent 2.png`, `/Client Logos/InnovativeLogoWebsite.png`, `/Client Logos/Life Publishers (Black).png`, `/Client Logos/FireBible logo Black.webp`. URL-encode spaces in `src`.

**Every page must include:** one H1 exactly "Web Design in {city}, {state}" (line breaks fine) · `page.eyebrow`, `page.lead` · all of `page.local` · the offer (package card with its 3 includes, the price, the term line, the $3,500 free website, then the 5 other services) · the strip "Only need a website? Ask us about our new website specials." linking to /contact · `page.industries` · `page.includes` · proof (the 3 `proofFor` clients with city, industry, work) · logo strip · `page.howWeWork` + the team photos + the line that Creative Cowboys is Josh and Dave at `NAP.streetAddress`, Villa Rica, about N miles from the city (only when N > 25) · `page.areas` · `page.faqs` (accessible disclosure, `<details>` is fine) · `nearbyLinks` + link to /areas-we-serve · a final CTA · phone `NAP.telephoneDisplay` as a tel: link · the lead form somewhere prominent.

**Schema:** copy the JSON-LD `schema` object exactly as built in `src/components/city/CityLandingPage.tsx` (BreadcrumbList, WebPage, Service with `offerSchema()` from `@/components/city/OfferSection`, FAQPage) and render it in a `<script type="application/ld+json">`.

**Header/footer:** `@/components/global/Header` (has a `dark` prop) and `@/components/global/Footer`.

**Truth rules:** no invented stats, client counts, star ratings, reviews, awards, years in business, guarantees, or "#1" claims. The only numbers you may show: $297/month, $3,500, month to month / no contracts, the computed miles, `page.population`, and what `proofFor` returns. Write any new microcopy plainly (short sentences, no "elevate/unlock/seamless/vibrant", no rhetorical questions, at most a few em dashes).

**Quality floor:** responsive from 375px to 1440px with no horizontal scroll · visible keyboard focus · `prefers-reduced-motion` respected · contrast AA · semantic h2/h3 under the single h1 · images with alt text · fonts via `next/font/google` declared at the top of your own file. Tailwind v4 utilities and arbitrary values are available. Keep it to your one file (a small `"use client"` helper file next to it, e.g. `LayoutA.motion.tsx`, is fine if you need motion).

**Don't:** edit any other file, install packages, build, commit, or push. Check your work with `npx tsc --noEmit -p .` and `curl -s -o /dev/null -w "%{http_code}" http://localhost:3031/city-layout-preview/<a|b|c>` (dev server runs on 3031; first load compiles, allow ~20s).

---

## Option A · "Night Ride" (Josh's new brand direction, follow it exactly)

Josh, Nov 18 2026: the site is moving to a sleek dark look, "sleek and easy to understand and read."

- **Color:** canvas `#050404` with a faint dot grid (`radial-gradient` 1px dots ~24px, ~6% opacity) and a soft orange glow at the bottom of the hero; orange `#F15A29` with gradient to `#FFB089` (for the price and key words); text `#F4EFEA`, muted `#A79C95`; card surface `#0E0B0A` with 1px `#2a2220` borders, radius 18px, a faint orange radial glow on hover.
- **Type:** Inter Tight 900, ALL CAPS, tracking -0.045em for headlines (huge in the hero, ~clamp(48px,9vw,120px)); Inter for body; JetBrains Mono 11–12px uppercase, letter-spaced, for HUD labels (eyebrows, coordinates, "REC", section tags).
- **Signature:** a camera **viewfinder** around Josh and Dave in the hero: their two photos side by side inside a frame with orange corner brackets, a pulsing red "● REC" label, and a mono readout of the city's coordinates (`page.lat`/`page.lon`, e.g. `33.9414°N 84.3127°W`) and "{city}, {ST}". This is the one bold move; keep the rest quiet.
- **Layout:** hero = left: mono eyebrow pill with glowing orange dot, H1, lead, two buttons (primary orange "Get my free {city} plan" scrolls to the form; secondary ghost "Call (470) 243-7517"); right: the viewfinder. Then a thin logo strip (inverted logos, 40% opacity). Local story in a narrow readable column. Offer as one large glowing card: price in gradient type, 3 includes, $3,500 line, then other services as a row of small rounded tiles; the website-specials strip as a slim pill bar. Industries + includes as 2×2 rounded cards. Proof: 3 cards. How we work + form side by side (form in a card). Areas as pills. FAQ as clean rows with + / − . Nearby as pills. Final CTA band with orange glow.
- **Motion:** soft rise + de-blur on load for the hero (expo ease, ~700ms, staggered 80ms), REC dot pulse. Nothing bouncy. Respect reduced motion.
- `Header dark`.

## Option B · "Daylight Studio" (bright, calm, premium agency)

The opposite of A: a light, spacious, high-end studio site. Professional and trustworthy, like an agency that wins bigger accounts.

- **Color:** canvas pure white `#FFFFFF`, secondary surface cool stone `#F3F3F1`; ink `#121212`, body `#4A4A4A`, hairlines `#E4E4E0`; one accent, the brand orange `#F15A29` used sparingly (links, small marks, the route line); one deep band `#111111` for the offer section. Not cream.
- **Type:** headlines in "Instrument Sans" or "Inter Tight" at 600–700, **sentence case** (not caps), large and tight (-0.03em), e.g. "Web design in Dunwoody, GA" as a calm, confident statement; body Inter 17–18px with generous line height; small labels in Inter 500 uppercase 12px tracking 0.12em.
- **Signature:** a drawn **route map** card: a clean SVG with two pins, "Villa Rica, GA (our office)" and "{city}, {ST}", connected by an orange dashed curved line with the computed distance ("about 38 miles") as a label. Position pins from real lat/lon (project into the SVG box; keep it simple: equirectangular scaled to fit with padding). If the city is under 25 miles away, label it "next door". Sits beside the local story. No map tiles, no external requests.
- **Layout:** hero split 55/45: left = small label + H1 + lead + primary button (solid ink, "Get a free {city} site plan") + text link "or call (470) 243-7517"; right = large rounded (24px) photo pair of Josh and Dave, slightly overlapping, with small name tags. Under the hero a light logo strip in grayscale. Local story (2 columns on desktop: text + route map card). Offer on the deep `#111` band: left price block, right includes and other services in a clean list with thin dividers; the website-specials line beneath in orange text with an arrow. Industries as a 2-column list with thin top borders (not boxes). Includes as 4 columns of small text. Proof: 3 white cards on `#F3F3F1` with client name large. How we work + form side by side (form on white card with soft shadow `0 20px 60px -20px rgba(0,0,0,.18)`). FAQ as an accordion with thin dividers. Nearby + areas as quiet text links. Final CTA centered.
- **Motion:** minimal: images fade in, route line draws itself once (stroke-dashoffset) when scrolled into view. Respect reduced motion.
- `Header` default (light).

## Option C · "The Quote" (bold, conversion-first)

Built to turn a visitor into a call. Energetic, confident, still professional.

- **Color:** hero is full-bleed brand orange `#F15A29` with ink `#0B0B0B` type; below, white `#FFFFFF` and a warm light gray `#F5F4F2`; ink sections `#0B0B0B` with white text; a pale orange tint `#FFE8DF` for highlights. 
- **Type:** headlines "Archivo" (or "Archivo Black" / Archivo 800–900 with slight width) ALL CAPS, big and blocky; body "Inter"; numbers and the quote in "IBM Plex Mono" or "JetBrains Mono".
- **Signature:** the offer as an **itemized quote / estimate document**: a white paper card, slightly rotated -1.5° on desktop (straight on mobile), with a header "Estimate for a {city}, {ST} business", line items with dotted leaders: "Custom website ...... ~~$3,500~~ $0", "Local SEO ...... Included", "Paid ads management (ad budget separate) ...... Included", then "Monthly ...... $297", "Contract ...... None, month to month", and a stamp-like orange tag "Free website included". Other services listed below the quote as "Add-ons available". This is the bold move.
- **Layout:** hero split: left = mono eyebrow, H1 in black on orange, lead, phone link; right = the lead form in a white card with ink shadow (this page leads with the form). Then a black strip with the logo strip inverted. Then local story on white with a big pull-quote line from `page.local.heading`. Then the quote document section on `#F5F4F2` (quote card left, "how it works" right: the 3 package includes). Industries as bold black tiles with white text. Includes as checklist. Proof as 3 cards with orange top border. Team (Josh, Dave photos) + how we work. Areas, FAQ (accordion), nearby. Final CTA is orange again with the phone number huge. On phones, a **sticky bottom bar**: "$297/mo · free website" + "Call" button (tel link) + "Get plan" button (scrolls to form); add bottom padding so it never covers content; hidden on desktop.
- **Motion:** quote card lifts slightly on hover; sticky bar slides up after scrolling past the hero. Respect reduced motion.
- `Header` default.
