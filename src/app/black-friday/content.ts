/**
 * Black Friday 2026 landing page: "a free website with any marketing package".
 *
 * The page exists for the Facebook ads Dave recorded on Nov 24 2026, so the offer wording follows
 * what he says on camera. Josh's terms (Nov 24): one page, no minimum term (month to month like
 * every other package), no end date shown, "limited spots" with no number, and the client keeps
 * the website even if they cancel after the first month. The lead form posts to
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

/**
 * Josh, Nov 24 2026: list only Local Growth, Max Growth and a custom option. Google Ads and Social
 * Ads are not shown as their own packages for now. Local Growth is the one to sell: the starting
 * point for a small business that isn't doing any marketing yet. The return line is Josh's claim.
 */
export const PACKAGES = [
    {
        name: "Local Growth",
        price: "$297",
        unit: "/mo",
        featured: true,
        badge: "Most popular",
        tagline: "Not doing any marketing yet? Start here. We get your business found on Google Maps for what you do, in the town you do it.",
        bullets: [
            "Google Business Profile optimized and managed",
            "Built to rank in the Map Pack for your service and city",
            "Reviews handled for you",
            "A monthly report showing what actually moved",
        ],
        note: "Our lowest-priced package, and most clients see a great return on it.",
    },
    {
        name: "Max Growth",
        price: "$1,497",
        unit: "/mo",
        featured: false,
        badge: "",
        tagline: "Local Growth turned up, for a wider area and more competition.",
        bullets: ["Everything in Local Growth", "More search terms and more pages", "A bigger content push every month"],
        note: "",
    },
    {
        name: "Custom",
        price: "Let's talk",
        unit: "",
        featured: false,
        badge: "",
        tagline: "Need something specific? Tell us what you're after and we'll build a plan around it.",
        bullets: ["Google Ads and social ads", "Video and photo", "A plan built around your goals"],
        note: "",
    },
];

/**
 * "What happens, and when": answers how long it takes and how much work it is for the client.
 * `yours` is the client's part of each step. BUILD_TIME is Josh's figure (confirmed Nov 24 2026).
 */
export const BUILD_TIME = "Most sites go live within about two weeks of the call.";
export const TIMELINE = [
    { when: "Today", title: "Send the form", body: "Tell us your name, your business and how to reach you.", yours: "About a minute" },
    { when: "Right after", title: "Book a call", body: "Pick a time on the calendar. We ask about your business and help you choose a package.", yours: "One 15-minute call" },
    { when: "While we build", title: "We build it", body: "We design the site and write every page. You send your logo and a few photos of your work.", yours: "A logo and a few photos" },
    { when: "Launch", title: "It goes live", body: `You look it over before anyone else sees it. ${BUILD_TIME}`, yours: "One look to approve it" },
];

/**
 * The Black Friday video (Dave on camera, 48 seconds), which also runs as a Facebook ad. It ends on "sign up
 * from the link below", so the page puts a "Claim my spot" button directly under it. The three
 * points restate what Dave says in it, for visitors who don't press play.
 */
export const VIDEO = {
    src: "/night-ride/video/bf-why-it-matters.mp4",
    poster: "/night-ride/video/bf-why-it-matters.jpg",
    title: "Why the marketing package matters",
    length: "0:48",
};
export const VIDEO_POINTS = [
    {
        title: "Customers start on Google",
        body: "Most people find a local business with a Google search. If you're not in the top three spots in your area, you're invisible to them.",
    },
    {
        title: "Search is changing",
        body: "More people now ask ChatGPT, Gemini or Siri who's the best near them. AI gives them one or two names.",
    },
    {
        title: "We set you up for both",
        body: "We build your site, get you ranking on Google and set you up to be the answer AI gives.",
    },
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
        a: "No. Sign up for any marketing package and we build your website for free. You pay for the package, month to month. The website is yours to keep, even if you cancel.",
    },
    {
        q: "Which packages count?",
        a: "Any of them: Local Growth, Max Growth or a custom plan. If you're not sure which one fits, we'll go through it with you on the call.",
    },
    {
        q: "Is there a contract?",
        a: "No. Every package is month to month.",
    },
    {
        q: "What happens to the website if I cancel?",
        a: "You keep it. The deal is a free website with any marketing package, and the website is yours. That holds even if you cancel after your first month.",
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
