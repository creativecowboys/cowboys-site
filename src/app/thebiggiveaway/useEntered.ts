"use client";

import { useSyncExternalStore } from "react";
import { GIVEAWAY_ENTERED_EVENT } from "./events";

/** 30 days (§5) — comfortably covers the whole entry window. */
export const ENTERED_FLAG = "cc_giveaway_entered";
const ENTERED_DAYS = 30;

function subscribe(onChange: () => void) {
    window.addEventListener(GIVEAWAY_ENTERED_EVENT, onChange);
    return () => window.removeEventListener(GIVEAWAY_ENTERED_EVENT, onChange);
}

function getSnapshot(): boolean {
    try {
        return (
            localStorage.getItem(ENTERED_FLAG) === "1" ||
            document.cookie.includes(`${ENTERED_FLAG}=1`)
        );
    } catch {
        // Private mode or blocked storage — treat as "not entered" and let them
        // submit again; the Sheet dedupes by email anyway.
        return false;
    }
}

/** Server render never has the flag, so it always starts false and hydrates cleanly. */
const getServerSnapshot = () => false;

/**
 * Has this browser already entered?
 *
 * useSyncExternalStore rather than an effect: localStorage is genuinely an
 * external store, and this gets the SSR-safe snapshot and the subscription in
 * one piece instead of a setState-on-mount that trips react-hooks lint and
 * costs an extra render.
 */
export function useHasEntered(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Record the entry and tell every listener (the form card, the sticky CTA). */
export function markEntered() {
    try {
        localStorage.setItem(ENTERED_FLAG, "1");
        document.cookie = `${ENTERED_FLAG}=1; path=/; max-age=${ENTERED_DAYS * 86400}; SameSite=Lax`;
    } catch {
        // Non-fatal: they'd just see the form again on a return visit.
    }
    window.dispatchEvent(new CustomEvent(GIVEAWAY_ENTERED_EVENT));
}
