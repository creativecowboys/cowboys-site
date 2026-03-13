import type { Metadata } from "next";
import AIDemoPageClient from "./AIDemoPageClient";

export const metadata: Metadata = {
    title: "Book a Free AI Demo | Creative Cowboys | West Georgia",
    description:
        "Book your free 15-minute AI Chat & Voice demo with Creative Cowboys. We'll show you a live AI assistant built around your industry — no commitment, no contracts.",
    alternates: { canonical: "/ai/demo" },
    openGraph: {
        title: "Book Your Free AI Demo — Creative Cowboys",
        description:
            "See a live AI Chat & Voice assistant built for your business in 15 minutes. Free demo from Creative Cowboys, West Georgia's AI team.",
    },
};

export default function AIDemoPage() {
    return <AIDemoPageClient />;
}
