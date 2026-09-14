/**
 * Local Max entrant offer — page copy and the handful of values that change.
 *
 * Everything a non-developer might need to edit lives here: the checkout link,
 * the Calendly link, the closing date, and every block of copy. The page files
 * only lay it out.
 */

/** GHL payment link for "Local Max — 12-month commitment" ($297/mo). */
export const CHECKOUT_URL = "https://link.fastpaydirect.com/payment-link/6a9d9346a7f78e147447f2e8";

/** 15-minute onboarding call (Calendly event "Local Max Onboarding Call"). */
export const CALENDLY_URL = "https://calendly.com/creativecowboys/local-max-onboarding-call";

/** Shown wherever the deadline is mentioned. */
export const OFFER_CLOSES = "Friday, October 3";

/** Video at the top of the page. Drop the files in /public/video and the page picks them up. */
export const VIDEO = {
    mp4: "/video/local-max-offer.mp4",
    webm: "/video/local-max-offer.webm",
    poster: "/video/local-max-offer-poster.jpg",
};

export const PHONE_DISPLAY = "(470) 243-7517";
export const PHONE_TEL = "tel:4702437517";

export const MARQUEE = [
    "FREE $8,000 WEBSITE",
    "LOCAL MAX $297/MO",
    "12 MONTHS",
    "ENTRANTS ONLY",
    `CLOSES ${OFFER_CLOSES.toUpperCase()}`,
];

/** The two lines of the deal, as they appear on the price card. */
export const DEAL = [
    {
        label: "YOUR NEW WEBSITE",
        sub: "Custom designed, written, built, and launched by us",
        was: "$8,000",
        now: "$0",
    },
    {
        label: "LOCAL MAX · 12 MONTHS",
        sub: "Local SEO, Google Business Profile, reviews, tracking, reporting, and ongoing site management",
        was: "$497/mo",
        now: "$297/mo",
    },
] as const;

export const WEBSITE_BULLETS = [
    "Custom design on our system — no themes, no page builders",
    "Copy written for the searches your customers actually type",
    "Built for phones first and tuned to load in under two seconds",
    "Lead forms and click-to-call wired to your phone and inbox",
    "Hosting, SSL, and launch handled — nothing for you to set up",
    "Monthly technical checkup with fixes applied, not just reported",
    "Content, photo, and hours updates whenever you send them",
    "It's yours outright when the 12 months are up",
];

export const SEO_BULLETS = [
    "Google Business Profile built out properly — categories, services, photos, Q&A",
    "A fresh post on your profile every week, written for your trade and season",
    "Review engine: one text to your customer, and we reply to every review within 24 hours",
    "Your name, address, and phone corrected across the directories Google trusts",
    "10 keywords tracked weekly so we can see what's moving",
    "A tracking phone number with a call log — every call from Google, counted",
    "A monthly results report in plain English: calls, directions, site clicks vs. your baseline",
    "Check-ins at month 1, 3, and 11 — a real person, not a dashboard",
];

export const STEPS = [
    {
        n: "01",
        title: "Accept the offer",
        body: "Two minutes at checkout. Card or bank, $297 a month, and the 12-month agreement is right there in plain English before you enter anything.",
    },
    {
        n: "02",
        title: "Book your 15-minute call",
        body: "Right after checkout you pick a slot with our team. We confirm what you want the site to do, who your customers are, and what's already working.",
    },
    {
        n: "03",
        title: "We build. You're live in about three weeks.",
        body: "Week one we gather your details and get access to your Google profile. Weeks two and three we build and optimize. Then we launch, and the monthly work starts.",
    },
];

export const FAQS = [
    {
        q: "Why is the website free?",
        a: "Because you entered the giveaway to win one, and the 12-month commitment on Local Max covers the build. We'd rather build the site right on day one than spend six months doing SEO on a site that's holding you back.",
    },
    {
        q: "Why 12 months?",
        a: "Local SEO compounds. Google Business Profile work can move you in the map pack inside 4 to 8 weeks, but organic rankings take 3 to 6 months to settle. Twelve months is how long it takes for this to become something worth having. It's also what pays for the site.",
    },
    {
        q: "What happens after the 12 months?",
        a: "Three options: renew for another year and your rate stays at $297, go month-to-month at the regular $497, or stop. Either way the website is yours — files, domain, everything.",
    },
    {
        q: "What if I need to end it early?",
        a: "You pay out the remaining months on your term in one payment, and the site is yours exactly as if you'd finished. We'll always tell you the exact number before anything is charged.",
    },
    {
        q: "I already have a website. Does this still make sense?",
        a: "Yes. Your audit email showed you where your current site stands. If it's solid, we'll build on it and put the effort into the Google side. If it's holding you back, that's exactly what the free build is for. We'll talk it through on the onboarding call.",
    },
    {
        q: "Is ad spend included?",
        a: "No. Local Max is organic: your website, your Google Business Profile, reviews, and citations. Google Ads and social ads are separate add-ons, and ad spend always goes straight to the platform.",
    },
    {
        q: "How long is this offer open?",
        a: `Through ${OFFER_CLOSES}. We build sites in the order people sign up, and we can only take on so many at once. After that Local Max goes back to $497 a month and the website is a separate cost.`,
    },
];
