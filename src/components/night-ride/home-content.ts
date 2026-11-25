/**
 * Homepage content that follows the value-equation layout Josh asked for (Nov 24 2026):
 * proof straight after the promise, what happens and when, then the packages.
 * Review lines are word for word from the Creative Cowboys Google profile.
 * Package names and prices mirror src/app/pricing/page.tsx. Change them there first.
 */

export const GOOGLE_RATING = { stars: "5.0", count: 20 };

export const PROOF = [
  { who: "Kaden VanWey", quote: "They have completely transformed my marketing, and my phone rings off the hook now!" },
  { who: "Rob Goldin", quote: "We have been with Josh and his crew for 2 years and have seen GREAT ROI." },
  { who: "Shana Genenbacher", quote: "Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do." },
];

/**
 * Client testimonial videos. Add an entry when a finished file is in public/night-ride/video/.
 * With one video the section shows it beside its quote; with more it becomes a grid.
 * `quote` and `points` must be the client's own words from the video. `note` discloses anything
 * the client received in connection with the testimonial.
 */
export type ClientVideo = {
  src: string; poster: string; title: string; length: string; upright: boolean;
  who: string; business: string; quote: string; points: string[]; note?: string;
};
export const CLIENT_VIDEOS: ClientVideo[] = [
  {
    src: "/night-ride/video/shana-genenbacher.mp4",
    poster: "/night-ride/video/shana-genenbacher.jpg",
    title: "Shana Genenbacher on working with Creative Cowboys",
    length: "0:38",
    upright: true,
    who: "Shana Genenbacher",
    business: "Realtor · Prattville, AL",
    quote: "They made me feel like I was a real person. I wasn't just a number.",
    points: [
      "\u201cMy first impression of the new website was that I loved it.\u201d",
      "\u201cI did a lot of research, probably nine months worth of research. I interviewed multiple companies.\u201d",
      "\u201c...definitely give them a call, check them out, you won't regret it.\u201d",
    ],
    note: "Shana is a client. She recorded this in exchange for a free video shoot day.",
  },
];

/** `yours` is the client's part of each step. The two-week build time is Josh's figure. */
export const TIMELINE = [
  { when: "Today", title: "Reach out", body: "Tell us your name and a little about your business. It takes about a minute.", yours: "About a minute" },
  { when: "Next", title: "We send a plan", body: "We review your website, your Google profile and your top competitors, then send a plan with clear prices.", yours: "Read it and decide" },
  { when: "While we build", title: "We build it", body: "We design and write your site and set up your marketing. Most websites go live within about two weeks.", yours: "A logo and a few photos" },
  { when: "Every month", title: "You see results", body: "We track calls, form leads and Google rankings, and we show you the numbers.", yours: "Answer the phone" },
];

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
