import type { Metadata } from "next";
import Desk from "./desk";

export const metadata: Metadata = {
  title: "Giveaway call desk",
  description: "Team call desk for Christmas in September entrants.",
  alternates: { canonical: "/leads" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// Protected by middleware (admin sign-in cookie). Reads/writes the Monday
// Giveaway Leads board through /api/team/calls.
export default function LeadsPage() {
  return <Desk />;
}
