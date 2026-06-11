# Franklin TN Landing Page — Antigravity Build Guide

**Target page:** https://www.creativecowboys.co/franklin-tn/web-design
**Goal:** Fix three critical content bugs, redesign three weak sections, clean up technical-jargon copy in the Services grid.

## Visual reference file

**Open this HTML file alongside the build guide and use it as the visual target for sections 2.1, 2.2, and 2.3:**

`Creative Cowboys/Franklin TN Landing Pages/Antigravity Reference Mockups.html`

The reference file renders all three section redesigns at full fidelity (typography, spacing, colors, pin positions, timeline layout). When the build guide describes a layout, the HTML file shows you what it should look like. Match the visual — the prose specs in this document are belt-and-suspenders descriptions of what's in the HTML.

If the visual reference and the prose ever conflict, the visual reference wins.

---

This guide is ordered by priority. **Do Phase 1 first** — those are blocking issues that make the page look broken or contain fabricated content. Phases 2 and 3 are design upgrades and copy polish that can ship in any order.

---

## How to use this guide

Each task has:
- **What:** the problem in one line
- **Where:** which section + CSS class or visual landmark
- **Fix:** detailed action with specifications
- **Acceptance:** how to verify it's done

Where reusable design tokens are referenced, use the existing brand palette:
- Cream surface: `#F2EBDA`
- Dark surface: `#0e0e0e`
- Coral accent: `#DD5A2E`
- Yellow accent: `#F5C842`
- Body text on dark: `#F2EBDA` / muted `#a0998a`
- Body text on cream: `#0a0a0a` / muted `#5a5a5a`

---

# PHASE 1 — Critical content bugs

These three bugs make the page either look broken or display content that doesn't exist. Fix first. Estimated total time: under 30 minutes in the CMS.

## Bug 1.1 — Hero browser mockup is empty

**Where:** Hero section, right column. The browser frame with coral border around it currently shows just an empty black rectangle with "harmonicproduction.co" in the URL bar.

**Fix:**
The browser frame is rendering correctly, but the screenshot inside the frame is either missing, not loaded, or pointing at a broken asset path. Replace the empty container with the actual Harmonic Production hero screenshot.

Reference asset already exists in workspace:
```
Creative Cowboys/Franklin TN Landing Pages/Client Portfolio/Harmonic - Desktop Hero.png
```

Better alternative — Phase 2 replaces this entire visual with a brand poster. If Phase 2 is happening in the same sprint, skip this fix and go straight to Phase 2.1.

**Acceptance:** The hero right column shows either (a) a real client website screenshot inside the browser frame, or (b) the new brand poster from Phase 2.1. No empty black rectangles.

## Bug 1.2 — Testimonial slide 3 (Day Accounting) shows McKinley Roofing's website

**Where:** Client Testimonials carousel, slide 03 of 04 ("DAY ACCOUNTING.")

**The issue:** The browser mockup on the right side of the slide has its URL bar correctly showing `dayacct.com`, but the screenshot inside the frame is McKinley Roofing's website (visible coral "West Georgia's Trusted Roofing Experts" headline and roof-crew photo). Wrong asset linked to this slide.

**Fix:**
1. Locate the Day Accounting slide image asset in your CMS
2. Replace the McKinley Roofing screenshot with an actual Day Accounting website screenshot
3. If no Day Accounting screenshot exists yet, navigate to `dayacct.com`, capture a desktop hero screenshot at 1440×900, and upload that

**Acceptance:** Day Accounting slide right-side browser mockup shows Day Accounting's actual website (an accountant/CPA site), not McKinley Roofing.

## Bug 1.3 — Remove fabricated "Horizon Real Estate" testimonial (slide 04)

**Where:** Client Testimonials carousel — the indicator currently reads "03 / 04" with slide tabs HARMONIC, COMMERCIAL INSURANCE, DAY ACCOUNTING, HORIZON REAL ESTATE.

**The issue:** Horizon Real Estate is a fabricated testimonial. The reviewer, company, and quote were all placeholder data from an earlier mockup that was never replaced with real content. Per the homepage content guide decision, this slide must be removed.

**Fix:**
1. Delete the Horizon Real Estate slide entirely from the carousel data source
2. Update carousel total count from `04` to `03`
3. Verify carousel indicators at the bottom now show only three tabs: HARMONIC / COMMERCIAL INSURANCE / DAY ACCOUNTING
4. Verify the right-arrow navigation from Day Accounting wraps back to Harmonic (or disables, depending on existing carousel behavior)

**Acceptance:** Carousel shows exactly 3 slides, indicator reads "X / 03", no "Horizon Real Estate" anywhere in the markup.

---

# PHASE 2 — Section redesigns

Three sections need structural redesign, not just copy edits. Specs below are detailed enough to implement directly.

## Section 2.1 — Hero visual (right column)

**Where:** Hero section, right column. Currently a single empty browser-frame container.

**Goal:** Replace the empty browser frame with a Franklin-specific brand poster that mirrors the "ZERO WASTED SPEND" poster pattern from the main homepage. This makes the Franklin page feel like the same brand family.

### Component spec — Franklin Brand Poster

**Container:**
- Background color: `#DD5A2E` (coral)
- Padding: `26px 22px`
- Transform: `rotate(-3deg)`
- Box-shadow: `8px 8px 0 #0a0a0a` (hard, no blur)
- Aspect ratio: `3 / 4` (portrait)
- Max-width: 280px (or sized to match existing hero right column)
- Display flex column, justify space-between
- Color: white text

**Top section:**
- Eyebrow row: text "FRANKLIN, TN" in Anton/Impact, 12px, white, letter-spacing 2px, with `border-bottom: 1.5px solid rgba(255,255,255,0.4)` and padding-bottom 6px
- Below eyebrow: a pill-shaped badge reading "EXIT 65 · I-65"
  - Border: `1.5px solid rgba(255,255,255,0.6)`
  - Border-radius: 20px
  - Padding: 3px 10px
  - Font-family: Impact/sans-serif
  - Font-size: 9px
  - Letter-spacing: 1.5px
  - Display inline-block, margin-top 8px

**Middle section:**
- Small eyebrow text "OUR PROMISE" — Impact, 10px, color `#F5C842`, letter-spacing 2px
- Big headline directly below: "FLAT FEE.\nFAST CODE.\nNO BS."
  - Font-family: Anton, Impact, Arial Black, sans-serif
  - Font-size: ~38px (responsive — scale to container)
  - Line-height: 0.85
  - Color: white
  - Margin-top: 4px
  - Three lines, hard break after each period

**Bottom section:**
- `border-top: 1px solid rgba(255,255,255,0.4)`
- Padding-top: 8px
- Two columns, justify-content space-between
- Both in Impact, 9px, white, letter-spacing 1.5px
- Left: "ESTABLISHED 2025"
- Right: "VILLA RICA · FRANKLIN"

**Acceptance:**
- Hero right column shows a coral tilted poster, not an empty browser frame
- Visual reads "FLAT FEE. FAST CODE. NO BS." as the dominant message
- "EXIT 65 · I-65" badge present in top section
- "VILLA RICA · FRANKLIN" footer present
- Poster matches the rotated/shadowed style of the ZERO WASTED SPEND poster on the main homepage

---

## Section 2.2 — Williamson County service area section

**Where:** Dark section currently titled "SERVING THE FULL FRANKLIN & WILLIAMSON COUNTY MARKET." Contains a small editorial map drawing on the right and two columns of text (Neighborhoods / Verticals) on the left.

**Goal:** Make the map bigger and more visually dominant. Convert the neighborhoods text list into actual pins on the map (the map IS the list). Convert the verticals text list into chip tags below the map. Tighten the section into a confident "we cover this whole market" statement.

### New layout

Two-column grid, but flip the proportions: left column ~40%, right column ~60% (map gets more space).

**Left column (content):**
- Eyebrow: "— SERVICE AREA —" (Impact, 12px, color `#F5C842`, letter-spacing 2px)
- Headline (replaces current "SERVING THE FULL FRANKLIN & WILLIAMSON COUNTY MARKET."): 
  - **"YOUR NEIGHBORHOOD. WE'RE THERE."**
  - Anton/Impact, ~30px, line-height 0.9, white
- Body paragraph (keep current copy, tightened):
  > "From Cool Springs storefronts to Westhaven boutiques, from Berry Farms home services to Downtown Franklin professional firms — we work with businesses across every Franklin neighborhood."
- Script accent below body: "strategy calls in person or remote —" (Brush Script MT, 18px, color `#F5C842`, transform `rotate(-3deg)`, display inline-block, font-weight 700)

**Right column (map):**
- Container: background `#1a1a2a`, border `2px solid #F5C842`, padding 22px, aspect-ratio `4 / 3`
- Top-left corner label: "WILLIAMSON CO · TN" (Impact, 9px, `#F5C842`, letter-spacing 1.5px)
- Inside the container, render a stylized SVG map (NOT a Google Maps embed — too much visual noise). Use:
  - A simple county outline path with `stroke: #F2EBDA`, `stroke-width: 1.2`, `stroke-dasharray: 4,3`, `fill: none`, opacity 0.4
  - Two thin reference lines (horizontal + vertical), `stroke: #F2EBDA`, `stroke-width: 0.6`, opacity 0.4
- Pins overlaid on the map (absolute-positioned at approximate locations):
  - **FRANKLIN (hero pin)** — coral circle, 14px diameter, background `#DD5A2E`, border `2px solid #F5C842`. Label below: "FRANKLIN" in Impact, 9px, `#F2EBDA`
  - **All other neighborhood pins** — yellow circles, 10px diameter, background `#F5C842`, no border. Labels in Impact, 8px, color `#d4ccb8`:
    - BRENTWOOD
    - WESTHAVEN
    - BERRY FARMS
    - SPRING HILL
    - COOL SPRINGS
    - MCKAY'S MILL
    - FIELDSTONE FARMS
    - LEIPER'S FORK
  - Position pins to look like they're scattered across the county (not in a grid). Franklin should be roughly center.

**Below the two-column grid (full width inside the dark section):**
- Divider line: `border-top: 1px solid rgba(245,200,66,0.3)`, padding-top 18px, margin-top 22px
- Small label: "WHO WE WORK WITH IN WILLIAMSON CO" (Impact, 10px, color `#F5C842`, letter-spacing 2px, margin-bottom 10px)
- Chip row: flex-wrap with 6px gap. Each chip:
  - Background: `rgba(245,200,66,0.15)`
  - Color: `#F5C842`
  - Padding: 4px 10px
  - Font-family: Impact/sans-serif
  - Font-size: 10px
  - Letter-spacing: 1px
  - Border: `1px solid #F5C842`
- Chip contents (one per chip): HEALTHCARE · BOUTIQUE RETAIL · RESTAURANTS · HOME SERVICES · LAW + FINANCIAL · COUNTRY MUSIC · WEALTH MGMT

### Things to DELETE from this section

- The current "NEIGHBORHOODS" two-column list with coral diamond bullets — neighborhoods are now pins on the map, no longer a separate text list
- The current "VERTICALS" two-column list — verticals are now chip tags below

**Acceptance:**
- Section headline reads "YOUR NEIGHBORHOOD. WE'RE THERE."
- Map is visually dominant (bigger than current implementation, takes ~60% of horizontal space)
- Franklin pin is coral, all other neighborhood pins are yellow
- Neighborhood names appear ONLY as map labels (no separate text list above or below)
- Verticals appear as chip-style tags below the map, not as a bulleted text list
- "strategy calls in person or remote —" script accent appears in the left column

---

## Section 2.3 — How We Work / Process

**Where:** Dark section titled "HOW WE WORK." Currently shows 5 equal-weight cards in a horizontal row, each with a small number circle and dense text.

**Goal:** Convert the grid of 5 cards into a horizontal timeline with a connecting line. Step 3 (Build) becomes the visual focal point. Week labels are moved above each step and made more prominent. The connecting line is the single visual element that turns five separate cards into one continuous story.

### Component spec — Process Timeline

**Section header (no change to copy, slight reformat):**
- Two-column flex, baseline aligned
- Left: eyebrow "— OUR PROCESS —" + headline "HOW WE WORK."
- Right: script accent "— five steps" (Brush Script MT, 18px, color `#F5C842`, transform `rotate(-3deg)`)

**Timeline container:**
- Position: relative
- Padding: 20px 0

**Connecting line (the key element):**
- Absolute positioned horizontal element
- Top: 50%
- Left: 5%, right: 5%
- Height: 2px
- Background: `linear-gradient(90deg, #F5C842, #DD5A2E, #F5C842)`
- Margin-top: -1px (to center on the row)

**Steps grid (above the line):**
- `display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;`
- `position: relative; z-index: 2;` (above the line)

**Each step (except step 3) — standard treatment:**
- `text-align: center`
- Week label above circle: small text (Impact, 9px, color `#F5C842`, letter-spacing 1.5px, margin-bottom 6px) — examples: "WEEK 1" / "WEEKS 2–3" / "WEEKS 5–6" / "MONTHS 2–3"
- Number circle:
  - Width/height: 48px
  - Background: `#F5C842`
  - Color: `#0a0a0a`
  - Border: `3px solid #0e0e0e` (matches section background, creates "cut-out" effect over the line)
  - Border-radius: 50%
  - Display: flex centered
  - Font-family: Anton, Impact, Arial Black
  - Font-size: 20px
  - Position: relative; z-index: 2 (above connecting line)
- Step title below circle (Anton/Impact, 13px, color `#F2EBDA`, margin-top 10px): DISCOVERY. / DESIGN. / LAUNCH. / OPTIMIZE.
- Description below title:
  - Font-size: 10px
  - Color: `#a0998a`
  - Line-height: 1.45
  - Margin-top: 6px

**Step 3 (BUILD) — featured treatment:**
Same as standard EXCEPT:
- Circle is bigger: width/height 56px (instead of 48px)
- Background: `#DD5A2E` (coral, not yellow)
- Color: `#fff` (not black)
- Font-size: 22px (instead of 20px)
- ADD outer ring: `box-shadow: 0 0 0 3px #F5C842` (yellow halo around the coral circle)
- Week label above: "WEEKS 3–5"
- Step title: "BUILD."
- Description text:
  > "Clean code, weekly Lighthouse reviews, real device testing. Live URL on day 1."

### Step content (week labels + titles + descriptions)

Keep all current copy for step descriptions. Just restructure to add the week label ABOVE the circle:

| Step | Week label | Title | Description (keep current copy) |
|---|---|---|---|
| 1 | WEEK 1 | DISCOVERY. | 60-min strategy call. You answer 12 questions about your business, your customers, and your goals. We send back a one-page strategy brief defining deliverables and what success looks like. |
| 2 | WEEKS 2–3 | DESIGN. | Wireframes first, then high-fidelity Figma designs for every page. We do one big design review with you in week 3 — not a death-by-Slack revision loop. |
| 3 | WEEKS 3–5 | BUILD. | Clean code on WordPress or Webflow. Lighthouse score reviewed weekly. Real device testing on iPhone and Pixel. You see a staging URL on day one and can review progress anytime. |
| 4 | WEEKS 5–6 | LAUNCH. | DNS handover, SSL, GA4 + GSC + Tag Manager setup, sitemap submission, schema validation. We don't ghost on launch day — we're on Slack with you for the full week. |
| 5 | MONTHS 2–3 | OPTIMIZE. | We watch the site in the wild. Real user data (Microsoft Clarity heat maps + GA4). Two rounds of small conversion-rate-optimization tweaks at days 30 and 60. |

### Things to DELETE from this section

- The current 5 equal-weight rectangular card containers
- The small inline "Week X" coral pill tags inside each current card (replaced by the prominent week labels above each circle)

**Acceptance:**
- Visible horizontal yellow/coral gradient line runs across the section, threading through all five number circles
- Steps 1, 2, 4, 5 use yellow circles. Step 3 uses a larger coral circle with a yellow ring around it.
- Week labels appear ABOVE each number circle, not inside the card
- No card backgrounds/borders — just circles + text aligned along the line
- "— five steps" script accent appears in section header

---

# PHASE 3 — Copy fixes (Services grid)

The "WHAT WE DO" section (6 numbered service cards in 3×2 dark grid) is structurally fine. The copy contains technical jargon that doesn't match the audience.

## Copy diffs for Services section

### Card 01 — LANDING PAGES.

Capability bullets:
| OLD | NEW |
|---|---|
| LIGHTHOUSE 95+ MOBILE SCORE | FAST MOBILE PERFORMANCE |
| INTEGRATED CALL TRACKING | Keep ✓ |
| HUBSPOT & CRM CONNECTIONS | CRM AND HUBSPOT INTEGRATIONS |

### Card 02 — BRAND WEBSITES.

Capability bullets:
| OLD | NEW |
|---|---|
| ZERO OFF-THE-SHELF TEMPLATES | CUSTOM DESIGN, NO TEMPLATES |
| FULLY CUSTOM WEBFLOW OR WORDPRESS | Keep ✓ |
| BUILT-IN LOCAL SCHEMA TAGS | LOCAL SEO MARKUP |

### Card 03 — E-COMMERCE STORES.

Capability bullets:
| OLD | NEW |
|---|---|
| FRICTIONLESS CHECKOUT PATHS | Keep ✓ |
| AUTOMATED EMAIL SEQUENCES | Keep ✓ |
| REAL-TIME INVENTORY SYNC | Keep ✓ |

(This one's fine.)

### Card 04 — LOCAL SEO SETUP.

Description body:
| OLD | NEW |
|---|---|
| "Neighborhood service area page mapping, citations audit, and deep Google Business Profile optimizations to place you on the Map Pack." | "Neighborhood service-area pages, citation audits, and deep Google Business Profile optimization. The goal: show up in the Map Pack when someone in Franklin searches for what you do." |

Capability bullets:
| OLD | NEW |
|---|---|
| MAP PACK RANKING TARGETS | MAP PACK RANKINGS |
| LOCATION PAGE BUILDERS | NEIGHBORHOOD PAGE BUILD-OUT |
| REVIEW GENERATION HOOKS | REVIEW GENERATION SYSTEM |

### Card 05 — FAST EDGE HOSTING.

Description body:
| OLD | NEW |
|---|---|
| "Ditch the sluggish servers. We host on Next.js/Vercel global CDNs with zero maintenance overhead, automated backups, and 99.9% uptime." | "Ditch the sluggish servers. We host on global content delivery networks with zero maintenance overhead, automated backups, and 99.9% uptime." |

Capability bullets:
| OLD | NEW |
|---|---|
| GLOBAL VERCEL/NEXT CDNS | GLOBAL CDN HOSTING |
| UPTIME MONITOR ALARMS | UPTIME MONITORING |
| SSL & CLOUD BACKUP ASSETS | SSL + AUTOMATED BACKUPS |

### Card 06 — SPEED AUDITS.

Description body:
| OLD | NEW |
|---|---|
| "Identify page load speed leakage and technical blockers. We rewrite code blocks and compress payloads to guarantee sub-1.5s mobile paint times." | "Identify page-load slowdowns and technical blockers. We rewrite code and compress assets to guarantee sub-1.5-second mobile load times." |

Capability bullets:
| OLD | NEW |
|---|---|
| LCP SPEED OPTIMIZATION | PAGE LOAD OPTIMIZATION |
| IMAGE PAYLOAD REDUCTION | IMAGE COMPRESSION |
| CORE WEB VITALS VALIDATION | GOOGLE SPEED METRICS VALIDATION |

## Why these changes

Audience for this page is Franklin, TN small-business owners — accountants, lawyers, restaurant owners, retailers. They don't know what:
- Next.js is
- Vercel is
- LCP is
- A Lighthouse score is
- Core Web Vitals are
- Schema tags / CDNs / payloads are

Plain-English replacements convey the same capability without confusing prospects or making them feel out-of-depth before they even contact you.

**Acceptance:** No instances of "Next.js," "Vercel," "Lighthouse," "LCP," or "Core Web Vitals" anywhere in the Services section. All bullet copy reads as something a non-technical small-business owner would understand on first read.

---

# PHASE 4 — Optional polish (low priority)

These are nice-to-haves. Ship Phases 1–3 first.

## 4.1 — Our Guarantee section icons

**Where:** "THINGS WE WANT YOU TO KNOW UPFRONT" section. Currently 4 bullets with coral diamond markers and a faint shield watermark in the background.

**Optional upgrade:** Replace each diamond bullet with a small custom icon that visualizes the guarantee:
- Bullet 1 ("You own the site...") → key icon
- Bullet 2 ("Flat fee. No surprises...") → price-tag icon
- Bullet 3 ("If you're not happy with the design...") → reverse-arrow / pivot icon
- Bullet 4 ("We say no a lot...") → stop-hand icon

Use Tabler icons (outline style) or matching custom SVGs. Color them `#DD5A2E` to maintain coral accent consistency.

Skip if it pushes the timeline. Current diamonds are fine.

---

# Verification checklist

Print this and check items as the build progresses.

## Phase 1 — Critical bugs

- [ ] Hero right column no longer shows empty black rectangle
- [ ] Day Accounting testimonial slide shows actual Day Accounting website (not McKinley Roofing)
- [ ] Horizon Real Estate slide removed from carousel
- [ ] Carousel total count reads "X / 03" not "X / 04"
- [ ] Three carousel slide indicators visible: HARMONIC / COMMERCIAL INSURANCE / DAY ACCOUNTING

## Phase 2 — Section redesigns

### Hero poster (2.1)
- [ ] Coral tilted brand poster appears in hero right column
- [ ] "FLAT FEE. FAST CODE. NO BS." reads as the dominant headline
- [ ] "EXIT 65 · I-65" badge visible in top
- [ ] "VILLA RICA · FRANKLIN" footer visible in bottom
- [ ] Hard drop shadow (no blur)
- [ ] Tilted ~-3deg

### Williamson County (2.2)
- [ ] Map takes ~60% of horizontal space in the section
- [ ] Franklin pin is coral, all other pins are yellow
- [ ] Neighborhood names appear only as pin labels (no separate text list)
- [ ] Verticals appear as chip tags below the map
- [ ] Headline reads "YOUR NEIGHBORHOOD. WE'RE THERE."
- [ ] Script accent "strategy calls in person or remote —" appears

### Process timeline (2.3)
- [ ] Horizontal gradient line visible, threading through all five step circles
- [ ] Step 3 (BUILD) circle is larger and coral-colored with yellow ring
- [ ] All other circles are yellow
- [ ] Week labels appear ABOVE each circle (not inside cards)
- [ ] No card backgrounds — just circles + text on the line
- [ ] "— five steps" script accent in section header

## Phase 3 — Copy

- [ ] Zero instances of "Next.js" in Services section
- [ ] Zero instances of "Vercel," "Lighthouse," "LCP," "Core Web Vitals" in client-facing copy
- [ ] All Services bullets readable by a non-technical small-business owner

---

# Reference assets

Existing assets in workspace that should be used:

```
Creative Cowboys/Franklin TN Landing Pages/Client Portfolio/
  - Harmonic - Desktop Hero.png
  - John B Jackson Law - Desktop Hero.png
  - McKinley Roofing - Desktop Hero.png
  - Squirrel Made Products - Desktop Hero.png
  - LEUCO Tools - Desktop Hero.png
```

Missing assets that need to be captured/created:
- Day Accounting website screenshot (`dayacct.com` hero) — for Bug 1.2 fix
- Commercial Insurance Agency website screenshot — for the Slide 2 testimonial (lower priority, current screenshot may be OK)

---

# Notes on what NOT to change

These sections are working — don't touch them:

- Hero headline ("FRANKLIN WEB DESIGN THAT PAYS FOR ITSELF.")
- Stats strip (1.4s / 100+ / $2M+)
- Service marquee (NO SALES CALLS / WILLIAMSON COUNTY / etc.)
- Recent Clients / Southeast Portfolio strip (the 5 horizontal client cards)
- Case Studies section (3 stacked cards — same as homepage)
- Pricing Tiers (Starter / Growth / Scale)
- "HOW WE PRICE OUR PROJECTS" dark band
- FAQ structure (2-column index + answer panel)
- Footer

---

*End of guide. Antigravity: when in doubt, prefer the simpler implementation. Match existing brand styling. Ask if a spec is ambiguous.*
