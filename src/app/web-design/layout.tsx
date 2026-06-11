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
    title: "Web Design in West Georgia",
    description:
        "Creative Cowboys builds custom, SEO-optimized websites for small businesses in West Georgia. Fast, mobile-friendly & built to convert visitors into customers. Free consultation.",
    alternates: { canonical: "/web-design" },
    openGraph: {
        title: "Web Design in West Georgia | Creative Cowboys",
        description:
            "Custom, SEO-optimized websites for West Georgia small businesses. Fast, mobile-friendly, conversion-focused. Free consultation from Creative Cowboys.",
    },
};

export default function WebDesignLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} ${lobster.variable} ${anton.variable}`}>
            {children}
        </div>
    );
}


