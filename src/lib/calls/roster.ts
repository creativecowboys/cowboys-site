import type { CallLead } from "@/app/leads/types";

// Fixed choices stay available even before someone has a lead assigned to them.
export const CALL_OWNERS = [
  { id: "39848115", name: "Dave" },
  { id: "39848217", name: "Josh" },
  { id: "116679004", name: "Keaton" },
] as const;

type OwnedLead = CallLead & { ownerIds?: string[] };
export type ContactStage = "new" | "active" | "closed";

export function contactStage(lead: CallLead): ContactStage {
  const status = lead.outreach.trim().toLowerCase();
  if (["not interested", "bad contact number", "won"].includes(status)) return "closed";
  if ((!status || status === "not contacted") && !lead.lastContact.trim()) return "new";
  return "active";
}

function contactTime(lead: CallLead): number {
  const date = Date.parse(lead.lastContact);
  return Number.isFinite(date) ? date : Number.NEGATIVE_INFINITY;
}

// Updating a record or reassigning its owner must not move it ahead of new leads.
export function compareLeads(a: CallLead, b: CallLead): number {
  const priority: Record<ContactStage, number> = { new: 0, active: 1, closed: 2 };
  const aStage = contactStage(a);
  const bStage = contactStage(b);
  const stageOrder = priority[aStage] - priority[bStage];
  if (stageOrder) return stageOrder;
  if (aStage !== "new") {
    const aTime = contactTime(a);
    const bTime = contactTime(b);
    if (aTime !== bTime) return aTime < bTime ? -1 : 1;
  }
  return a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id, "en");
}

export function matchesOwner(lead: OwnedLead, filterId: string): boolean {
  if (!filterId || filterId === "all") return true;
  const owners = lead.ownerIds ?? (lead.ownerId ? [lead.ownerId] : []);
  if (filterId === "unassigned") return owners.length === 0;
  return owners.includes(filterId);
}
