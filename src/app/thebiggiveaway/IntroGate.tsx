"use client";

import { useEffect, useRef, useState } from "react";
import { gaEvent } from "@/lib/analytics";
import { GIVEAWAY_START_EVENT } from "./events";

/** Native size of the hero photograph — the CTA coordinates are relative to it. */
const HERO_W = 5056;
const HERO_H = 3392;

/**
 * CTA placement, as supplied with the artwork (README.txt):
 * left 2013px, top 1665px, width 1164px of a 5056×3392 frame.
 */
const CTA = { left: "39.81%", top: "49.09%", width: "23.02%" };

/**
 * Full-screen intro gate — the hero photograph and a neon "Enter Now".
 *
 * Still load-bearing rather than decorative: pressing Enter Now is a user
 * gesture, and a gesture is the only thing that lets the hero video start with
 * sound. Chrome and Safari refuse sound-on autoplay for a first-time visitor
 * and refuse a timer-driven unmute too.
 *
 * LAYOUT. The CTA is positioned as a percentage of the artwork, so it only
 * stays welded to the neon if it shares the image's coordinate space. A plain
 * `cover` background would crop the photo while leaving the button on the
 * untouched viewport box, and the two would drift apart. Instead an inner
 * "stage" carries the artwork's exact aspect ratio, the button is positioned
 * inside it, and the stage is centred and allowed to overflow. Cropping then
 * moves the photo and the button together.
 *
 * The width formula is what keeps it usable on a phone. At a plain 100vw a
 * portrait screen would render the CTA around 90×25px — under the 44px minimum
 * touch target, and the neon would be tiny. Scaling to at least 56vh worth of
 * artwork keeps the sign legible and the button thumb-sized, while staying
 * narrow enough that the lettering is never cropped.
 */
export default function IntroGate() {
    const [open, setOpen] = useState(true);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Move focus into the dialog (not onto the button) and stop the page
    // scrolling behind it. Focusing the button directly would trip
    // :focus-visible for every visitor, painting a keyboard focus ring over
    // the artwork on load; parking focus on the dialog keeps screen readers
    // oriented while leaving the ring for people who actually Tab to it.
    useEffect(() => {
        if (!open) return;
        dialogRef.current?.focus({ preventScroll: true });
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    // Escape dismisses — but without sound, since it isn't a click.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                gaEvent("giveaway_intro_dismissed", { method: "escape" });
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const start = () => {
        // Dispatched synchronously so HeroVideo calls play() inside this same
        // task, while the click still counts as user activation. An await or a
        // setTimeout here would lose the permission and mute the video.
        window.dispatchEvent(new CustomEvent(GIVEAWAY_START_EVENT));
        gaEvent("giveaway_intro_start", { source: "christmas-in-september" });
        setOpen(false);
    };

    if (!open) return null;

    return (
        <>
            <noscript>
                {/* Nothing could dismiss this without JS, so hide it rather than
                    wall off the page. */}
                <style>{`#giveaway-intro-gate{display:none !important}`}</style>
            </noscript>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .gate-stage{
          position:relative;
          aspect-ratio:${HERO_W} / ${HERO_H};
          width:max(100vw, calc(56vh * ${HERO_W} / ${HERO_H}));
          flex:none;
        }
        .gate-cta{
          position:absolute;
          display:block;
          line-height:0;
          cursor:pointer;
          background:none;
          border:0;
          padding:0;
          transition:transform .25s ease, filter .25s ease;
          animation:gateFlicker 6s infinite;
        }
        /* Expands the touch target past the artwork without moving it. */
        .gate-cta::after{content:'';position:absolute;inset:-16px -12px;}
        .gate-cta img{width:100%;height:auto;display:block;}
        .gate-cta:hover,.gate-cta:focus-visible{
          transform:translateX(1.5%) scale(1.04);
          filter:brightness(1.15) drop-shadow(0 0 18px rgba(255,170,80,.9));
          animation:none;
        }
        .gate-cta:focus-visible{outline:3px solid #F5C842;outline-offset:10px;}
        .gate-cta:active{transform:translateX(1.5%) scale(.99);}
        @keyframes gateFlicker{
          0%,92%,100%{filter:brightness(1);}
          93%{filter:brightness(.82);}
          94%{filter:brightness(1.08);}
          96%{filter:brightness(.9);}
        }
        @media (prefers-reduced-motion: reduce){
          .gate-cta{animation:none;}
          .gate-cta:hover,.gate-cta:focus-visible{transform:none;}
        }
      `,
                }}
            />

            <div
                id="giveaway-intro-gate"
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="The Big Giveaway"
                className="fixed inset-0 z-[100] bg-[#1a1210] overflow-hidden flex items-center justify-center outline-none"
            >
                <div className="gate-stage">
                    {/* Explicit media-based sources rather than srcset + sizes.
                        The stage is deliberately wider than the viewport on a
                        phone (see the width formula above), so `sizes` in viewport
                        units mis-describes the slot and had phones pulling the
                        2560px file — 408KB where 168KB is plenty, and a needless
                        downscale of a 4.4MP image on the weakest hardware. */}
                    <picture>
                        <source
                            media="(max-width: 820px)"
                            type="image/webp"
                            srcSet="/giveaway/gate-bg-1440.webp"
                        />
                        <source type="image/webp" srcSet="/giveaway/gate-bg-1920.webp" />
                        <img
                            src="/giveaway/gate-bg-1920.jpg"
                            alt=""
                            // First paint of the whole visit — tell the browser so.
                            fetchPriority="high"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover select-none"
                            draggable={false}
                        />
                    </picture>

                    <button
                        type="button"
                        onClick={start}
                        aria-label="Enter the Big Giveaway"
                        className="gate-cta"
                        style={{ left: CTA.left, top: CTA.top, width: CTA.width }}
                    >
                        <picture>
                            <source type="image/webp" srcSet="/giveaway/gate-cta.webp" />
                            <img src="/giveaway/gate-cta.png" alt="" draggable={false} />
                        </picture>
                    </button>
                </div>
            </div>
        </>
    );
}
