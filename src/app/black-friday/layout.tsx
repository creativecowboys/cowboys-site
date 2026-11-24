import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "@/components/night-ride/night-ride.css";

// Both are variable fonts, so no `weight` list: a static weight list on a variable Google font
// is what intermittently broke Vercel builds in the /seo and /web-design layouts.
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap", preload: false });

export const metadata: Metadata = {
    // Ad landing pages: they exist for paid traffic, not for search (also in NOINDEX_ROUTES in sitemap.ts).
    robots: { index: false, follow: true },
};

export default function BlackFridayLayout({ children }: { children: React.ReactNode }) {
    return <div className={`${interTight.variable} ${jetbrainsMono.variable}`}>{children}</div>;
}
