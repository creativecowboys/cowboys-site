// The wrap-up step's call outcomes, in the order the desk offers them. "In progress" is first because it is the common
// case (Dave, Oct 2 2026: "most of these we are still working on"): the rep talked to the lead and is still working it.
export const CALL_OUTCOMES = [
  "In progress",
  "No answer / left voicemail",
  "Booked followup",
  "Not interested",
  "Bad contact number",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];
export function isCallOutcome(value: string): value is CallOutcome {
  return (CALL_OUTCOMES as readonly string[]).includes(value);
}
/** The Outreach Status a saved outcome sets in GoHighLevel: the outcome's own words, except that Not interested reuses the
 *  existing "Not Interested" option instead of creating a case-only duplicate. */
export function outreachStatus(value: CallOutcome): string {
  return value === "Not interested" ? "Not Interested" : value;
}
/** The label a saved outcome sets on the Monday Giveaway Leads board (the rollback path). That board is frozen, so no new
 *  label is ever written to it: In progress is recorded with the board's existing "Contacted" label. */
export function mondayOutcome(value: CallOutcome): string {
  return value === "In progress" ? "Contacted" : outreachStatus(value);
}
