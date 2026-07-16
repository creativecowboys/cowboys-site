import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";

export const metadata: Metadata = {
    title: "Video, Photography & Graphic Design for West Georgia Businesses",
    description:
        "Creative Cowboys produces scroll-stopping video, photography & graphic design content for businesses across West Georgia. Tell your story. Build your brand.",
    alternates: { canonical: "/media-creation" },
    openGraph: {
        title: "Video, Photography & Graphic Design for West Georgia Businesses | Creative Cowboys",
        description: "Professional video production, business photography, and graphic design for West Georgia businesses.",
    },
};

const faqs = [
    { q: "What kind of content do you produce?", a: "Brand videos, testimonials, product and team photography, graphic design for ads and print, and short-form social content for Reels, TikTok, and YouTube Shorts — all built to match your brand." },
    { q: "How does the production process work?", a: "Discovery call → creative brief → production day(s) → editing and delivery → integration into your content calendar. Simple, professional, and fast." },
    { q: "Do you shoot on location in West Georgia?", a: "Yes. We're based in Villa Rica and shoot on-site at your business, facility, or job site across West Georgia so the content actually looks like you." },
];

const data: ServiceData = {
    eyebrow: "Video · Photo · Design",
    titleLead: "CONTENT THAT",
    titleHighlight: "TELLS YOUR STORY.",
    subhead:
        "Scroll-stopping video, photography, and graphic design for West Georgia businesses. Real footage of your team, your work, and your business — the local proof that turns lookers into buyers.",
    featuresHeading: "WHAT WE CREATE.",
    features: [
        { label: "Business Video Production", desc: "Brand videos, testimonials, product showcases, and explainer videos that tell your story and build trust with potential customers." },
        { label: "Professional Photography", desc: "High-quality photos of your team, facility, products, and work that make your business look polished across every platform." },
        { label: "Graphic Design for Marketing", desc: "Print and digital design for ads, brochures, signage, presentations, and brand materials — all consistent with your brand identity." },
        { label: "Social Media Content", desc: "Custom content sized and optimized for Instagram, Facebook, TikTok, and LinkedIn — ready to publish and built to perform." },
        { label: "Reels & Short-Form Video", desc: "Short-form video for Instagram Reels, TikTok, and YouTube Shorts — the highest-reach, lowest-cost content format available." },
        { label: "A Simple Production Process", desc: "Discovery call → creative brief → production day(s) → editing and delivery → content calendar integration. Professional and fast." },
    ],
    marquee: ["VIDEO", "PHOTOGRAPHY", "GRAPHIC DESIGN", "REELS", "REAL FOOTAGE", "WEST GEORGIA"],
    faqs,
    ctaHeadline: "LET'S MAKE SOMETHING WORTH WATCHING.",
    ctaSub: "Free consultation — tell us what you're building and we'll map the content that sells it.",
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Media Creation",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://www.creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Video production, business photography, graphic design, and social media content creation for businesses in West Georgia.",
    url: "https://www.creativecowboys.co/media-creation",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function MediaCreationPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
