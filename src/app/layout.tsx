import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative Cowboys Media | Creative Web Agency",
  description:
    "Creative Cowboys Media is a creative web agency specializing in stunning digital experiences, branding, and web development.",
};

export const viewport: Viewport = {
  themeColor: "#c8dff0",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#c8dff0" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#c8dff0]`}
      >
        <ScrollToTop />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
