import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk, Manrope, Anton } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import ScrollToTop from "@/components/ScrollToTop";

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


export const metadata: Metadata = {
  title: {
    default: "Digital Marketing Agency in West Georgia That Actually Drives Results | Creative Cowboys",
    template: "%s | Creative Cowboys",
  },
  description:
    "Creative Cowboys is West Georgia's no-fluff digital marketing agency. We help small businesses grow with SEO, PPC, web design & branding. Based in Villa Rica, GA. Free consultation.",
  metadataBase: new URL("https://www.creativecowboys.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.creativecowboys.co",
    siteName: "Creative Cowboys",
    title: "Digital Marketing Agency in West Georgia That Actually Drives Results | Creative Cowboys",
    description:
      "Creative Cowboys is West Georgia's no-fluff digital marketing agency. We help small businesses grow with SEO, PPC, web design & branding. Based in Villa Rica, GA.",
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
    title: "Digital Marketing Agency in West Georgia | Creative Cowboys",
    description:
      "No-fluff digital marketing for West Georgia small businesses. SEO, PPC, web design & branding from Villa Rica, GA.",
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
    "digital marketing agency West Georgia",
    "digital marketing agency Villa Rica GA",
    "SEO company West Georgia",
    "Google Ads agency West Georgia",
    "web design West Georgia",
    "small business marketing West Georgia",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0D0D0F",
  viewportFit: "cover",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "Creative Cowboys Media",
  url: "https://www.creativecowboys.co",
  telephone: "+1-470-243-7517",
  email: "howdy@creativecowboys.co",
  address: {
    "@type": "PostalAddress",
    streetAddress: "222 West Montgomery St",
    addressLocality: "Villa Rica",
    addressRegion: "GA",
    postalCode: "30180",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.7327,
    longitude: -84.9182,
  },
  description:
    "No-fluff digital marketing agency serving small businesses in West Georgia. Specializing in SEO, Google Ads (PPC), web design, social media advertising, and brand strategy.",
  priceRange: "$$",
  serviceArea: [
    { "@type": "City", name: "Villa Rica" },
    { "@type": "City", name: "Carrollton" },
    { "@type": "City", name: "Douglasville" },
    { "@type": "City", name: "Newnan" },
    { "@type": "City", name: "Bremen" },
    { "@type": "City", name: "Dallas" },
    { "@type": "AdministrativeArea", name: "West Georgia" },
    { "@type": "City", name: "Atlanta" },
  ],
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
  sameAs: [
    "https://www.facebook.com/creativecowboys",
    "https://www.instagram.com/creativecowboysmedia",
  ],
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
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${manrope.variable} ${anton.variable} antialiased bg-[#0D0D0F]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        


        


        <ScrollToTop />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
