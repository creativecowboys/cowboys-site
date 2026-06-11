# Antigravity Prompt — Service Pages + Core Pages Redesign

Redesign the four main service pages, the contact page, and the blog — and build a new about page — to match the new design system already live on `/home-new` and `/franklin-tn/web-design`.

## Mission

These pages are still running the OLD design system (Space Grotesk, dark theme, generic SaaS layout, Unsplash stock photos): `/web-design`, `/seo`, `/ppc`, `/brand-strategy`, `/contact`, `/blog` and all blog article pages. There is currently NO about page — that one is a net-new build at `/about`. The new homepage and the Franklin landing page have established the new vintage indie-brutalist system. Rebuild everything listed here in the new system.

## Visual references — these win every conflict

Open these HTML mockups and use them as the visual build targets. One per page:

1. `Creative Cowboys/Service Pages Redesign/web-design.html`
2. `Creative Cowboys/Service Pages Redesign/seo.html`
3. `Creative Cowboys/Service Pages Redesign/ppc.html`
4. `Creative Cowboys/Service Pages Redesign/brand-strategy.html`
5. `Creative Cowboys/Service Pages Redesign/about.html` — net-new page
6. `Creative Cowboys/Service Pages Redesign/contact.html`
7. `Creative Cowboys/Service Pages Redesign/blog.html` — blog index
8. `Creative Cowboys/Service Pages Redesign/blog-article.html` — template for ALL article pages

Each mockup renders the full page at fidelity: typography, spacing, colors, section order, device mockups, tables, cards. If the prose in this document and the mockups ever conflict, **the mockup wins**. Also reference the live pages `/home-new` and `/franklin-tn/web-design` for the production nav, footer, FAQ accordion, testimonial carousel, and marquee components — reuse those existing components rather than rebuilding them.

## Design system (must match exactly)

- **Canvas:** cream `#F2EBDA`, secondary cream `#E8E1CF`, with the dot-grid texture (`radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)`, 18px grid)
- **Ink:** `#0a0a0a` — text, borders, hard shadows
- **Coral:** `#DD5A2E` — primary CTAs, accent words in headlines, eyebrows on light sections
- **Yellow:** `#F5C842` — accents on dark sections, featured cards, eyebrow labels on dark
- **Dark sections:** `#0e0e0e` background, body text `#d4ccb8`, muted `#a0998a`
- **Display type:** Anton, ALL CAPS, line-height 0.88–0.92, accent word in coral
- **Script accents:** Lobster, rotated −3°, used sparingly as handwritten side-notes
- **Body:** Inter 400/500/700
- **Brutalist hardware:** 2.5–3px solid `#0a0a0a` borders, hard offset shadows (`4px 4px 0` buttons, `6px 6px 0` cards, `10px 10px 0` feature bands), no blur, no border-radius except pills and phone mockups
- **Marquee strips:** black bg, Anton cream text, coral ★ separators, infinite scroll
- **Eyebrows:** `— LABEL —` Anton, letter-spacing 2.5px

## Franklin, TN — priority market. This shapes the whole site.

Creative Cowboys is EXPANDING into Franklin — opening a physical office there, not just selling into the market. The site must read as a two-home company: Villa Rica, GA (HQ) + Franklin, TN (new office). Site-wide rules:

- **Utility bar (every page):** "COMING SOON: OUR FRANKLIN, TN OFFICE →" — links to the `/franklin-tn/web-design` hub. Replaces "Now serving Franklin, TN."
- **Footer (every page):** location line reads "VILLA RICA, GA · FRANKLIN, TN (NEW OFFICE)"; Howdy Partner body says "Villa Rica, GA born, and now settin' up shop in Franklin, TN"; direct links include FRANKLIN, TN → the Franklin hub.
- **Nav (every page):** FRANKLIN, TN is a top-level nav item in coral (see nav spec below). This is both a commitment signal and a permanent internal link to the priority hub.
- **About page:** carries the flagship announcement — the yellow "WE'RE NOT JUST SERVING FRANKLIN. WE'RE MOVING IN." band and the "TWO HOMES. GEORGIA & TENNESSEE." service-area section (see mockup).
- **Contact page:** Franklin gets its own coral-outlined location card ("NEW OFFICE · Opening soon"). Swap in the real address the day it's confirmed.
- **Schema:** Organization with TWO LocalBusiness locations once the Franklin address exists. Until then, Franklin appears in `areaServed` only — do not invent an address.
- **Tenure rule still applies:** the expansion is forward-looking. "We're opening / we're moving in / new office" — never "we've been in Franklin since X." Don't fabricate an opening date; `// TODO:` until Josh confirms.
- **Franklin hub stays canonical for Franklin keywords:** the `/franklin-tn/*` pages own "web design franklin tn" etc. Main service pages link TO them (e.g. a "Working from Franklin or Williamson County?" callout linking to the hub) rather than competing for the same keywords.

## Global nav rework (every page)

Replace the current inconsistent navs with one global nav: **Logo (script) | SERVICES ▾ · WORK · ABOUT · BLOG · FRANKLIN, TN (coral) | [GET A PROPOSAL]**

- SERVICES is a dropdown: Web Design, SEO, PPC Advertising, Brand Strategy, Social Media Ads, Content + Copy. On mobile it expands in the menu.
- WORK = case studies/portfolio (currently #case-studies / #portfolio on home — point to the best canonical target).
- FRANKLIN, TN → `/franklin-tn/web-design` hub, styled coral to stand out.
- GET A PROPOSAL is the only nav CTA — coral, brutalist border + hard shadow, goes to /contact. Phone number lives in the utility bar (click-to-call on mobile).
- Mobile: hamburger → full-screen cream overlay, Anton links, CTA pinned at bottom. Sticky nav on scroll (utility bar can scroll away).
- The footer is NOT bespoke per page: reuse the new homepage "HOWDY PARTNER" footer component verbatim everywhere (with the dual-location updates above). One component, one source of truth.

## Shared page skeleton (all redesigned pages)

Top utility bar (Franklin announcement + phone) → Global nav (above) → Hero (eyebrow / Anton headline with coral accent word / body / primary + secondary CTA / right-column visual) → Marquee strip → 4–6 content sections alternating cream and dark → FAQ accordion → Final CTA → Howdy Partner footer (homepage component).

## Per-page notes

### 1. `/web-design` — build first
- Hero headline: "WEB DESIGN THAT ACTUALLY CONVERTS." Right column: the desktop + phone mockup pair (same component already built for the Franklin page hero — reuse it, showing the real Harmonic site).
- Hero stat strip: 100+ sites shipped · 1.4s avg page load · $2M+ client revenue.
- Sections: Why us (4 numbered rows — "We don't build websites. We build revenue machines.") → Capabilities (6 cards) → Case study bands (Harmonic 300%, McKinley +1000% — real screenshots where available) → Process timeline, dark (4 steps) → Who we work with (6 vertical tags) → FAQ → Final CTA.
- **Kill the Unsplash portfolio grid from the old page.** Replace with real client work or cut the section. No stock photography anywhere.

### 2. `/seo`
- Hero headline: "GET FOUND. GET LEADS. GET RESULTS." Right column: the SERP/map-pack mockup from the HTML reference (CSS-built, your business #1 in the map pack).
- Sections: Why local SEO matters (split prose + JBJ pull-quote) → 6-step process cards (Google Business Profile card is the yellow featured one) → Proof, dark section (keyword before→after table + the two growth stat cards: +340% organic sessions, +180% profile clicks) → Local vs. national + monthly reporting checklist → SEO vs. PPC yellow cross-sell band → FAQ → Final CTA.
- Keyword table data comes from the current live `/seo` page — real Jackson Law numbers. Note: live site copy says both 21 and 22 #1 rankings in different places — confirm the real number with Josh and use it consistently.

### 3. `/ppc`
- Hero headline: "GOOGLE ADS. ZERO WASTED SPEND." Right column: the ads-dashboard mockup (KPIs: qualified leads, cost per lead down, return on spend; bar chart trending up; lead ticker with call tracking rows). CSS-built per the reference — not a real screenshot of a client account.
- Sections: Why Google Ads (split prose + commercial-insurance pull-quote) → 6-step process cards (Conversion Tracking is the featured card) → Cost transparency, dark section (two cards: "PAID TO GOOGLE $500–$1,500/mo" / "PAID TO US FROM $497/mo" + no-inflated-recommendations note) → Two cross-sell bands (SEO comparison, landing pages → /web-design) → FAQ → Final CTA.

### 4. `/brand-strategy`
- Hero headline: "BRANDS BUILT TO STAND OUT." Right column: the layered brand-board mockup (logo card, palette swatches, type specimen, voice card — four rotated brutalist cards).
- Sections: Why branding (split prose + pull-quote) → What's included (6 cards, logo card featured) → Touchpoints, dark section (4 tiles: website, social, signage/print, email) → FAQ (3 questions) → Final CTA.

### 5. `/about` — NET NEW PAGE
- Hero headline: "HOWDY, PARTNER. WE'RE THE COWBOYS." Right column: two rotated polaroid cards (Josh + Dave) with the "EST. 2025 · VILLA RICA, GA" stamp. Photos are `// TODO:` placeholders until real photos exist — never stock.
- Sections: Our story split prose + "ZERO WASTED SPEND" mission pull-quote → Stats band (300% avg traffic / 90-day payback / 100+ brands — same numbers as homepage) → The Cowboy Code (4 numbered values rows, pulled from the Franklin guarantee section) → Team cards (Josh Pack — Founder & Creative Director confirmed; Dave's title and both bios are `// TODO:` — get from Josh) → Service area dark section (tag cloud: Villa Rica HQ, Carrollton, Douglasville, Newnan, West Georgia, Cleveland TN, Franklin TN) → Final CTA.
- Story copy in the mockup is a DRAFT written in the brand voice — have Josh approve/edit before publish. Don't invent history beyond what's in it.
- Add `/about` to site nav and footer once live. Schema: AboutPage + Organization with founders.

### 6. `/contact`
- Two-column layout: left = headline "TELL US WHAT YOU'RE BUILDIN'." + 4 info cards (email, phone, address, hours) + yellow "respond within one business day" note; right = the brutalist form card (dark header bar, "FREE · NO PRESSURE" badge).
- Form fields are IDENTICAL to the current live form (name, email, company, service select with same 6 options, message) — keep the existing form handler/endpoint, just reskin. Keep "no spam" microcopy under the form.
- Below: marquee → "WHAT HAPPENS NEXT" dark section (3 numbered steps with timeframes) → "Three things that won't happen" promise strip → footer.
- Keep existing page title/meta/canonical. ContactPage schema.

### 7. `/blog` — index
- Hero: "STRAIGHT TALK ON DIGITAL MARKETING." + category filter buttons (All / SEO Tips / PPC & Google Ads / Web Design / Social Media / Agency Advice). Filters actually filter the grid (client-side is fine).
- Featured post: large dark band with coral shadow — currently the Local SEO Guide; make this a CMS-selectable slot.
- Post grid: 3-up brutalist cards — category chip (yellow = SEO, coral = PPC, white = web/agency, cream = social), Anton title, dek, read time, hover lifts card with coral shadow. All 10 existing posts migrate; titles/deks/URLs unchanged.
- Yellow CTA band before footer ("Ready to put this into action?").
- One copy fix while migrating: the law-firm SEO post dek says "21 #1 rankings" while service pages say 22 — confirm with Josh and align.

### 8. Blog article template — applies to ALL posts
- Article hero: breadcrumb, category + read-time + updated-date chips, Anton headline with coral accent word, dek, byline with avatar (Josh Pack — Founder & Creative Director).
- Body layout: sticky "IN THIS ARTICLE" table-of-contents card on the left (collapses above content on mobile), 720px prose column.
- Article components to implement as reusable blocks: yellow "THE SHORT VERSION" takeaway box at top, coral-edge pull-quote, black-and-yellow phase/timeline table, dark mid-article CTA card, author box at the end, "KEEP READING" 3-card related section.
- Numbered Anton H2s with coral numerals.
- The mockup uses the "How Long Does SEO Take" post as demo content — its body text is a rewrite draft; existing published article copy stays as-is unless Josh says otherwise. Apply the new TEMPLATE to existing posts without rewriting their content.
- Article schema (Article + BreadcrumbList), preserve all existing URLs exactly.

## Copy rules

- Body copy substance comes from the CURRENT live pages — it's solid SEO copy targeting West Georgia keywords. Keep the keyword targeting (West Georgia, Villa Rica, Carrollton, Douglasville) intact. The mockups restructure and tighten it into the new voice; use the mockup copy.
- Voice rules from the Homepage Content Guide apply site-wide: no technical jargon without plain-English expansion (no naked "schema markup," "CRO," "GBP"), first person plural, no fluff.
- Footer is the new Howdy Partner footer (Josh and Dave, Villa Rica GA) — NOT the old multi-column footer with the fake social links (twitter/linkedin URLs on the old pages 404 — kill them).
- Keep each page's existing `<title>`, meta description, and canonical (they're ranking). Only change page titles if Josh approves new ones.

## SEO baseline — treat as a build gate

- Lighthouse mobile 95+ across all four metrics. LCP < 1.5s, CLS < 0.05. WCAG 2.1 AA.
- Keep each page's existing `<title>`, meta description, canonical, and URL — they're ranking. New pages (/about) get fresh metadata targeting brand + location terms.
- One H1 per page (the hero headline), keyword-mapped: each service page owns its "[service] West Georgia" cluster; the Franklin hub owns Franklin terms; the blog owns informational queries. H2s carry secondary keywords naturally — never stuffed.
- Schema: Organization site-wide; LocalBusiness (two locations once Franklin address confirmed); Service + FAQPage + BreadcrumbList per service page; AboutPage; ContactPage; Article on every post. Validate everything in Rich Results Test.
- Internal linking is part of the design, not an afterthought: every service page cross-links its siblings (SEO ↔ PPC bands, PPC → Web Design), every blog post mid-CTA links to the matching service page, related-posts links stay within topic clusters, and every page links to the Franklin hub via nav + utility bar + footer.
- Image hygiene: descriptive alt text with location/service terms where honest, explicit width/height (CLS), lazy-load below the fold, modern formats.
- Device mockups, SERP cards, dashboards, and brand boards are CSS/HTML builds per the mockups — never images of dashboards, never stock photos. (Also faster = better Core Web Vitals.)
- Renders correctly at 320 / 768 / 1024 / 1440.
- 301-safe: URLs do not change. Sitemap regenerated and submitted to GSC after each page ships.

## Conversion baseline — every page is a lead page

- Primary CTA visible above the fold on every page at every viewport; one consistent primary action site-wide (Get a Proposal → /contact) plus a lower-friction secondary (Book a Strategy Call / free audit).
- Click-to-call `tel:` links on every phone number; utility-bar phone is tappable on mobile.
- Mobile: sticky bottom CTA bar (CALL + GET A PROPOSAL) on service pages — small, dismissible, never covering content.
- Contact form: keep the existing handler and the exact current fields — do not add fields (every field costs conversions). Inline validation, a real thank-you state with "what happens next" steps, and conversion event firing on successful submit (not on button click).
- Every CTA fires a distinct GA4 event via server-side GTM, named by page + position (e.g. `seo_hero_audit`, `ppc_midpage_proposal`) so we can see which sections convert.
- FAQ accordions: first question open by default; questions mirror real objections (price, timeline, ownership).
- Proof near every ask: each final CTA sits within one scroll of a metric, testimonial, or guarantee. Never a naked pitch.
- No popups, no exit-intent modals, no chat widgets — trust is the conversion strategy.

## Failure modes to avoid

1. Don't keep ANY component from the old design system — no Space Grotesk, no dark SaaS cards, no Unsplash.
2. Don't use coral decoratively on light sections beyond accent words, eyebrows, and CTAs.
3. Don't soften the brutalist hardware — shadows are hard offsets, never blurred.
4. Don't fabricate metrics, clients, or testimonials. Every number on these pages exists on the current live site. If unsure, `// TODO:` placeholder and flag it.
5. Don't break the existing SEO: keep URLs, titles, meta descriptions, and heading keyword targeting.
6. Don't add chat widgets, popups, exit-intent modals, or loading animations.
7. Don't claim Franklin tenure or invent a Franklin address/opening date — expansion language is forward-looking only, `// TODO:` until Josh confirms details.
8. Don't build per-page footers or navs — one global nav component, one homepage footer component, reused everywhere.

## Build order + reporting

`/web-design` → `/seo` → `/ppc` → `/brand-strategy` → `/contact` → `/blog` index + article template → `/about` (last — it's blocked on photos, bios, and Dave's title from Josh). Ship one, validate, then the next.

After each page: Lighthouse mobile screenshot, Rich Results Test screenshot, real mobile + desktop screenshots, and a list of any `// TODO:` content slots with what's needed to fill them.
