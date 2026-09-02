import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk, Manrope, Anton, Inter, Lobster } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import ScrollToTop from "@/components/ScrollToTop";
import MetaPixel from "@/components/MetaPixel";
import { NAP, POSTAL_ADDRESS, SERVICE_AREA, SITE_URL, SOCIAL_PROFILES } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  preload: false,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  preload: false,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "optional",
});

// Body/UI face — used site-wide via the `font-inter` utility, so it is preloaded.
// Named --font-inter-sans, not --font-inter: the latter is the Tailwind theme key
// in globals.css, and reusing it here would make @theme inline self-referential.
const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});


// Script face for the giveaway campaign page's hand-written side-notes.
// display:optional so a slow font fetch can never hold up first paint on a
// page it only decorates.
const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: ["400"],
  display: "optional",
});


export const metadata: Metadata = {
  title: {
    default: "Digital Marketing Agency for the Southeast | Creative Cowboys",
    template: "%s | Creative Cowboys",
  },
  description:
    "Creative Cowboys is a no-fluff digital marketing agency serving small businesses across the Southeast. SEO, Google Ads, web design & branding. Villa Rica, GA roots. Free consultation.",
  metadataBase: new URL("https://www.creativecowboys.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.creativecowboys.co",
    siteName: "Creative Cowboys",
    title: "Digital Marketing Agency for the Southeast | Creative Cowboys",
    description:
      "A no-fluff digital marketing agency serving small businesses across the Southeast. SEO, Google Ads, web design & branding. Villa Rica, GA roots.",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys Media — West Georgia Digital Marketing Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Marketing Agency for the Southeast | Creative Cowboys",
    description:
      "No-fluff digital marketing for Southeast small businesses. SEO, Google Ads, web design & branding from Villa Rica, GA.",
    images: ["/Main%20logo%202.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  keywords: [
    "digital marketing agency Southeast",
    "digital marketing agency Georgia",
    "SEO company Georgia",
    "Google Ads agency Georgia",
    "web design agency Southeast",
    "marketing agency for contractors",
    "law firm marketing agency Georgia",
    "digital marketing agency Villa Rica GA",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0D0D0F",
  viewportFit: "cover",
};

// Built from src/lib/seo.ts so the NAP and service area can't drift out of sync
// with the other pages the way they did before.
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: NAP.name,
  alternateName: NAP.alternateName,
  url: SITE_URL,
  telephone: NAP.telephone,
  email: NAP.email,
  address: { ...POSTAL_ADDRESS },
  geo: {
    "@type": "GeoCoordinates",
    latitude: NAP.latitude,
    longitude: NAP.longitude,
  },
  description:
    "No-fluff digital marketing agency serving small businesses across the Southeast, with roots in West Georgia. Specializing in SEO, Google Ads (PPC), web design, social media advertising, and brand strategy for contractors, law firms, and industrial B2B.",
  priceRange: "$$",
  serviceArea: SERVICE_AREA.map((a) => ({ ...a })),
  areaServed: SERVICE_AREA.map((a) => ({ ...a })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Marketing Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "SEO Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google Ads / PPC Management" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web Design" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Social Media Advertising" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Brand Strategy" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Media Creation" } },
    ],
  },
  sameAs: [...SOCIAL_PROFILES],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#0D0D0F" }}>
      <head>
        {/*
          Search Atlas / OTTO dynamic optimization.
          Must stay a synchronous script in <head>: OTTO rewrites page content
          before render, so async/defer would let unoptimized markup paint first.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          {...{ nowprocket: "", "nitro-exclude": "" }}
          type="text/javascript"
          id="sa-dynamic-optimization"
          data-uuid="0f559ccd-afd9-4c44-983e-2998e29d8993"
          src="https://dashboard.searchatlas.com/scripts/dynamic_optimization.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${manrope.variable} ${anton.variable} ${inter.variable} ${lobster.variable} antialiased bg-[#0D0D0F]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        


        


        <MetaPixel />
        <ScrollToTop />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
