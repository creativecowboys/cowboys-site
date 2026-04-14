import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0D0D0F",
  viewportFit: "cover",
};

/**
 * Landing pages have their own sticky header + minimal footer,
 * so we bypass the main site TopBar / FloatingNav.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
