"use client";

import { useEffect, useRef, useState } from "react";

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

/**
 * Inline Calendly scheduler. Loads Calendly's widget script once and lets it
 * upgrade the placeholder div. If the script is blocked, the fallback link
 * underneath still gets people to the booking page.
 */
export default function CalendlyEmbed({ url }: { url: string }) {
    const host = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
        const s = document.createElement("script");
        s.src = WIDGET_SRC;
        s.async = true;
        s.onerror = () => setFailed(true);
        document.body.appendChild(s);
    }, []);

    const src = `${url}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1&background_color=ffffff&text_color=0a0a0a&primary_color=b5330e`;

    return (
        <div className="bg-white border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a]">
            {!failed && (
                <div
                    ref={host}
                    className="calendly-inline-widget"
                    data-url={src}
                    style={{ minWidth: 320, height: 700 }}
                />
            )}
            {failed && (
                <div className="p-8 text-center font-inter text-sm">
                    The scheduler didn&rsquo;t load.{" "}
                    <a href={url} className="underline text-[#B5330E]" rel="noopener">
                        Open it in a new tab instead
                    </a>
                    .
                </div>
            )}
        </div>
    );
}
