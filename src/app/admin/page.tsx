import type { Metadata } from "next";
import { Suspense } from "react";
import Shell from "@/app/leads/shell";
import { DESK_PATH } from "@/lib/desk-path";

// The team desk: Sales, Onboarding and Clients tabs over one sign-in. It was served at /leads until Oct 2 2026
// (Dave: "this has become more of an admin setup than just calling new leads"); /leads now forwards here with its
// query string (next.config.ts). The desk's own files still live in src/app/leads/; this page only mounts them.
// Named "Back Office" on screen since Oct 4 2026 (Dave: "ill just say backoffice for now"); the address stays /admin.
export const metadata: Metadata = {
  title: "Back Office",
  description: "Creative Cowboys team desk: sales follow-up, new-client onboarding and active clients.",
  alternates: { canonical: DESK_PATH },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// Protected by middleware (the team sign-in cookie). Sales is the call desk (LEADS_BACKEND); Onboarding and Clients
// follow DESK_BACKEND (the two Monday boards, or GoHighLevel contacts once it is "ghl").
// The page is static, so DESK_BACKEND is read at build time; flipping it is an env change plus a redeploy,
// which rebuilds. It only words the copy before the first list loads — every list response names its system.
export default function AdminPage() {
  return <Suspense fallback={null}><Shell deskDefault={process.env.DESK_BACKEND === "ghl" ? "ghl" : "monday"} /></Suspense>;
}
