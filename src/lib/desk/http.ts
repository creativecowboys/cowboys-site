import { validateFileScope } from "@/lib/onboarding/validation";
import { ensureIntake } from "@/lib/onboarding/intake";
import type { IntakeRecord } from "@/lib/onboarding/types";
import { isOwnerEmail, teamSession } from "@/lib/team-auth";
import { ensureIntakeGhl } from "./intake";
import { assertMayWriteGhl, backendForScope, isGhlRecordId, validateScope } from "./switch";

// Helpers shared by the team file routes (/api/team/onboarding/<scope>/files|upload|file). A file store's
// scope is a Monday-era key (pipeline item id, or "c" + client item id) or a GoHighLevel contact id.
// Monday-shaped scopes go through the original validator untouched.
export const fileScope = (raw: string): string => (isGhlRecordId(raw) ? validateScope(raw) : validateFileScope(raw));

/** The intake / file record for a scope, seeded from whichever system holds the client. */
export const ensureIntakeFor = (scope: string): Promise<IntakeRecord> => (backendForScope(scope) === "ghl" ? ensureIntakeGhl(scope) : ensureIntake(scope));

/** Before the flip, changing files on a GoHighLevel-desk record is owner-only (same rule as every other write there). */
export async function assertMayChangeFiles(scope: string): Promise<void> {
  if (backendForScope(scope) === "ghl") assertMayWriteGhl(isOwnerEmail((await teamSession())?.email));
}
