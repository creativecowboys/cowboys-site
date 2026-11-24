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

export const STEPS = [
    { title: "Tell us about your business", body: "Fill in the short form. It takes about a minute." },
    { title: "Book a quick call", body: "Pick a time for a 15-minute call with Josh. He'll help you choose the package that fits." },
    { title: "We build your website", body: "We design it and write it. You review it, and we put it live." },
];

export const WORK = [
    { img: "grove", name: "The Grove at DeFoor Farm", alt: "The Grove at DeFoor Farm homepage" },
    { img: "shana", name: "Shana Genenbacher", alt: "Shana Genenbacher real estate homepage" },
    { img: "icg", name: "Innovative Construction Group", alt: "Innovative Construction Group homepage" },
    { img: "bremencia", name: "Commercial Insurance Agency", alt: "Commercial Insurance Agency homepage" },
    { img: "aetheria", name: "Aetheria Wellness", alt: "Aetheria Wellness homepage" },
    { img: "squirrel", name: "Squirrel Made", alt: "Squirrel Made products homepage" },
];

/** Google reviews, quoted as posted on the Creative Cowboys Google Business Profile. */
export const REVIEWS = [
    {
        who: "Kaden VanWey",
        quote: "They have completely transformed my marketing, and my phone rings off the hook now! I am very satisfied with the service I have received from Creative Cowboys and will continue to use them for my website, SEO, and AIO",
    },
    {
        who: "Shana Genenbacher",
        quote: "Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do. They wanted to get to know me and my business and they listened to what I wanted for my website and delivered just that.",
    },
    {
        who: "Daniel Hooper",
        quote: "I had very specific needs for my website, and they worked closely with me to build exactly what my company required. It felt like I was the only company in the world and they invested all of their time and resources to me.",
    },
];
export const GOOGLE_RATING = { stars: "5.0", count: 20 };

export const FAQS = [
    {
        q: "Is there a catch?",
        a: "No. Sign up for any marketing package and we build your website for free. You pay for the package you choose, month to month.",
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
