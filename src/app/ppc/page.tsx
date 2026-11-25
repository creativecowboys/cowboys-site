import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";
import { breadcrumb, graph, serviceSchema } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Google Ads & PPC Management for the Southeast",
    description:
        "Google Ads and PPC management for contractors, law firms and B2B companies across the Southeast. Every dollar tracked to a call or a lead. Month to month, no contracts.",
    alternates: { canonical: "/ppc" },
    openGraph: {
        title: "Google Ads & PPC Management for the Southeast | Creative Cowboys",
        description: "Every dollar tracked, every click optimized. Google Ads campaigns that drive real leads, not vanity clicks.",
    },
};

const faqs = [
    { q: "How much do Google Ads cost for a small business?", a: "Our Google Ads plans are $500, $1,000 or $1,500 a month, and your ad spend comes out of that price. We'll recommend the plan that makes sense for your goals after a free consultation." },
    { q: "How quickly can I see results from Google Ads?", a: "Unlike SEO, Google Ads can drive traffic within hours of launch. Most campaigns start showing meaningful lead volume in the first 2 to 4 weeks as we optimize targeting and bids." },
    { q: "Do you require long-term contracts?", a: "No contracts that trap you. We work month-to-month and earn your business by delivering results. If it's not working, you're not locked in." },
];

const data: ServiceData = {
    eyebrow: "Google Ads · PPC",
    titleLead: "Ads that pay for",
    titleHighlight: "themselves.",
    subhead:
        "Google Ads for small businesses in West Georgia and across the Southeast. We track every dollar to a call or a form lead, cut the clicks that waste money, and report on what you earned back.",
    featuresHeading: "What we manage.",
    features: [
        { label: "Campaign Strategy", desc: "We map out your target keywords, competitor landscape, and campaign structure before spending a single dollar." },
        { label: "Search Ads Setup", desc: "Google Search Ads that appear when people are actively searching for your services. This is the highest-intent traffic you can buy." },
        { label: "Display & Remarketing", desc: "Stay in front of visitors who didn't convert the first time with smart remarketing campaigns across the Google Display Network." },
        { label: "Conversion Tracking", desc: "We set up GA4 and Google Tag Manager to track every call, form fill and purchase, so you know your exact return." },
        { label: "Bid Optimization", desc: "Ongoing bid adjustments to reduce cost-per-click and maximize your budget efficiency as campaign data accumulates." },
        { label: "ROI Reporting", desc: "Plain-English monthly reports: what we spent, what you got, and what we're doing next to improve results." },
    ],
    marquee: ["Google Ads", "Call tracking", "Negative keywords", "ROI reporting", "No contracts"],
    faqs,
    ctaHeadline: "Ready for leads that convert?",
    ctaSub: "Get a free consultation and a straight recommendation on the budget that makes sense for your goals.",
    heroImage: { src: "/night-ride/hero/google-ads.jpg", position: "92% 45%" },
    pricing: "Google Ads plans are $500, $1,000 or $1,500 a month, and your ad spend comes out of that price.",
};

const pageSchema = graph(
    breadcrumb("Google Ads & PPC Management", "/ppc"),
    serviceSchema({
        name: "Google Ads & PPC Management",
        serviceType: "Pay-Per-Click Advertising Management",
        description:
            "ROI-focused Google Ads and PPC campaign management for small businesses across the Southeast. Campaign setup, keyword targeting, conversion tracking, and transparent reporting.",
        path: "/ppc",
    }),
    {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    },
);

export default function PPCPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
