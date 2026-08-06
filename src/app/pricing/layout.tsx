import type { Metadata } from "next";

// pricing/page.tsx is a client component, so its metadata has to live here.
// Without this the page inherited the root layout's default title and rendered
// as a duplicate of the homepage in search results.
export const metadata: Metadata = {
  title: "Digital Marketing Pricing — Websites, SEO & Ads",
  description:
    "Straightforward pricing for web design, SEO, Google Ads, and brand work. No contracts, no retainer games — see what each service costs before you talk to anyone.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Digital Marketing Pricing | Creative Cowboys",
    description:
      "Straightforward pricing for web design, SEO, Google Ads, and brand work. No contracts, no retainer games.",
    url: "https://www.creativecowboys.co/pricing",
  },
};

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
