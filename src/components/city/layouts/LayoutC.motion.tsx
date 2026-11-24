"use client";

import { useEffect, useState } from "react";

/**
 * Phone-only sticky call bar for Layout C. Slides up once the hero has scrolled
 * out of view. While hidden it is inert, so keyboard users never tab into it.
 */
export function StickyCallBar({
  heroId,
  formId,
  offer,
  tel,
}: {
  heroId: string;
  formId: string;
  offer: string;
  tel: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [heroId]);

  return (
    <div
      inert={!show}
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#0B0B0B] text-white border-t-2 border-[#F15A29] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2 px-4 h-16">
        <p className="flex-1 min-w-0 font-(family-name:--fc-mono) text-[11px] leading-tight uppercase tracking-[0.12em] text-white/85">
          {offer}
        </p>
        <a
          href={`tel:${tel}`}
          className="shrink-0 inline-flex items-center h-11 px-4 bg-[#F15A29] text-[#0B0B0B] font-(family-name:--fc-display) font-black uppercase text-sm tracking-wide focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Call
        </a>
        <a
          href={`#${formId}`}
          className="shrink-0 inline-flex items-center h-11 px-4 bg-white text-[#0B0B0B] font-(family-name:--fc-display) font-black uppercase text-sm tracking-wide focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F15A29]"
        >
          Get plan
        </a>
      </div>
    </div>
  );
}
