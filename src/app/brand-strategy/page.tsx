import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";

export const metadata: Metadata = {
    title: "Brand Strategy & Identity for West Georgia Small Businesses",
    description:
        "Creative Cowboys builds cohesive brand identities for West Georgia small businesses — from logo to launch. Stand out, connect with customers & grow with confidence.",
    alternates: { canonical: "/brand-strategy" },
    openGraph: {
        title: "Brand Strategy & Identity for West Georgia Small Businesses | Creative Cowboys",
        description: "Logo design, brand voice, visual identity and competitive positioning for West Georgia small businesses.",
    },
};

const faqs = [
    { q: "What's included in a brand identity project?", a: "Typically a logo and visual identity, brand voice and messaging, a color palette and typography system, and a brand guidelines document — everything you need to look consistent everywhere." },
    { q: "Do you do rebrands, or only new brands?", a: "Both. If your current brand no longer reflects your business, we'll rethink and rebuild it while preserving the equity and recognition you've already earned." },
    { q: "Why does brand strategy matter for a small business?", a: "Strategy first, design second. Clear positioning and a consistent look make you the obvious choice for your ideal customer — and make every ad, page, and post work harder." },
];

const data: ServiceData = {
    eyebrow: "Brand Strategy · Identity",
    titleLead: "A BRAND THAT",
    titleHighlight: "LOOKS THE PART.",
    subhead:
        "Cohesive brand identities for West Georgia small businesses — from logo to launch. Strategy first, design second: positioning, voice, and a visual system that make you the obvious choice.",
    featuresHeading: "WHAT WE BUILD.",
    features: [
        { label: "Logo Design & Visual Identity", desc: "A logo that captures your brand's personality and works across every touchpoint — print, digital, signage, and social." },
        { label: "Brand Voice & Messaging", desc: "How you sound is just as important as how you look. We define your brand's tone, tagline, and core messaging." },
        { label: "Competitive Positioning", desc: "We research your market and competitors to find the positioning that makes you the obvious choice for your ideal customer." },
        { label: "Brand Guidelines", desc: "A complete brand standards guide so your team, contractors, and partners always represent your brand consistently." },
        { label: "Visual Design System", desc: "Color palette, typography, iconography, and layout patterns that create a cohesive, professional look across all materials." },
        { label: "Rebranding Services", desc: "If your current brand no longer reflects your business, we'll rethink and rebuild it — while preserving the equity you've built." },
    ],
    marquee: ["LOGO DESIGN", "BRAND VOICE", "POSITIONING", "VISUAL IDENTITY", "STRATEGY FIRST", "WEST GEORGIA"],
    faqs,
    ctaHeadline: "LET'S BUILD A BRAND THAT STICKS.",
    ctaSub: "Free consultation — we'll talk through where you are now and what a stronger brand could do for you.",
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Brand Strategy & Identity",
    provider: { "@type": "LocalBusiness", name: "Creative Cowboys Media", url: "https://www.creativecowboys.co" },
    areaServed: "West Georgia",
    description: "Brand strategy, logo design, visual identity, brand voice, and competitive positioning for small businesses in West Georgia.",
    url: "https://www.creativecowboys.co/brand-strategy",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function BrandStrategyPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
