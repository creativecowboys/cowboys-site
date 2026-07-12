import type { Metadata } from "next";
import CityLandingClient, { type CityData } from "@/components/CityLandingClient";

export const metadata: Metadata = {
  title: "Digital Marketing Agency in Newnan, GA",
  description:
    "Creative Cowboys is a Newnan, GA digital marketing agency. Local SEO, Google Ads, web design & social media advertising for Coweta County small businesses. Free consultation.",
  alternates: { canonical: "/digital-marketing-newnan-ga" },
  keywords: [
    "digital marketing agency Newnan GA",
    "SEO company Newnan GA",
    "Google Ads agency Newnan",
    "web design Newnan GA",
    "local SEO Coweta County",
    "small business marketing West Georgia",
  ],
  openGraph: {
    title: "Digital Marketing Agency in Newnan, GA | Creative Cowboys",
    description:
      "Local SEO, Google Ads, and web design for Newnan, GA small businesses. Creative Cowboys — West Georgia's no-fluff digital marketing agency.",
    url: "https://www.creativecowboys.co/digital-marketing-newnan-ga",
    siteName: "Creative Cowboys",
    type: "website",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys — Digital Marketing Agency in Newnan, GA",
      },
    ],
  },
};

const faqEntries = [
  {
    q: "How much does digital marketing cost in Newnan, GA?",
    a: "Most Newnan small businesses start one of two ways: ongoing from $497/mo with $0 upfront, or a one-time build from $3,500 that you own outright. No hidden fees — the proposal number is the invoice number.",
  },
  {
    q: "How long until I see SEO results in Newnan?",
    a: "Local SEO typically starts moving in 60–90 days, with meaningful Map Pack gains by months 3–6. Paid ads can generate leads within the first week. We target a 90-day payback.",
  },
  {
    q: "Do you actually work with businesses in Newnan?",
    a: "Yes. We're based in Villa Rica, a straight shot from Newnan, and work across Coweta County. We'll meet you in person — we're your West Georgia neighbors, not a call center.",
  },
  {
    q: "What makes you different from other Newnan marketing agencies?",
    a: "You work directly with the people doing the work — no offshore teams, no sales-rep hand-off. We publish our pricing, manage to revenue instead of vanity metrics, and say no when a project isn't a fit.",
  },
  {
    q: "Can you get my business into the Google Map Pack?",
    a: "That's our core local-SEO focus: Newnan keyword targeting, Google Business Profile optimization, service-area pages, citations, and reviews — the exact signals that decide the Map Pack.",
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
    a: "Yes. Many Newnan clients run both — ads for immediate leads while SEO compounds. We manage both to ROI with call tracking so you see exactly what's working.",
  },
  {
    q: "What if I already have a website?",
    a: "We'll audit it free. Sometimes a redesign makes sense; sometimes we just fix speed, SEO, and conversion issues on what you have. We'll tell you the truth either way.",
  },
];

const city: CityData = {
  name: "Newnan",
  nameUpper: "NEWNAN",
  county: "Coweta County",
  countyUpper: "COWETA COUNTY",
  slug: "newnan",
  eyebrow: "Digital Marketing · Newnan, GA",
  heroSubhead:
    "Creative Cowboys helps Newnan small businesses get found on Google, run ads that pay for themselves, and build websites that turn visitors into customers. We're West Georgia locals up in Villa Rica — not an out-of-town agency. No fluff. No offshore work.",
  marqueeLine: "VILLA RICA TO NEWNAN",
  introParagraphs: [
    "Newnan — the “City of Homes” and county seat of Coweta County — is one of the fastest-growing markets south of Atlanta, anchored by a picture-perfect historic Court Square, the Ashley Park retail district, and Piedmont Newnan Hospital. With the I-85 corridor bringing steady growth, customers are here — but so is the competition. The businesses that show up first in local search capture the majority of the calls. Everyone else is invisible.",
    "We build the systems that put Newnan businesses in front of those buyers: local SEO that lands you in the Google Map Pack, paid ads that don't waste a dollar, and fast websites that actually convert. From the boutiques and restaurants around Court Square to the contractors and service pros serving Sharpsburg, Senoia, and Thomas Crossroads, we build revenue machines for businesses like yours.",
    "When you hire Creative Cowboys, you work directly with the team doing the work — Josh and Dave — not a salesperson who hands you off.",
  ],
  neighborhoods: [
    "Historic Court Square",
    "Ashley Park",
    "Thomas Crossroads",
    "Sharpsburg",
    "Senoia",
    "Grantville",
    "Moreland",
    "Arnco-Sargent",
    "Peachtree City",
    "Palmetto",
    "Coweta County",
    "Downtown Newnan",
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
    "We're Josh and Dave — serving Newnan and Coweta County, GA. No vanity metrics. Just high-converting websites, fast code, and SEO built to make your phone ring.",
  footerLocation: "Villa Rica, GA · Serving Newnan",
  otherCities: [
    { label: "Villa Rica", href: "/digital-marketing-villa-rica-ga" },
    { label: "Carrollton", href: "/digital-marketing-carrollton-ga" },
    { label: "Douglasville", href: "/digital-marketing-douglasville-ga" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Marketing in Newnan, GA",
  serviceType: "Digital Marketing Agency",
  url: "https://www.creativecowboys.co/digital-marketing-newnan-ga",
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
    name: "Newnan",
    containedInPlace: { "@type": "AdministrativeArea", name: "Coweta County, Georgia" },
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

export default function NewnanPage() {
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
