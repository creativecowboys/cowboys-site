import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { clientDetailGhl, findClientByStripeCustomerGhl, listClientsGhl, patchClientGhl, reconcilable, syncClientFromStripeGhl } from "./clients";
import { addDeskNote, classifyNote, formatDeskNote, readableNote, toTimeline } from "./notes";
import { validateDeskClientPatch } from "./validation";
import { forgetWinnersGhl, listWinnersGhl, listWinnersGhlCached, winnerForContactGhl, winnerMessageGhl } from "./winners";
import { readableHistory } from "@/lib/calls/markers";
import { forgetCustomFields } from "@/lib/ghl/client";
import { resetDeskFieldCheck } from "./fields";
import { todayEastern } from "@/lib/onboarding/api";
import type { FakeGhl } from "./testing/fake-ghl";
import { assertOnlyDeskWrites, DAVE, MADISON, reps, setUp, tearDown } from "./testing/harness";
import { getCallsPage } from "@/lib/calls/backend";
import { listOnboardingGhl } from "./onboarding";
import { deskTabOf, deskTabRule } from "./record";

const CLIENT = "ClientSquirrel000001";
let ghl: FakeGhl;
beforeEach(() => { ghl = setUp(); forgetWinnersGhl(); });
afterEach(() => { assertOnlyDeskWrites(ghl); tearDown(ghl); });
const addClient = (fields: Record<string, unknown> = {}, id = CLIENT) => ghl.addContact({
  id, firstName: "Jeremy", lastName: "Nutt", companyName: "Squirrel Made Products", email: "jeremy@squirrel.example", phone: "+14045550100", website: "https://squirrelmade.example",
  tags: ["desk-client", "lse:client"], assignedTo: reps.Josh,
  fields: { "Desk Client Status": "Active", "Desk Client Health": "Too New", "Desk Pay Status": "No Billing Set Up", "Desk Pay Method": "Stripe via GHL", "Desk Packages": ["Local Growth — First Year $297"], "Desk GBP Access": "Not Requested", "Desk Account Manager": "Josh", "Desk Client Since": "2026-09-15", "LSE Health": "green", "LSE Term End": "2027-09-15", ...fields },
});
const v = (id = CLIENT) => String(ghl.get(id).dateUpdated);
const patch = (body: Record<string, unknown>, actor = DAVE, id = CLIENT) => patchClientGhl(id, validateDeskClientPatch({ expectedUpdatedAt: v(id), ...body }), actor);
const UUID = "9b2f7c1e-5a4d-4e8b-9c3a-1f2e3d4c5b6a";

test("the list and the panel: flags, list price, owners-only money, the file store", async () => {
  addClient();
  const list = await listClientsGhl();
  assert.equal(list.system, "ghl"); assert.equal(list.cursor, null); assert.equal(list.rows.length, 1);
  const row = list.rows[0];
  assert.equal(row.id, CLIENT); assert.equal(row.name, "Squirrel Made Products"); assert.equal(row.contact, "Jeremy Nutt"); assert.equal(row.group, "active"); assert.equal(row.groupTitle, "Active");
  assert.equal(row.mrr, "297"); assert.equal(row.accountManager, "Josh"); assert.deepEqual(row.accountManagerIds, ["Josh"]); assert.equal(row.teamDesk, true); assert.equal(row.onboardingItem, "");
  assert.deepEqual(row.flags, ["gbp", "report", "no-stripe"]);
  const owner = await clientDetailGhl(CLIENT, true);
  assert.equal(owner.row.mrr, "297"); assert.equal(owner.canSeeMoney, true); assert.equal(owner.fileScope, CLIENT); assert.equal(owner.system, "ghl"); assert.deepEqual(owner.owners.map((o) => o.name), ["Dave", "Josh", "Keaton", "Madison"]);
  const staff = await clientDetailGhl(CLIENT, false);
  assert.equal(staff.row.mrr, ""); assert.equal(staff.row.customMonthly, ""); assert.equal(staff.row.payStatus, "No Billing Set Up", "everyone still sees the payment status");
  // A giveaway winner counts $0 whatever they won; custom monthly adds to the list price for everyone else.
  addClient({ "Desk Packages": ["Giveaway Winner", "Local Growth"], "Desk Custom Monthly": 100 }, "WinnerContact0000001");
  addClient({ "Desk Packages": ["Local Growth", "AI SEO"], "Desk Custom Monthly": 97 }, "CustomContact0000001");
  const rows = (await listClientsGhl()).rows;
  assert.equal(rows.find((r) => r.id === "WinnerContact0000001")!.mrr, "0"); assert.equal(rows.find((r) => r.id === "CustomContact0000001")!.mrr, "594");
  // Records imported from the old board keep their storage key.
  addClient({ "Desk Monday Client ID": "13125661635" }, "ImportedClient000001");
  assert.equal((await clientDetailGhl("ImportedClient000001", true)).fileScope, "c13125661635");
  assert.equal((await clientDetailGhl("13125661635", true)).row.id, "ImportedClient000001", "an old link by Monday id still opens the client");
  await assert.rejects(clientDetailGhl("NotAClient0000000001", true), { status: 404 });
});

test("patches: all thirteen client actions land in desk fields (or the contact's own details)", async () => {
  addClient();
  const today = todayEastern();
  await assert.rejects(patchClientGhl(CLIENT, validateDeskClientPatch({ action: "health", value: "Green", expectedUpdatedAt: "2026-09-30T00:00:00.000Z" }), DAVE), { status: 409 });
  let row = await patch({ action: "group", group: "risk" }); assert.equal(row.group, "risk"); assert.equal(ghl.value(CLIENT, "Desk Client Status"), "At risk");
  row = await patch({ action: "health", value: "Red" }); assert.equal(row.health, "Red");
  assert.equal(ghl.value(CLIENT, "LSE Health"), "green", "Desk Client Health is not LSE Health — no health automation is touched"); assert.ok(!ghl.get(CLIENT).tags!.includes("lse:red"));
  row = await patch({ action: "payMethod", value: "QuickBooks invoice" }); assert.equal(row.payMethod, "QuickBooks invoice");
  row = await patch({ action: "gbp", value: "Verified", gbpUrl: "https://maps.google.com/?cid=9" }); assert.equal(row.gbpAccess, "Verified"); assert.equal(row.gbpChecked, today); assert.equal(row.gbpUrl, "https://maps.google.com/?cid=9");
  row = await patch({ action: "gbp", value: "Lost / recheck", gbpUrl: "" }); assert.equal(row.gbpAccess, "Lost / recheck"); assert.equal(row.gbpUrl, "https://maps.google.com/?cid=9", "a blank URL does not erase the saved one");
  row = await patch({ action: "gbpChecked" }); assert.equal(row.gbpAccess, "Verified"); assert.equal(row.gbpChecked, today);
  row = await patch({ action: "searchAtlasListing", listingId: "94266" }); assert.equal(row.searchAtlasListing, "94266");
  row = await patch({ action: "reportSent" }); assert.equal(row.lastReport, today); assert.equal(ghl.value(CLIENT, "LSE Report URL"), undefined);
  row = await patch({ action: "manager", ownerId: "Madison" }); assert.equal(row.accountManager, "Madison");
  assert.throws(() => validateDeskClientPatch({ action: "manager", ownerId: "39848217", expectedUpdatedAt: v() }), { status: 400 });
  row = await patch({ action: "stripeCustomer", customerId: "cus_ABC123" }); assert.equal(row.stripeCustomer, "cus_ABC123");
  row = await patch({ action: "dates", nextBill: "2026-10-25", termEnds: "2027-09-24", billingDay: "25" }); assert.equal(row.nextBill, "2026-10-25"); assert.equal(row.termEnds, "2027-09-24"); assert.equal(row.billingDay, "25");
  assert.equal(ghl.value(CLIENT, "LSE Term End"), "2027-09-15", "Desk Term Ends is not LSE Term End — the renewal automation's date is untouched");
  row = await patch({ action: "dates", nextBill: "", termEnds: "", billingDay: "" }); assert.equal(row.nextBill, ""); assert.equal(row.billingDay, "");
  assert.deepEqual(row.flags, []);
});

test("the contact's own details: corrected on the contact, never blanked, and a clash is explained", async () => {
  addClient();
  const same = { action: "contact", contact: "Jeremy Nutt", email: "jeremy@squirrel.example", phone: "+14045550100", website: "https://squirrelmade.example" };
  const writes = ghl.writes().length;
  await patch(same); assert.equal(ghl.writes().length, writes, "tabbing out of an unchanged field writes nothing");
  const row = await patch({ ...same, contact: "Jeremy R Nutt", email: "Jeremy@SquirrelMade.example", phone: "(404) 555-0199", website: "squirrelmade.co" });
  assert.equal(row.contact, "Jeremy R Nutt"); assert.equal(row.email, "jeremy@squirrelmade.example"); assert.equal(row.phone, "+14045550199"); assert.equal(row.website, "https://squirrelmade.co");
  assert.equal(ghl.get(CLIENT).companyName, "Squirrel Made Products");
  await assert.rejects(patch({ ...same, email: "" }), { status: 400 }); await assert.rejects(patch({ ...same, email: "jeremy@squirrelmade.example", phone: "" }), { status: 400 });
  assert.equal((await patch({ action: "contact", contact: "", email: "jeremy@squirrelmade.example", phone: "+14045550199", website: "" })).contact, "Jeremy R Nutt", "a blank name is ignored; a blank website clears it");
  assert.equal(ghl.get(CLIENT).website, "");
  // GoHighLevel holds a website with no scheme: tabbing out of the untouched field is still not a change.
  ghl.get(CLIENT).website = "PlainCo.example/";
  const before = [ghl.writes().length, v()];
  await patch({ action: "contact", contact: "Jeremy R Nutt", email: "jeremy@squirrelmade.example", phone: "+14045550199", website: "PlainCo.example/" });
  assert.deepEqual([ghl.writes().length, v()], before); assert.equal(ghl.get(CLIENT).website, "PlainCo.example/");
  ghl.failures.push({ match: /^PUT \/contacts\//, status: 400, body: { message: "This location does not allow duplicated contacts.", meta: { contactId: "x" } } });
  await assert.rejects(patch({ action: "contact", contact: "Jeremy R Nutt", email: "taken@example.com", phone: "+14045550199", website: "" }), (e: Error & { status?: number }) => e.status === 409 && /another contact already uses/.test(e.message));
});

test("payment status: Card Failed and Overdue move to Payment issue and leave a task for the manager — never the LSE dunning tag", async () => {
  addClient();
  let row = await patch({ action: "payStatus", value: "Card Failed" });
  assert.equal(row.payStatus, "Card Failed"); assert.equal(row.group, "issue"); assert.deepEqual(row.flags.includes("payment"), true);
  assert.equal(ghl.tasks.length, 1);
  assert.equal(ghl.tasks[0].title, "Payment failed for Squirrel Made Products — card declined. Reach out before the service lapses."); assert.equal(ghl.tasks[0].assignedTo, reps.Josh); assert.equal(ghl.tasks[0].contactId, CLIENT);
  assert.ok(!ghl.get(CLIENT).tags!.includes("lse:payment-failed"), "the tag that starts LSE-09's emails and texts to the client is never added");
  row = await patch({ action: "payStatus", value: "Card Failed" }); assert.equal(ghl.tasks.length, 1, "no second task for the same status");
  row = await patch({ action: "payStatus", value: "Paid / Current" }); assert.equal(row.group, "issue", "a manual status never moves a client out of Payment issue on its own");
  row = await patch({ action: "manager", ownerId: "Madison" });
  row = await patch({ action: "payStatus", value: "Overdue" });
  assert.equal(ghl.tasks.length, 2); assert.equal(ghl.tasks[1].title, "Squirrel Made Products is overdue on payment. Chase it before the service lapses."); assert.equal(ghl.tasks[1].assignedTo, reps.Josh, "Madison has no GoHighLevel user, so the heads-up goes to Josh");
  process.env.DESK_PAYMENT_ALERTS = "off";
  await patch({ action: "payStatus", value: "Paid / Current" }); await patch({ action: "payStatus", value: "Card Failed" });
  assert.equal(ghl.tasks.length, 2, "DESK_PAYMENT_ALERTS=off");
});

const stripeUp = (sub: Record<string, unknown> | null, invoice: Record<string, unknown> | null) => {
  process.env.STRIPE_SECRET_KEY = "nonfunctional-test-stripe-key";
  ghl.stripe.set("/customers?email=jeremy%40squirrel.example&limit=3", { data: [{ id: "cus_123", email: "jeremy@squirrel.example", name: "Jeremy" }] });
  ghl.stripe.set("/customers/cus_123", { id: "cus_123", email: "jeremy@squirrel.example", name: "Jeremy" });
  ghl.stripe.set("/subscriptions?customer=cus_123&status=all&limit=10", { data: sub ? [sub] : [] });
  ghl.stripe.set("/invoices?customer=cus_123&limit=5", { data: invoice ? [invoice] : [] });
};
const unix = (iso: string) => Math.floor(Date.parse(`${iso}T12:00:00Z`) / 1000);
const activeSub = { id: "sub_1", status: "active", current_period_end: unix("2026-10-25"), cancel_at: null, items: { data: [{ price: { unit_amount: 29700, recurring: { interval: "month" } } }] } };
const paidInvoice = { id: "in_1", status: "paid", amount_due: 29700, due_date: null, attempted: true, hosted_invoice_url: "https://invoice.example/1", status_transitions: { paid_at: unix("2026-09-25") } };

test("Stripe sync writes payment state to desk fields: finds the customer by email, never pulls a client out of At risk", async () => {
  addClient({ "Desk Client Status": "At risk" });
  stripeUp(activeSub, paidInvoice);
  const r = await syncClientFromStripeGhl(CLIENT);
  assert.deepEqual(r.changed, ["customer id", "payment → Paid / Current", "last payment 2026-09-25", "next bill 2026-10-25"]);
  assert.equal(r.row.stripeCustomer, "cus_123"); assert.equal(r.row.payStatus, "Paid / Current"); assert.equal(r.row.lastPayment, "2026-09-25"); assert.equal(r.row.nextBill, "2026-10-25"); assert.equal(r.row.group, "risk");
  assert.equal(r.stripe?.subscription?.amount, 297); assert.equal(ghl.tasks.length, 0);
  assert.deepEqual((await syncClientFromStripeGhl(CLIENT)).changed, [], "a second sync changes nothing");
  // The card fails: Card Failed → Payment issue, one internal task, and still no LSE tag or field.
  stripeUp({ ...activeSub, status: "past_due" }, { ...paidInvoice, id: "in_2", status: "open", attempted: true, status_transitions: { paid_at: null } });
  const failed = await syncClientFromStripeGhl(CLIENT);
  assert.deepEqual(failed.changed, ["payment → Card Failed", "group → issue"]); assert.equal(failed.row.group, "issue"); assert.equal(ghl.tasks.length, 1);
  assert.ok(!ghl.get(CLIENT).tags!.includes("lse:payment-failed"));
  // Paid again: back to Active (from Payment issue the sync does move it).
  stripeUp(activeSub, { ...paidInvoice, id: "in_3", status_transitions: { paid_at: unix("2026-10-02") } });
  const recovered = await syncClientFromStripeGhl(CLIENT);
  assert.equal(recovered.row.payStatus, "Paid / Current"); assert.equal(recovered.row.group, "active"); assert.equal(recovered.row.lastPayment, "2026-10-02");
  // Cancelled → Churned.
  stripeUp({ ...activeSub, status: "canceled" }, paidInvoice);
  assert.equal((await syncClientFromStripeGhl(CLIENT)).row.group, "churned");
});
test("owners-only money covers the timeline: the package builder's notes are not shown to anyone else", async () => {
  addClient();
  ghl.notes.push({ id: "noteBilling000000001", contactId: CLIENT, dateAdded: "2026-09-25T15:00:00.000Z", body: "Package builder (call desk): Monthly plan for Squirrel Made Products\nLocal Growth — First Year $297\nTotal $297.00 / month" });
  await addDeskNote(CLIENT, { text: "Called about the logo.", noteId: UUID, source: "client", actor: DAVE });
  assert.deepEqual((await clientDetailGhl(CLIENT, true)).history.map((h) => h.source), ["Client", "Billing"]);
  assert.deepEqual((await clientDetailGhl(CLIENT, false)).history.map((h) => h.source), ["Client"]);
});

test("the billing guard never works from a list that may be short: if GoHighLevel refuses the desk's filter, the tabs fall back and billing is refused", async () => {
  addClient({ "Desk Packages": ["Giveaway Winner", "Local Growth"] });
  ghl.get(CLIENT).tags = ["lse:client"]; // a winner whose desk tag was never added: only the field filter finds it
  ghl.addContact({ id: "DuplicateContact0001", companyName: "Squirrel Made", email: "jeremy@squirrel.example" });
  assert.equal((await winnerForContactGhl({ id: "DuplicateContact0001", email: "jeremy@squirrel.example" }))?.itemId, CLIENT);
  for (const status of [400, 422]) {
    ghl.failures.push({ match: /^POST \/contacts\/search/, status });
    assert.deepEqual((await listClientsGhl()).rows, [], `the Clients tab still loads on a ${status}, from the tag alone`);
    ghl.failures.push({ match: /^POST \/contacts\/search/, status });
    await assert.rejects(listWinnersGhl(), { status: 503 });
    ghl.failures.push({ match: /^POST \/contacts\/search/, status });
    await assert.rejects(winnerForContactGhl({ id: "DuplicateContact0001", email: "jeremy@squirrel.example" }), { status: 503 }, "refused, not waved through");
  }
});

test("a burst of Stripe events for one failed payment leaves one task, not one per event", async () => {
  addClient({ "Desk Pay Status": "Paid / Current", "Desk Stripe Customer ID": "cus_123" });
  stripeUp({ ...activeSub, status: "past_due" }, { ...paidInvoice, id: "in_2", status: "open", attempted: true, status_transitions: { paid_at: null } });
  // invoice.payment_failed, customer.subscription.updated and invoice.updated arrive together; each sync reads the contact before any has written.
  const all = await Promise.all([syncClientFromStripeGhl(CLIENT), syncClientFromStripeGhl(CLIENT), syncClientFromStripeGhl(CLIENT)]);
  assert.ok(all.every((r) => r.row.payStatus === "Card Failed" && r.row.group === "issue"));
  assert.equal(ghl.tasks.length, 1);
});
test("Stripe sync says what is missing instead of guessing", async () => {
  process.env.STRIPE_SECRET_KEY = "nonfunctional-test-stripe-key";
  ghl.addContact({ id: "NoEmailClient0000001", companyName: "No Email Co", tags: ["desk-client"], fields: { "Desk Client Status": "Active" } });
  await assert.rejects(syncClientFromStripeGhl("NoEmailClient0000001"), { status: 400 });
  addClient();
  ghl.stripe.set("/customers?email=jeremy%40squirrel.example&limit=3", { data: [] });
  await assert.rejects(syncClientFromStripeGhl(CLIENT), { status: 404 });
  assert.equal(ghl.writes().length, 0);
});
test("the Stripe webhook finds its client by the stored customer id, then by email among clients with no id yet", async () => {
  addClient({ "Desk Stripe Customer ID": "cus_123" });
  ghl.addContact({ id: "SecondClient00000001", companyName: "Second Co", email: "pat@second.example", tags: ["desk-client"], fields: { "Desk Client Status": "Active" } });
  ghl.addContact({ id: "StillOnboarding00001", companyName: "Early Co", email: "early@co.example", tags: ["desk-client", "desk-onboarding"], fields: { "Desk Client Status": "Active", "Desk Onboarding Stage": "New handoff" } });
  assert.equal((await findClientByStripeCustomerGhl("cus_123"))?.id, CLIENT);
  assert.equal((await findClientByStripeCustomerGhl("cus_999", "PAT@second.example"))?.id, "SecondClient00000001");
  assert.equal(await findClientByStripeCustomerGhl("cus_999", "jeremy@squirrel.example"), null, "a client that already has a different customer id is not matched by email");
  assert.equal(await findClientByStripeCustomerGhl("cus_999", "early@co.example"), null, "still in onboarding");
  assert.equal(await findClientByStripeCustomerGhl("cus_999"), null);
});

test("notes: saved on the contact as the signed-in person, once, and shown newest first with where they came from", async () => {
  addClient();
  for (const group of ["Payment issue", "At risk", "Paused", "Churned", "Active"]) {
    ghl.get(CLIENT).customFields!.find((f) => f.id === ghl.fieldId("Desk Client Status"))!.value = group;
    const row = await patch({ action: "note", text: `Note while ${group}`, noteId: crypto.randomUUID() });
    assert.equal(row.id, CLIENT, `a note can be added in ${group}`);
  }
  assert.equal(ghl.notesFor(CLIENT).length, 5);
  // Idempotent on retry: same id → same note. A note needs no record version.
  const body = { action: "note", text: "Called Jeremy — wants the monthly report earlier.", noteId: UUID };
  await patchClientGhl(CLIENT, validateDeskClientPatch(body), DAVE);
  await patchClientGhl(CLIENT, validateDeskClientPatch({ ...body, expectedUpdatedAt: "2026-09-30T00:00:00.000Z" }), DAVE);
  const saved = ghl.notesFor(CLIENT).filter((n) => n.body.includes(UUID));
  assert.equal(saved.length, 1); assert.equal(saved[0].userId, reps.Dave, "authored as Dave in GoHighLevel");
  assert.equal(saved[0].body, `Called Jeremy — wants the monthly report earlier.\n\n[CC-NOTE:${UUID}] [CC-SRC:client] [CC-BY:Dave]`);
  // Madison has no GoHighLevel user: the note is saved by the integration and still carries her name.
  await patch({ action: "note", text: "Sent the kickoff email." }, MADISON);
  const hers = ghl.notesFor(CLIENT).at(-1)!;
  assert.equal(hers.userId, undefined); assert.match(hers.body, /\[CC-BY:Madison\]$/);
  // Things other systems put on the contact are part of the same history.
  ghl.notes.push({ id: "n-ghl", contactId: CLIENT, userId: reps.Keaton, dateAdded: "2026-10-05T10:00:00.000Z", body: "Typed straight into GoHighLevel" });
  ghl.notes.push({ id: "n-bill", contactId: CLIENT, dateAdded: "2026-10-05T11:00:00.000Z", body: "Package builder (call desk): monthly plan created.\n• Local Growth — 12-month agreement — $297/mo" });
  ghl.notes.push({ id: "n-imp", contactId: CLIENT, dateAdded: "2026-10-05T12:00:00.000Z", body: "From Monday (Josh Pack, 2026-09-24):\nConfirmed active at $297.\n\n[CC-MONDAY-UPDATE:4471] [CC-SRC:client]" });
  const history = (await clientDetailGhl(CLIENT, true)).history;
  assert.deepEqual(history.slice(0, 5).map((h) => [h.source, h.author]), [["Imported", "Josh Pack"], ["Billing", "Team"], ["GoHighLevel", "Keaton"], ["Client", "Madison"], ["Client", "Dave"]]);
  assert.equal(history[4].text, "Called Jeremy — wants the monthly report earlier."); assert.ok(history.every((h) => !/\[CC-/.test(h.text)));
  assert.equal(history[0].text, "From Monday (Josh Pack, 2026-09-24):\nConfirmed active at $297.");
  // Validation.
  assert.throws(() => validateDeskClientPatch({ action: "note", text: "  " }), { status: 400 });
  assert.throws(() => validateDeskClientPatch({ action: "note", text: "x", noteId: "../../etc" }), { status: 400 });
  assert.throws(() => validateDeskClientPatch({ action: "note", text: "x", extra: 1 }), { status: 400 });
});
test("note text can never carry a marker of its own; the Sales tab strips the desk's markers too", async () => {
  assert.equal(formatDeskNote("Paid in full [CC-NOTE:fake] [CC-BY:Dave]\r\n ok", UUID, "onboarding", "Madison"), `Paid in full  \n ok\n\n[CC-NOTE:${UUID}] [CC-SRC:onboarding] [CC-BY:Madison]`);
  assert.throws(() => formatDeskNote("[CC-NOTE:only-a-marker]", UUID, "client", "Dave"), { status: 400 });
  assert.equal(readableNote(`Hello\n\n[CC-NOTE:${UUID}] [CC-SRC:client] [CC-BY:Dave]`), "Hello");
  assert.equal(readableHistory(`Hello\n\n[CC-NOTE:${UUID}] [CC-SRC:client] [CC-BY:Dave] [CC-HANDOFF-SUMMARY:${UUID}]`), "Hello");
  assert.deepEqual(classifyNote({ body: `x\n\n[CC-NOTE:${UUID}] [CC-SRC:onboarding] [CC-BY:Madison]` }), { source: "Onboarding", author: "Madison" });
  assert.deepEqual(classifyNote({ body: "Call note — Creative Cowboys desk\nRep: Keaton\nOutcome: Booked followup\n\n[CC-CALL:x]", userId: reps.Keaton }), { source: "Sales call", author: "Keaton" });
  assert.deepEqual(classifyNote({ body: "anything", userId: "someoneElse000000001" }), { source: "GoHighLevel", author: "Team" });
  assert.deepEqual(toTimeline([{ id: "1", body: "[CC-NOTE:x]" }]), [], "a note that is only markers is not shown");
  addClient();
  await assert.rejects(addDeskNote(CLIENT, { text: "x", noteId: "bad id", source: "client", actor: DAVE }), { status: 400 });
});

test("giveaway winners: the contact itself, or another contact for the same business, blocks billing — and a failed read refuses", async () => {
  addClient({ "Desk Packages": ["Giveaway Winner", "Local Growth"] });
  ghl.addContact({ id: "OnboardingWinner0001", companyName: "Winner In Onboarding", email: "w@onboarding.example", tags: ["desk-onboarding"], fields: { "Desk Onboarding Stage": "New handoff", "Desk Packages": ["Giveaway Winner", "Max Growth"] } });
  ghl.addContact({ id: "PayingClient00000001", companyName: "Paying Co", email: "pay@co.example", tags: ["desk-client"], fields: { "Desk Client Status": "Active", "Desk Packages": ["Local Growth"] } });
  const winners = await listWinnersGhl();
  assert.deepEqual(winners.map((w) => [w.itemId, w.board]).sort(), [[CLIENT, "Clients"], ["OnboardingWinner0001", "Onboarding"]]);
  assert.equal((await winnerForContactGhl({ id: CLIENT }))?.itemId, CLIENT);
  assert.equal(await winnerForContactGhl({ id: "PayingClient00000001", email: "pay@co.example", company: "Paying Co" }), null);
  // A second contact in GoHighLevel for the same business (same email / phone / exact name) is caught too.
  ghl.addContact({ id: "DuplicateContact0001", companyName: "Squirrel Made", email: "JEREMY@squirrel.example" });
  assert.equal((await winnerForContactGhl({ id: "DuplicateContact0001", email: "JEREMY@squirrel.example" }))?.itemId, CLIENT);
  assert.equal((await winnerForContactGhl({ id: "DuplicateContact0001", phone: "(404) 555-0100" }))?.itemId, CLIENT);
  assert.equal((await winnerForContactGhl({ id: "DuplicateContact0001", company: "squirrel made products" }))?.itemId, CLIENT);
  // The moment a contact is made a winner it is blocked, even while GoHighLevel's search index still lags.
  ghl.settle(); ghl.lag = true;
  ghl.get("PayingClient00000001").customFields!.find((f) => f.id === ghl.fieldId("Desk Packages"))!.value = ["Giveaway Winner", "Local Growth"];
  assert.equal((await winnerForContactGhl({ id: "PayingClient00000001" }))?.itemId, "PayingClient00000001");
  ghl.lag = false;
  assert.match(winnerMessageGhl(winners[0]), /not charged\. Nothing was created in GHL\./); assert.ok(!/Monday/.test(winnerMessageGhl(winners[0])));
  assert.equal((await listWinnersGhlCached()).length, 3);
  ghl.failures.push({ match: /^POST \/contacts\/search$/, status: 500 }, { match: /^POST \/contacts\/search$/, status: 500 }, { match: /^POST \/contacts\/search$/, status: 500 });
  await assert.rejects(winnerForContactGhl({ id: "DuplicateContact0001", email: "x@y.co" }), "GoHighLevel down → the guard throws, and the package route refuses to bill");
});

// ───────────────────────────── legacy clients (Oct 2 2026) ─────────────────────────────
// A long-standing client as the import brings it over: a contact made from the business name alone (no person, email or phone),
// billed by QuickBooks invoice, with nothing on file about GBP or reports.
const LEGACY = "LegacyWhitenPools001";
const addLegacy = (fields: Record<string, unknown> = {}, over: Record<string, unknown> = {}, id = LEGACY) => ghl.addContact({
  id, companyName: "Whiten Pools, Inc.", website: "https://whiten-pools.com", tags: ["desk-client", "monday-import"],
  fields: { "Desk Client Status": "Active", "Desk Client Health": "Too New", "Desk Pay Status": "No Billing Set Up", "Desk Pay Method": "QuickBooks invoice", "Desk Account Manager": "Josh", "Desk Monday Client ID": "13125631516", "Desk Notes": "Search Atlas location 97647, GBP locked.", "Desk Legacy Client": "Yes", ...fields }, ...over,
});

test("legacy clients sit on the Clients tab next to desk clients: marked, quiet, and counted in the money like anyone", async () => {
  addClient(); addLegacy();
  addLegacy({ "Desk Packages": ["Local Growth"], "Desk Monday Client ID": "13125562410" }, { companyName: "Sconyers Concrete Inc", website: "" }, "LegacySconyers000001");
  const rows = (await listClientsGhl()).rows;
  const squirrel = rows.find((r) => r.id === CLIENT)!; const whiten = rows.find((r) => r.id === LEGACY)!; const sconyers = rows.find((r) => r.id === "LegacySconyers000001")!;
  // The desk client is exactly what it was before legacy clients existed.
  assert.equal(squirrel.legacy, false); assert.deepEqual(squirrel.flags, ["gbp", "report", "no-stripe"]); assert.equal(squirrel.mrr, "297");
  // A legacy client: the business name is the client, nobody is the contact, nothing nags.
  assert.equal(whiten.legacy, true); assert.equal(whiten.name, "Whiten Pools, Inc."); assert.equal(whiten.contact, ""); assert.equal(whiten.email, ""); assert.equal(whiten.website, "https://whiten-pools.com");
  assert.equal(whiten.group, "active"); assert.equal(whiten.payStatus, "No Billing Set Up"); assert.equal(whiten.payMethod, "QuickBooks invoice"); assert.equal(whiten.accountManager, "Josh"); assert.equal(whiten.gbpAccess, "");
  assert.deepEqual(whiten.flags, []); assert.deepEqual(sconyers.flags, []);
  // Money: a legacy client's packages count at list price, for owners only — the same rule as every client.
  assert.equal(whiten.mrr, "0"); assert.equal(sconyers.mrr, "497");
  assert.equal(rows.reduce((sum, r) => sum + Number(r.mrr), 0), 794);
  assert.equal((await clientDetailGhl("LegacySconyers000001", false)).row.mrr, "", "not shown to someone who is not an owner");
  assert.equal((await clientDetailGhl("LegacySconyers000001", true)).row.mrr, "497");
  // The panel opens by contact id and by the old board's row id, with its file store under the old key.
  const detail = await clientDetailGhl("13125631516", true);
  assert.equal(detail.row.id, LEGACY); assert.equal(detail.row.legacy, true); assert.equal(detail.fileScope, "c13125631516"); assert.equal(detail.row.notes, "Search Atlas location 97647, GBP locked.");
  assert.equal(ghl.writes().length, 0, "looking at the tab and a panel wrote nothing");
});

test("only an owner marks or un-marks a legacy client; un-marking puts the desk rules back, marking again quiets them", async () => {
  addLegacy();
  const asOwner = (body: Record<string, unknown>) => patchClientGhl(LEGACY, validateDeskClientPatch({ expectedUpdatedAt: v(LEGACY), ...body }), DAVE, { owner: true });
  await assert.rejects(patch({ action: "legacy", value: false }, MADISON, LEGACY), (e: Error & { status?: number }) => e.status === 403 && /Only an owner/.test(e.message));
  await assert.rejects(patchClientGhl(LEGACY, validateDeskClientPatch({ action: "legacy", value: false, expectedUpdatedAt: v(LEGACY) }), DAVE), { status: 403 }, "the owner flag comes from the route, never from the request");
  assert.equal(ghl.writes().length, 0);
  assert.throws(() => validateDeskClientPatch({ action: "legacy", value: "no", expectedUpdatedAt: v(LEGACY) }), { status: 400 });
  assert.throws(() => validateDeskClientPatch({ action: "legacy", value: true }), { status: 400 }, "needs the record version like every change");
  assert.throws(() => validateDeskClientPatch({ action: "legacy", value: true, extra: 1, expectedUpdatedAt: v(LEGACY) }), { status: 400 });
  await assert.rejects(patchClientGhl(LEGACY, validateDeskClientPatch({ action: "legacy", value: false, expectedUpdatedAt: "2026-09-30T00:00:00.000Z" }), DAVE, { owner: true }), { status: 409 });
  let row = await asOwner({ action: "legacy", value: false });
  assert.equal(row.legacy, false); assert.equal(ghl.value(LEGACY, "Desk Legacy Client"), "No", "an explicit No, so a re-import of the old board leaves the owner's choice alone");
  assert.deepEqual(row.flags, ["gbp", "report"], "now a desk client: GBP and reports are expected (QuickBooks invoice: still no Stripe flag)");
  row = await asOwner({ action: "legacy", value: true });
  assert.equal(row.legacy, true); assert.equal(ghl.value(LEGACY, "Desk Legacy Client"), "Yes"); assert.deepEqual(row.flags, []);
  // A desk client can be marked legacy the same way.
  addClient();
  const squirrel = await patchClientGhl(CLIENT, validateDeskClientPatch({ action: "legacy", value: true, expectedUpdatedAt: v() }), DAVE, { owner: true });
  assert.equal(squirrel.legacy, true); assert.deepEqual(squirrel.flags, ["no-stripe"], "its Stripe method with no customer id is still a fact on the record");
  // Every other change on a legacy client is open to the whole team, as on any client — and tracking something starts its flag.
  row = await patch({ action: "gbp", value: "Requested", gbpUrl: "" }, MADISON, LEGACY); assert.deepEqual(row.flags, ["gbp"]);
  row = await patch({ action: "gbpChecked" }, MADISON, LEGACY); assert.deepEqual(row.flags, []);
  row = await patch({ action: "reportSent" }, MADISON, LEGACY); assert.deepEqual(row.flags, []);
  row = await patch({ action: "contact", contact: "Kelli Whiten", email: "kelli@whiten.example", phone: "", website: "https://whiten-pools.com" }, MADISON, LEGACY);
  assert.equal(row.contact, "Kelli Whiten"); assert.equal(ghl.get(LEGACY).companyName, "Whiten Pools, Inc.", "naming the person never touches the business name");
});

test("the desk keeps working on a location where Desk Legacy Client does not exist yet: nobody is legacy, and marking one says what is missing", async () => {
  ghl.defs = ghl.defs.filter((d) => d.name !== "Desk Legacy Client"); forgetCustomFields(); resetDeskFieldCheck();
  addClient();
  const row = (await listClientsGhl()).rows[0];
  assert.equal(row.legacy, false); assert.deepEqual(row.flags, ["gbp", "report", "no-stripe"]);
  assert.equal((await patch({ action: "health", value: "Green" })).health, "Green", "every other change still saves");
  await assert.rejects(patchClientGhl(CLIENT, validateDeskClientPatch({ action: "legacy", value: true, expectedUpdatedAt: v() }), DAVE, { owner: true }), (e: Error & { status?: number }) => e.status === 503 && /"Desk Legacy Client" does not exist yet/.test(e.message));
});

test("Stripe leaves a legacy client alone unless Stripe is part of its record", async () => {
  addLegacy({}, { email: "office@whiten.example" });
  const row = (await listClientsGhl()).rows[0];
  // Nightly reconcile: it has an email, but it is billed by QuickBooks invoice — not looked up.
  assert.equal(reconcilable(row), false);
  // A Stripe event for a customer with the same email is not matched to it either.
  assert.equal(await findClientByStripeCustomerGhl("cus_999", "office@whiten.example"), null);
  // Once Stripe is on the record — the method, or a customer id someone stored — it is followed like any client.
  await patch({ action: "payMethod", value: "Stripe via GHL" }, DAVE, LEGACY);
  assert.equal((await findClientByStripeCustomerGhl("cus_999", "office@whiten.example"))?.id, LEGACY); assert.equal(reconcilable((await listClientsGhl()).rows[0]), true);
  await patch({ action: "payMethod", value: "QuickBooks invoice" }, DAVE, LEGACY); await patch({ action: "stripeCustomer", customerId: "cus_ABC" }, DAVE, LEGACY);
  assert.equal((await findClientByStripeCustomerGhl("cus_ABC"))?.id, LEGACY); assert.equal(reconcilable((await listClientsGhl()).rows[0]), true);
  // A desk client is reconciled as before: a customer id or an email is enough.
  addClient();
  const squirrel = (await listClientsGhl()).rows.find((r) => r.id === CLIENT)!;
  assert.equal(reconcilable(squirrel), true); assert.equal(reconcilable({ ...squirrel, email: "", stripeCustomer: "" }), false);
  assert.equal(ghl.tasks.length, 0);
});

test("a payment problem someone records on a legacy client is still a payment problem", async () => {
  addLegacy();
  const row = await patch({ action: "payStatus", value: "Overdue" }, DAVE, LEGACY);
  assert.equal(row.group, "issue"); assert.deepEqual(row.flags, ["payment"]);
  assert.equal(ghl.tasks.length, 1); assert.equal(ghl.tasks[0].title, "Whiten Pools, Inc. is overdue on payment. Chase it before the service lapses."); assert.equal(ghl.tasks[0].assignedTo, reps.Josh);
});

// ───────────────────────────── the Sales list leaves out the desk's businesses (Dave, Oct 9 2026) ─────────────────────────────
test("the Sales list leaves out every business on the Onboarding or Clients tab — decided by the same rule the two tabs list by", async () => {
  const lead = (id: string, name: string, fields: Record<string, unknown> = {}, tags: string[] = ["giveaway-entrant"]) =>
    ghl.addContact({ id, companyName: name, firstName: "Pat", lastName: name.split(" ")[0], email: `${id.toLowerCase()}@example.com`, phone: "+14045550199", tags, assignedTo: reps.Dave, fields: { "Lead Source": "The Big Giveaway", "Outreach Status": "Call Booked", ...fields } });
  // Still leads: nothing on the desk yet. A Won lead nobody has handed off is on neither tab, so it stays on Sales.
  lead("PlainLead00000000001", "Plain Lead Co");
  lead("WonNoHandoff00000001", "Won Not Handed Off", { "Outreach Status": "Won" }, ["giveaway-entrant", "sales-won"]);
  // On the Onboarding tab: by the tag alone, by the stage alone, launched without becoming a client, and a client whose onboarding is not finished.
  lead("ObTagOnly00000000001", "Blue Ridge Golf Carts LLC", {}, ["giveaway-entrant", "desk-onboarding"]);
  lead("ObStageOnly000000001", "Stage Only Co", { "Desk Onboarding Stage": "Collecting assets / access" }, ["playbook-lead"]);
  lead("ObLaunched0000000001", "Launched Not Client", { "Desk Onboarding Stage": "Launched" }, ["giveaway-entrant", "desk-onboarding"]);
  lead("StillOnboarding00001", "Client Still Onboarding", { "Desk Onboarding Stage": "New handoff", "Desk Client Status": "Active" }, ["giveaway-entrant", "desk-onboarding", "desk-client"]);
  // On the Clients tab: every status the tab can show — active, at risk, paused, churned, payment issue, legacy — and a launched graduate.
  lead("ClActive000000000001", "Arctic Law Alaska", { "Desk Client Status": "Active" }, ["playbook-lead", "desk-client"]);
  lead("ClChurned00000000001", "Churned Co", { "Desk Client Status": "Churned" }, ["giveaway-entrant", "desk-client"]);
  lead("ClPaused000000000001", "Paused Co", { "Desk Client Status": "Paused" }, ["sales-lead"]);
  lead("ClRisk00000000000001", "At Risk Co", { "Desk Client Status": "At risk" }, ["giveaway-entrant", "desk-client"]);
  lead("ClIssue0000000000001", "Payment Issue Co", { "Desk Client Status": "Payment issue" }, ["giveaway-entrant", "desk-client"]);
  lead("ClLegacy000000000001", "Choice Enterprises", { "Desk Client Status": "Active", "Desk Legacy Client": "Yes" }, ["website-form", "desk-client"]);
  lead("Graduated00000000001", "Graduated Co", { "Desk Onboarding Stage": "Launched", "Desk Client Status": "Active" }, ["giveaway-entrant", "desk-onboarding", "desk-client"]);
  // A client that never was a lead: the roster search never finds it, so it is neither listed nor counted.
  addClient({}, "NeverALead0000000001");
  ghl.get("NeverALead0000000001").tags = ["desk-client"];

  const page = await getCallsPage(null, "ghl", { hideDeskRecords: true });
  assert.deepEqual(page.leads.map((l) => l.id).sort(), ["PlainLead00000000001", "WonNoHandoff00000001"]);
  // The tabs' own lists are the truth: what Sales hides is exactly the roster's contacts that appear on them, under the tab that lists them.
  const onTab = new Map<string, string>();
  for (const r of (await listOnboardingGhl()).rows) onTab.set(r.id, "onboarding");
  for (const r of (await listClientsGhl()).rows) onTab.set(r.id, "clients"); // a launched graduate is listed on both; the Clients tab is where it lives
  const expected = [...onTab].filter(([id]) => id !== "NeverALead0000000001").sort();
  assert.deepEqual(page.deskHidden!.map((h) => [h.id, h.tab]).sort(), expected);
  assert.equal(page.deskHidden!.length, 11);
  assert.equal(page.deskHidden!.find((h) => h.id === "StillOnboarding00001")!.tab, "onboarding", "one place at a time: a client still onboarding is on the Onboarding tab");
  assert.equal(page.deskHidden!.find((h) => h.id === "ObTagOnly00000000001")!.name, "Blue Ridge Golf Carts LLC");
  // Looking is not changing: the Sales list read the definitions and searched, and wrote nothing.
  assert.deepEqual(ghl.writes(), []);
  // The calendar feeds ask without the rule and still get every lead (a handed-off client's booked call stays on the calendar).
  const feed = await getCallsPage(null, "ghl");
  assert.equal(feed.leads.length, 13); assert.equal(feed.deskHidden, undefined);
});
test("the desk-tab rule without the desk fields (a location before setup) places contacts by the desk tags alone", async () => {
  const rule = await deskTabRule();
  const c = (tags: string[]) => ({ id: "Anyone00000000000001", tags, customFields: [] });
  assert.equal(rule(c(["giveaway-entrant"])), null);
  assert.equal(deskTabOf(c(["desk-onboarding"]), {}), "onboarding");
  assert.equal(deskTabOf(c(["desk-client"]), {}), "clients");
  assert.equal(deskTabOf(c(["desk-client", "desk-onboarding"]), {}), "onboarding", "no stage to say it launched: still onboarding, which is where the Clients tab leaves it too");
  assert.equal(deskTabOf(c(["lse:client", "sales-won"]), {}), null, "Josh's LSE tags and the Won tag are not the desk's: they move nobody off Sales");
});
