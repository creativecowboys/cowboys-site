"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface MobileMenuProps {
  dark?: boolean;
  serviceLinks: Array<{ name: string; href: string }>;
}

export default function MobileMenu({ dark = false, serviceLinks }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const hamburgerClass = dark
    ? "text-white hover:text-h3-red"
    : "text-[#0a0a0a] hover:text-[#B5330E]";

  return (
    <>
      {/* Hamburger Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setOpen(!open)}
          className={`${hamburgerClass} transition-colors duration-200 cursor-pointer`}
          aria-label="Toggle Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Full-Screen Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 top-[110px] bg-[#F2EBDA] border-t-2 border-[#0a0a0a] py-8 px-6 flex flex-col justify-between font-h3-display text-3xl uppercase tracking-widest text-[#0a0a0a] z-50 overflow-y-auto">
          <div className="flex flex-col gap-6 text-left">
            {/* Expandable Services list */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-h3-secondary font-bold tracking-widest text-neutral-400">Services</span>
              <div className="flex flex-col gap-2 pl-4 text-2xl">
                {serviceLinks.map((link) => (
                  <Link
                    prefetch={false}
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="hover:text-[#B5330E] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-[#0a0a0a]/10 my-2" />

            <Link
              prefetch={false}
              href="/results"
              onClick={() => setOpen(false)}
              className="hover:text-[#B5330E] transition-colors"
            >
              Work
            </Link>
            <Link
              prefetch={false}
              href="/about"
              onClick={() => setOpen(false)}
              className="hover:text-[#B5330E] transition-colors"
            >
              About
            </Link>
            <Link
              prefetch={false}
              href="/blog"
              onClick={() => setOpen(false)}
              className="hover:text-[#B5330E] transition-colors"
            >
              Blog
            </Link>
            <Link
              prefetch={false}
              href="/franklin-tn/web-design"
              onClick={() => setOpen(false)}
              className="text-[#B5330E] hover:text-[#0a0a0a] transition-colors"
            >
              Franklin, TN
            </Link>
          </div>

          <div className="pt-8 pb-4">
            <Link
              prefetch={false}
              href="/contact"
              onClick={() => setOpen(false)}
              className="h3-btn-brutalist w-full border-[2.5px] border-[#0a0a0a] bg-[#B5330E] text-white font-bold py-4 uppercase tracking-wider text-base inline-flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0a0a0a]"
            >
              Get A Proposal <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
