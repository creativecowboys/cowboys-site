import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Marketing Agency in West Georgia That Actually Drives Results | Creative Cowboys",
  description:
    "Creative Cowboys is West Georgia's no-fluff digital marketing agency. We help small businesses grow with SEO, PPC, web design & branding. Based in Villa Rica, GA. Free consultation.",
};

export default function Home2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
