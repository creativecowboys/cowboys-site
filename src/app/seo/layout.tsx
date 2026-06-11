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
    title: "SEO Services in West Georgia",
    description:
        "Creative Cowboys offers results-driven SEO services for small businesses in West Georgia. Local SEO, keyword strategy & Google Business Profile optimization. Based in Villa Rica, GA.",
    alternates: { canonical: "/seo" },
    openGraph: {
        title: "SEO Services in West Georgia | Creative Cowboys",
        description: "Get found on Google. Creative Cowboys delivers local SEO, on-page optimization, and keyword strategy for West Georgia small businesses.",
    },
};

export default function SEOLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} ${lobster.variable} ${anton.variable}`}>
            {children}
        </div>
    );
}

