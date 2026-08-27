/**
 * Meta (Facebook) Pixel helpers.
 *
 * The pixel itself is installed once in the root layout via <MetaPixel />.
 * This module only exists so the rest of the app can fire events without
 * repeating the `window.fbq` type dance or crashing when the pixel hasn't
 * loaded (ad blockers, consent tooling, or the script simply being slow).
 */

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

/**
 * Fire a Meta standard or custom event.
 *
 * Deliberately a no-op when `fbq` is absent rather than throwing — a blocked
 * pixel must never be able to break a form submission.
 */
export function trackFb(event: string, params?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
        window.fbq?.("track", event, params);
    } catch {
        // Analytics is never worth an exception in a user-facing path.
    }
}
