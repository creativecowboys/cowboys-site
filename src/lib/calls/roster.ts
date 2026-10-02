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

// ───────────────────────────── off the call list ─────────────────────────────
// Dave, Oct 1 2026: "when we mark a client we followed up with as not interested. I want to keep their contact in
// go high level for email campaigns and news letters. But I don't want them in the sales list to call again."
// A lead is OFF the call list when its Outreach Status is Not Interested, or when its GoHighLevel contact carries
// one of the tags Dave puts on contacts from his own calling. This only decides which rows the desk shows and which
// follow-ups reach a calendar: nothing is deleted, no DND is set and no tag is added or removed — the contact stays
// in GoHighLevel exactly as it is. No Node imports here: the desk (a client component) and the server both use it.
export const NO_CALL_TAGS = ["do-not-contact", "fake-lead"] as const;
export type NoCallTag = (typeof NO_CALL_TAGS)[number];
export type OffListReason = "not-interested" | NoCallTag;
export const OFF_LIST_LABELS: Record<OffListReason, string> = { "not-interested": "Not interested", "do-not-contact": "Do not contact", "fake-lead": "Fake lead" };
/** The "Show leads" choice that lists exactly the leads that are off the call list. */
export const OFF_LIST_VIEW = "off";

/** The no-call tags among a contact's tags, in a fixed order. GoHighLevel stores tags lower-cased; be forgiving anyway. */
export function noCallTagsOf(tags: readonly unknown[] | null | undefined): NoCallTag[] {
  if (!Array.isArray(tags) || !tags.length) return [];
  const have = new Set(tags.map((t) => String(t).trim().toLowerCase()));
  return NO_CALL_TAGS.filter((t) => have.has(t));
}
type Listable = { outreach?: string | null; noCallTags?: readonly unknown[] | null };
/** Why a lead is off the call list; empty when it is on it. Status first, then tags. */
export function offListReasons(lead: Listable): OffListReason[] {
  const reasons: OffListReason[] = (lead.outreach || "").trim().toLowerCase() === "not interested" ? ["not-interested"] : [];
  return [...reasons, ...noCallTagsOf(lead.noCallTags)];
}
export const isOffCallList = (lead: Listable): boolean => offListReasons(lead).length > 0;

/** "Show leads": every view except OFF_LIST_VIEW leaves off-list leads out; OFF_LIST_VIEW lists them and nothing else. */
export function inRosterView(lead: CallLead, view: string): boolean {
  const off = isOffCallList(lead);
  if (view === OFF_LIST_VIEW) return off;
  return !off && (view === "all" || contactStage(lead) === view);
}

export type RosterFilters = { view: string; owner: string; status: string; source: string; search: string };
/** The roster as the desk shows it: view, owner, status, lead source and search, in calling order. Search runs inside the view, so a name typed on the normal list never returns an off-list lead. */
export function filterRoster(leads: CallLead[], f: RosterFilters): CallLead[] {
  const text = f.search.toLowerCase();
  return leads.filter((l) => inRosterView(l, f.view) && matchesOwner(l, f.owner) && (!f.status || l.outreach === f.status)
    && (!f.source || (f.source === "none" ? !l.leadSource : l.leadSource === f.source))
    && `${l.name} ${l.contact} ${l.email} ${l.city}`.toLowerCase().includes(text)).sort(compareLeads);
}

const versionTime = (lead: CallLead): number => { const t = Date.parse(lead.updatedAt); return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY; };
/**
 * A roster reload must not undo what this tab already knows. GoHighLevel's contact search lags its own writes by a
 * few seconds, so a refresh right after a save can hand back the pre-save row — and a lead just marked Not Interested
 * would pop back onto the call list. Where the tab holds a newer version of a lead (from the lead's own record,
 * which is always current), keep it. `append` adds a further page to what is loaded.
 */
export function mergeRoster(prev: CallLead[], incoming: CallLead[], append = false): CallLead[] {
  const known = new Map(prev.map((l) => [l.id, l]));
  const fresher = (row: CallLead) => { const held = known.get(row.id); return held && versionTime(held) > versionTime(row) ? held : row; };
  if (!append) return incoming.map(fresher);
  const merged = new Map(prev.map((l) => [l.id, l]));
  for (const row of incoming) merged.set(row.id, fresher(row));
  return [...merged.values()];
}
