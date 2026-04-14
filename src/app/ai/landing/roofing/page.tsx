import type { Metadata } from "next";
import AILandingPageClient from "../AILandingPageClient";
import { roofingContent } from "../content";

export const metadata: Metadata = {
  title: "AI for Roofing Contractors — Never Miss a Lead Again | Creative Cowboys",
  description:
    "Your AI answers every call, chats with every lead, and books appointments 24/7. Plus a free custom roofing website ($2,500 value). No contracts. Setup in under a week.",
  alternates: { canonical: "/ai/landing/roofing" },
  openGraph: {
    title: "AI for Roofing Contractors — Never Miss a Lead Again | Creative Cowboys",
    description:
      "AI Chat & Voice for roofing contractors. 24/7 lead capture, instant response, and a free custom website included.",
  },
};

export default function RoofingLandingPage() {
  return <AILandingPageClient content={roofingContent} />;
}
