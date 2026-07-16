import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";

export const metadata: Metadata = {
    title: "Social Media Advertising in West Georgia",
    description:
        "Creative Cowboys creates and manages Facebook, Instagram & TikTok ad campaigns for small businesses across West Georgia. Real engagement, real leads, real ROI.",
    alternates: { canonical: "/social-media-ads" },
    openGraph: {
        title: "Social Media Advertising in West Georgia | Creative Cowboys",
        description: "Scroll-stopping social media ads that drive real results for West Georgia small businesses. Facebook, Instagram & TikTok advertising management.",
    },
};

const faqs = [
    { q: "Which platforms do you run ads on?", a: "Facebook, Instagram, and TikTok — the platforms where West Georgia buyers actually spend their time. We manage your full ad account and recommend the mix that fits your audience and budget." },
    { q: "How much should I budget for social media ads?", a: "Most local businesses start with $300–$1,000/month in ad spend, plus management starting at $497/month. We'll recommend a budget after a free consultation — no pressure, just a straight answer." },
    { q: "Do social ads actually work for local businesses?", a: "Yes — when the targeting, creative, and offer are aligned. Social ads are unmatched for building local awareness and reaching people before they're actively searching. We manage to leads and ROI, not just likes." },
];

const data: ServiceData = {
    eyebrow: "Social Media Ads",
    titleLead: "ADS THAT STOP",
    titleHighlight: "THE SCROLL.",
    subhead:
        "Scroll-stopping Facebook, Instagram & TikTok campaigns for West Georgia small businesses. Real engagement, real leads, real ROI — creative that drives action, not just likes.",
    featuresHeading: "WHAT WE RUN.",
    features: [
        { label: "Audience Targeting", desc: "We build precise audiences based on demographics, interests, behaviors, and lookalikes of your best customers." },
        { label: "Creative That Converts", desc: "Scroll-stopping ad creative — video, image, and carousel — designed to stop the thumb and drive action." },
        { label: "Facebook & Instagram Ads", desc: "The most powerful social advertising platforms for local businesses. We manage your full Meta ad account." },
        { label: "TikTok Advertising", desc: "Reach younger demographics and expand your audience with TikTok ads that feel native to the platform." },
        { label: "Budget Optimization", desc: "We continuously optimize your ad spend allocation across campaigns, ad sets, and creative to maximize ROI." },
        { label: "Reporting & Optimization", desc: "Weekly performance snapshots and monthly deep-dives. You always know what your ads are producing." },
    ],
    marquee: ["FACEBOOK", "INSTAGRAM", "TIKTOK", "REAL ENGAGEMENT", "NO VANITY METRICS", "WEST GEORGIA"],
    faqs,
    ctaHeadline: "LET'S GET YOU IN THE FEED.",
    ctaSub: "Free consultation — we'll map the platforms, budget, and creative that fit your business.",
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Social Media Advertising",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://www.creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Facebook, Instagram and TikTok ad campaign management for small businesses in West Georgia. Audience targeting, creative strategy, and ROI reporting.",
    url: "https://www.creativecowboys.co/social-media-ads",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function SocialMediaAdsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
