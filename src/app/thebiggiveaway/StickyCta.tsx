"use client";

import { useEffect, useState } from "react";
import TrackedCta from "./TrackedCta";
import { useHasEntered } from "./useEntered";

/**
 * Mobile-only sticky CTA (§4.12). Hidden when the entry form is on screen,
 * once the visitor has entered, and in the closed/winner phases — a bar
 * shouting ENTER TO WIN over a closed form would be worse than no bar.
 */
export default function StickyCta() {
    const [formVisible, setFormVisible] = useState(false);
    const entered = useHasEntered();

    useEffect(() => {
        const target = document.getElementById("enter");
        if (!target) return;

        const observer = new IntersectionObserver(
            ([e]) => setFormVisible(e.isIntersecting),
            { rootMargin: "-10% 0px -10% 0px" },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    if (formVisible || entered) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#0a0a0a] px-3.5 py-2.5">
            <TrackedCta
                position="sticky"
                href="#enter"
                className="block text-center bg-[#B5330E] text-white font-anton text-[13px] tracking-[1.5px] py-3.5 border-[2.5px] border-[#F2EBDA]"
            >
                ENTER TO WIN — FREE →
            </TrackedCta>
        </div>
    );
}
