import type { Metadata } from "next";
import AIPageClient from "./AIPageClient";

export const metadata: Metadata = {
    title: "AI Chat & Voice for Small Businesses | Creative Cowboys | West Georgia",
    description:
        "Creative Cowboys' AI Chat and Voice services keep your business answering questions, booking appointments, and capturing leads 24/7 — even when you're off the clock. Serving West Georgia and beyond.",
    alternates: { canonical: "/ai" },
    openGraph: {
        title: "Your Business Never Closes — Creative Cowboys AI Chat & Voice",
        description:
            "Stop losing leads to voicemail and missed chats. Creative Cowboys builds AI chat and voice assistants that work around the clock for your small business. Free 15-minute demo available.",
    },
};

export default function AIPage() {
    return <AIPageClient />;
}
