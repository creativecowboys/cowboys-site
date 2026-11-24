# City landing page content spec

Each page is one JSON file in `src/content/city-pages/<slug>.json`, shaped like
`src/lib/city-pages/types.ts`. `scripts/city-pages/validate.mjs` enforces the hard
limits below; nothing ships until it passes. `dunwoody-ga.json` is the reference
example. Match its depth and tone, never its sentences.

## Goal

Rank in Google's top 3 organic results (under the map pack) for
"web design <city> <st>", and also show up for "seo <city>" and
"marketing agency <city>". The pages winning those spots today are mostly thin
templates from out-of-town agencies. We beat them with real local substance,
real proof, and a clear offer.

## What the template already adds (don't write these)

- The H1 ("Web Design in Dunwoody, GA"), breadcrumb, calls to action, and phone.
- The offer block: $297/month Local Marketing Package (local SEO, paid ads
  management with a separate ad budget, free website valued at $3,500, month to
  month with no contracts) plus the other services (AI SEO, 24/7 AI agent,
  email marketing, social media management, CRM).
- Client proof (nearest real clients, else the featured case studies).
- The Josh and Dave / Villa Rica line with the distance, nearby city links, schema.

## Fields

| Field | Rules |
|---|---|
| slug | `city-st`, lowercase, hyphens. File name is `<slug>.json`. |
| path | `/web-design-<slug>` |
| city, state, stateName, county, metro | Real names. `metro` is the anchor city from the queue. |
| lat, lon, population | From the queue entry. |
| published, updated | Today's date, `YYYY-MM-DD`. |
| title | 41 characters max. Contains "Web Design" and the city. e.g. `Web Design in Dunwoody, GA` or `Dunwoody, GA Web Design & Local SEO`. |
| metaDescription | 120-160 characters. Names the city. Mentions the $297/month package or the free website. Unique. |
| eyebrow | Short line above the H1. A real local hook, e.g. "Perimeter Center · DeKalb County". |
| lead | 30-80 words. Names the city. Says what we do for businesses there and why it's different. |
| local.heading | A specific claim about this city's market, not "About <city>". |
| local.paragraphs | 3-4 paragraphs, 45-150 words each. **This is what wins.** Real places, corridors, employers, business districts, growth, who the customers are, how they search. Every fact must come from a source you list. |
| industries | heading + intro + 4-6 items. The business types that actually matter in this city, and what their website has to do. Be specific to the town (e.g. medical offices around Northside Hospital, contractors serving new subdivisions). |
| includes | Exactly 4 items: what a site we build for this city includes, angled to the town (service-area pages that name its neighborhoods, click-to-call for a commuter market, etc.). |
| areas | intro + 6+ real neighborhoods, districts, corridors, or adjacent towns. |
| howWeWork | heading + 2 paragraphs. Honest: we're based in Villa Rica, GA, so say how we work with this city (video calls, shared drafts, travel when it makes sense). Never claim an office, a local address, or that we're "based in" this city. |
| faqs | 5-7. Must include a cost question (answer: $297/month package, month to month, no contracts, includes local SEO, ads management with separate ad budget, and the free $3,500 website). Others: town-specific questions people really ask. Answers 20-95 words. |
| sources | 3+ URLs you used for the local facts (city site, chamber, Census, local news, Wikipedia is fine as one of them). |

## Hard rules

- **Truth first.** No invented clients, numbers, awards, rankings, or offices. Prices only
  $297 and $3,500, used as above. Never mention a 12-month agreement, a term, or a
  $497 rate: it's month to month, no contracts. If you can't verify a local fact, leave it out.
- **No promises.** Don't guarantee rankings, "#1", or results.
- **Unique.** Under 20% of 5-word phrases may match any other city page (the validator
  masks city names before comparing). Write each page from its own research. Don't
  start from another page's text.
- **City name** 10-20 times across the copy, used where a person would say it. Never stuffed.
- **Total copy** (your fields) 850-1,500 words.

## Voice

Creative Cowboys sounds like two plain-spoken guys from West Georgia who know their
stuff. Short sentences. Concrete nouns. Talk to the business owner. Run the copy
through the humanizer rules before you finish:

- No AI filler: elevate, unlock, seamless, cutting-edge, vibrant, bustling, nestled,
  boasts, thriving, robust, leverage, empower, delve, testament, tapestry,
  "in today's digital world", "look no further", "whether you're", "not just X but Y".
- At most 4 em dashes on the whole page. Prefer periods.
- No rule-of-three lists for rhythm, no one-line zingers at the end of paragraphs,
  no rhetorical questions as openers.
- Specific beats general: "the Ashford-Dunwoody Road corridor" beats "local roads".

## Process for each city

1. Research (15-20 minutes of searching): city government site, chamber of commerce,
   Census QuickFacts, local news, major employers, business districts, hospitals,
   schools, growth/development news, neighborhoods. Note each source URL.
2. Look at Google page one for "web design <city> <st>" if you can, to see what
   you're beating.
3. Write the JSON.
4. `node scripts/city-pages/validate.mjs <slug>` and fix everything it reports.
