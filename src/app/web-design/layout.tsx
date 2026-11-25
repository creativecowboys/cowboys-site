import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Web Design for Southeast Small Businesses",
    description:
        "Custom, SEO-optimized websites for contractors, law firms, and manufacturers across the Southeast. Fast, mobile-friendly, and built to convert visitors into customers. Free consultation.",
    alternates: { canonical: "/web-design" },
    openGraph: {
        title: "Web Design for Southeast Small Businesses | Creative Cowboys",
        description:
            "Custom, SEO-optimized websites built to convert. Fast, mobile-first, no templates. Free consultation from Creative Cowboys.",
    },
};

export default function WebDesignLayout({ children }: { children: React.ReactNode }) {
    return children;
}
