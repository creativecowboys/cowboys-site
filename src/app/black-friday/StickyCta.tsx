"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/night-ride/icons";

/** Phone-only bar pinned to the bottom of the screen. It slides away while the form is on screen. */
export default function StickyCta() {
    const [off, setOff] = useState(true);

    useEffect(() => {
        const form = document.getElementById("claim");
        // Without the form or the observer the bar stays hidden; the page's own buttons still work.
        if (!form || !("IntersectionObserver" in window)) return;
        const io = new IntersectionObserver(([e]) => setOff(e.isIntersecting), { threshold: 0.15 });
        io.observe(form);
        return () => io.disconnect();
    }, []);

    return (
        <div className={`sticky${off ? " off" : ""}`}>
            <a href="#claim" className="btn btn-primary btn-block" tabIndex={off ? -1 : 0}>
                Claim my free website <ArrowRight />
            </a>
        </div>
    );
}
