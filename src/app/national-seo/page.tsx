import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";
import { breadcrumb, graph, serviceSchema } from "@/lib/seo";

export const metadata: Metadata = {
    title: "National SEO for Manufacturers & B2B",
    description:
        "National organic SEO for manufacturers, distributors, and B2B companies selling beyond their zip code. Technical SEO, product and category page strategy, and content that ranks for how buyers actually search.",
    alternates: { canonical: "/national-seo" },
    openGraph: {
        title: "National SEO for Manufacturers & B2B | Creative Cowboys",
        description:
            "For companies whose customers aren't down the street. Technical SEO, category page strategy, and content built for long, specific B2B search.",
    },
};

const faqs = [
    {
        q: "How is national SEO different from local SEO?",
        a: "Local SEO is a proximity game — you're competing to be one of three businesses in a map for people near you. National SEO has no map and no proximity advantage, so it comes down to site architecture, content depth, and links. Different work, different timeline, different measurement.",
    },
    {
        q: "We're a manufacturer. Does SEO even apply to us?",
        a: "It applies unusually well. Industrial buyers search in long, specific strings — part numbers, specs, materials, tolerances, applications. Those searches have almost no competition from content built to answer them, which is exactly the gap a well-structured catalog and technical content fills.",
    },
    {
        q: "How long before we see anything?",
        a: "Longer than local. Technical fixes can show movement in 6–10 weeks, but competitive national terms generally take 6–12 months to establish. Anyone promising a national #1 in 90 days is selling you something.",
    },
    {
        q: "Do you handle sites with thousands of product pages?",
        a: "Yes — that's a large part of this work. Big catalogs live or die on crawl efficiency, internal linking, category structure, and templating that produces genuinely distinct pages rather than thousands of near-duplicates.",
    },
];

const data: ServiceData = {
    eyebrow: "National & Organic SEO",
    titleLead: "RANK BEYOND",
    titleHighlight: "YOUR ZIP CODE.",
    subhead:
        "Some businesses don't sell to the town they're in. Manufacturers, distributors, and B2B suppliers compete against companies three states away, and the map pack does nothing for them. This is the other kind of SEO — architecture, depth, and authority instead of proximity.",
    featuresHeading: "HOW WE APPROACH IT.",
    features: [
        {
            label: "Technical SEO & Site Architecture",
            desc: "Crawlability, indexation, site speed, internal linking, and URL structure. On a large catalog these aren't housekeeping — they decide which of your pages Google ever bothers to look at.",
        },
        {
            label: "Category & Product Page Strategy",
            desc: "Category pages are usually the biggest untapped asset on a manufacturer's site. We build them into pages that rank on their own instead of acting as pass-through navigation.",
        },
        {
            label: "Keyword Research for How Buyers Search",
            desc: "Industrial and B2B search is long, specific, and low-volume per term — part numbers, specs, materials, applications. Hundreds of those terms together outperform any single head keyword.",
        },
        {
            label: "Technical Content That Earns Links",
            desc: "Spec comparisons, application guides, selection charts, and troubleshooting resources. The content engineers actually reference, which is also the content that attracts links naturally.",
        },
        {
            label: "Competitive Gap Analysis",
            desc: "What your competitors rank for that you don't, where their content is thin, and which of those gaps are realistically winnable given your current authority.",
        },
        {
            label: "Reporting Tied to Pipeline",
            desc: "Rankings and traffic are inputs. We report on qualified inquiries and the terms producing them, because for a B2B company a hundred right visitors beat ten thousand wrong ones.",
        },
    ],
    marquee: ["TECHNICAL SEO", "CATEGORY PAGES", "B2B SEARCH", "MANUFACTURING", "LINK BUILDING", "LARGE CATALOGS"],
    faqs,
    ctaHeadline: "SELLING PAST YOUR CITY LIMITS?",
    ctaSub: "Free consultation. We'll look at your site's structure and tell you where the organic ceiling actually is.",
};

const pageSchema = graph(
    breadcrumb("National SEO", "/national-seo"),
    serviceSchema({
        name: "National SEO Services",
        serviceType: "National Organic Search Engine Optimization",
        description:
            "National organic SEO for manufacturers, distributors, and B2B companies: technical SEO and site architecture, category and product page strategy, B2B keyword research, technical content, and competitive gap analysis.",
        path: "/national-seo",
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

export default function NationalSEOPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
