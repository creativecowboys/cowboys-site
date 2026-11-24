"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for Night Ride pages: any element with the `rv` class rises and de-blurs once as
 * it enters the viewport. Renders nothing. If scripting or IntersectionObserver is missing, the
 * elements are shown straight away.
 */
export default function Reveal() {
    useEffect(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>(".nr .rv"));
        if (!("IntersectionObserver" in window)) {
            els.forEach((el) => el.classList.add("in"));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        e.target.classList.add("in");
                        io.unobserve(e.target);
                    }
                }
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
    return null;
}
