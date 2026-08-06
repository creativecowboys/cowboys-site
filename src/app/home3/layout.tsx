import { Metadata } from "next";

// Internal design reference — this design now ships as the live homepage ("/").
// Must never be indexed: it is a near-duplicate of "/" and was competing with
// the real homepage in search.
export const metadata: Metadata = {
  title: "Home v3 (internal)",
  description: "Internal design reference. Not a public page.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function Home3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
