import type { Metadata } from "next";
import Desk from "./desk";

export const metadata: Metadata = {
  title: "Giveaway call desk preview",
  description: "Review the Creative Cowboys giveaway conversation guide using fictional businesses.",
  alternates: { canonical: "/leads" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// Public review version only. Real entrant data and Monday writes remain in the
// authenticated team portal until the site's secure connection is configured.
export default function LeadsPage() {
  return <Desk demo />;
}
