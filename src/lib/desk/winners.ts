import { contactUrl, type GhlContact } from "@/lib/ghl/client";
import { GIVEAWAY_WINNER, isGiveawayWinner } from "@/lib/onboarding/config";
import { matchWinner, type ContactKeys, type Winner } from "@/lib/packages/winners";
import { deskList, type DeskFields } from "./fields";
import { allDeskFields, businessName, isClientRecord, listRecords, readContact } from "./record";
import { isGhlRecordId } from "./switch";

// The giveaway-winner billing guard on the GoHighLevel desk (Dave, Oct 1 2026: winners are never charged).
// A client is a winner when "Desk Packages" on its contact includes Giveaway Winner. The package builder
// works off a contact, so the first check is the contact itself, read fresh by id — no search lag. The list
// of every winner on the desk then catches a second contact for the same business (same email, phone or
// exact business name). Either read failing throws; the package route refuses to bill rather than guess.
const toWinner = (c: GhlContact, f: DeskFields): Winner => ({ itemId: c.id, name: businessName(c), board: isClientRecord(c, f) ? "Clients" : "Onboarding", url: contactUrl(c.id), email: c.email || "", phone: c.phone || "", ghl: c.id });

/** Every onboarding record and client tagged Giveaway Winner. Throws if GoHighLevel can't be read — or can only be read
 *  through the weaker tag-only list, which could miss a winner: the billing guard refuses rather than work from that. */
export async function listWinnersGhl(): Promise<Winner[]> {
  const f = await allDeskFields();
  const [onboarding, clients] = await Promise.all([listRecords("onboarding", f, { strict: true }), listRecords("client", f, { strict: true })]);
  return [...new Map([...onboarding, ...clients].map((c) => [c.id, c])).values()].filter((c) => isGiveawayWinner(deskList(c, f, "packages"))).map((c) => toWinner(c, f));
}

/** The send guard: is this contact — or another contact for the same business — a giveaway winner? Fresh read, no cache. */
export async function winnerForContactGhl(contact: ContactKeys): Promise<Winner | null> {
  const f = await allDeskFields();
  if (contact.id && isGhlRecordId(contact.id)) {
    const fresh = await readContact(contact.id);
    if (isGiveawayWinner(deskList(fresh, f, "packages"))) return toWinner(fresh, f);
  }
  return matchWinner(contact, await listWinnersGhl());
}

// Short cache for the contact search only (it fires on every debounced keystroke). The send guard never uses it.
let cached: { at: number; winners: Winner[] } | null = null;
export async function listWinnersGhlCached(maxAgeMs = 60_000): Promise<Winner[]> {
  if (cached && Date.now() - cached.at < maxAgeMs) return cached.winners;
  const winners = await listWinnersGhl();
  cached = { at: Date.now(), winners };
  return winners;
}
export const forgetWinnersGhl = () => { cached = null; };

export const winnerMessageGhl = (w: Winner) =>
  `${w.name} is a ${GIVEAWAY_WINNER} (on the team desk's ${w.board} tab), so they are not charged. Nothing was created in GHL. If they have since become a paying client, remove ${GIVEAWAY_WINNER} from "Desk Packages" on their contact in GoHighLevel first.`;
