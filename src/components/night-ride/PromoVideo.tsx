"use client";

import { useRef, useState } from "react";
import { gaEvent } from "@/lib/analytics";
import { Corners } from "./icons";

/**
 * Video with a cover frame and one play button: upright 9:16 by default, 16:9 with `wide`. Nothing downloads until the
 * visitor presses play (`preload="none"`), and it never autoplays. Once started it shows the
 * browser's own controls. Fires GA4 `video_start` once per page view.
 */
export default function PromoVideo({ src, poster, title, length, wide = false }: { src: string; poster: string; title: string; length: string; wide?: boolean }) {
    const ref = useRef<HTMLVideoElement>(null);
    const [started, setStarted] = useState(false);

    function start() {
        const v = ref.current;
        if (!v) return;
        setStarted(true);
        gaEvent("video_start", { video_title: title });
        void v.play().catch(() => {
            // Playback blocked: the native controls are showing now, so the visitor can press play there.
        });
    }

    return (
        <div className={`player vf${wide ? " wide" : ""}${started ? " on" : ""}`}>
            <Corners />
            <video ref={ref} src={src} poster={poster} preload="none" playsInline controls={started} aria-label={title} />
            {!started && (
                <button type="button" className="play" onClick={start} aria-label={`Play video: ${title}`}>
                    <i aria-hidden="true" />
                    Watch · {length}
                </button>
            )}
        </div>
    );
}
