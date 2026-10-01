import type { LeadsBackend } from "@/app/leads/types";
import { MONDAY_ID } from "./validation";
import { ghlRepIds, MONDAY_IDS, type RepName } from "@/lib/ghl/reps";

// The LEADS_BACKEND switch, pure part (no Monday/GHL imports — unit-tested). `monday` (default) = the
// Giveaway Leads board, `ghl` = GoHighLevel contacts. The roster follows the switch, or `?backend=` on a
// team request so an owner can preview /leads?backend=ghl before the flip. Anything keyed on a lead id
// follows the id's SHAPE (Monday ids are digits, GHL ids are letters+digits) so a draft, a calendar
// deep link or a handoff always reaches the system that holds that lead, whatever the switch says.
export const defaultBackend = (env = process.env.LEADS_BACKEND): LeadsBackend => (env === "ghl" ? "ghl" : "monday");
export function leadsBackend(req?: Request | null, env = process.env.LEADS_BACKEND): LeadsBackend {
  const q = req ? new URL(req.url).searchParams.get("backend") : null;
  return q === "ghl" || q === "monday" ? q : defaultBackend(env);
}
export const backendForLeadId = (id: string): LeadsBackend => (MONDAY_ID.test(id) ? "monday" : "ghl");
export const systemName = (b: LeadsBackend) => (b === "ghl" ? "GoHighLevel" : "Monday");
/** A rep's owner id in the given backend (Monday person id or GHL user id) — what the roster's ownerIds carry. */
export const repIdFor = (rep: RepName, backend: LeadsBackend): string => (backend === "ghl" ? ghlRepIds()[rep] : MONDAY_IDS[rep]);
