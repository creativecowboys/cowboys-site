import type { Metadata } from "next";
import CarrolltonClient from "@/components/CarrolltonClient";

export const metadata: Metadata = {
  title: "Digital Marketing Agency in Carrollton, GA",
  description:
    "Creative Cowboys is a Carrollton, GA digital marketing agency. Local SEO, Google Ads, web design & social media advertising for Carroll County small businesses. Free consultation.",
  alternates: { canonical: "/digital-marketing-carrollton-ga" },
  keywords: [
    "digital marketing agency Carrollton GA",
    "SEO company Carrollton GA",
    "Google Ads agency Carrollton",
    "web design Carrollton GA",
    "local SEO Carroll County",
    "small business marketing West Georgia",
  ],
  openGraph: {
    title: "Digital Marketing Agency in Carrollton, GA | Creative Cowboys",
    description:
      "Local SEO, Google Ads, and web design for Carrollton, GA small businesses. Creative Cowboys — West Georgia's no-fluff digital marketing agency.",
    url: "https://www.creativecowboys.co/digital-marketing-carrollton-ga",
    siteName: "Creative Cowboys",
    type: "website",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys — Digital Marketing Agency in Carrollton, GA",
      },
    ],
  },
};

const faqEntries = [
  {
    q: "How much does digital marketing cost in Carrollton, GA?",
    a: "Most Carrollton small businesses start one of two ways: ongoing from $497/mo with $0 upfront, or a one-time build from $3,500 that you own outright. No hidden fees — the proposal number is the invoice number.",
  },
  {
    q: "How long until I see SEO results in Carrollton?",
    a: "Local SEO typically starts moving in 60–90 days, with meaningful Map Pack gains by months 3–6. Paid ads can generate leads within the first week. We target a 90-day payback.",
  },
  {
    q: "Do you actually work with businesses in Carrollton?",
    a: "Yes. We're based in Villa Rica, 15 minutes away, and work across Carroll County. We'll meet you in person — we're your neighbors, not a call center.",
  },
  {
    q: "What makes you different from other Carrollton marketing agencies?",
    a: "You work directly with the people doing the work — no offshore teams, no sales-rep hand-off. We publish our pricing, manage to revenue instead of vanity metrics, and say no when a project isn't a fit.",
  },
  {
    q: "Can you get my business into the Google Map Pack?",
    a: "That's our core local-SEO focus: Carrollton keyword targeting, Google Business Profile optimization, service-area pages, citations, and reviews — the exact signals that decide the Map Pack.",
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
    a: "Yes. Many Carrollton clients run both — ads for immediate leads while SEO compounds. We manage both to ROI with call tracking so you see exactly what's working.",
  },
  {
    q: "What if I already have a website?",
    a: "We'll audit it free. Sometimes a redesign makes sense; sometimes we just fix speed, SEO, and conversion issues on what you have. We'll tell you the truth either way.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Marketing in Carrollton, GA",
  serviceType: "Digital Marketing Agency",
  url: "https://www.creativecowboys.co/digital-marketing-carrollton-ga",
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
    name: "Carrollton",
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

export default function CarrolltonPage() {
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
      <CarrolltonClient />
    </>
  );
}
