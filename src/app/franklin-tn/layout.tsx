import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Franklin, TN - Creative Cowboys",
  description: "Web Design, SEO, and Digital Marketing for Franklin, TN businesses.",
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
