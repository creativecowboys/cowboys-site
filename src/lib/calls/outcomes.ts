export const CALL_OUTCOMES = [
  "No answer / left voicemail",
  "Booked followup",
  "Not interested",
  "Bad contact number",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];
export function isCallOutcome(value: string): value is CallOutcome {
  return (CALL_OUTCOMES as readonly string[]).includes(value);
}
// Reuse the existing Monday status instead of creating a case-only duplicate.
export function mondayOutcome(value: CallOutcome): string {
  return value === "Not interested" ? "Not Interested" : value;
}
