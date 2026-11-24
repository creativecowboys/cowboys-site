/**
 * The offer every city landing page leads with (Josh, Nov 18 2026).
 *
 * One place for the numbers, so a price change is one edit and no page can
 * quote something different. Josh, Nov 18 2026: $297/month, month to month,
 * no contracts. (src/lib/packages/catalog.ts, the internal invoicing tool, still
 * bills a 12-month term; it hasn't been changed.)
 */

export const LOCAL_PACKAGE = {
  name: "Local Marketing Package",
  monthly: 297,
  term: "Month to month. No contracts.",
  websiteValue: 3500,
  /** What the $297 covers, in the order the card lists it. */
  includes: [
    {
      title: "Local SEO",
      body: "Google Business Profile, Map Pack work, and on-page SEO aimed at the towns you serve.",
    },
    {
      title: "Paid ads management",
      body: "Google and Facebook ads run by us if you want them. Your ad budget is separate and goes straight to the ads.",
    },
    {
      title: "A free custom website",
      body: "Built for your business and your service area. A $3,500 value, included with the package.",
    },
  ],
} as const;

/** Everything else we do, listed under the package on every city page. */
export const OTHER_SERVICES = [
  {
    title: "AI SEO",
    body: "Get your business named when people ask ChatGPT, Google's AI answers, and Perplexity for a recommendation.",
    href: "/seo",
  },
  {
    title: "24/7 AI agent",
    body: "Answers your website chat and your phone at any hour, captures the lead, and books the job.",
    href: "/ai",
  },
  {
    title: "Email marketing campaigns",
    body: "Campaigns that bring past customers back and keep new leads warm until they're ready.",
  },
  {
    title: "Social media management",
    body: "Regular posts and paid social that keep your name in front of people in your area.",
    href: "/social-media-ads",
  },
  {
    title: "CRM",
    body: "Every lead from calls, forms, and chat in one place, with follow-up that doesn't depend on memory.",
  },
] as const;

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
