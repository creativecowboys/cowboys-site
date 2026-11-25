import { Inter_Tight, JetBrains_Mono } from "next/font/google";

// Both are variable fonts, so no `weight` list: a static weight list on a variable Google font
// is what intermittently broke Vercel builds in the /seo and /web-design layouts.
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap", preload: false });

/** Class names that define --font-inter-tight and --font-jetbrains-mono. Inter itself comes from the root layout. */
export const nightRideFonts = `${interTight.variable} ${jetbrainsMono.variable}`;
