/**
 * Black Friday 2026 landing page: "a free website with any marketing package".
 *
 * The page exists for the Facebook ads Dave recorded on Nov 24 2026, so the offer wording follows
 * what he says on camera. Josh's terms (Nov 24): one page, no minimum term (month to month like
 * every other package), no end date shown, "limited spots" with no number. The lead form posts to
 * /api/contact (email + GoHighLevel), then /black-friday/book shows the Calendly calendar.
 *
 * Package names and prices mirror src/app/pricing/page.tsx. Change them there first.
 */

export const FORM_NAME = "Black Friday Free Website";
export const BOOK_PATH = "/black-friday/book";
export const CALENDLY_URL = "https://calendly.com/creativecowboys/lets-talk";
/** sessionStorage key: carries the visitor's name and email from the form to the calendar. */
export const LEAD_KEY = "cc_bf_lead";

/**
 * "Why work with us", shown right under the hero with Josh's and Dave's headshots.
 * Points and the 99% retention figure are Josh's (Nov 24 2026).
 */
export const CREW = [
    { img: "josh", name: "Josh", role: "Websites, SEO and ads.", alt: "Josh, smiling, in a black Creative Cowboys cap and T-shirt" },
    { img: "dave", name: "Dave", role: "Clients and strategy.", alt: "Dave, smiling, in a white Creative Cowboys T-shirt" },
];

export const WHY = [
    {
        title: "We learn your business first",
        body: "Before we build anything, we ask how your business works, who your customers are and what you want more of.",
        quote: "They wanted to get to know me and my business...",
        who: "Shana Genenbacher",
    },
    {
        title: "Nothing cookie-cutter",
        body: "Your website and your marketing are made for your trade and your town. We don't drop your logo into a template.",
        quote: "...they listened to what I wanted for my website and delivered just that.",
        who: "Shana Genenbacher",
    },
    {
        title: "We treat it like our own",
        body: "We work as a partner in your business. When you call, one of us answers.",
        quote: "Always responsive when we have a question/issue.",
        who: "Rob Goldin",
    },
    {
        title: "Clients stay with us",
        body: "99% of the clients we've worked with over the last few years are still with us. Our business is built on their results and their word.",
        quote: "I am very satisfied with the service I have received from Creative Cowboys and will continue to use them for my website, SEO, and AIO",
        who: "Kaden VanWey",
    },
];

export const CREW_FACTS = [
    { label: "Client retention", value: "99%" },
    { label: "Google rating", value: "5.0" },
    { label: "Contracts", value: "None" },
];

export const INCLUDED = [
    { title: "Designed for your business", body: "A custom design built around your work, your photos and your town." },
    { title: "Every page written for you", body: "Services, about, contact and the pages Google looks for. You review it, we write it." },
    { title: "Fast on a phone", body: "Most of your customers will find you on their phone, so the site is built for that first." },
    { title: "Calls and forms that reach you", body: "Click-to-call buttons and contact forms sent straight to your phone and inbox." },
    { title: "Set up for Google", body: "Page titles, structure and speed handled from day one, so the site can be found." },
    { title: "Launched for you", body: "We connect your domain and put the site live. You don't touch any settings." },
];

export const PACKAGES = [
    {
        name: "Local Growth",
        price: "$297",
        unit: "/mo",
        tagline: "Get found on Google Maps for what you do, in the town you do it.",
        bullets: ["Google Business Profile optimized and managed", "Built to rank in the Map Pack", "Reviews handled for you"],
    },
    {
        name: "Max Growth",
        price: "$1,497",
        unit: "/mo",
        tagline: "Local Growth turned up, for a wider area and more competition.",
        bullets: ["Everything in Local Growth", "More search terms and more pages", "A bigger content push every month"],
    },
    {
        name: "Google Ads",
        price: "$500",
        unit: "/mo and up",
        tagline: "Top of Google when someone is ready to hire. Ad budget included.",
        bullets: ["Plans at $500, $1,000 or $1,500", "Your ad spend comes out of that price", "Campaign build and daily management"],
    },
    {
        name: "Social Ads",
        price: "$300",
        unit: "/mo and up",
        tagline: "Facebook and Instagram ads that look like your work. Ad budget included.",
        bullets: ["Plans at $300, $600 or $1,200", "Your ad spend comes out of that price", "Creative, ad copy and daily management"],
    },
];

/**
 * "What happens, and when": answers how long it takes and how much work it is for the client.
 * `yours` is the client's part of each step. BUILD_TIME is Josh's figure (confirmed Nov 24 2026).
 */
export const BUILD_TIME = "Most sites go live within about two weeks of the call.";
export const TIMELINE = [
    { when: "Today", title: "Send the form", body: "Tell us your name, your business and how to reach you.", yours: "About a minute" },
    { when: "Right after", title: "Talk with Josh", body: "Pick a time on the calendar. Josh asks about your business and helps you choose a package.", yours: "One 15-minute call" },
    { when: "While we build", title: "We design and write it", body: "We design the site and write every page. You send your logo and a few photos of your work.", yours: "A logo and a few photos" },
    { when: "Launch", title: "You review it, then it's live", body: `You look it over before anyone else sees it. ${BUILD_TIME}`, yours: "One look to approve it" },
];

export const WORK = [
    { img: "grove", name: "The Grove at DeFoor Farm", alt: "The Grove at DeFoor Farm homepage" },
    { img: "shana", name: "Shana Genenbacher", alt: "Shana Genenbacher real estate homepage" },
    { img: "icg", name: "Innovative Construction Group", alt: "Innovative Construction Group homepage" },
    { img: "bremencia", name: "Commercial Insurance Agency", alt: "Commercial Insurance Agency homepage" },
    { img: "blueridge", name: "Blue Ridge Golf Carts", alt: "Blue Ridge Golf Carts homepage" },
    { img: "soltacos", name: "Sol Tacos & Tequila", alt: "Sol Tacos & Tequila homepage" },
];

/**
 * Outcome quotes shown right under the hero, so proof is the next thing a visitor sees after the
 * promise. Each is an excerpt, word for word, from a review on the Creative Cowboys Google profile.
 */
export const PROOF = [
    { who: "Kaden VanWey", quote: "They have completely transformed my marketing, and my phone rings off the hook now!" },
    { who: "Rob Goldin", quote: "We have been with Josh and his crew for 2 years and have seen GREAT ROI." },
    { who: "Shana Genenbacher", quote: "Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do." },
];
export const GOOGLE_RATING = { stars: "5.0", count: 20 };

export const FAQS = [
    {
        q: "Is there a catch?",
        a: "No. Sign up for any marketing package and we build your website for free. You pay for the package, month to month. The site stays live for as long as you're a client.",
    },
    {
        q: "Which packages count?",
        a: "Any of them: Local Growth, Max Growth, Google Ads or Social Ads. If you're not sure which one fits, we'll go through it with you on the call.",
    },
    {
        q: "Is there a contract?",
        a: "No. Every package is month to month.",
    },
    {
        q: "What happens to the website if I cancel?",
        a: "The free website comes with your marketing package, so it stays live for as long as you're a client. If you cancel and want to keep the site, you can buy it from us and take it with you.",
    },
    {
        q: "I already have a website. Can I still do this?",
        a: "Yes. We can rebuild what you have or start fresh. Your current site stays up until the new one is ready.",
    },
    {
        q: "What do you need from me?",
        a: "Your logo if you have one, a few photos of your work, and a 15-minute call. We write the pages and handle the launch.",
    },
    {
        q: "How many spots are there?",
        a: "A limited number, because we build every site ourselves. When they're taken, the deal closes.",
    },
];
