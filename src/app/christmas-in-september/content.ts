/**
 * Christmas in September — page copy.
 *
 * Lifted verbatim from the build handoff (§4). Kept in one module so a copy
 * change is a data edit rather than surgery on JSX, and so the FAQ can feed
 * both the rendered accordion and the FAQPage schema from one source.
 */

export const PRIZE_LINES = [
    {
        what: "A BRAND-NEW WEBSITE",
        sub: "Custom designed & built by us — you own it outright",
        value: "$8,000",
    },
    {
        what: "GROWTH MAX MARKETING · 12 MONTHS",
        sub: "Our full-stack marketing package — $3,000/mo, managed for you",
        value: "$36,000",
        subLines: [
            { label: "SEO & LOCAL SEARCH", value: "$14,400" },
            { label: "DIGITAL ADVERTISING†", value: "$10,800" },
            { label: "AI TOOLS", value: "$6,000" },
            { label: "LEAD TRACKING CRM", value: "$4,800" },
        ],
    },
    {
        what: "BUSINESS GROWTH STRATEGY",
        sub: "Kickoff workshop + quarterly sessions with Josh & Dave — included with Growth Max",
        value: "INCLUDED",
        green: true,
    },
] as const;

export const AD_SPEND_FOOTNOTE =
    "†Advertising management only. Ad spend paid to Google, Meta or other platforms is not included in the prize or the stated value.";

export const MARQUEE = [
    "NEW WEBSITE",
    "12 MONTHS OF GROWTH MAX MARKETING",
    "GROWTH STRATEGY",
    "$44,000 VALUE",
    "WINNER ANNOUNCED SEPT 25",
    "NO PURCHASE NECESSARY",
];

export const WEBSITE_BULLETS = [
    "Custom design — no themes, no page builders",
    "Copywriting for every page",
    "Local SEO structure baked in",
    "Lead forms, click-to-call, tracking",
    "You own it — code, domain, everything",
];

export const GROWTH_MAX_TILES = [
    {
        title: "SEO & LOCAL SEARCH",
        value: "$14,400",
        mo: "$1,200/mo",
        desc: "Monthly content, links, technical fixes, and Google Business Profile management — built to win the map pack.",
    },
    {
        title: "DIGITAL ADVERTISING†",
        value: "$10,800",
        mo: "$900/mo",
        desc: "Google Ads and social ads — strategy, creative, setup, and ongoing management and optimization.",
    },
    {
        title: "AI TOOLS",
        value: "$6,000",
        mo: "$500/mo",
        desc: "AI chat and lead-response on your site, AI review replies, and content tooling — so you never miss a lead after hours.",
    },
    {
        title: "LEAD TRACKING CRM",
        value: "$4,800",
        mo: "$400/mo",
        desc: "Every call, form, and chat tracked in one CRM with instant notifications and monthly reporting in plain English.",
    },
];

export const TOTAL_BAND_FINEPRINT =
    "†The Digital Advertising value reflects campaign strategy, creative, setup, and ongoing management services only. Advertising spend — the amounts paid directly to Google, Meta, or any other advertising platform to run ads — is not included in the prize or in the stated $44,000 value, and is set, paid, and controlled solely by the winner. The winner may choose to run the package without paid advertising.";

export const STEPS = [
    {
        n: "1",
        title: "ENTER IN 2 MINUTES.",
        body: "Tell us who you are, what kind of business you run, and how to reach you. That's the whole entry.",
        when: "ENTRIES OPEN NOW",
        hot: false,
    },
    {
        n: "2",
        title: "WE DRAW A WINNER.",
        body: "One eligible entry is drawn at random and announced on our social channels and by email. We'll call the winner personally — that's the fun part.",
        when: "SEPTEMBER 25, 2026",
        hot: true,
    },
    {
        n: "3",
        title: "WE GET TO WORK.",
        body: "Kickoff strategy workshop, then we build the site and switch on Growth Max. Your 12 months run from kickoff.",
        when: "KICKOFF IN OCTOBER",
        hot: false,
    },
];

export const WHO_TILES = [
    "HOME SERVICES & TRADES",
    "RESTAURANTS & FOOD",
    "RETAIL & BOUTIQUES",
    "HEALTH, WELLNESS & FITNESS",
    "PROFESSIONAL SERVICES",
    "AUTOMOTIVE",
    "BEAUTY & SALONS",
    "REAL ESTATE & CONSTRUCTION",
    "NONPROFITS & CHURCHES",
    "...AND EVERYBODY ELSE",
];

export const FAQS = [
    {
        q: "IS THIS ACTUALLY FREE?",
        a: "Yes. The winner pays nothing for the website, the 12 months of Growth Max marketing, or the strategy work. The only cost that could ever come up is ad spend — the money paid directly to Google or Meta if you choose to run paid ads — and that's entirely your call and your budget. Plenty of our clients grow on SEO alone.",
    },
    {
        q: "WHY WOULD YOU GIVE AWAY $44,000 OF WORK?",
        a: "Because it's the best marketing we could possibly do. We'd rather spend our own ad budget building something real for one business — and documenting the whole thing — than run another round of “Get More Leads!” ads. You get a head start; we get a case study we're proud of.",
    },
    {
        q: "DO I HAVE TO BE IN GEORGIA OR TENNESSEE?",
        a: "No. Any small business in the United States can enter. We're based in Villa Rica, GA and opening in Franklin, TN, but we work with clients across the country — strategy sessions happen in person or on video, whichever's easier for you.",
    },
    {
        q: "WHAT IF I ALREADY HAVE A WEBSITE?",
        a: "Enter anyway. Most of our clients had a website when they came to us — it just wasn't doing its job. We'll build you a new one, move your domain over safely, and keep anything that's actually working.",
    },
    {
        q: "HOW IS THE WINNER CHOSEN?",
        a: "By random drawing from all eligible entries after entries close on September 24. We announce the winner on September 25 on Instagram and Facebook, and by email to everyone who entered. The winner gets a phone call first.",
    },
    {
        q: "WHAT HAPPENS TO MY INFORMATION IF I DON'T WIN?",
        a: "We keep it private and we never sell it. You'll get an email when the winner is announced, and occasionally after that we'll send tips and offers we think are useful for small business owners. Every email has an unsubscribe link, and it works.",
    },
    {
        q: "DOES THE YEAR START RIGHT AWAY?",
        a: "The 12-month package runs from your kickoff strategy workshop, which we'll schedule with the winner in October 2026. The website typically launches within the first 6–8 weeks, and marketing runs the full year from kickoff.",
    },
];

/**
 * Official Rules (§4.9).
 *
 * `[[TODO: ...]]` markers render as a yellow highlight, exactly as the mockup
 * does. That is deliberate and load-bearing: these are unresolved legal terms,
 * and making them impossible to miss on the rendered page is what stops the
 * giveaway going live with a blank in the rules. Resolve them before launch —
 * they are not decorative.
 */
export const RULES: Array<{ title: string; body: string }> = [
    {
        title: "No purchase necessary.",
        body: "A purchase will not increase your chances of winning. Void where prohibited by law.",
    },
    {
        title: "Sponsor.",
        body: "Creative Cowboys, 222 West Montgomery St., Villa Rica, GA 30180 (“Sponsor”). This promotion is in no way sponsored, endorsed, administered by, or associated with Meta, Instagram, Facebook, TikTok, or Google.",
    },
    {
        title: "Eligibility.",
        body: "Open to legal residents of the 50 United States and D.C. who are 18 years of age or older at the time of entry and who own or are authorized to act on behalf of a small business operating in the United States. Employees of Sponsor, their immediate families, and current or former Creative Cowboys clients are not eligible.",
    },
    {
        title: "Entry period.",
        body: "Begins September 3, 2026 and ends September 24, 2026 at 11:59 PM Eastern Time. Limit one (1) entry per business. Duplicate or automated entries will be disqualified.",
    },
    {
        title: "How to enter.",
        body: "Complete and submit the entry form on this page with accurate information. Incomplete entries will not be considered.",
    },
    {
        title: "Winner selection & notification.",
        body: "One (1) potential winner will be selected by random drawing from all eligible entries on or about September 25, 2026. The winner will be notified by phone and email and announced publicly on Sponsor's social media channels. The potential winner must respond within five (5) business days of first notification or an alternate winner may be selected. Odds of winning depend on the number of eligible entries received.",
    },
    {
        title: "Prize.",
        body: "One (1) prize package consisting of: (a) a custom-designed and developed website; and (b) twelve (12) months of Sponsor's “Growth Max” marketing package (retail $3,000 per month), consisting of search engine optimization and Google Business Profile management, digital advertising campaign management, AI tools, and lead tracking through a CRM, together with a kickoff strategy workshop and quarterly strategy sessions. Approximate Retail Value (“ARV”): $44,000 (website $8,000; Growth Max $36,000). The 12-month term begins at the kickoff workshop, to be scheduled within 30 days of winner confirmation. **The digital advertising component consists of management services only. Advertising spend — amounts paid to Google, Meta, or any other advertising platform — is not included in the prize or the ARV** and is at the winner's sole discretion and expense; the winner is not required to purchase advertising to receive the prize. Prize is non-transferable and may not be substituted or redeemed for cash, except that Sponsor reserves the right to substitute a prize of equal or greater value. Any difference between the ARV and the actual value of the prize will not be awarded.",
    },
    {
        title: "Conditions.",
        body: "The winner agrees to participate reasonably in the project (providing content, feedback, and approvals in a timely manner) and consents to Sponsor's use of the winner's business name, likeness, and project results in Sponsor's marketing and case studies without additional compensation, except where prohibited by law. The winner is responsible for any taxes that may apply to the prize.",
    },
    {
        title: "Privacy.",
        body: "Information collected will be used to administer the giveaway and, with your consent, to send marketing communications from Sponsor. We do not sell or share your information with third parties for their marketing. You may unsubscribe at any time. See our [Privacy Policy](/privacy-policy).",
    },
    {
        title: "General.",
        body: "By entering, you agree to these Official Rules and the decisions of Sponsor, which are final. Sponsor reserves the right to disqualify any entry that is fraudulent, incomplete, or in violation of these rules, and to cancel or modify the giveaway if it cannot be conducted as planned. These rules are governed by the laws of the State of Georgia.",
    },
];

/** True when any rule still carries an unresolved TODO — used as a launch gate. */
export const RULES_HAVE_TODOS = RULES.some((r) => r.body.includes("[[TODO:"));
