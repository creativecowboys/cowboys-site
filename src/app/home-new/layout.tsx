import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative Cowboys | Indie Brutalist Digital Marketing Agency",
  description:
    "Creative Cowboys is a West Georgia digital marketing agency. Custom web design, local SEO, PPC, and brand strategy, wrapped in a vintage indie-brutalist style.",
};

export default function Home3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
