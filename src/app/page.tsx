import type { Metadata } from "next";
import HomeEffects from "@/components/night-ride/HomeEffects";
import HomeNightRide from "@/components/night-ride/HomeNightRide";
import { CHAT_WIDGET } from "@/lib/chat-widget";

export const metadata: Metadata = {
  title: "Creative Cowboys — No-Fluff Digital Marketing Agency for the Southeast",
  description:
    "Creative Cowboys builds websites, runs local SEO and manages Google and Facebook ads for small businesses across the Southeast. Based in Villa Rica, Georgia. Free proposal.",
  alternates: {
    canonical: "https://www.creativecowboys.co",
  },
  openGraph: {
    title: "Creative Cowboys — No-Fluff Digital Marketing Agency for the Southeast",
    description:
      "Creative Cowboys builds websites, runs local SEO and manages Google and Facebook ads for small businesses across the Southeast. Based in Villa Rica, Georgia. Free proposal.",
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
  return (
    <>
      <HomeNightRide />
      <HomeEffects />
      {/* GHL chat widget (A2P SMS opt-in). Server-rendered so the tag is in the page HTML. */}
      <script
        id={CHAT_WIDGET.id}
        src={CHAT_WIDGET.src}
        data-resources-url={CHAT_WIDGET.resourcesUrl}
        data-widget-id={CHAT_WIDGET.widgetId}
        data-source="WEB_USER"
        defer
      />
    </>
  );
}
