"use client";

import Script from "next/script";

const FORM_EMBED_SRC = "https://link.msgsndr.com/js/form_embed.js";

/**
 * Inline GoHighLevel booking widget. The iframe is the scheduler; GHL's
 * form_embed.js resizes it to the calendar. The frame is the same bordered
 * card the previous scheduler used.
 */
export default function BookingEmbed({ url }: { url: string }) {
    const id = "cowboys-onboarding-call-30min";

    return (
        <div className="bg-white border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] overflow-hidden min-h-[700px]">
            <iframe
                src={url}
                id={id}
                title="Book your onboarding call"
                scrolling="no"
                className="block w-full max-w-full border-0"
                style={{ width: "100%", height: 700, overflow: "hidden" }}
            />
            <Script src={FORM_EMBED_SRC} strategy="afterInteractive" />
        </div>
    );
}
