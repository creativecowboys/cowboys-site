import type { Metadata } from "next";
import AILandingPageClient from "../AILandingPageClient";
import { lawContent } from "../content";

export const metadata: Metadata = {
  title: "AI for Law Firms — Capture Every Client Inquiry 24/7 | Creative Cowboys",
  description:
    "Your AI engages potential clients instantly, pre-qualifies cases, and books consultations around the clock. Professional website included. No contracts.",
  alternates: { canonical: "/ai/landing/law" },
  openGraph: {
    title: "AI for Law Firms — Capture Every Client Inquiry 24/7 | Creative Cowboys",
    description:
      "AI Chat & Voice for law firms. Intelligent, discreet, always on. 24/7 intake, pre-qualification, and a professional website included.",
  },
};

export default function LawLandingPage() {
  return <AILandingPageClient content={lawContent} />;
}
