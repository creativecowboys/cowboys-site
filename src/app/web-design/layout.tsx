import type { Metadata } from "next";
import { Inter, Lobster, Anton } from "next/font/google";

// No `weight` here on purpose. Asking Google Fonts for the static 400 and 700 files made
// Vercel builds fail about half the time on Nov 24 2026 ("Cannot read properties of null" in
// next/font's loader). Without it this is the variable Inter the root layout already loads.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lobster = Lobster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lobster",
  display: "swap",
  preload: false,
});

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "optional",
});

export const metadata: Metadata = {
    title: "Web Design for Southeast Small Businesses",
    description:
        "Custom, SEO-optimized websites for contractors, law firms, and manufacturers across the Southeast. Fast, mobile-friendly, and built to convert visitors into customers. Free consultation.",
    alternates: { canonical: "/web-design" },
    openGraph: {
        title: "Web Design for Southeast Small Businesses | Creative Cowboys",
        description:
            "Custom, SEO-optimized websites built to convert. Fast, mobile-first, no templates. Free consultation from Creative Cowboys.",
    },
};

export default function WebDesignLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} ${lobster.variable} ${anton.variable}`}>
            {children}
        </div>
    );
}


