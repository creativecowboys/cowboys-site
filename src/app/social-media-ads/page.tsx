import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";
import { breadcrumb, graph, serviceSchema } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Social Media Advertising for Southeast Businesses",
    description:
        "Facebook, Instagram, and TikTok ad campaigns built and managed for small businesses across the Southeast. Real leads and a return you can measure, beyond likes.",
    alternates: { canonical: "/social-media-ads" },
    openGraph: {
        title: "Social Media Advertising for Southeast Businesses | Creative Cowboys",
        description: "Scroll-stopping social ads that drive real leads. Facebook, Instagram & TikTok campaign management.",
    },
};

const faqs = [
    { q: "Which platforms do you run ads on?", a: "Facebook, Instagram and TikTok, the platforms where local buyers spend their time. We manage your full ad account and recommend the mix that fits your audience and budget." },
    { q: "How much should I budget for social media ads?", a: "Our social ad plans are $300, $600 or $1,200 a month, and your ad spend comes out of that price. We'll recommend a plan after a free consultation, with no pressure." },
    { q: "Do social ads actually work for local businesses?", a: "Yes, when the targeting, the creative and the offer line up. Social ads are the best way to build local awareness and reach people before they start searching. We manage to leads and return, and likes come second." },
];

const data: ServiceData = {
    eyebrow: "Social Media Ads",
    titleLead: "Ads that stop",
    titleHighlight: "the scroll.",
    subhead:
        "Facebook, Instagram and TikTok campaigns for small businesses in West Georgia and across the Southeast. Ads people stop for, tracked to the leads they bring in.",
    featuresHeading: "What we run.",
    features: [
        { label: "Audience Targeting", desc: "We build precise audiences based on demographics, interests, behaviors, and lookalikes of your best customers." },
        { label: "Creative That Converts", desc: "Video, image and carousel ads designed to stop the thumb and get a click or a call." },
        { label: "Facebook & Instagram Ads", desc: "The most powerful social advertising platforms for local businesses. We manage your full Meta ad account." },
        { label: "TikTok Advertising", desc: "Reach younger demographics and expand your audience with TikTok ads that feel native to the platform." },
        { label: "Budget Optimization", desc: "We continuously optimize your ad spend allocation across campaigns, ad sets, and creative to maximize ROI." },
        { label: "Reporting & Optimization", desc: "Weekly performance snapshots and monthly deep-dives. You always know what your ads are producing." },
    ],
    marquee: ["Facebook", "Instagram", "TikTok", "Creative testing", "Lead tracking", "No contracts"],
    faqs,
    ctaHeadline: "Let's get you in the feed.",
    ctaSub: "Free consultation. We map the platforms, budget and creative that fit your business.",
    heroImage: { src: "/night-ride/hero/social-ads.jpg", position: "92% 62%" },
    pricing: "Social ad plans are $300, $600 or $1,200 a month, and your ad spend comes out of that price.",
};

const pageSchema = graph(
    breadcrumb("Social Media Advertising", "/social-media-ads"),
    serviceSchema({
        name: "Social Media Advertising",
        serviceType: "Social Media Advertising Management",
        description:
            "Facebook, Instagram and TikTok ad campaign management for small businesses across the Southeast. Audience targeting, creative strategy, and ROI reporting.",
        path: "/social-media-ads",
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

export default function SocialMediaAdsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
