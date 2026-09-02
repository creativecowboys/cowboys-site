"use client";

import { useEffect, useState } from "react";
import type { Phase } from "@/lib/giveaway";
import { GIVEAWAY_CLOSED_EVENT } from "./events";

const pad = (n: number) => String(n).padStart(2, "0");

const CAPTION: Record<Phase, string> = {
    open: "UNTIL ENTRIES CLOSE · WINNER ANNOUNCED SEPT 25",
    closed: "ENTRIES CLOSED · WINNER ANNOUNCED SEPT 25",
    winner: "ENTRIES CLOSED · WINNER ANNOUNCED — CHECK OUR SOCIALS",
};

type Parts = { d: string; h: string; m: string; s: string };
const ZERO: Parts = { d: "00", h: "00", m: "00", s: "00" };

export default function Countdown({ deadlineIso, phase }: { deadlineIso: string; phase: Phase }) {
    // Render dashes on the server and on first paint. Computing the real value
    // during SSR would guarantee a hydration mismatch, since the server's "now"
    // is always a second or two behind the browser's.
    const [ticking, setTicking] = useState<Parts | null>(null);
    const [closedLive, setClosedLive] = useState(false);

    // Derived, not stored: outside the open phase the clock is simply zero, and
    // there is nothing for an effect to synchronise.
    const parts = phase === "open" ? ticking : ZERO;
    const caption = phase === "open" && closedLive ? CAPTION.closed : CAPTION[phase];

    useEffect(() => {
        if (phase !== "open") return;

        const deadline = new Date(deadlineIso).getTime();
        let timer: ReturnType<typeof setTimeout> | undefined;

        const tick = () => {
            const diff = deadline - Date.now();

            if (diff <= 0) {
                setTicking(ZERO);
                setClosedLive(true);
                // Tell the form card to flip to its closed state. The server
                // also refuses at /api/giveaway, so this is presentation only.
                window.dispatchEvent(new CustomEvent(GIVEAWAY_CLOSED_EVENT));
                return;
            }

            setTicking({
                d: pad(Math.floor(diff / 864e5)),
                h: pad(Math.floor((diff % 864e5) / 36e5)),
                m: pad(Math.floor((diff % 36e5) / 6e4)),
                s: pad(Math.floor((diff % 6e4) / 1e3)),
            });
            timer = setTimeout(tick, 1000);
        };

        timer = setTimeout(tick, 0);
        return () => clearTimeout(timer);
    }, [deadlineIso, phase]);

    const units: Array<[string, keyof Parts]> = [
        ["DAYS", "d"],
        ["HOURS", "h"],
        ["MINUTES", "m"],
        ["SECONDS", "s"],
    ];

    return (
        <>
            <div className="flex gap-2 sm:gap-3 mt-8" aria-live="polite">
                {units.map(([label, key]) => (
                    <div
                        key={key}
                        className="bg-white border-[2.5px] border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a] pt-3 pb-2.5 flex-1 sm:flex-none sm:w-[92px] text-center"
                    >
                        <div className="font-anton text-[28px] sm:text-[34px] leading-none">
                            {parts ? parts[key] : "--"}
                        </div>
                        <div className="font-anton text-[9px] tracking-[2px] text-[#B5330E] mt-1.5">{label}</div>
                    </div>
                ))}
            </div>
            <div className="font-anton text-[11px] tracking-[2px] mt-3 text-[#5a5a5a]">{caption}</div>
        </>
    );
}
