import { createHash } from "node:crypto";
import type { CallDraft } from "@/app/leads/types";

// Idempotency markers embedded in saved call notes — the same in Monday updates and GHL notes, so a
// retry with the same call id is recognised in either system.
export const callMarker = (callId: string) => `[CC-CALL:${callId}]`;
export const handoffMarker = (handoffId: string) => `[CC-HANDOFF:${handoffId}]`;
export const importMarker = (mondayUpdateId: string) => `[CC-MONDAY-UPDATE:${mondayUpdateId}]`;

// Exclude the optimistic version: a legitimate retry may follow a reload. Include
// every user-entered field so a reused call ID cannot silently discard changed notes.
export function payloadMarker(draft: CallDraft): string {
  const content = Object.entries(draft).filter(([key]) => key !== "expectedUpdatedAt").sort(([a], [b]) => a.localeCompare(b));
  return `[CC-PAYLOAD:${createHash("sha256").update(JSON.stringify(content)).digest("hex")}]`;
}

/** Strip every machine marker before showing a note to a person. */
export function readableHistory(text: string): string {
  return text
    .replace(/\[CC-CALL:[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}\]/gi, "")
    .replace(/\[CC-PAYLOAD:[\da-f]{64}\]/gi, "")
    .replace(/\[CC-HANDOFF:[^\]]+\]/g, "")
    .replace(/\[CC-MONDAY-UPDATE:[^\]]+\]/g, "")
    .trim();
}
