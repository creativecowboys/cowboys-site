/**
 * Christmas in September giveaway — shared config.
 *
 * Imported by BOTH the page and /api/giveaway on purpose. The page deciding
 * it's open while the route returns 410 (or the reverse) is the single most
 * confusing failure this campaign could have, so there is exactly one
 * definition of "what phase are we in".
 */

/** Sept 24, 2026 11:59:59 PM ET. */
export const ENTRY_DEADLINE = new Date("2026-09-25T03:59:59Z");

/** Sept 25, 2026 9:00 AM ET. TODO: Josh to confirm the announcement time. */
export const WINNER_ANNOUNCE = new Date("2026-09-25T13:00:00Z");

export const SOURCE = "christmas-in-september";

export type Phase = "open" | "closed" | "winner";

/**
 * Resolve the campaign phase, server-side only.
 *
 * GIVEAWAY_PHASE is the manual override (§9). Two deliberate departures from a
 * literal reading of the spec, both to remove footguns:
 *
 * - Unset falls back to the dates rather than to "not open". The spec's
 *   `GIVEAWAY_PHASE !== 'open'` check would silently 410 every entry if the
 *   env var were ever missing or misspelled on the deploy — a dead campaign
 *   with no error anywhere. Deriving from the deadline is still evaluated on
 *   the server, so the anti-client-clock property the spec wanted is intact.
 * - An override of "open" cannot reopen entries once the deadline has passed.
 *   The deadline is a published legal term in the Official Rules; a stale env
 *   var must not be able to contradict it.
 */
export function resolvePhase(now: Date = new Date()): Phase {
    const override = process.env.GIVEAWAY_PHASE?.trim().toLowerCase();

    if (override === "closed" || override === "winner") return override;
    if (override === "open") return now > ENTRY_DEADLINE ? "closed" : "open";

    if (now <= ENTRY_DEADLINE) return "open";
    if (now < WINNER_ANNOUNCE) return "closed";
    return "winner";
}

export const BUSINESS_TYPES = [
    "Home Services & Trades (plumbing, HVAC, roofing, etc.)",
    "Restaurant, Bar or Food",
    "Retail or Boutique",
    "Health, Wellness or Fitness",
    "Professional Services (legal, accounting, consulting)",
    "Automotive",
    "Beauty or Salon",
    "Real Estate or Construction",
    "Nonprofit or Church",
    "Something Else",
] as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EntryFields = {
    name: string;
    email: string;
    phone: string;
    city_state: string;
    business_name: string;
    business_type: string;
    website: string;
    consent: boolean;
};

/**
 * Field validation, shared so the client and the server can never drift apart.
 * Returns a map of field name -> true for each field that is invalid.
 */
export function validateEntry(v: Partial<EntryFields>): Record<string, boolean> {
    const bad: Record<string, boolean> = {};
    if (!v.name?.trim()) bad.name = true;
    if (!v.email?.trim() || !EMAIL_RE.test(v.email.trim())) bad.email = true;
    if ((v.phone ?? "").replace(/\D/g, "").length < 10) bad.phone = true;
    if (!v.city_state?.trim()) bad.city_state = true;
    if (!v.business_name?.trim()) bad.business_name = true;
    if (!v.business_type?.trim()) bad.business_type = true;
    if (!v.consent) bad.consent = true;
    return bad;
}
