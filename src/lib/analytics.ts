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
 * The gtag snippet is loaded by <GoogleAnalytics /> in the root layout, and only
 * when NEXT_PUBLIC_GA_MEASUREMENT_ID is set. Without it these calls are silent
 * no-ops rather than errors.
 */
export function gaEvent(name: string, params?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
        window.gtag?.("event", name, params ?? {});
    } catch {
        // Analytics never breaks a user-facing path.
    }
}

import { trackFb } from "./fbq";

/**
 * A lead: someone sent a form. One call per successful submission.
 *
 * Fires GA4's recommended `generate_lead` event (mark it as a key event in GA4,
 * and import it into Google Ads as a conversion) and Meta's standard `Lead`.
 * Pass `meta: false` where the form already fires its own Meta event.
 */
export function trackLead(formName: string, opts: { meta?: boolean } = {}) {
    if (typeof window === "undefined") return;
    gaEvent("generate_lead", { form_name: formName, page_path: window.location.pathname });
    if (opts.meta !== false) trackFb("Lead", { content_name: formName });
}

export { trackFb };
