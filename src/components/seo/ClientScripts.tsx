"use client";

import dynamic from "next/dynamic";

const MobileStickyCTA = dynamic(() => import("./MobileStickyCTA"), {
  ssr: false,
});
const CTAEventListener = dynamic(() => import("../web-design/CTAEventListener"), {
  ssr: false,
});

export default function ClientScripts() {
  return (
    <>
      <MobileStickyCTA />
      <CTAEventListener />
    </>
  );
}
