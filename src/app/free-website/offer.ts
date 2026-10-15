/**
 * The free-website program as the claim page sells it (Josh & Dave, Oct 15 2026; spec: the "Free
 * Website Program" page). Monthly prices come from the package catalog so the claim page, the Sales
 * tab and the desk can never disagree; the one-time items and the credit allowances live here.
 *
 * Pure and client-safe: no node imports, so ClaimBuilder can use it in the browser.
 */

import { CATALOG } from "@/lib/packages/catalog";

/** How many builds we take a month: the number we can actually sign off and launch inside two weeks. */
export const SLOTS = 10;

export const PHONE_DISPLAY = "(470) 243-7517";
export const PHONE_HREF = "tel:4702437517";

function price(key: string): number {
    const item = CATALOG.find((c) => c.key === key);
    if (!item?.amount) throw new Error(`Catalog item ${key} has no flat price`);
    return item.amount;
}

export type PlanKey = "basic" | "pro";

export type Plan = {
    key: PlanKey;
    catalogKey: string;
    name: string;
    monthly: number;
    credits: number;
    tagline: string;
    includes: string[];
    /** Add-on keys that Pro already includes; the builder shows them ticked and greys them out. */
    bundled: AddonKey[];
};

export type AddonKey = "ai-chat" | "custom-domain" | "lead-text-alerts" | "online-booking" | "ai-seo";

export type Addon = {
    key: AddonKey;
    name: string;
    monthly: number;
    /** The one line next to the checkbox; outcome first. */
    pitch: string;
    /** Shown only when the box is on, so the page stays short. */
    detail?: string;
};

export type OneTime = { key: "gbp-optimization"; name: string; amount: number; pitch: string; detail: string };

export const PLANS: Plan[] = [
    {
        key: "basic",
        catalogKey: "website-hosting",
        name: "Hosting & Support",
        monthly: price("website-hosting"),
        credits: 10,
        tagline: "Everything your site needs to stay up, fast and secure.",
        includes: [
            "Hosting, SSL and security, handled",
            "On-demand web updates: 10 credits a month",
            "Contact forms wired to your phone and inbox",
            "Support when something breaks",
        ],
        bundled: [],
    },
    {
        key: "pro",
        catalogKey: "website-pro",
        name: "Website Pro",
        monthly: price("website-pro"),
        credits: 50,
        tagline: "For businesses that want the site working harder every month.",
        includes: [
            "Everything in Hosting & Support",
            "Advanced on-demand web updates: 50 credits a month",
            "AI chat that answers visitors 24/7 and texts you the lead",
            "Text alerts for every form lead",
            "Custom domain included",
            "Priority team requests, answered within 48 hours",
            "Monthly performance report",
        ],
        bundled: ["ai-chat", "lead-text-alerts", "custom-domain"],
    },
];

export const ADDONS: Addon[] = [
    {
        key: "ai-chat",
        name: "AI Chat",
        monthly: price("ai-chat"),
        pitch: "Answers your website visitors 24/7 and texts you the lead.",
        detail: "Trained on your business. 250 conversations a month included.",
    },
    {
        key: "lead-text-alerts",
        name: "Lead Text Alerts",
        monthly: price("lead-text-alerts"),
        pitch: "A text the moment someone fills out a form on your site.",
    },
    {
        key: "custom-domain",
        name: "Custom Domain",
        monthly: price("custom-domain"),
        pitch: "Don't have a domain? We'll find one you like and register it for you.",
        detail: "You pick it during onboarding. The domain is yours.",
    },
    {
        key: "online-booking",
        name: "Online Booking",
        monthly: price("online-booking"),
        pitch: "Customers book a time straight from your website.",
    },
    {
        key: "ai-seo",
        name: "AI SEO",
        monthly: price("ai-seo"),
        pitch: "Show up when someone asks ChatGPT or Google AI who to call.",
        detail: "We structure your site so AI tools can read it, track the questions people ask about your trade, and add an answer every month.",
    },
];

export const ONE_TIME: OneTime[] = [
    {
        key: "gbp-optimization",
        name: "Google Business Profile Optimization",
        amount: 97,
        pitch: "Your Google listing filled out the way Google wants it.",
        detail: "One-time. Needs a Google Business Profile that's already verified.",
    },
];

/** The platform rule, the refund rule and the 2-week line, as shown above the claim button and in the fine print. */
export const TERMS_LINE =
    "Your site is hosted on the Creative Cowboys platform and stays with us. Moving it to another host is a paid service. Your domain and your content are always yours.";

export const MOVE_OFF_FEE = 297;

/** Wix and Squarespace list prices on annual billing, checked Oct 15 2026. Re-check before each campaign. */
export const COMPETITORS = [
    { name: "Wix", low: 19, high: 39, note: "Light to Business plans" },
    { name: "Squarespace", low: 16, high: 39, note: "Basic to Plus plans" },
];

export type Selection = { plan: PlanKey; addons: AddonKey[]; oneTime: OneTime["key"][] };

export type Totals = { monthly: number; oneTime: number; today: number; lines: { name: string; amount: number; monthly: boolean }[] };

/** What the client pays today (first month plus one-time items) and every month after. */
export function totals(sel: Selection): Totals {
    const plan = PLANS.find((p) => p.key === sel.plan)!;
    const lines: Totals["lines"] = [{ name: plan.name, amount: plan.monthly, monthly: true }];
    for (const a of ADDONS) {
        if (!sel.addons.includes(a.key) || plan.bundled.includes(a.key)) continue;
        lines.push({ name: a.name, amount: a.monthly, monthly: true });
    }
    for (const o of ONE_TIME) {
        if (!sel.oneTime.includes(o.key)) continue;
        lines.push({ name: o.name, amount: o.amount, monthly: false });
    }
    const monthly = lines.filter((l) => l.monthly).reduce((s, l) => s + l.amount, 0);
    const oneTime = lines.filter((l) => !l.monthly).reduce((s, l) => s + l.amount, 0);
    return { monthly, oneTime, today: monthly + oneTime, lines };
}

/**
 * Where "Claim my website" goes. The GoHighLevel order form for the chosen plan, when its URL is
 * configured (NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_BASIC / _PRO), with the selection and any ad
 * parameters carried along as query parameters so the form can prefill them. Null until the
 * forms exist: the builder then shows the claim form and we send the checkout link by hand.
 */
export function checkoutUrl(sel: Selection, search: string): string | null {
    const base = sel.plan === "pro"
        ? process.env.NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO
        : process.env.NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_BASIC;
    if (!base?.trim()) return null;
    let url: URL;
    try { url = new URL(base.trim()); } catch { return null; }
    url.searchParams.set("plan", sel.plan);
    if (sel.addons.length) url.searchParams.set("addons", sel.addons.join(","));
    if (sel.oneTime.length) url.searchParams.set("one_time", sel.oneTime.join(","));
    try {
        for (const [k, v] of new URLSearchParams(search)) {
            if (/^utm_|^(fbclid|gclid|ttclid|msclkid|ad|adset|campaign)$/i.test(k)) url.searchParams.set(k, v);
        }
    } catch { /* a malformed query string is not a reason to lose the checkout link */ }
    return url.toString();
}

/** One line a rep can read: "Website Pro + Online Booking + GBP Optimization (one-time) · $185 today, then $88/mo". */
export function summarize(sel: Selection): string {
    const t = totals(sel);
    const names = t.lines.map((l) => (l.monthly ? l.name : `${l.name} (one-time)`)).join(" + ");
    return `${names} · $${t.today} today, then $${t.monthly}/mo`;
}
