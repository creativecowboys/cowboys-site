import ServicePage, { type ServicePageData } from "@/components/night-ride/ServicePage";
import { RESULT_HARMONIC, RESULT_JBJ } from "@/components/night-ride/service-content";

/**
 * Adapter for the simpler service pages (/ppc, /social-media-ads, /local-seo, /national-seo,
 * /brand-strategy, /media-creation). Each of those pages passes a small ServiceData object; this
 * turns it into the shared Night Ride service layout.
 */

export type ServiceFeature = { label: string; desc: string };
export type ServiceFaq = { q: string; a: string };

export type ServiceData = {
    /** small eyebrow above the H1, e.g. "Google Ads · PPC" */
    eyebrow: string;
    /** first line(s) of the hero headline */
    titleLead: string;
    /** highlighted (orange) tail of the headline */
    titleHighlight: string;
    /** hero paragraph */
    subhead: string;
    /** the included capabilities */
    features: ServiceFeature[];
    /** heading over the features grid; defaults to "What's included." */
    featuresHeading?: string;
    /** short proof points, shown as pills under the hero buttons */
    marquee: string[];
    /** optional FAQ */
    faqs?: ServiceFaq[];
    /** closing CTA headline */
    ctaHeadline: string;
    /** closing CTA sub-line */
    ctaSub?: string;
    /** one line of real prices for this service, shown above the FAQ */
    pricing?: string;
    /** this page's own faint hero background (every page gets its own; the loft is the fallback) */
    heroImage?: { src: string; position?: string };
};

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export default function ServiceClient({ data }: { data: ServiceData }) {
    const page: ServicePageData = {
        slug: slugOf(data.eyebrow),
        eyebrow: data.eyebrow,
        titleLead: data.titleLead,
        titleHighlight: data.titleHighlight,
        subhead: data.subhead,
        pills: data.marquee,
        secondary: { label: "See results", href: "#results" },
        heroImage: data.heroImage,
        blocks: [
            {
                id: "included",
                eyebrow: "What you get",
                heading: data.featuresHeading ?? "What's included.",
                items: data.features,
            },
        ],
        results: [RESULT_JBJ, RESULT_HARMONIC],
        pricing: data.pricing ? { line: data.pricing } : undefined,
        faqs: data.faqs,
        ctaHeadline: data.ctaHeadline,
        ctaSub: data.ctaSub,
    };
    return <ServicePage data={page} />;
}
