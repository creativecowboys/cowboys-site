import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";

export const metadata: Metadata = {
    title: "Google Ads & PPC Management in West Georgia",
    description:
        "Creative Cowboys manages ROI-focused Google Ads & PPC campaigns for small businesses in West Georgia. No wasted spend — just qualified leads. Villa Rica, GA digital marketing agency.",
    alternates: { canonical: "/ppc" },
    openGraph: {
        title: "Google Ads & PPC Management in West Georgia | Creative Cowboys",
        description: "Every dollar tracked, every click optimized. Creative Cowboys manages Google Ads campaigns that drive real leads for West Georgia small businesses.",
    },
};

const faqs = [
    { q: "How much do Google Ads cost for a small business?", a: "Ad spend varies by market and goals — most West Georgia small businesses start with $500–$1,500/month in ad budget. Our management fee starts at $497/month. We'll recommend a budget that makes sense for your goals after a free consultation." },
    { q: "How quickly can I see results from Google Ads?", a: "Unlike SEO, Google Ads can drive traffic within hours of launch. Most campaigns start showing meaningful lead volume in the first 2–4 weeks as we optimize targeting and bids." },
    { q: "Do you require long-term contracts?", a: "No contracts that trap you. We work month-to-month and earn your business by delivering results. If it's not working, you're not locked in." },
];

const data: ServiceData = {
    eyebrow: "Google Ads · PPC",
    titleLead: "ADS THAT PAY FOR",
    titleHighlight: "THEMSELVES.",
    subhead:
        "ROI-focused Google Ads for West Georgia small businesses. Every dollar tracked, every click optimized — no wasted spend, just qualified leads. We manage to ROI, not impressions.",
    featuresHeading: "WHAT WE MANAGE.",
    features: [
        { label: "Campaign Strategy", desc: "We map out your target keywords, competitor landscape, and campaign structure before spending a single dollar." },
        { label: "Search Ads Setup", desc: "Google Search Ads that appear when prospects are actively searching for your services — the highest-intent traffic available." },
        { label: "Display & Remarketing", desc: "Stay in front of visitors who didn't convert the first time with smart remarketing campaigns across the Google Display Network." },
        { label: "Conversion Tracking", desc: "We set up GA4 and Google Tag Manager to track every call, form fill, and purchase — so you know your exact ROI." },
        { label: "Bid Optimization", desc: "Ongoing bid adjustments to reduce cost-per-click and maximize your budget efficiency as campaign data accumulates." },
        { label: "ROI Reporting", desc: "Plain-English monthly reports: what we spent, what you got, and what we're doing next to improve results." },
    ],
    marquee: ["GOOGLE ADS", "ZERO WASTED SPEND", "CALL TRACKING", "ROI-FOCUSED", "NO CONTRACTS", "WEST GEORGIA"],
    faqs,
    ctaHeadline: "READY FOR LEADS THAT CONVERT?",
    ctaSub: "Get a free consultation and a straight recommendation on the budget that makes sense for your goals.",
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Google Ads & PPC Management",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://www.creativecowboys.co" },
    areaServed: "West Georgia",
    description: "ROI-focused Google Ads and PPC campaign management for small businesses in West Georgia. Campaign setup, keyword targeting, conversion tracking, and transparent reporting.",
    url: "https://www.creativecowboys.co/ppc",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function PPCPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
