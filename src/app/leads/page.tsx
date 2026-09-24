import type { Metadata } from "next";
import { Suspense } from "react";
import Shell from "./shell";

export const metadata: Metadata = {
  title: "Team desk — sales & onboarding",
  description: "Team desk for Christmas in September follow-up calls and new-client onboarding.",
  alternates: { canonical: "/leads" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// Protected by middleware (admin sign-in cookie). The Sales tab is the giveaway call desk
// (Monday Giveaway Leads board); the Onboarding tab works the Onboarding Pipeline board.
export default function LeadsPage() {
  return <Suspense fallback={null}><Shell /></Suspense>;
}
