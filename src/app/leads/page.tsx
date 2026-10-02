import type { Metadata } from "next";
import { Suspense } from "react";
import Shell from "./shell";

export const metadata: Metadata = {
  title: "Team desk — sales & onboarding",
  description: "Team desk for Christmas in September follow-up calls and new-client onboarding.",
  alternates: { canonical: "/leads" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// Protected by middleware (admin sign-in cookie). Three tabs: Sales (the call desk — LEADS_BACKEND),
// Onboarding and Clients (DESK_BACKEND: the two Monday boards, or GoHighLevel contacts once it is "ghl").
// The page is static, so DESK_BACKEND is read at build time; flipping it is an env change plus a redeploy,
// which rebuilds. It only words the copy before the first list loads — every list response names its system.
export default function LeadsPage() {
  return <Suspense fallback={null}><Shell deskDefault={process.env.DESK_BACKEND === "ghl" ? "ghl" : "monday"} /></Suspense>;
}
