"use client";

import { useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { gaEvent } from "@/lib/analytics";

/**
 * The message from Josh and Dave at the top of the offer page.
 *
 * Deliberately simpler than the giveaway hero video: it starts on a click, with
 * sound, from the top. People arrive here from an email, so they're already
 * paying attention; a video that autoplays muted under their scrolling thumb
 * would waste the one thing we want them to hear.
 */
export default function OfferVideo({
    mp4,
    webm,
    poster,
    available,
}: {
    mp4: string;
    webm: string;
    poster: string;
    available: boolean;
}) {
    const ref = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [ended, setEnded] = useState(false);

    const play = () => {
        const v = ref.current;
        if (!v) return;
        v.muted = false;
        setMuted(false);
        setEnded(false);
        v.play()
            .then(() => gaEvent("local_max_offer_video_play"))
            .catch(() => setPlaying(false));
    };

    const toggleSound = () => {
        const v = ref.current;
        if (!v) return;
        const next = !v.muted;
        v.muted = next;
        setMuted(next);
    };

    const frame =
        "relative bg-[#0a0a0a] border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] lg:rotate-[1.2deg]";

    if (!available) {
        // Until the video files land in /public/video this holds the space so
        // the layout can be reviewed as it will ship.
        return (
            <div className={frame}>
                <div className="aspect-video w-full flex flex-col items-center justify-center gap-3 text-center px-8">
                    <span className="flex items-center justify-center w-16 h-16 border-[2.5px] border-[#F2EBDA] text-[#F2EBDA]">
                        <Play size={26} fill="currentColor" />
                    </span>
                    <span className="font-anton text-[#F2EBDA] text-xl tracking-[1px] uppercase">
                        A quick word from Josh &amp; Dave
                    </span>
                    <span className="font-inter text-[#F2EBDA]/60 text-sm">Video coming soon</span>
                </div>
            </div>
        );
    }

    return (
        <div className={frame}>
            <video
                ref={ref}
                className="block w-full aspect-video bg-[#0a0a0a]"
                poster={poster}
                playsInline
                preload="metadata"
                controls={ended}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                    setPlaying(false);
                    setEnded(true);
                    gaEvent("local_max_offer_video_complete");
                }}
            >
                <source src={webm} type="video/webm" />
                <source src={mp4} type="video/mp4" />
                Your browser can&rsquo;t play this video.{" "}
                <a href={mp4} className="underline">
                    Download it instead
                </a>
                .
            </video>

            {!playing && !ended && (
                <button
                    type="button"
                    onClick={play}
                    aria-label="Play video with sound"
                    className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/35 hover:bg-[#0a0a0a]/25 transition-colors cursor-pointer"
                >
                    <span className="flex items-center gap-2.5 bg-[#B5330E] text-white font-anton text-sm tracking-[1.5px] px-6 py-4 border-[2.5px] border-[#F2EBDA] shadow-[4px_4px_0px_#0a0a0a]">
                        <Play size={18} fill="currentColor" /> PLAY WITH SOUND
                    </span>
                </button>
            )}

            {playing && (
                <button
                    type="button"
                    onClick={toggleSound}
                    aria-label={muted ? "Unmute video" : "Mute video"}
                    aria-pressed={!muted}
                    className={`absolute z-10 bottom-3 right-3 w-10 h-10 flex items-center justify-center border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] cursor-pointer ${
                        muted ? "bg-[#F5C842] text-[#0a0a0a]" : "bg-[#F2EBDA] text-[#0a0a0a]"
                    }`}
                >
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            )}
        </div>
    );
}
