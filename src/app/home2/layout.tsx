import { Metadata } from "next";

// Internal design reference. Must never be indexed — the content is a
// near-duplicate of "/" and was competing with the real homepage in search.
export const metadata: Metadata = {
  title: "Home v2 (internal)",
  description: "Internal design reference. Not a public page.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function Home2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
