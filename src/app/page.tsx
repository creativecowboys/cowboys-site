import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Creative Cowboys — No-Fluff Digital Marketing Agency for the Southeast",
  description:
    "Creative Cowboys is a West Georgia digital marketing agency. Custom web design, local SEO, PPC, and brand strategy, wrapped in a vintage indie-brutalist style.",
  alternates: {
    canonical: "https://www.creativecowboys.co",
  },
  openGraph: {
    title: "Creative Cowboys — No-Fluff Digital Marketing Agency for the Southeast",
    description:
      "Creative Cowboys is a West Georgia digital marketing agency. Custom web design, local SEO, PPC, and brand strategy, wrapped in a vintage indie-brutalist style.",
    url: "https://www.creativecowboys.co",
    siteName: "Creative Cowboys",
    type: "website",
    images: [
      {
        url: "/Main%20logo%202.png",
        width: 1200,
        height: 630,
        alt: "Creative Cowboys — Digital Marketing Agency",
      },
    ],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
