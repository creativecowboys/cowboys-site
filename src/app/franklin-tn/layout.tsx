import type { Metadata } from "next";

// Title omits the brand — the root layout's template already appends
// "| Creative Cowboys". Including it here rendered it twice.
export const metadata: Metadata = {
  title: "Web Design & Digital Marketing in Franklin, TN",
  description:
    "Creative Cowboys builds websites, SEO, and ad campaigns for Franklin and Williamson County businesses. Villa Rica, GA roots — now with a Franklin, TN office.",
};

export default function FranklinLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#F4F2F0] text-neutral-900 font-body min-h-screen selection:bg-[#F26522] selection:text-white">
      {/* 
        This wrapper enforces the light theme (#F4F2F0 background)
        and resets text color for the Franklin TN landing pages,
        overriding the global dark theme (#0D0D0F) for this section.
      */}
      {children}
    </div>
  );
}
