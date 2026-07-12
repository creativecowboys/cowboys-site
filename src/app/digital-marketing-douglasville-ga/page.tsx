import type { Metadata } from "next";
import CityLandingClient, { type CityData } from "@/components/CityLandingClient";

export const metadata: Metadata = {
  title: "Digital Marketing Agency in Douglasville, GA",
  description:
    "Creative Cowboys is a Douglasville, GA digital marketing agency. Local SEO, Google Ads, web design & social media advertising for Douglas County small businesses. Free consultation.",
  alternates: { canonical: "/digital-marketing-douglasville-ga" },
  keywords: [
    "digital marketing agency Douglasville GA",
    "SEO company Douglasville GA",
    "Google Ads agency Douglasville",
    "web design Douglasville GA",
    "local SEO Douglas County",
    "small business marketing West Georgia",
  ],
  openGraph: {
    title: "Digital Marketing Agency in Douglasville, GA | Creative Cowboys",
    description:
      "Local SEO, Google Ads, and web design for Douglasville, GA small businesses. Creative Cowboys — West Georgia's no-fluff digital marketing agency.",
    url: "https://www.creativecowboys.co/digital-marketing-douglasville-ga",
    siteName: "Creative Cowboys",
    type: "website",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys — Digital Marketing Agency in Douglasville, GA",
      },
    ],
  },
};

const faqEntries = [
  {
    q: "How much does digital marketing cost in Douglasville, GA?",
    a: "Most Douglasville small businesses start one of two ways: ongoing from $497/mo with $0 upfront, or a one-time build from $3,500 that you own outright. No hidden fees — the proposal number is the invoice number.",
  },
  {
    q: "How long until I see SEO results in Douglasville?",
    a: "Local SEO typically starts moving in 60–90 days, with meaningful Map Pack gains by months 3–6. Paid ads can generate leads within the first week. We target a 90-day payback.",
  },
  {
    q: "Do you actually work with businesses in Douglasville?",
    a: "Absolutely — Douglasville is home turf for us. Two of our biggest case studies (John B. Jackson & Associates and McKinley Roofing) are Douglasville businesses. We're based in Villa Rica, about 20 minutes west on I-20, and we'll meet you in person.",
  },
  {
    q: "What makes you different from other Douglasville marketing agencies?",
    a: "You work directly with the people doing the work — no offshore teams, no sales-rep hand-off. We publish our pricing, manage to revenue instead of vanity metrics, and say no when a project isn't a fit.",
  },
  {
    q: "Can you get my business into the Google Map Pack?",
    a: "That's our core local-SEO focus: Douglasville keyword targeting, Google Business Profile optimization, service-area pages, citations, and reviews — the exact signals that decide the Map Pack.",
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
    a: "Yes. Many Douglasville clients run both — ads for immediate leads while SEO compounds. We manage both to ROI with call tracking so you see exactly what's working.",
  },
  {
    q: "What if I already have a website?",
    a: "We'll audit it free. Sometimes a redesign makes sense; sometimes we just fix speed, SEO, and conversion issues on what you have. We'll tell you the truth either way.",
  },
];

const city: CityData = {
  name: "Douglasville",
  nameUpper: "DOUGLASVILLE",
  county: "Douglas County",
  countyUpper: "DOUGLAS COUNTY",
  slug: "douglasville",
  eyebrow: "Digital Marketing · Douglasville, GA",
  heroSubhead:
    "Creative Cowboys helps Douglasville small businesses get found on Google, run ads that pay for themselves, and build websites that turn visitors into customers. We're headquartered 20 minutes west in Villa Rica — your West Georgia neighbors, not an out-of-town agency. No fluff. No offshore work.",
  marqueeLine: "VILLA RICA TO DOUGLASVILLE",
  introParagraphs: [
    "Douglasville is one of metro Atlanta's fastest-growing gateways — the county seat of Douglas County, sitting right on I-20 with Arbor Place Mall, a booming Chapel Hill corridor, and WellStar Douglas Hospital anchoring the local economy. That growth pulls in customers from across the west metro, but it also means real competition. The businesses that rank first in local search capture the majority of the calls. Everyone else is invisible.",
    "We know this market because we win in it. Douglasville is home to two of our biggest results — John B. Jackson & Associates and McKinley Roofing — and we build the same systems for businesses like yours: local SEO that lands you in the Google Map Pack, paid ads that don't waste a dollar, and fast websites that actually convert. From downtown Douglasville and O'Neal Plaza to the shops around Arbor Place and the contractors serving Chapel Hill and Lithia Springs, we build revenue machines.",
    "When you hire Creative Cowboys, you work directly with the team doing the work — Josh and Dave — not a salesperson who hands you off.",
  ],
  neighborhoods: [
    "Downtown & O'Neal Plaza",
    "Arbor Place",
    "Chapel Hill",
    "Lithia Springs",
    "Winston",
    "Bill Arp",
    "Fairplay",
    "Mirror Lake",
    "Villa Rica",
    "Austell",
    "Sweetwater",
    "Douglas County",
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
    "We're Josh and Dave — serving Douglasville and Douglas County, GA. No vanity metrics. Just high-converting websites, fast code, and SEO built to make your phone ring.",
  footerLocation: "Villa Rica, GA · Serving Douglasville",
  otherCities: [
    { label: "Villa Rica", href: "/digital-marketing-villa-rica-ga" },
    { label: "Carrollton", href: "/digital-marketing-carrollton-ga" },
    { label: "Newnan", href: "/digital-marketing-newnan-ga" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Marketing in Douglasville, GA",
  serviceType: "Digital Marketing Agency",
  url: "https://www.creativecowboys.co/digital-marketing-douglasville-ga",
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
    name: "Douglasville",
    containedInPlace: { "@type": "AdministrativeArea", name: "Douglas County, Georgia" },
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

export default function DouglasvillePage() {
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
