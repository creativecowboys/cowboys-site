import { CallDeskError } from "@/lib/calls/validation";
import { addTask, contactDisplayName, ghl, GhlError, listNotes, normalizePhone, splitName, type GhlContact, type GhlContactPatch } from "@/lib/ghl/client";
import { ghlRepIds } from "@/lib/ghl/reps";
import { todayEastern } from "@/lib/onboarding/api";
import { readIntake } from "@/lib/onboarding/store";
import { flagsFor, stripeWithoutMoney, withLiveGbp, withoutMoney } from "@/lib/clients/board";
import { findCustomerByEmail, paymentFromSnapshot, snapshot, stripeConnected } from "@/lib/clients/stripe";
import type { ClientDetail, ClientRow, ClientsListData, StripeSnapshot } from "@/lib/clients/types";
import { accessFromCard, parseListingId } from "@/lib/gbp/state";
import { gbpCard, listLocations, searchAtlasConnected } from "@/lib/gbp/searchatlas";
import type { GbpCard } from "@/lib/gbp/types";
import { assertOption, type DeskFields } from "./fields";
import { stripeFollowed } from "./legacy";
import { addDeskNote, toTimeline } from "./notes";
import { tasksFor } from "./tasks";
import { allDeskFields, businessName, fileScopeFor, groupLabel, isClientRecord, listRecords, mapClient, readContact, resolveRecordId, stillOnboarding, version, writeRecord, type DeskValues } from "./record";
import { memberByName, teamOwners, type Actor } from "./team";
import type { DeskClientPatch } from "./validation";

// The Clients tab on GoHighLevel (Phase 2). Same behaviour as src/lib/clients/board.ts, against a contact
// instead of an Active Clients item. Stripe state lands in desk-owned fields only — in particular the desk
// never adds the `lse:payment-failed` tag, which would start LSE-09's card emails and texts to the client.
// Nothing in this file talks to Monday.
const STALE = "Someone changed this client since you loaded it. Reload to see the latest before changing it.";

/** Every client on the desk, minus those still in onboarding ("one place at a time"), with live GBP state for linked listings. */
export async function listClientsGhl(): Promise<ClientsListData> {
  const f = await allDeskFields();
  const today = todayEastern();
  const rows = (await listRecords("client", f)).filter((c) => !stillOnboarding(c, f)).map((c) => mapClient(c, f, today));
  return { rows: await withLiveGbp(rows), cursor: null, boardName: "GoHighLevel", stripeConnected: stripeConnected(), canSeeMoney: false /* the route decides per session */, searchAtlasConnected: searchAtlasConnected(), system: "ghl", systemName: "GoHighLevel" };
}

async function clientContact(rawId: string, f: DeskFields): Promise<GhlContact> {
  const contact = await readContact(await resolveRecordId(rawId, "client", f));
  if (!isClientRecord(contact, f)) throw new CallDeskError("This contact is not on the Clients tab. Graduate it from the Onboarding tab first.", 404);
  return contact;
}

/** Only a connected + verified listing changes the record on its own: GBP access → Verified and the recheck stamp → today (once a day). */
async function liveGbp(row: ClientRow, f: DeskFields, opts: { fresh?: boolean; mayWrite?: boolean } = {}): Promise<{ card: GbpCard | null; row: ClientRow }> {
  const listing = parseListingId(row.searchAtlasListing);
  if (!listing) return { card: null, row };
  const card = await gbpCard(listing, { detail: true, fresh: !!opts.fresh });
  let fresh = row;
  try {
    const live = accessFromCard(card, row.gbpAccess);
    const today = todayEastern();
    // `mayWrite: false` = someone who may not change the preview is only looking: show the live card, write nothing.
    if (opts.mayWrite !== false && live.live && live.value === "Verified" && (live.changed || row.gbpChecked !== today)) {
      await writeRecord(row.id, f, { gbpAccess: "Verified", gbpChecked: today });
      fresh = mapClient(await readContact(row.id), f);
    }
  } catch (error) { console.error(`[gbp] could not write Verified to client contact ${row.id}: ${error instanceof Error ? error.message : error}`); }
  const withLive = { ...fresh, gbpLive: card };
  return { card, row: { ...withLive, flags: flagsFor(withLive) } };
}

export async function clientDetailGhl(rawId: string, canSeeMoney: boolean, opts: { mayWrite?: boolean } = {}): Promise<ClientDetail> {
  const f = await allDeskFields();
  const contact = await clientContact(rawId, f);
  const stored = mapClient(contact, f);
  const fileScope = fileScopeFor(contact, f);
  // Live Stripe read when we know the customer; a Stripe hiccup never hides the record.
  const [notes, stripe, live, gbpLocations, intake, tasks] = await Promise.all([
    listNotes(contact.id),
    stripeConnected() && stored.stripeCustomer ? snapshot(stored.stripeCustomer).catch(() => null) : Promise.resolve(null),
    liveGbp(stored, f, { mayWrite: opts.mayWrite }),
    searchAtlasConnected() ? listLocations().catch(() => []) : Promise.resolve([]),
    readIntake(fileScope).catch(() => null),
    tasksFor(contact.id), // the running task list (GoHighLevel tasks on the contact); never throws
  ]);
  const files = intake?.files.map((x) => ({ key: x.key, name: x.name, size: x.size, category: x.category, uploadedAt: x.uploadedAt })) || [];
  // Owners-only money covers the timeline too: the package builder's notes list plan line items and totals.
  const history = toTimeline(notes).filter((n) => canSeeMoney || n.source !== "Billing");
  return { fileScope, files, row: canSeeMoney ? live.row : withoutMoney(live.row), history, stripe: canSeeMoney ? stripe : stripeWithoutMoney(stripe), stripeConnected: stripeConnected(), owners: teamOwners(), canSeeMoney, gbpLocations, searchAtlasConnected: searchAtlasConnected(), system: "ghl", tasks };
}

/**
 * Josh's Monday automations notified him when Payment Status turned Card Failed or Overdue. Monday is gone on
 * this path, so the same heads-up becomes a GoHighLevel task on the contact for the account manager (Josh when
 * the manager has no GoHighLevel user). Internal only — nothing goes to the client. DESK_PAYMENT_ALERTS=off disables it.
 */
// One failure reaches the site as a burst of Stripe events in the same second, each running its own sync before the first
// has written — without this, each of them would leave a task. Per warm instance, which is where a burst lands.
const alerted = new Map<string, number>();
const ALERT_QUIET_MS = 120_000;
export const forgetPaymentAlerts = () => alerted.clear();
async function paymentAlert(contact: GhlContact, f: DeskFields, before: string, after: string): Promise<void> {
  if (before === after || !["Card Failed", "Overdue"].includes(after) || (process.env.DESK_PAYMENT_ALERTS || "").toLowerCase() === "off") return;
  const key = `${contact.id}:${after}`;
  if (Date.now() - (alerted.get(key) ?? -Infinity) < ALERT_QUIET_MS) return;
  alerted.set(key, Date.now());
  const name = businessName(contact);
  const title = after === "Card Failed" ? `Payment failed for ${name} — card declined. Reach out before the service lapses.` : `${name} is overdue on payment. Chase it before the service lapses.`;
  const assignee = memberByName(mapClient(contact, f).accountManager)?.ghlUserId || ghlRepIds().Josh;
  // Events can also land on two instances at once: if the same heads-up is already open on the contact, one is enough.
  // (A failed or unreadable task list never blocks the heads-up.)
  try {
    const open = await ghl<{ tasks?: { title?: string; completed?: boolean }[] }>("GET", `/contacts/${encodeURIComponent(contact.id)}/tasks`, undefined, { retries: 0, timeoutMs: 8000 });
    if ((open.tasks || []).some((t) => !t.completed && t.title === title.slice(0, 200))) return;
  } catch { /* create it */ }
  try { await addTask(contact.id, title.slice(0, 200), `Payment status on the team desk changed from ${before || "not set"} to ${after}. Open the client on the Clients tab for the Stripe details.`, 0, assignee); }
  catch (e) { console.error(`desk payment alert: task failed for ${contact.id}: ${e instanceof Error ? e.message : e}`); }
}

/** Staff edit the contact's own details here. Email and phone can be corrected, never blanked (they are how GoHighLevel reaches the client). */
function contactPatch(contact: GhlContact, patch: { contact: string; email: string; phone: string; website: string }): Omit<GhlContactPatch, "customFields" | "tags"> {
  const native: Omit<GhlContactPatch, "customFields" | "tags"> = {};
  // A blank name is ignored: the desk never erases who the contact is.
  if (patch.contact && patch.contact !== contactDisplayName(contact)) { const { firstName, lastName } = splitName(patch.contact); native.firstName = firstName; native.lastName = lastName; }
  const email = patch.email.toLowerCase();
  if (!email && contact.email) throw new CallDeskError("An email can be corrected here but not removed. To remove it, edit the contact in GoHighLevel.", 400);
  if (email && email !== (contact.email || "").toLowerCase()) native.email = email;
  if (!patch.phone && contact.phone) throw new CallDeskError("A phone number can be corrected here but not removed. To remove it, edit the contact in GoHighLevel.", 400);
  if (patch.phone && normalizePhone(patch.phone) !== normalizePhone(contact.phone || "")) native.phone = normalizePhone(patch.phone);
  // Unchanged text is never written — GoHighLevel may hold "example.com" with no scheme, and a blur must not turn it into a change.
  const bare = (u: string) => u.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
  if (bare(patch.website) !== bare(contact.website || "")) native.website = patch.website ? (patch.website.includes(":") ? patch.website : `https://${patch.website}`) : "";
  return native;
}

export async function patchClientGhl(rawId: string, patch: DeskClientPatch, actor: Actor, opts: { owner?: boolean } = {}): Promise<ClientRow> {
  const f = await allDeskFields();
  const contact = await clientContact(rawId, f);
  const id = contact.id;
  // Whether a client is "legacy" decides what the tab flags for it, so only an owner changes it (checked before anything is read as stale or written).
  if (patch.action === "legacy" && !opts.owner) throw new CallDeskError("Only an owner can change whether a client is a legacy client.", 403);
  if (patch.action !== "note" && version(contact) !== patch.expectedUpdatedAt) throw new CallDeskError(STALE, 409);
  const before = mapClient(contact, f);
  const today = todayEastern();
  const write = (values: DeskValues) => writeRecord(id, f, values);
  switch (patch.action) {
    case "group": await write({ clientStatus: groupLabel(patch.group) }); break;
    case "health": assertOption(f, "clientHealth", patch.value); await write({ clientHealth: patch.value }); break;
    case "payStatus": {
      assertOption(f, "payStatus", patch.value);
      // Overdue and Card Failed belong in Payment issue (what the Monday board's automation did).
      await write({ payStatus: patch.value, ...(["Overdue", "Card Failed"].includes(patch.value) && before.group !== "issue" ? { clientStatus: groupLabel("issue") } : {}) });
      await paymentAlert(contact, f, before.payStatus, patch.value);
      break;
    }
    case "payMethod": assertOption(f, "payMethod", patch.value); await write({ payMethod: patch.value }); break;
    case "gbp": assertOption(f, "gbpAccess", patch.value); await write({ gbpAccess: patch.value, ...(patch.value === "Verified" ? { gbpChecked: today } : {}), ...(patch.gbpUrl ? { gbpUrl: patch.gbpUrl } : {}) }); break;
    case "gbpChecked": await write({ gbpChecked: today, gbpAccess: "Verified" }); break;
    case "searchAtlasListing": {
      await write({ searchAtlasListing: patch.listingId });
      if (parseListingId(patch.listingId)) return (await liveGbp(mapClient(await readContact(id), f), f, { fresh: true })).row;
      break;
    }
    case "reportSent": await write({ lastReport: today }); break;
    case "manager": await write({ accountManager: patch.ownerId }); break;
    case "stripeCustomer": await write({ stripeCustomer: patch.customerId }); break;
    case "dates": await write({ nextBill: patch.nextBill, termEnds: patch.termEnds, billingDay: patch.billingDay }); break;
    case "contact": {
      const native = contactPatch(contact, patch);
      if (!Object.keys(native).length) break;
      try { await writeRecord(id, f, {}, native); }
      catch (e) {
        // GoHighLevel refuses an email or phone that another contact already has; say so instead of a bare upstream error.
        if (e instanceof GhlError && [400, 409, 422].includes(e.ghlStatus)) throw new CallDeskError(`GoHighLevel did not accept that change${/duplicat/i.test(e.body) ? " — another contact already uses that email or phone" : ""}. Nothing was changed.`, 409);
        throw e;
      }
      break;
    }
    case "note": await addDeskNote(id, { text: patch.text, noteId: patch.noteId || crypto.randomUUID(), source: "client", actor }); break;
    // Always an explicit Yes or No — never a blank — so a later re-import of the old board (which marks blank rows only) leaves an owner's choice alone.
    case "legacy": { const value = patch.value ? "Yes" : "No"; assertOption(f, "legacy", value); await write({ legacy: value }); break; }
  }
  return mapClient(await readContact(id), f);
}

/** Pull the client's Stripe state and write it to the contact's desk fields. Finds the customer by email when no id is stored yet. */
export async function syncClientFromStripeGhl(rawId: string): Promise<{ row: ClientRow; stripe: StripeSnapshot | null; changed: string[] }> {
  const f = await allDeskFields();
  const contact = await clientContact(rawId, f);
  const row = mapClient(contact, f);
  let customerId = row.stripeCustomer;
  if (!customerId) {
    if (!row.email) throw new CallDeskError("No Stripe customer id and no email on this client. Add the email or the customer id first.", 400);
    const found = await findCustomerByEmail(row.email);
    if (!found) throw new CallDeskError(`No Stripe customer uses ${row.email}. Paste the customer id from Stripe instead.`, 404);
    customerId = found.id;
  }
  const snap = await snapshot(customerId);
  const pay = paymentFromSnapshot(snap);
  const values: DeskValues = { stripeCustomer: customerId, payStatus: pay.payStatus };
  const changed: string[] = [];
  if (row.stripeCustomer !== customerId) changed.push("customer id");
  if (row.payStatus !== pay.payStatus) changed.push(`payment → ${pay.payStatus}`);
  if (pay.lastPayment && pay.lastPayment !== row.lastPayment) { values.lastPayment = pay.lastPayment; changed.push(`last payment ${pay.lastPayment}`); }
  if (pay.nextBill && pay.nextBill !== row.nextBill) { values.nextBill = pay.nextBill; changed.push(`next bill ${pay.nextBill}`); }
  if (!row.payMethod.startsWith("Stripe")) { values.payMethod = "Stripe via GHL"; changed.push("method → Stripe"); }
  // Sync never pulls a client out of At risk or Paused on its own.
  if (pay.group && pay.group !== row.group && !(pay.group === "active" && ["risk", "paused"].includes(row.group))) { values.clientStatus = groupLabel(pay.group); changed.push(`group → ${pay.group}`); }
  await writeRecord(contact.id, f, values);
  await paymentAlert(contact, f, row.payStatus, pay.payStatus);
  return { row: mapClient(await readContact(contact.id), f), stripe: snap, changed };
}

/** Webhook / reconcile entry: which client owns this Stripe customer? By the stored id first, then by email among clients with no id yet.
 *  A legacy client billed outside Stripe is never picked by its email (see stripeFollowed) — only by a customer id someone stored on it. */
export async function findClientByStripeCustomerGhl(customerId: string, email?: string | null): Promise<ClientRow | null> {
  const f = await allDeskFields();
  const contacts = await listRecords("client", f);
  const byId = contacts.map((c) => mapClient(c, f)).find((r) => r.stripeCustomer === customerId);
  if (byId) return byId;
  if (!email) return null;
  return contacts.filter((c) => !stillOnboarding(c, f)).map((c) => mapClient(c, f)).find((r) => r.email.toLowerCase() === email.toLowerCase() && !r.stripeCustomer && stripeFollowed(r)) || null;
}

/** The clients the nightly Stripe reconcile re-reads: a stored customer id, or an email to find one by — and, for a legacy client, only when Stripe is part of its record. */
export const reconcilable = (row: ClientRow): boolean => (!!row.stripeCustomer || !!row.email) && stripeFollowed(row);
