"use client";

import dynamic from "next/dynamic";

const MobileStickyCTA = dynamic(() => import("./MobileStickyCTA"), {
  ssr: false,
});
const CTAEventListener = dynamic(() => import("./CTAEventListener"), {
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
