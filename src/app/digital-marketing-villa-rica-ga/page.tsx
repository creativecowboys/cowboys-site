import type { Metadata } from "next";
import CityLandingClient, { type CityData } from "@/components/CityLandingClient";

export const metadata: Metadata = {
  title: "Digital Marketing Agency in Villa Rica, GA",
  description:
    "Creative Cowboys is a Villa Rica, GA digital marketing agency — headquartered downtown. Local SEO, Google Ads, web design & social media advertising for Villa Rica small businesses. Free consultation.",
  alternates: { canonical: "/digital-marketing-villa-rica-ga" },
  keywords: [
    "digital marketing agency Villa Rica GA",
    "SEO company Villa Rica GA",
    "Google Ads agency Villa Rica",
    "web design Villa Rica GA",
    "local SEO Carroll County",
    "small business marketing West Georgia",
  ],
  openGraph: {
    title: "Digital Marketing Agency in Villa Rica, GA | Creative Cowboys",
    description:
      "Villa Rica's own digital marketing agency. Local SEO, Google Ads, and web design for Villa Rica small businesses. Creative Cowboys — West Georgia's no-fluff agency.",
    url: "https://www.creativecowboys.co/digital-marketing-villa-rica-ga",
    siteName: "Creative Cowboys",
    type: "website",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys — Digital Marketing Agency in Villa Rica, GA",
      },
    ],
  },
};

const faqEntries = [
  {
    q: "How much does digital marketing cost in Villa Rica, GA?",
    a: "Most Villa Rica small businesses start one of two ways: ongoing from $497/mo with $0 upfront, or a one-time build from $3,500 that you own outright. No hidden fees — the proposal number is the invoice number.",
  },
  {
    q: "How long until I see SEO results in Villa Rica?",
    a: "Local SEO typically starts moving in 60–90 days, with meaningful Map Pack gains by months 3–6. Paid ads can generate leads within the first week. We target a 90-day payback.",
  },
  {
    q: "Are you really based in Villa Rica?",
    a: "Yes — Creative Cowboys is headquartered right here at 222 West Montgomery St in downtown Villa Rica. We're your neighbors, not an out-of-town call center. We'll meet you in person.",
  },
  {
    q: "What makes you different from other Villa Rica marketing agencies?",
    a: "You work directly with the people doing the work — no offshore teams, no sales-rep hand-off. We publish our pricing, manage to revenue instead of vanity metrics, and say no when a project isn't a fit.",
  },
  {
    q: "Can you get my business into the Google Map Pack?",
    a: "That's our core local-SEO focus: Villa Rica keyword targeting, Google Business Profile optimization, service-area pages, citations, and reviews — the exact signals that decide the Map Pack.",
  },
  {
    q: "Do I own my website when you're done?",
    a: "Always. Domain, files, design, and code all transfer to you. No hostage situations.",
  },
  {
    q: "Do you build e-commerce stores?",
    a: "Yes — Shopify, Stripe, and WooCommerce builds with checkout, cart recovery, and analytics.",
  },
  {
    q: "How fast will my new site load?",
    a: "We average 1.4 seconds. Speed is a ranking factor and a conversion factor, so we optimize every build for it.",
  },
  {
    q: "Do you handle Google Ads as well as SEO?",
    a: "Yes. Many Villa Rica clients run both — ads for immediate leads while SEO compounds. We manage both to ROI with call tracking so you see exactly what's working.",
  },
  {
    q: "What if I already have a website?",
    a: "We'll audit it free. Sometimes a redesign makes sense; sometimes we just fix speed, SEO, and conversion issues on what you have. We'll tell you the truth either way.",
  },
];

const city: CityData = {
  name: "Villa Rica",
  nameUpper: "VILLA RICA",
  county: "Carroll County",
  countyUpper: "CARROLL COUNTY",
  slug: "villa_rica",
  eyebrow: "Digital Marketing · Villa Rica, GA",
  heroSubhead:
    "Creative Cowboys is headquartered right here in Villa Rica. We help local small businesses get found on Google, run ads that pay for themselves, and build websites that turn visitors into customers. Your West Georgia neighbors — no fluff, no offshore work.",
  marqueeLine: "HOME OF THE COWBOYS",
  introParagraphs: [
    "Villa Rica sits right on the I-20 corridor between Atlanta and Carrollton, straddling the Carroll and Douglas County line — a fast-growing West Georgia town where new rooftops and new businesses are showing up every year. That growth means opportunity, but also competition. The businesses that show up first in local search capture the majority of the calls. Everyone else is invisible.",
    "This is our home turf. From the shops and restaurants around historic downtown and The Mill, to the contractors and service businesses out toward Mirror Lake and Fairfield Plantation, to the professional firms along Highway 61 and Interstate West — we build the systems that put Villa Rica businesses in front of local buyers: Map Pack SEO, paid ads that don't waste a dollar, and fast websites that convert.",
    "When you hire Creative Cowboys, you work directly with the team doing the work — Josh and Dave — not a salesperson who hands you off. We're 60 seconds from the businesses we serve.",
  ],
  neighborhoods: [
    "Downtown & Main Street",
    "The Mill",
    "Mirror Lake",
    "Fairfield Plantation",
    "Gold City",
    "Interstate West",
    "Pine Mountain",
    "Highway 61 Corridor",
    "Temple",
    "Winston",
    "Carrollton",
    "Douglasville",
  ],
  faqs: faqEntries.map((f, i) => ({
    index: String(i + 1).padStart(2, "0"),
    category: [
      "PRICING",
      "TIMELINE",
      "LOCAL",
      "WHY US",
      "SEO",
      "OWNERSHIP",
      "E-COMMERCE",
      "SPEED",
      "ADS + SEO",
      "EXISTING SITE",
    ][i],
    question: f.q.toUpperCase(),
    answer: f.a,
  })),
  footerBlurb:
    "We're Josh and Dave — headquartered right here in Villa Rica, GA. No vanity metrics. Just high-converting websites, fast code, and SEO built to make your phone ring.",
  footerLocation: "Villa Rica, GA · Our Home Base",
  otherCities: [
    { label: "Carrollton", href: "/digital-marketing-carrollton-ga" },
    { label: "Douglasville", href: "/digital-marketing-douglasville-ga" },
    { label: "Newnan", href: "/digital-marketing-newnan-ga" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Marketing in Villa Rica, GA",
  serviceType: "Digital Marketing Agency",
  url: "https://www.creativecowboys.co/digital-marketing-villa-rica-ga",
  provider: {
    "@type": "LocalBusiness",
    name: "Creative Cowboys Media",
    telephone: "+1-470-243-7517",
    email: "howdy@creativecowboys.co",
    address: {
      "@type": "PostalAddress",
      streetAddress: "222 West Montgomery St",
      addressLocality: "Villa Rica",
      addressRegion: "GA",
      postalCode: "30180",
      addressCountry: "US",
    },
  },
  areaServed: {
    "@type": "City",
    name: "Villa Rica",
    containedInPlace: { "@type": "AdministrativeArea", name: "Carroll County, Georgia" },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqEntries.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function VillaRicaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CityLandingClient city={city} />
    </>
  );
}
