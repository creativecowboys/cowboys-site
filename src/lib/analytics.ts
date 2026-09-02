/**
 * Thin analytics wrappers.
 *
 * Both call sites are fire-and-forget: a blocked pixel, a missing GA4 container
 * or an ad blocker must never surface as a broken form or a thrown error.
 */

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/**
 * GA4 event.
 *
 * NOTE: no gtag/GTM snippet exists in this codebase — the site's GA4 arrives
 * through server-side GTM (see the handoff, §8). If GA4 is not actually on the
 * page these calls are silent no-ops rather than errors, so wiring GTM later
 * turns them on with no code change here.
 */
export function gaEvent(name: string, params?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
        window.gtag?.("event", name, params ?? {});
    } catch {
        // Analytics never breaks a user-facing path.
    }
}

export { trackFb } from "./fbq";
