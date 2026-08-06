import type { Metadata } from "next";
import { Inter, Lobster, Anton } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
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

