import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Digital Marketing Services for Small Businesses in West Georgia | Creative Cowboys",
    description:
        "Explore Creative Cowboys' full suite of digital marketing services — SEO, PPC, web design, social media ads & branding — tailored for small businesses across West Georgia and Atlanta.",
    alternates: { canonical: "/services" },
    openGraph: {
        title: "Digital Marketing Services for Small Businesses in West Georgia | Creative Cowboys",
        description:
            "SEO, PPC, web design, social media ads & brand strategy for small businesses in West Georgia. Based in Villa Rica, GA.",
    },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
