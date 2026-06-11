"use client";

import dynamic from "next/dynamic";

const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
});

interface MobileMenuWrapperProps {
  dark?: boolean;
  serviceLinks: Array<{ name: string; href: string }>;
}

export default function MobileMenuWrapper({ dark = false, serviceLinks }: MobileMenuWrapperProps) {
  return <MobileMenu dark={dark} serviceLinks={serviceLinks} />;
}
