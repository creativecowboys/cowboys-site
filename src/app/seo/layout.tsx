import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SEO Services for Southeast Businesses",
    description:
        "Results-driven SEO for contractors, law firms, and industrial B2B across Georgia, Alabama, Tennessee and the Carolinas. Local SEO, keyword strategy, and Google Business Profile optimization from a Villa Rica, GA shop.",
    alternates: { canonical: "/seo" },
    openGraph: {
        title: "SEO Services for Southeast Businesses | Creative Cowboys",
        description: "Get found on Google. Local and organic SEO for trades, law firms, and manufacturers across the Southeast.",
    },
};

export default function SEOLayout({ children }: { children: React.ReactNode }) {
    return children;
}
