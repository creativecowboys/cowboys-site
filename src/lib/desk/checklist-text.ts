import { createHash } from "node:crypto";
import { checklistFor, isRequiredName } from "@/lib/onboarding/checklist";
import type { ChecklistItem } from "@/lib/onboarding/types";

// The onboarding checklist on GoHighLevel lives ON THE CONTACT, in the desk-owned large-text field
// "Desk Checklist" — one readable line per item, so it can be read (and in a pinch fixed) in GoHighLevel:
//
//   [x] Intake link delivered to client | Onboard
//   [~] Citations submitted | Build | @Dave
//   [!] Logo files received (vector preferred) | Onboard | due 2026-10-05
//   [ ] Kickoff call offered | Onboard
//
//   [x] Done · [~] Working on it · [!] Stuck · [ ] not started.  Optional parts after the name, in this order:
//   phase (Onboard / Build / Launch), @owner, due YYYY-MM-DD.
//
// Why a contact field rather than GoHighLevel tasks or the Blob store: it is saved in the same request and
// under the same version check as every other onboarding field; the Onboarding list gets "what is missing"
// straight from the contact search with no extra read per client; twenty tasks per client would flood the
// assignee's task list and notifications; and it keeps the record in GoHighLevel, which is the point.
// Monday subitems had ids; here an item's id is a short hash of its name (stable while the name is).
// Server-only (node:crypto). "Required" is never stored — it is worked out from the packages on every read.

export type StoredItem = { name: string; status: string; phase: string; owner: string; due: string };
const MARK_TO_STATUS: Record<string, string> = { x: "Done", "~": "Working on it", "!": "Stuck", " ": "" };
const STATUS_TO_MARK: Record<string, string> = { Done: "x", "Working on it": "~", Stuck: "!", "": " " };
const PHASES = ["Onboard", "Build", "Launch"];

const clean = (s: string) => s.replace(/[\r\n]+/g, " ").replace(/\s*\|\s*/g, " / ").replace(/\s+/g, " ").trim();
export const itemId = (name: string): string => `c${createHash("sha1").update(name.trim().toLowerCase()).digest("hex").slice(0, 12)}`;

/** Parse the field text. Tolerant of hand edits: a line without a [ ] box is still an item (not started); blank lines are skipped. */
export function parseChecklist(text: string | null | undefined): StoredItem[] {
  const items: StoredItem[] = [];
  for (const raw of (text || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const box = /^\[( |x|X|~|!)?\]\s*(.*)$/.exec(line);
    const mark = box ? (box[1] || " ").toLowerCase() : " ";
    const parts = (box ? box[2] : line).split("|").map((p) => p.trim());
    const name = parts.shift() || "";
    if (!name) continue;
    const item: StoredItem = { name, status: MARK_TO_STATUS[mark] ?? "", phase: "", owner: "", due: "" };
    for (const part of parts) {
      const due = /^due\s+(\d{4}-\d{2}-\d{2})$/i.exec(part);
      if (due) item.due = due[1];
      else if (part.startsWith("@")) item.owner = part.slice(1).trim();
      else if (PHASES.includes(part)) item.phase = part;
    }
    items.push(item);
  }
  return items;
}

export function serializeChecklist(items: StoredItem[]): string {
  return items.map((i) => [`[${STATUS_TO_MARK[i.status] ?? " "}] ${clean(i.name)}`, i.phase && PHASES.includes(i.phase) ? i.phase : "", i.owner ? `@${clean(i.owner)}` : "", /^\d{4}-\d{2}-\d{2}$/.test(i.due) ? `due ${i.due}` : ""].filter(Boolean).join(" | ")).join("\n");
}

/** What the desk shows: stored items with ids and the "required" flag for these packages. Two items with the same name get distinct ids. */
export function toChecklistItems(items: StoredItem[], packages: string[]): ChecklistItem[] {
  const seen = new Map<string, number>();
  return items.map((i) => {
    const base = itemId(i.name);
    const n = (seen.get(base) || 0) + 1; seen.set(base, n);
    return { id: n === 1 ? base : `${base}x${n}`, name: i.name, status: i.status, owner: i.owner, due: i.due, phase: i.phase, required: isRequiredName(i.name, packages) };
  });
}

/** Add the template rows for these packages that are not on the list yet (by exact name). Existing rows and their order are kept. */
export function mergeTemplates(items: StoredItem[], packages: string[]): { items: StoredItem[]; added: number } {
  const have = new Set(items.map((i) => i.name));
  const next = [...items];
  let added = 0;
  for (const t of checklistFor(packages)) {
    if (have.has(t.name)) continue;
    next.push({ name: t.name, status: "", phase: t.phase, owner: "", due: "" });
    have.add(t.name); added++;
  }
  return { items: next, added };
}

/** Set one item's status by id. Returns null when the id is not on this list. */
export function setItemStatus(items: StoredItem[], packages: string[], id: string, status: string): StoredItem[] | null {
  const index = toChecklistItems(items, packages).findIndex((i) => i.id === id);
  if (index < 0) return null;
  return items.map((item, i) => (i === index ? { ...item, status } : item));
}
