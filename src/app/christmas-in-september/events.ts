/** Cross-component signals for the giveaway page. */

/** Countdown reached zero while the page was open. */
export const GIVEAWAY_CLOSED_EVENT = "giveaway:closed";

/** Visitor has entered (this session, or on a previous visit). */
export const GIVEAWAY_ENTERED_EVENT = "giveaway:entered";

/**
 * Visitor pressed "Get Started" on the intro gate.
 *
 * Dispatched SYNCHRONOUSLY inside the click handler — that is the whole point.
 * User activation only survives within the gesture's own task, so anything
 * async here (await, setTimeout, a promise tick) would lose it and put us back
 * to a muted video.
 */
export const GIVEAWAY_START_EVENT = "giveaway:start";
