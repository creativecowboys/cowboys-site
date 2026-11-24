import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityPage } from "@/lib/city-pages";
import LayoutA from "@/components/city/layouts/LayoutA";
import LayoutB from "@/components/city/layouts/LayoutB";
import LayoutC from "@/components/city/layouts/LayoutC";

/**
 * Internal preview of the three city page layout options (Nov 2026).
 * Never indexed; delete this route once a layout is chosen.
 * /city-layout-preview/a?city=dunwoody-ga
 */
export const metadata: Metadata = {
  title: "City page layout preview (internal)",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

const LAYOUTS = { a: LayoutA, b: LayoutB, c: LayoutC } as const;

export function generateStaticParams() {
  return Object.keys(LAYOUTS).map((variant) => ({ variant }));
}

export default async function LayoutPreview({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const { variant } = await params;
  const { city } = await searchParams;
  const Layout = LAYOUTS[variant as keyof typeof LAYOUTS];
  if (!Layout) notFound();
  let page;
  try {
    page = getCityPage(city || "dunwoody-ga");
  } catch {
    notFound();
  }
  return <Layout page={page} preview />;
}
