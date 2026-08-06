import type { Metadata } from "next";
import ServiceClient, { type ServiceData } from "@/components/ServiceClient";
import { breadcrumb, graph, serviceSchema } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Local SEO Services — Rank in the Map Pack",
    description:
        "Local SEO for contractors, law firms, and service businesses across the Southeast. Google Business Profile optimization, citation cleanup, review generation, and service-area pages that rank.",
    alternates: { canonical: "/local-seo" },
    openGraph: {
        title: "Local SEO Services — Rank in the Map Pack | Creative Cowboys",
        description:
            "Google Business Profile optimization, citation cleanup, review systems, and service-area pages. Local SEO built for businesses that live off the phone ringing.",
    },
};

const faqs = [
    {
        q: "Can I rank in a city where I don't have an office?",
        a: "In the map pack, no — Google ranks those results by how close the business is to the person searching, so a physical address in that city is the requirement. In the regular organic results below the map, absolutely yes. That's what service-area pages are for, and it's often the larger share of the traffic anyway.",
    },
    {
        q: "How long does local SEO take?",
        a: "Google Business Profile work can move rankings in 4–8 weeks because you're optimizing an asset Google already trusts. Organic service-area pages take longer — usually 3–6 months to settle, more in a competitive metro.",
    },
    {
        q: "Why do my listings show different addresses on different sites?",
        a: "Because old listings never die on their own. If you moved or changed your phone number, the previous data is still sitting in directories that Google cross-references, and the contradiction weakens your ranking. Cleaning that up is usually the first thing we do — and often the single highest-return fix.",
    },
    {
        q: "Do reviews actually affect rankings, or just conversions?",
        a: "Both. Review count, rating, and recency all feed local pack ranking, and they're the deciding factor for most people choosing between the three businesses Google shows them. For a service business with no storefront, reviews are the single strongest signal you control.",
    },
];

const data: ServiceData = {
    eyebrow: "Local SEO · Map Pack",
    titleLead: "OWN THE MAP",
    titleHighlight: "IN YOUR MARKET.",
    subhead:
        "When somebody needs a roofer, a plumber, or an attorney, they open Google and pick from the three businesses in the map. Local SEO is the work of being one of those three — and of ranking underneath them for every town you actually serve.",
    featuresHeading: "WHAT LOCAL SEO ACTUALLY INVOLVES.",
    features: [
        {
            label: "Google Business Profile Optimization",
            desc: "Categories, services, attributes, photos, products, and posts — filled out properly and kept current. It's the highest-leverage asset in local SEO and most businesses leave half of it blank.",
        },
        {
            label: "Citation Cleanup & NAP Consistency",
            desc: "We find every listing carrying an old address or disconnected phone number and correct it. Contradictory data across directories is one of the most common reasons a business quietly underranks.",
        },
        {
            label: "Review Generation & Response",
            desc: "A system that asks every happy customer at the right moment, plus responses to what comes in. Count, rating, and recency all feed the local pack — and they close the sale once you're in it.",
        },
        {
            label: "Service-Area Pages That Aren't Filler",
            desc: "A real page for each town you serve, with genuine local specifics — not a template with the city name swapped. Google's 2026 stance on mass-generated location pages is unforgiving, and thin ones now hurt the whole domain.",
        },
        {
            label: "Local Link Building",
            desc: "Chambers, trade associations, local press, suppliers, and community sponsorships. Regionally relevant links move local rankings far more than generic directory submissions.",
        },
        {
            label: "Tracking That Shows the Phone Ringing",
            desc: "Rank tracking by location, Google Business Profile insights, and call tracking — so you can see which towns are producing and which need work, instead of guessing.",
        },
    ],
    marquee: ["MAP PACK", "GOOGLE BUSINESS PROFILE", "CITATIONS", "REVIEWS", "SERVICE AREAS", "LOCAL LINKS"],
    faqs,
    ctaHeadline: "READY TO SHOW UP WHERE IT COUNTS?",
    ctaSub: "Free consultation. We'll pull up your current local visibility and tell you straight what's holding it back.",
};

const pageSchema = graph(
    breadcrumb("Local SEO", "/local-seo"),
    serviceSchema({
        name: "Local SEO Services",
        serviceType: "Local Search Engine Optimization",
        description:
            "Local SEO for service businesses across the Southeast: Google Business Profile optimization, citation cleanup and NAP consistency, review generation, service-area page development, and local link building.",
        path: "/local-seo",
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

export default function LocalSEOPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
            <ServiceClient data={data} />
        </>
    );
}
