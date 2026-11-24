import type { Metadata } from "next";

/**
 * Client proposals are private links, never search results.
 *
 * The middleware also sends an X-Robots-Tag header for /proposals/*; this tag is
 * the second layer, so the page itself says the same thing. A proposal page that
 * sets its own `robots` keeps it.
 */
export const metadata: Metadata = {
  title: { default: "Proposal", template: "%s | Creative Cowboys" },
  robots: { index: false, follow: false },
};

export default function ProposalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
