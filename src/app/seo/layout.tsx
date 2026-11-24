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
    title: "SEO Services for Southeast Businesses",
    description:
        "Results-driven SEO for contractors, law firms, and industrial B2B across Georgia, Alabama, Tennessee and the Carolinas. Local SEO, keyword strategy, and Google Business Profile optimization from a Villa Rica, GA shop.",
    alternates: { canonical: "/seo" },
    openGraph: {
        title: "SEO Services for Southeast Businesses | Creative Cowboys",
        description: "Get found on Google. Local and organic SEO for trades, law firms, and manufacturers across the Southeast.",
    },
};

export default function SEOLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} ${lobster.variable} ${anton.variable}`}>
            {children}
        </div>
    );
}

