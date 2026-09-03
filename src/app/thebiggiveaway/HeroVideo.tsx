"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { gaEvent } from "@/lib/analytics";
import { GIVEAWAY_START_EVENT } from "./events";

const MQ = "(prefers-reduced-motion: reduce)";

/** How long after load before the video unmutes itself. */
const UNMUTE_DELAY_MS = 2000;

/** Grace period for spotting a browser that punished the unmute by pausing. */
const UNMUTE_VERIFY_MS = 300;

function subscribeMotion(cb: () => void) {
    const mq = window.matchMedia(MQ);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}

/** Server never knows the preference, so it renders as "no reduction" and hydrates. */
function useReducedMotion() {
    return useSyncExternalStore(
        subscribeMotion,
        () => window.matchMedia(MQ).matches,
        () => false,
    );
}

/**
 * Hero campaign video — it walks people through how to enter, so it is meant
 * to start with sound.
 *
 * WHAT THE BROWSER ALLOWS. Sound-on autoplay is refused until a visitor has
 * earned it on this origin (Chrome's Media Engagement Index, Safari's per-site
 * setting), and a refused unmuted play() does not degrade to muted — it simply
 * does not play. So the order is: try with sound; if refused, play muted and
 * unmute on the first gesture the browser will accept.
 *
 * The gesture listener deliberately does NOT use { once: true }. An early
 * pointer event — a click during load, before the browser has settled the
 * autoplay decision — would consume a one-shot listener on a no-op and leave
 * the video muted forever with no second chance. It now keeps listening until
 * it has actually unmuted something.
 */
export default function HeroVideo({ gated = false }: { gated?: boolean }) {
    const ref = useRef<HTMLVideoElement>(null);
    /**
     * Cleared by the intro gate's "Get Started" press. While the gate is up the
     * video holds at its poster: starting muted behind the overlay and unmuting
     * later would throw away the one thing the gate buys us — a real gesture to
     * start playback with sound, from the top.
     */
    const [started, setStarted] = useState(!gated);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [showControls, setShowControls] = useState(false);
    /** Set once the visitor works the sound control themselves — their call wins. */
    const manualSound = useRef(false);
    /**
     * Whether the browser has actually ruled on sound-on autoplay yet.
     *
     * play() settles asynchronously, and until it does the element reads as
     * unmuted only because we optimistically set it that way. A gesture
     * arriving inside that window must not be mistaken for "sound already
     * works" — that is what previously stood the video down with no listener
     * left to recover it.
     */
    const autoplaySettled = useRef(false);
    const reduceMotion = useReducedMotion();

    // The gate's click is a user gesture, so this is the one path where sound
    // is guaranteed rather than attempted.
    useEffect(() => {
        if (!gated) return;
        const onStart = () => {
            const v = ref.current;
            setStarted(true);
            if (!v) return;
            v.muted = false;
            setMuted(false);
            try {
                v.currentTime = 0; // start from the top, not from a buffered offset
            } catch {
                /* Not seekable yet — playing from wherever it is beats not playing. */
            }
            // Called synchronously inside the click's task, so activation holds.
            v.play()
                .then(() => gaEvent("giveaway_video_autoplay", { sound: "on", via: "intro_gate" }))
                .catch(() => setPlaying(false));
        };
        window.addEventListener(GIVEAWAY_START_EVENT, onStart);
        return () => window.removeEventListener(GIVEAWAY_START_EVENT, onStart);
    }, [gated]);

    // Try with sound; fall back to muted playback rather than a dead frame.
    useEffect(() => {
        const v = ref.current;
        if (!v || !started) return;
        if (reduceMotion) {
            autoplaySettled.current = true;
            return;
        }

        let cancelled = false;
        v.muted = false;
        v.play()
            .then(() => {
                if (cancelled) return;
                autoplaySettled.current = true;
                setMuted(false);
                gaEvent("giveaway_video_autoplay", { sound: "on" });
            })
            .catch(() => {
                if (cancelled) return;
                v.muted = true;
                autoplaySettled.current = true;
                setMuted(true);
                v.play().catch(() => {
                    /* Muted autoplay refused too — the play overlay covers it. */
                });
                gaEvent("giveaway_video_autoplay", { sound: "blocked" });
            });

        return () => {
            cancelled = true;
        };
    }, [reduceMotion, started]);

    // Timed unmute: UNMUTE_DELAY_MS after load, turn the sound on by itself.
    //
    // A timer is NOT user activation, so a browser that refused sound-on
    // autoplay will refuse this too — and Chrome's way of refusing is to pause
    // the video the moment it is unmuted. Unmuting blind would therefore trade
    // a silent video for a stopped one. So the attempt is made and then
    // verified: if playback died, the mute is put back and the video resumes,
    // leaving the gesture listener below to catch it instead.
    useEffect(() => {
        if (reduceMotion || !started) return;

        let verifyTimer: ReturnType<typeof setTimeout> | undefined;

        const timer = setTimeout(() => {
            const v = ref.current;
            if (!v || manualSound.current || !v.muted || v.paused) return;

            v.muted = false;
            setMuted(false);
            gaEvent("giveaway_video_unmute", { trigger: "timer" });

            verifyTimer = setTimeout(() => {
                if (!v.paused) return; // sound is on and it kept playing
                // The browser stopped playback rather than allow the audio.
                v.muted = true;
                setMuted(true);
                void v.play().catch(() => {});
                gaEvent("giveaway_video_unmute_reverted", { trigger: "timer" });
            }, UNMUTE_VERIFY_MS);
        }, UNMUTE_DELAY_MS);

        return () => {
            clearTimeout(timer);
            clearTimeout(verifyTimer);
        };
    }, [reduceMotion, started]);

    // Fallback for when the timed attempt was refused: unmute at the first
    // gesture the browser will honour, and keep trying until it sticks.
    useEffect(() => {
        const events = ["pointerdown", "keydown", "touchstart"] as const;
        const opts: AddEventListenerOptions = { capture: true, passive: true };

        const stop = () => events.forEach((e) => document.removeEventListener(e, attempt, opts));

        function attempt() {
            const v = ref.current;
            if (!v) return;
            if (manualSound.current) {
                stop();
                return;
            }
            // Decision still pending — stay armed rather than burning the
            // listener on a state that is about to change.
            if (!autoplaySettled.current) return;
            // Sound is already on — nothing to do, but stay armed rather than
            // tearing down. The timed attempt can unmute and then be reverted
            // ~300ms later; a listener that stood down inside that window would
            // leave the video muted with nothing left to recover it.
            if (!v.muted) return;
            v.muted = false;
            setMuted(false);
            // Chrome pauses a muted-autoplayed video the instant it is unmuted.
            // We are inside a real gesture here, so playback can be re-asserted.
            void v.play().catch(() => {});
            gaEvent("giveaway_video_unmute", { trigger: "first_gesture" });
            stop();
        }

        events.forEach((e) => document.addEventListener(e, attempt, opts));
        return stop;
    }, []);

    const play = () => {
        const v = ref.current;
        if (!v) return;
        // A click is a user gesture, so sound is allowed from here.
        v.muted = false;
        setMuted(false);
        v.play().catch(() => setPlaying(false));
    };

    const toggleSound = () => {
        const v = ref.current;
        if (!v) return;
        manualSound.current = true;
        const next = !v.muted;
        v.muted = next;
        setMuted(next);
        if (!next) {
            void v.play().catch(() => {});
            gaEvent("giveaway_video_unmute", { trigger: "button" });
        }
    };

    return (
        <div className="relative">
            <div className="relative bg-[#0a0a0a] border-[3px] border-[#0a0a0a] shadow-[10px_10px_0px_#0a0a0a] lg:rotate-[1.2deg]">
                <video
                    ref={ref}
                    className="block w-full aspect-video bg-[#0a0a0a]"
                    poster="/video/dave-at-desk-poster.jpg"
                    // playsInline is what stops iOS taking the video fullscreen.
                    playsInline
                    preload="auto"
                    controls={showControls}
                    onPlay={() => setPlaying(true)}
                    onPlaying={() => setPlaying(true)}
                    // Autoplay can start while the document is still parsing, so
                    // `playing` may fire before React hydrates and attaches these
                    // handlers, leaving the overlay stuck over a running video.
                    // timeupdate recovers that missed transition.
                    onTimeUpdate={(e) => {
                        if (!playing && !e.currentTarget.paused) setPlaying(true);
                    }}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setShowControls(true)}
                >
                    <source src="/video/dave-at-desk.webm" type="video/webm" />
                    <source src="/video/dave-at-desk.mp4" type="video/mp4" />
                    Your browser can&rsquo;t play this video.{" "}
                    <a href="/video/dave-at-desk.mp4" className="underline">
                        Download it instead
                    </a>
                    .
                </video>

                {/* Play overlay — autoplay refused outright, or reduced motion. */}
                {!playing && (
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

                {/* Small sound toggle, bottom-right. Neutral cream while sound is
                    on (its job is muting); yellow while muted, so the one case
                    that needs a click still reads as needing one. */}
                {playing && !showControls && (
                    <button
                        type="button"
                        onClick={toggleSound}
                        aria-label={muted ? "Unmute video" : "Mute video"}
                        aria-pressed={!muted}
                        title={muted ? "Unmute" : "Mute"}
                        className={`absolute z-10 bottom-3 right-3 w-10 h-10 flex items-center justify-center border-[2.5px] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] cursor-pointer transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0a0a0a] ${
                            muted ? "bg-[#F5C842] text-[#0a0a0a]" : "bg-[#F2EBDA] text-[#0a0a0a]"
                        }`}
                    >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
}
