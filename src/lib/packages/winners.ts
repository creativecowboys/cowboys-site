import { monday } from "@/lib/onboarding/api";
import { COL, GIVEAWAY_WINNER, MONDAY_ORIGIN, PIPELINE_BOARD_ID, TEMPLATE_GROUP_ID, isGiveawayWinner } from "@/lib/onboarding/config";
import { CCOL, CLIENTS_BOARD_ID } from "@/lib/clients/config";

// Billing guard for giveaway winners (Dave, Oct 1 2026: "a winner tab, where we don't have to charge them").
// A client is a winner when its Onboarding Pipeline or Active Clients row carries the "Giveaway Winner"
// package label. The package builder works off a GHL contact, so we match that contact to those rows by
// GHL contact id, email, phone or exact business name, and refuse to create a plan for a match.
// Both boards are small (tens of rows), so one page read per board is cheaper and sturdier than a
// filtered query that breaks before the label exists on the board.

/** `board` is "Onboarding Pipeline" / "Active Clients" on Monday and "Onboarding" / "Clients" on the GoHighLevel desk (src/lib/desk/winners.ts). */
export type Winner = { itemId: string; name: string; board: string; url: string; email: string; phone: string; ghl: string };
export type ContactKeys = { id?: string; email?: string; phone?: string; company?: string; name?: string };

const digits = (v: string) => v.replace(/\D/g, "").slice(-10);
const nameKey = (v: string) => v.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

/** Pure: the first winner row that is the same client as this GHL contact, or null. */
export function matchWinner(contact: ContactKeys, winners: Winner[]): Winner | null {
  const email = (contact.email || "").trim().toLowerCase();
  const phone = digits(contact.phone || "");
  const names = [contact.company, contact.name].map((n) => nameKey(n || "")).filter((n) => n.length >= 4);
  return winners.find((w) =>
    (!!contact.id && w.ghl.includes(contact.id))
    || (!!email && w.email.trim().toLowerCase() === email)
    || (phone.length === 10 && digits(w.phone) === phone)
    || names.includes(nameKey(w.name)),
  ) || null;
}

type Col = { id: string; text: string | null; value: string | null };
type Item = { id: string; name: string; group: { id: string } | null; column_values: Col[] };
const BOARDS = [
  { id: PIPELINE_BOARD_ID, label: "Onboarding Pipeline" as const, cols: { package: COL.package, email: COL.email, phone: COL.phone, ghl: COL.ghlContact } },
  { id: CLIENTS_BOARD_ID, label: "Active Clients" as const, cols: { package: CCOL.package, email: CCOL.email, phone: CCOL.phone, ghl: CCOL.ghlContact } },
];

/** Every row on either board tagged Giveaway Winner. Throws (MondayError) if Monday can't be read. */
export async function listWinners(): Promise<Winner[]> {
  const pages = await Promise.all(BOARDS.map(async (b) => {
    const ids = Object.values(b.cols);
    const data = await monday<{ boards: { items_page: { items: Item[] } }[] }>(
      `query Winners($board: [ID!]) { boards(ids: $board) { items_page(limit: 500) { items { id name group { id } column_values(ids: ${JSON.stringify(ids)}) { id text value } } } } }`,
      { board: [b.id] }, 15000,
    );
    const items = data.boards?.[0]?.items_page?.items || [];
    // Skip the pipeline's "duplicate me" template group; churned Active Clients rows still count.
    return items.filter((i) => !(b.id === PIPELINE_BOARD_ID && i.group?.id === TEMPLATE_GROUP_ID)).map((i) => {
      const t = (id: string) => i.column_values.find((c) => c.id === id);
      const text = (id: string) => t(id)?.text || "";
      return { item: i, packages: text(b.cols.package), winner: {
        itemId: i.id, name: i.name, board: b.label, url: `${MONDAY_ORIGIN}/boards/${b.id}/pulses/${i.id}`,
        email: text(b.cols.email), phone: text(b.cols.phone), ghl: `${text(b.cols.ghl)} ${t(b.cols.ghl)?.value || ""}`,
      } satisfies Winner };
    }).filter((r) => isGiveawayWinner(r.packages)).map((r) => r.winner);
  }));
  return pages.flat();
}

// Short cache for the contact search only (it fires on every debounced keystroke). The send guard never uses it.
let cached: { at: number; winners: Winner[] } | null = null;
export async function listWinnersCached(maxAgeMs = 60_000): Promise<Winner[]> {
  if (cached && Date.now() - cached.at < maxAgeMs) return cached.winners;
  const winners = await listWinners();
  cached = { at: Date.now(), winners };
  return winners;
}

export const winnerMessage = (w: Winner) =>
  `${w.name} is a ${GIVEAWAY_WINNER} (tagged on the ${w.board} board), so they are not charged. Nothing was created in GHL. If they have since become a paying client, remove the ${GIVEAWAY_WINNER} label in Monday first.`;
