// Ported verbatim from creativecowboys/local-seo-engine onboarding-chat/src/lib/packages.ts (Sep 25 2026) so the
// Sales tab can build the same monthly plan. Keep both copies in sync with the Monday "Packages & Pricing" board.
/**
 * Creative Cowboys monthly service catalog — the standardized price list (Sept 2026).
 * Source of truth is the Monday "Packages & Pricing" board; keep this in sync with it.
 * Monthly items only. One-time items (the $497 website build, the $997 strategy meeting)
 * cannot live here: this feeds a GHL *recurring* invoice, so any line added would bill
 * again every month. Those get their own one-off invoice.
 * Note the website is no longer free with a monthly plan (changed Sept 21 2026). The
 * build is a separate one-time charge and its $30/mo hosting is required, so
 * website-hosting below is expected on any client who has a site with us.
 */

export type Tier = { key: string; label: string; amount: number };

export type CatalogItem = {
  key: string;
  name: string;            // line-item name on the invoice
  blurb: string;           // one plain sentence for the rep
  group: "plan" | "ads" | "addon";
  amount?: number;         // flat monthly price
  tiers?: Tier[];          // pick one (ads)
  custom?: boolean;        // rep types the amount
  requires?: string[];     // only valid alongside one of these keys
  conflictsWith?: string[]; // cannot be combined with any of these keys
  promo?: { label: string; amount: number; months: number; note: string }; // first-year rate
};

export const CATALOG: CatalogItem[] = [
  {
    key: "local-growth",
    name: "Local Growth",
    blurb: "Found on Google Maps for your service and city, reviews handled, monthly report.",
    group: "plan",
    amount: 497,
    promo: {
      label: "First-year rate (12-month agreement)",
      amount: 297,
      months: 12,
      note: "Local Growth bills at $297/mo for the first 12 months, then $497/mo.",
    },
  },
  {
    key: "max-growth",
    name: "Max Growth",
    blurb: "Everything in Local Growth, turned up: more searches, more pages, a bigger monthly push.",
    group: "plan",
    amount: 1497,
  },
  {
    key: "google-ads",
    name: "Google Ads",
    blurb: "Top of Google when someone's ready to hire. One flat price, ad spend included.",
    group: "ads",
    tiers: [
      { key: "500", label: "$500/mo", amount: 500 },
      { key: "1000", label: "$1,000/mo", amount: 1000 },
      { key: "1500", label: "$1,500/mo", amount: 1500 },
    ],
  },
  {
    key: "social-ads",
    name: "Social Ads",
    blurb: "Reviews and job photos turned into Facebook and Instagram ads. Ad spend included.",
    group: "ads",
    tiers: [
      { key: "300", label: "$300/mo", amount: 300 },
      { key: "600", label: "$600/mo", amount: 600 },
      { key: "1200", label: "$1,200/mo", amount: 1200 },
    ],
  },
  {
    key: "crm",
    name: "CRM",
    blurb: "Every call, form, and message in one place, with automatic follow-ups. Includes AI website chat.",
    group: "addon",
    amount: 97,
  },
  {
    key: "ai-chat",
    name: "AI Chat only",
    blurb: "Just the website chat, without the CRM. Answers after hours and catches the lead.",
    group: "addon",
    amount: 47,
  },
  {
    key: "expanded-reach",
    name: "Expanded Reach",
    blurb: "Get found in five more towns. Local Growth only.",
    group: "addon",
    amount: 200,
    requires: ["local-growth"],
  },
  {
    key: "ai-seo",
    name: "AI SEO",
    blurb: "Show up in ChatGPT, Perplexity and Google AI answers. Rides on an SEO plan.",
    group: "addon",
    amount: 97,
    requires: ["local-growth", "max-growth"],
  },
  {
    // Same work as ai-seo, priced for a client with no SEO plan underneath it.
    // Blocked against the plans so a rep can't bill $297 to someone entitled to $97.
    key: "ai-seo-standalone",
    name: "AI SEO (standalone)",
    blurb: "The same AI visibility work for a client who isn't on an SEO plan.",
    group: "addon",
    amount: 297,
    conflictsWith: ["local-growth", "max-growth", "ai-seo"],
  },
  {
    key: "website-hosting",
    name: "Website Hosting & Support",
    blurb: "Hosting, support and minor updates. Required with every website build.",
    group: "addon",
    amount: 30,
  },
];

export type Selection = {
  key: string;
  tier?: string;        // tier key for ads
  amount?: number;      // custom amount (ai-seo / custom line)
  promo?: boolean;      // use first-year rate
  name?: string;        // custom line name
};

export type Line = { name: string; description: string; amount: number; promoNote?: string };

/** Turn a selection list into invoice lines. Throws on invalid combinations. */
export function buildLines(selections: Selection[]): Line[] {
  const keys = new Set(selections.map((s) => s.key));
  const lines: Line[] = [];
  for (const s of selections) {
    if (s.key === "custom") {
      const amt = Number(s.amount);
      if (!s.name?.trim() || !Number.isFinite(amt) || amt <= 0) throw new Error("Custom line needs a name and a monthly amount.");
      lines.push({ name: s.name.trim(), description: "Custom monthly item", amount: Math.round(amt * 100) / 100 });
      continue;
    }
    const item = CATALOG.find((c) => c.key === s.key);
    if (!item) throw new Error(`Unknown item ${s.key}`);
    if (item.requires && !item.requires.some((r) => keys.has(r))) {
      const names = item.requires.map((r) => CATALOG.find((c) => c.key === r)?.name).filter(Boolean);
      throw new Error(`${item.name} requires ${names.join(" or ")}.`);
    }
    const clash = item.conflictsWith?.find((c) => keys.has(c));
    if (clash) throw new Error(`${item.name} can't be combined with ${CATALOG.find((c) => c.key === clash)?.name}.`);
    if (item.tiers) {
      const t = item.tiers.find((x) => x.key === s.tier);
      if (!t) throw new Error(`Pick a tier for ${item.name}.`);
      lines.push({ name: `${item.name} · ${t.label}`, description: "Management fee and ad spend, one flat monthly price", amount: t.amount });
    } else if (item.custom) {
      const amt = Number(s.amount);
      if (!Number.isFinite(amt) || amt <= 0) throw new Error(`Enter a monthly amount for ${item.name}.`);
      lines.push({ name: item.name, description: item.blurb, amount: Math.round(amt * 100) / 100 });
    } else if (item.promo && s.promo) {
      lines.push({ name: `${item.name} — first year`, description: `${item.promo.label}. Regular rate $${item.amount}/mo after month ${item.promo.months}.`, amount: item.promo.amount, promoNote: item.promo.note });
    } else {
      lines.push({ name: item.name, description: item.blurb, amount: item.amount! });
    }
  }
  if (!lines.length) throw new Error("Pick at least one item.");
  const plans = selections.filter((s) => CATALOG.find((c) => c.key === s.key)?.group === "plan");
  if (plans.length > 1) throw new Error("Pick one plan: Local Growth or Max Growth.");
  return lines;
}

export const monthlyTotal = (lines: Line[]) => Math.round(lines.reduce((a, l) => a + l.amount, 0) * 100) / 100;
