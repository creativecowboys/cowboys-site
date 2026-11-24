"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Draws the route line once when the map scrolls into view.
 * Server render shows the finished map, so no-JS and reduced-motion visitors
 * always see the whole route. JS only "arms" it (hides the line) when it is
 * safe to animate, then draws it on first intersection.
 */
export function RouteDraw({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "armed" | "drawn">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setState("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          // Let the armed state paint first so the transition has a start point.
          void el.getBoundingClientRect();
          window.setTimeout(() => setState("drawn"), 60);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-route={state} className={className}>
      {children}
    </div>
  );
}
