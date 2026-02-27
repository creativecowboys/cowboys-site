import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Web Design in West Georgia | Creative Cowboys",
    description:
        "Creative Cowboys builds custom, SEO-optimized websites for small businesses in West Georgia. Fast, mobile-friendly & built to convert visitors into customers. Free consultation.",
    alternates: { canonical: "/web-design" },
    openGraph: {
        title: "Web Design in West Georgia | Creative Cowboys",
        description:
            "Custom, SEO-optimized websites for West Georgia small businesses. Fast, mobile-friendly, conversion-focused. Free consultation from Creative Cowboys.",
    },
};

export default function WebDesignLayout({ children }: { children: React.ReactNode }) {
    return children;
}
