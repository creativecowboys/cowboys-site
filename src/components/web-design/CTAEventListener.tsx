"use client";

import { useEffect } from "react";

export default function CTAEventListener() {
  useEffect(() => {
    const handleTracking = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-track]");
      if (target) {
        const eventName = target.getAttribute("data-track");
        if (eventName) {
          if (typeof window !== "undefined") {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
              event: eventName,
            });
            console.log(`GA4 Event tracked via data-track attribute: ${eventName}`);
          }
        }
      }
    };

    document.addEventListener("click", handleTracking);
    return () => {
      document.removeEventListener("click", handleTracking);
    };
  }, []);

  return null;
}
