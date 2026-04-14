import type { Metadata } from "next";
import AILandingPageClient from "../AILandingPageClient";
import { plumbingContent } from "../content";

export const metadata: Metadata = {
  title: "AI for Plumbing Contractors — First to Respond Gets the Job | Creative Cowboys",
  description:
    "Your AI answers emergency calls at midnight, texts leads back in seconds, and books jobs while you sleep. Plus a free custom plumbing website ($2,500 value). No contracts.",
  alternates: { canonical: "/ai/landing/plumbing" },
  openGraph: {
    title: "AI for Plumbing Contractors — First to Respond Gets the Job | Creative Cowboys",
    description:
      "AI Chat & Voice for plumbers. 24/7 emergency coverage, instant lead response, and a free custom website included.",
  },
};

export default function PlumbingLandingPage() {
  return <AILandingPageClient content={plumbingContent} />;
}
