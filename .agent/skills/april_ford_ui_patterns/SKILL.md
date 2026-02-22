---
name: April Ford UI Patterns
description: Reusable UI patterns extracted from the April Ford agency site (aprilford.com). Includes bordered icon grid, logo marquee ticker, case study hero cards, and mega-menu with inline form.
---

# April Ford UI Patterns

Reference patterns extracted from the April Ford Webflow site. Adapt these to the Cowboys brand (orange `#F15F2A`, peach bg `#f0ddd4`/`#fce8d5`, dark text `#1a1514`).

---

## Pattern 1: Bordered Icon Grid ("Specialise, Don't Generalise")

**What it is:** A multi-column borderless grid where each cell has a dashed/solid border, a Material Symbol icon, a bold uppercase title, and a short description. Clean, editorial, no shadow.

**Design rules:**
- Each cell: `padding: 24px`, `border: 1px solid rgba(0,0,0,0.10)`, no border-radius
- Icon: 24px Material Symbol or Lucide icon above the title
- Title: `font-weight: 700`, `font-size: 15-16px`, uppercase or title case
- Description: `font-size: 13px`, muted `opacity: 0.6`
- Hover: subtle background shift (e.g. `background: rgba(241,95,42,0.04)`)
- Grid: `repeat(3, 1fr)` desktop, `repeat(2, 1fr)` tablet, `1fr` mobile
- No card shadow — border does all the visual work

**Cowboys adaptation — TSX:**
```tsx
// Bordered grid section (light peach bg)
<section style={{ background: "linear-gradient(180deg, #fce8d5 0%, #f0ddd4 100%)", padding: "96px 24px" }}>
  <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F15F2A" }}>
      What We Offer
    </span>
    <h2 style={{ fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 800, color: "#1a1514", letterSpacing: "-0.03em", margin: "16px 0 48px" }}>
      Everything you need,<br />nothing you don't.
    </h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
      {items.map(({ Icon, title, desc }) => (
        <div key={title} className="af-grid-cell" style={{
          padding: "28px 24px",
          border: "1px solid rgba(26,21,20,0.10)",
          cursor: "default",
        }}>
          <Icon size={22} color="#F15F2A" strokeWidth={1.5} style={{ marginBottom: "14px" }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1514", margin: "0 0 8px" }}>{title}</h3>
          <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(26,21,20,0.55)", margin: 0 }}>{desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**CSS hover:**
```css
.af-grid-cell {
  transition: background 200ms ease;
}
.af-grid-cell:hover {
  background: rgba(241, 95, 42, 0.04);
}
```

---

## Pattern 2: Logo Marquee Ticker ("In Good Company")

**What it is:** Three rows of client logos scrolling in a continuous infinite loop — two rows scroll left, one scrolls right. Duplicated lists create the seamless loop effect.

**Design rules:**
- Outer: `overflow: hidden`, full width
- Each track: `display: flex`, `gap: 48px`, `animation: marquee-left/right 40s linear infinite`
- Logos: `height: 28-36px`, `opacity: 0.55`, `filter: grayscale(100%)` (or `brightness(0)`)
- On hover: `animation-play-state: paused`  
- Two duplicate `.w-dyn-list` blocks inside each track = seamless loop

**Cowboys adaptation — TSX:**
```tsx
"use client";
import { useRef } from "react";

const LOGOS = [
  { src: "/logos/client-a.svg", alt: "Client A" },
  // ... more logos
];

export function LogoMarquee() {
  return (
    <section style={{ background: "linear-gradient(180deg, #fce8d5 0%, #f0ddd4 100%)", padding: "64px 0", overflow: "hidden" }}>
      <p style={{ textAlign:"center", fontSize:"11px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(26,21,20,0.35)", marginBottom:"32px" }}>
        Trusted by
      </p>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 48px;
          width: max-content;
          animation: marquee-left 35s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div style={{ display: "flex", gap: "48px" }} className="marquee-track">
        {[...LOGOS, ...LOGOS].map((l, i) => (
          <img key={i} src={l.src} alt={l.alt} style={{ height: "28px", opacity: 0.5, filter: "brightness(0)", flexShrink: 0 }} />
        ))}
      </div>
    </section>
  );
}
```

---

## Pattern 3: Case Study Full-Width Editorial Cards

**What it is:** Large full-bleed image cards stacked or side-by-side, with an animated headline that boldens on hover (variable font weight). Used in the "results that speak for themselves" section.

**Design rules:**
- Card: full container width or 1/3 width in a row, `aspect-ratio: 4/3` or `16/9`
- Image: `object-fit: cover`, full bleed
- Heading: positioned below the image (or overlay), `font-variation-settings: "wght" 700 "ital" 0`
- Hover: heading transitions to `"wght" 800, "ital" 10` — requires a variable font
- Visual effect: parallax scroll on image (optional)

**Cowboys adaptation notes:**
- Use `font-variation-settings` if geist or a variable font is loaded
- Great for a "Our Work" or "Case Studies" section
- On the Cowboys peach bg: card borders `1px solid rgba(26,21,20,0.09)`, `border-radius: 20px`
- Swap italic heading trick for a simple `transform: translateY(-4px)` lift on hover

---

## Pattern 4: Mega Menu with Inline Proposal Form

**What it is:** A fullscreen dropdown mega-menu with two panes — left: a dynamic list of services/specialisations; right: a mini contact form for requesting a proposal directly from the nav.

**Design rules:**
- Two-column layout: `grid-template-columns: 1fr 360px`
- Left: scrollable list of linked items with icon + title + description
- Right: form inputs full-width with submit button
- Far right: CTA box with headline and "Contact" button (third pane)

**Cowboys adaptation notes:**
- Could be used in FloatingNav as a mega-dropdown when "Services" is hovered
- Right pane would be the Cowboys contact form fields (name, business, email, message)
- Style left pane items with orange icon, dark title, muted desc — matches existing pattern
- Only worth implementing if navigation complexity grows

---

## Source Site
- **URL:** https://www.aprilford.com
- **Framework:** Webflow
- **Key CSS classes to reference:** `.collection-list-2.is--homepage`, `.marquee_track`, `.section-2.is--hero`, `.megamenu`
- **Fonts used:** Gilmer (custom), Material Symbols Rounded (Google)

## Cowboys Brand Mappings
| April Ford token | Cowboys equivalent |
|---|---|
| `blue` (#1a6ee5) | `#F15F2A` (orange) |
| White/light grey bg | `linear-gradient(180deg, #fce8d5 0%, #f0ddd4 100%)` |
| `trueblack` (#000) | `#1a1514` |
| `_60-opacity` | `rgba(26,21,20,0.55)` |
| Material Symbols icons | Lucide React icons |
