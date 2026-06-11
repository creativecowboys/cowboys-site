"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t-2 border-[#B5330E] py-3 px-4 flex justify-between items-center md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3 flex-1">
        <a 
          href="tel:4702437517" 
          data-track="seo_sticky_call"
          className="flex-1 text-center border border-[#F2EBDA]/20 text-[#F2EBDA] font-anton uppercase text-xs tracking-wider py-2.5 hover:bg-neutral-900 transition-colors"
        >
          CALL NOW
        </a>
        <Link 
          prefetch={false}
          href="/contact" 
          data-track="seo_sticky_proposal"
          className="flex-1 text-center bg-[#B5330E] text-white font-anton uppercase text-xs tracking-wider py-2.5 border border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
        >
          GET A PROPOSAL
        </Link>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="text-white hover:text-[#B5330E] ml-4 cursor-pointer focus:outline-none"
        aria-label="Dismiss sticky CTA"
      >
        <X size={20} />
      </button>
    </div>
  );
}
