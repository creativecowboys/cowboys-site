import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { graduateGhl, listOnboardingGhl, onboardingDetailGhl, patchOnboardingGhl, retryOnboardingGhl, startOnboardingGhl } from "./onboarding";
import { listClientsGhl } from "./clients";
import { winnerForContactGhl } from "./winners";
import { forgetCustomFields } from "@/lib/ghl/client";
import { validateDeskPatch } from "./validation";
import { parseChecklist } from "./checklist-text";
import { checklistFor } from "@/lib/onboarding/checklist";
import { todayEastern } from "@/lib/onboarding/api";
import { validateHandoff } from "@/lib/onboarding/validation";
import type { HandoffRecord, IntakeRecord } from "@/lib/onboarding/types";
import { blobJson, blobKeys, blobSeed } from "./testing/blob-stub";
import type { FakeGhl } from "./testing/fake-ghl";
import { addLead, assertOnlyDeskWrites, DAVE, handoffForm, LEAD, MADISON, ORIGIN, reps, setUp, tearDown } from "./testing/harness";

let ghl: FakeGhl;
beforeEach(() => { ghl = setUp(); });
afterEach(() => { assertOnlyDeskWrites(ghl); tearDown(ghl); });
const ctx = { origin: ORIGIN, actor: DAVE };
const v = (id = LEAD) => String(ghl.get(id).dateUpdated);
const patch = (body: Record<string, unknown>, actor = DAVE, id = LEAD) => patchOnboardingGhl(id, validateDeskPatch({ expectedUpdatedAt: v(id), ...body }), actor);

test("handoff from a won lead: the lead's own contact becomes the onboarding record", async () => {
  addLead(ghl);
  const form = handoffForm(ghl);
  const r = await startOnboardingGhl(validateHandoff(form), ctx);
  assert.deepEqual(r, { itemId: LEAD, itemUrl: `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${LEAD}`, pending: [], adopted: false, system: "ghl" });
  const today = todayEastern();
  const want: Record<string, unknown> = {
    "Desk Onboarding Stage": "New handoff", "Desk Onboarding Health": "Not Started", "Desk GBP Access": "Not Requested", "Desk Intake": "Not sent",
    "Desk Agreement": "Pending", "Desk Onboarding Payment": "Pending", "Desk Handoff ID": form.handoffId, "Desk Signed": today, "Desk Last Touch": today,
    "Desk Sales Owner": "Dave", "Desk Setup Amount": 497, "Desk Target Launch": "2026-10-15", "Desk Business Type": "Ecommerce",
    "Desk Next Action": "Madison: send the intake link and request assets", "Desk Next Action Due": "2026-10-03", "Desk Link": `${ORIGIN}/leads?tab=onboarding&client=${LEAD}`,
  };
  for (const [name, value] of Object.entries(want)) assert.deepEqual(ghl.value(LEAD, name), value, name);
  assert.deepEqual(ghl.value(LEAD, "Desk Packages"), ["Local Growth — First Year $297"]);
  assert.match(String(ghl.value(LEAD, "Desk Notes")), /^Monthly agreed: \$297 · Setup agreed: \$497\nScope: Local SEO and a new site\nGoals: New site$/);
  assert.deepEqual(parseChecklist(String(ghl.value(LEAD, "Desk Checklist"))).map((i) => i.name), checklistFor(form.packages).map((t) => t.name));
  // The lead is marked Won on the same contact; nothing about who the contact is was overwritten.
  const c = ghl.get(LEAD);
  assert.equal(ghl.value(LEAD, "Outreach Status"), "Won"); assert.ok(c.tags!.includes("desk-onboarding") && c.tags!.includes("sales-won") && c.tags!.includes("giveaway-entrant"));
  assert.equal(c.email, "freddy@bourbon.example"); assert.equal(c.phone, "+13865895606"); assert.equal(c.companyName, "Bourbon Leather Company"); assert.equal(c.assignedTo, reps.Dave);
  // Josh's LSE values on the contact are exactly as they were.
  assert.equal(ghl.value(LEAD, "LSE Health"), "green"); assert.equal(ghl.value(LEAD, "LSE Term End"), "2027-09-28"); assert.ok(c.tags!.includes("lse:client"));
  // One handoff note (authored as the sales owner); the Sales tab's "handed off" note is not posted on top of it.
  const notes = ghl.notesFor(LEAD);
  assert.equal(notes.length, 1); assert.equal(notes[0].userId, reps.Dave);
  assert.match(notes[0].body, /^Sales → onboarding handoff\nBusiness: Bourbon Leather Company\n/); assert.ok(notes[0].body.includes(`[CC-HANDOFF:${form.handoffId}]`));
  // Durable state in Blob, keyed by the contact id.
  const record = blobJson<HandoffRecord>(`onboarding/handoffs/${LEAD}.json`)!;
  assert.equal(record.itemId, LEAD); assert.ok(Object.values(record.steps).every((s) => s.state === "done"));
  const intake = blobJson<IntakeRecord>(`onboarding/intake/${LEAD}.json`)!;
  assert.equal(intake.contactId, LEAD); assert.equal(intake.business, "Bourbon Leather Company"); assert.equal(intake.form.email, "freddy@bourbon.example");
});

test("a second click, a reload or another rep never makes a second record or a second note", async () => {
  addLead(ghl);
  const form = validateHandoff(handoffForm(ghl));
  await startOnboardingGhl(form, ctx);
  const writesAfterFirst = ghl.writes().length;
  const again = await startOnboardingGhl(form, ctx); // same draft, lead version now stale — still fine, the record exists
  assert.equal(again.adopted, false); assert.deepEqual(again.pending, []); assert.equal(again.itemId, LEAD);
  assert.equal(ghl.writes().length, writesAfterFirst, "nothing written the second time");
  const other = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { handoffId: "11111111-2222-4333-8444-555555555555", scope: "A different draft" })), { origin: ORIGIN, actor: MADISON });
  assert.equal(other.adopted, true); assert.equal(other.itemId, LEAD);
  assert.equal(ghl.value(LEAD, "Desk Handoff ID"), form.handoffId, "the first handoff stays the record");
  assert.equal(ghl.notesFor(LEAD).filter((n) => n.body.includes("[CC-HANDOFF:")).length, 1);
  assert.equal(blobKeys().filter((k) => k.startsWith("onboarding/handoffs/")).length, 1);
});

test("a lead that changed since the rep opened it is refused before anything is written", async () => {
  addLead(ghl);
  const form = validateHandoff({ ...handoffForm(ghl), expectedUpdatedAt: "2026-09-30T00:00:00.000Z" });
  await assert.rejects(startOnboardingGhl(form, ctx), { status: 409 });
  assert.equal(ghl.writes().length, 0); assert.equal(blobKeys().length, 0);
  await assert.rejects(startOnboardingGhl(validateHandoff({ ...handoffForm(ghl), leadId: "13149403716", expectedUpdatedAt: "2026-09-30T00:00:00.000Z" }), ctx), { status: 409 }, "a draft that still points at a Monday lead id never reaches Monday");
});

test("a failed step is recorded and Retry finishes only what is missing", async () => {
  addLead(ghl);
  ghl.failures.push({ match: /^POST \/contacts\/[^/]+\/notes$/, status: 500 });
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  assert.deepEqual(r.pending, ["summary"]);
  assert.equal(ghl.value(LEAD, "Desk Onboarding Stage"), "New handoff"); assert.equal(ghl.notesFor(LEAD).length, 1, "the lead was still marked Won, with its own short handoff note");
  const retried = await retryOnboardingGhl(LEAD, DAVE);
  assert.deepEqual(retried.pending, []); assert.equal(retried.itemId, LEAD);
  const notes = ghl.notesFor(LEAD);
  assert.equal(notes.length, 2, "the summary that failed is posted on the retry, even though the lead's short handoff note is already there");
  assert.ok(notes[1].body.startsWith("Sales → onboarding handoff")); assert.ok(notes[0].body.startsWith("Handed off to onboarding."));
  assert.deepEqual((await retryOnboardingGhl(LEAD, DAVE)).pending, []); assert.equal(ghl.notesFor(LEAD).length, 2, "and never a third time");
  ghl.addContact({ id: "NoHandoffContact0000", fields: { "Desk Onboarding Stage": "New handoff" } });
  await assert.rejects(retryOnboardingGhl("NoHandoffContact0000", DAVE), { status: 400 });
});

test("Add client (no lead): creates a contact, or reuses the one GoHighLevel already has for that email", async () => {
  const manual = { handoffId: "22222222-3333-4444-8555-666666666666", leadId: "", manual: true, business: "Choice Pressure Washing", contact: "Reese Pownall", email: "reese@choice.example", phone: "(770) 949-0407", website: "", city: "Villa Rica, GA", salesOwner: "Josh" as const, packages: ["Giveaway Winner" as const, "Local Growth" as const], monthlyAgreed: "", setupAgreed: "" };
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl, manual)), ctx);
  assert.equal(r.adopted, false); assert.deepEqual(r.pending, []);
  const c = ghl.get(r.itemId);
  assert.equal(c.companyName, "Choice Pressure Washing"); assert.equal(c.firstName, "Reese"); assert.equal(c.lastName, "Pownall"); assert.equal(c.email, "reese@choice.example"); assert.equal(c.phone, "+17709490407"); assert.equal(c.city, "Villa Rica"); assert.equal(c.state, "GA");
  assert.equal(c.assignedTo, reps.Josh, "a brand-new contact goes to the sales owner"); assert.deepEqual(c.tags, ["desk-onboarding"]);
  // A giveaway winner: $0, No charge, and the do-not-bill note.
  assert.equal(ghl.value(r.itemId, "Desk Onboarding Payment"), "No charge"); assert.equal(ghl.value(r.itemId, "Desk Setup Amount"), 0);
  assert.match(String(ghl.value(r.itemId, "Desk Notes")), /^GIVEAWAY WINNER — NO CHARGE/);
  assert.ok(String(ghl.value(r.itemId, "Desk Checklist")).includes("Giveaway winner: confirmed no invoice or recurring plan in GHL"));
  assert.equal(ghl.value(r.itemId, "Outreach Status"), undefined, "a client added by hand is not a sales lead; nothing is marked Won");
  assert.ok(blobJson<HandoffRecord>(`onboarding/handoffs/manual-${manual.handoffId}.json`));
  // Same button pressed again → the same contact.
  const again = await startOnboardingGhl(validateHandoff(handoffForm(ghl, manual)), ctx);
  assert.equal(again.itemId, r.itemId); assert.equal(ghl.contacts.size, 1);
  // A different client whose email GoHighLevel already knows: that contact is used, and its details are not overwritten.
  const known = ghl.addContact({ id: "KnownContact00000001", firstName: "Jeremy", companyName: "Squirrel Made", email: "jeremy@squirrel.example", phone: "+14045550100", assignedTo: reps.Keaton });
  const second = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { ...manual, handoffId: "33333333-4444-4555-8666-777777777777", business: "Squirrel Made Products", contact: "Someone Else", email: "Jeremy@Squirrel.example", phone: "", packages: ["Local Growth"] })), ctx);
  assert.equal(second.itemId, known.id); assert.equal(ghl.contacts.size, 2);
  const k = ghl.get(known.id);
  assert.equal(k.firstName, "Jeremy"); assert.equal(k.phone, "+14045550100"); assert.equal(k.assignedTo, reps.Keaton, "an existing owner in GoHighLevel is never replaced");
  assert.equal(k.companyName, "Squirrel Made Products", "the business name the rep typed is the record's name");
});

test("a first attempt that failed part-way is finished on the same contact: no second contact, no missing tag, nothing left pending", async () => {
  // Add client by name alone (no email or phone to find the contact by); GoHighLevel fails right after the contact is created.
  const manual = validateHandoff(handoffForm(ghl, { handoffId: "44444444-5555-4666-8777-888888888888", leadId: "", manual: true, business: "Name Only Roofing", contact: "", email: "", phone: "", website: "", city: "", packages: ["Local Growth"], monthlyAgreed: "", setupAgreed: "" }));
  ghl.failures.push({ match: /^PUT \/contacts\//, status: 500 });
  await assert.rejects(startOnboardingGhl(manual, ctx));
  assert.equal(ghl.contacts.size, 1);
  const r = await startOnboardingGhl(manual, ctx);
  assert.equal(ghl.contacts.size, 1, "the retry finished the contact the first attempt made"); assert.deepEqual(r.pending, []);
  assert.equal(ghl.value(r.itemId, "Desk Onboarding Stage"), "New handoff"); assert.deepEqual(ghl.get(r.itemId).tags, ["desk-onboarding"]);
  // The stored contact was deleted in GoHighLevel since: the next attempt makes a new one rather than failing forever.
  ghl.contacts.delete(r.itemId);
  const afterDelete = await startOnboardingGhl(manual, ctx);
  assert.notEqual(afterDelete.itemId, r.itemId); assert.equal(ghl.contacts.size, 1); assert.equal(ghl.value(afterDelete.itemId, "Desk Onboarding Stage"), "New handoff");

  // Handoff from a lead: the fields are written, then GoHighLevel fails on the tag. The rep presses Confirm again with the same draft.
  addLead(ghl);
  const form = validateHandoff(handoffForm(ghl));
  ghl.failures.push({ match: new RegExp(`^POST /contacts/${LEAD}/tags$`), status: 500 });
  await assert.rejects(startOnboardingGhl(form, ctx));
  assert.equal(ghl.value(LEAD, "Desk Onboarding Stage"), "New handoff"); assert.ok(!ghl.get(LEAD).tags!.includes("desk-onboarding"));
  const again = await startOnboardingGhl(form, ctx);
  assert.deepEqual([again.itemId, again.pending, again.adopted], [LEAD, [], false]);
  assert.ok(ghl.get(LEAD).tags!.includes("desk-onboarding"), "the tag the first attempt missed is added");
  const record = blobJson<HandoffRecord>(`onboarding/handoffs/${LEAD}.json`)!;
  assert.equal(record.itemId, LEAD); assert.equal(record.steps.item.state, "done");
  assert.equal(ghl.notesFor(LEAD).filter((n) => n.body.includes("[CC-HANDOFF-SUMMARY:")).length, 1);
  assert.deepEqual(ghl.value(LEAD, "Desk Packages"), ["Local Growth — First Year $297"]);
});

test("onboarding started on a contact that is already a client keeps what the client record holds — a Giveaway Winner stays one", async () => {
  const c = ghl.addContact({ id: "ClientSquirrel000001", firstName: "Jeremy", lastName: "Nutt", companyName: "Squirrel Made Products", email: "jeremy@squirrel.example", tags: ["desk-client"],
    fields: { "Desk Client Status": "Active", "Desk Packages": ["Giveaway Winner", "Local Growth"], "Desk Notes": "Sept 24: Josh confirmed this IS an active monthly client.", "Desk GBP Access": "Verified", "Desk Intake": "Reviewed", "Desk Monday Client ID": "13125661635", "Desk Pay Status": "No Billing Set Up", "Desk Client Since": "2026-09-15" } });
  assert.ok(await winnerForContactGhl({ id: c.id }));
  // Someone adds the same business by hand (same email) with an upsell.
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { handoffId: "55555555-6666-4777-8888-999999999999", leadId: "", manual: true, business: "Squirrel Made Products", contact: "Jeremy Nutt", email: "jeremy@squirrel.example", phone: "", packages: ["Social Ads $300"], monthlyAgreed: "300", setupAgreed: "" })), ctx);
  assert.equal(r.itemId, c.id); assert.equal(ghl.contacts.size, 1);
  assert.deepEqual(ghl.value(c.id, "Desk Packages"), ["Giveaway Winner", "Local Growth", "Social Ads $300"], "packages are added to, never replaced");
  assert.equal(ghl.value(c.id, "Desk Notes"), "Sept 24: Josh confirmed this IS an active monthly client.\n\nMonthly agreed: $300 · Setup agreed: not recorded\nScope: Local SEO and a new site\nGoals: New site");
  assert.equal(ghl.value(c.id, "Desk GBP Access"), "Verified"); assert.equal(ghl.value(c.id, "Desk Intake"), "Reviewed");
  assert.equal(ghl.value(c.id, "Desk Client Status"), "Active"); assert.equal(ghl.value(c.id, "Desk Client Since"), "2026-09-15"); assert.equal(ghl.value(c.id, "Desk Onboarding Stage"), "New handoff");
  assert.ok(await winnerForContactGhl({ id: c.id }), "still a giveaway winner: the package builder still refuses to bill them");
  assert.deepEqual((await listClientsGhl()).rows, [], "one place at a time: back on the Onboarding tab until it launches again");
  const row = (await listOnboardingGhl()).rows[0];
  assert.equal(row.id, c.id); assert.equal(row.monthly, "0");
});

test("Add client for a business whose onboarding is already open adopts that record and applies nothing of the new draft", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  const before = { notes: ghl.notesFor(LEAD).length, checklist: ghl.value(LEAD, "Desk Checklist"), packages: ghl.value(LEAD, "Desk Packages"), version: v(), puts: ghl.writes().filter((w) => w.method !== "GET").length };
  // Someone on the Onboarding tab adds "the same" client by hand, with other packages.
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { handoffId: "99999999-aaaa-4bbb-8ccc-dddddddddddd", leadId: "", manual: true, business: "Bourbon Leather", contact: "Freddy", email: "FREDDY@bourbon.example", phone: "", packages: ["Max Growth", "Google Ads $500"], monthlyAgreed: "", setupAgreed: "" })), ctx);
  assert.deepEqual([r.itemId, r.adopted, r.pending], [LEAD, true, []]);
  assert.deepEqual({ notes: ghl.notesFor(LEAD).length, checklist: ghl.value(LEAD, "Desk Checklist"), packages: ghl.value(LEAD, "Desk Packages"), version: v(), puts: ghl.writes().filter((w) => w.method !== "GET").length }, before, "the record is exactly as it was");
  assert.equal(ghl.contacts.size, 1); assert.equal(ghl.get(LEAD).companyName, "Bourbon Leather Company");
});

test("a handoff onto a record that came from the old board with no stored handoff is adopted and applies nothing", async () => {
  // Choice Pressure Washing: made by hand on the Monday board, imported — an open onboarding record with no handoff in storage.
  addLead(ghl, { tags: ["sales-lead", "desk-onboarding"], fields: { "Lead Source": "The Big Giveaway", "Outreach Status": "Call Booked", "Desk Onboarding Stage": "Collecting assets / access", "Desk Packages": ["Local Growth — First Year $297"], "Desk Checklist": "[x] Welcome email + onboarding link delivered (LSE-01) | Onboard", "Desk Monday Onboarding ID": "13052279909" } });
  const writes = ghl.writes().length;
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { packages: ["Max Growth"] })), ctx);
  assert.deepEqual(r, { itemId: LEAD, itemUrl: `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${LEAD}`, pending: [], adopted: true, system: "ghl" });
  assert.equal(ghl.writes().length, writes, "no note, no checklist rows, no Won mark, no field");
  assert.equal(ghl.value(LEAD, "Outreach Status"), "Call Booked"); assert.equal(ghl.value(LEAD, "Desk Checklist"), "[x] Welcome email + onboarding link delivered (LSE-01) | Onboard");
  assert.deepEqual(blobKeys(), [], "and nothing is left in storage for a handoff that did not happen");
});

test("a package GoHighLevel's Desk Packages list does not have is refused before anything is saved", async () => {
  addLead(ghl);
  const def = ghl.defs.find((d) => d.name === "Desk Packages")!;
  def.picklistOptions = (def.picklistOptions || []).filter((o) => o !== "Giveaway Winner"); forgetCustomFields();
  const form = validateHandoff(handoffForm(ghl, { packages: ["Giveaway Winner", "Local Growth"], monthlyAgreed: "", setupAgreed: "" }));
  await assert.rejects(startOnboardingGhl(form, ctx), (e: Error & { status?: number }) => e.status === 409 && /"Giveaway Winner" is not on the "Desk Packages" list in GoHighLevel, so nothing was saved/.test(e.message));
  assert.equal(ghl.writes().length, 0); assert.deepEqual(blobKeys(), []);
  // Someone adds the option in GoHighLevel and the rep presses Confirm again straight away: no ten-minute wait for the cache.
  def.picklistOptions = [...(def.picklistOptions || []), "Giveaway Winner"];
  const done = await startOnboardingGhl(form, ctx);
  assert.deepEqual([done.itemId, done.pending], [LEAD, []]); assert.deepEqual(ghl.value(LEAD, "Desk Packages"), ["Giveaway Winner", "Local Growth"]);
});

test("the list and the panel: rows, what is missing, overdue, the whole history, the stored handoff", async () => {
  addLead(ghl);
  ghl.notes.push({ id: "callnote000000000001", contactId: LEAD, userId: reps.Josh, dateAdded: "2026-09-28T15:00:00.000Z", body: "Call note — Creative Cowboys desk\nRep: Josh\nOutcome: Booked followup\nConversation notes: wants a new site\n\n[CC-CALL:6f1c2a4e-3b7d-4c8e-9f01-23456789abcd] [CC-PAYLOAD:" + "a".repeat(64) + "]" });
  await startOnboardingGhl(validateHandoff(handoffForm(ghl, { nextDue: "2000-01-01" })), ctx);
  const list = await listOnboardingGhl();
  assert.equal(list.system, "ghl"); assert.equal(list.cursor, null); assert.equal(list.rows.length, 1);
  const row = list.rows[0];
  assert.equal(row.id, LEAD); assert.equal(row.name, "Bourbon Leather Company"); assert.equal(row.contact, "Freddy Sumbay"); assert.equal(row.city, "Parrish, FL"); assert.equal(row.stage, "new");
  assert.equal(row.packages, "Local Growth — First Year $297"); assert.equal(row.monthly, "297"); assert.equal(row.setup, "497"); assert.equal(row.salesOwner, "Dave"); assert.deepEqual(row.onboardingOwnerIds, []);
  assert.equal(row.overdue, true); assert.equal(row.missing.length, checklistFor(["Local Growth — First Year $297"]).filter((t) => t.required).length);
  assert.equal(row.url, `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${LEAD}`);
  const detail = await onboardingDetailGhl(LEAD);
  assert.equal(detail.system, "ghl"); assert.equal(detail.fileScope, LEAD); assert.equal(detail.nextDue, "2000-01-01");
  assert.deepEqual(detail.owners.map((o) => o.id), ["Dave", "Josh", "Keaton", "Madison"]);
  assert.equal(detail.record?.handoff.monthlyAgreed, "297"); assert.equal(detail.intake?.linkActive, false); assert.equal((detail.intake as unknown as { tokenHash?: string }).tokenHash, undefined);
  assert.deepEqual(detail.history.map((h) => [h.source, h.author]), [["Handoff", "Dave"], ["Sales call", "Josh"]], "sales-call notes and the handoff are one history, newest first");
  assert.ok(!detail.history.some((h) => /\[CC-/.test(h.text)));
  // The designated test contact never shows in a list; a contact with the tag but no stage shows as Unknown rather than vanishing.
  ghl.addContact({ id: "C8FHl1LIfXEMI9isByB2", tags: ["desk-onboarding"], fields: { "Desk Onboarding Stage": "New handoff" } });
  ghl.addContact({ id: "TagOnlyContact000001", companyName: "Tag Only Co", tags: ["desk-onboarding"] });
  const rows = (await listOnboardingGhl()).rows;
  assert.deepEqual(rows.map((r) => r.id).sort(), [LEAD, "TagOnlyContact000001"].sort()); assert.equal(rows.find((r) => r.id === "TagOnlyContact000001")!.stage, "unknown");
  await assert.rejects(onboardingDetailGhl("NotARecord0000000001"), { status: 404 });
});

test("patches: every onboarding action lands in a desk field, guarded by the contact version", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  await assert.rejects(patchOnboardingGhl(LEAD, validateDeskPatch({ action: "health", value: "On Track", expectedUpdatedAt: "2026-09-30T00:00:00.000Z" }), DAVE), { status: 409 }, "stale version");
  let row = await patch({ action: "health", value: "Waiting on Client" });
  assert.equal(row.health, "Waiting on Client"); assert.equal(ghl.value(LEAD, "Desk Onboarding Health"), "Waiting on Client"); assert.equal(ghl.value(LEAD, "LSE Health"), "green");
  row = await patch({ action: "owner", ownerId: "Madison" }, MADISON);
  assert.equal(row.onboardingOwner, "Madison"); assert.deepEqual(row.onboardingOwnerIds, ["Madison"]); assert.equal(ghl.get(LEAD).assignedTo, reps.Dave, "the GoHighLevel owner (sales) is untouched");
  assert.throws(() => validateDeskPatch({ action: "owner", ownerId: "39848115", expectedUpdatedAt: v() }), { status: 400 }, "a Monday person id is not an owner here");
  row = await patch({ action: "owner", ownerId: "" }); assert.equal(row.onboardingOwner, "");
  row = await patch({ action: "stage", stage: "collecting" }); assert.equal(row.stage, "collecting"); assert.equal(ghl.value(LEAD, "Desk Onboarding Stage"), "Collecting assets / access");
  row = await patch({ action: "agreement", value: "Signed" }); assert.equal(row.agreement, "Signed");
  row = await patch({ action: "payment", value: "Deposit paid" }); assert.equal(row.payment, "Deposit paid");
  await assert.rejects(patch({ action: "payment", value: "No charge" }), { status: 400 }, "No charge is for giveaway winners only");
  row = await patch({ action: "dns", value: "Client adds our CNAME" }); assert.equal(row.dnsPath, "Client adds our CNAME");
  row = await patch({ action: "dns", value: "" }); assert.equal(row.dnsPath, "");
  row = await patch({ action: "gbp", value: "Requested", gbpUrl: "https://maps.google.com/?cid=1" }); assert.equal(row.gbpAccess, "Requested"); assert.equal(row.gbpUrl, "https://maps.google.com/?cid=1");
  row = await patch({ action: "next", nextAction: "Call Freddy about the logo", due: "2000-01-02" }); assert.equal(row.nextAction, "Call Freddy about the logo"); assert.equal(row.overdue, true);
  row = await patch({ action: "next", nextAction: "Call Freddy about the logo", due: "" }); assert.equal(row.overdue, false); assert.equal(ghl.value(LEAD, "Desk Next Action Due"), "");
  row = await patch({ action: "searchAtlasListing", listingId: "94266" }); assert.equal(row.searchAtlasListing, "94266"); assert.equal(row.gbpAccess, "Requested", "no Search Atlas key → nothing is promoted");
  // Checklist: tick one, mark one stuck, untick.
  const first = row.checklist[0];
  row = await patch({ action: "checklist", subitemId: first.id, status: "Done" });
  assert.equal(row.checklist[0].status, "Done"); assert.equal(row.missing.includes(first.name), false); assert.match(String(ghl.value(LEAD, "Desk Checklist")), /^\[x\] Intake link delivered to client \| Onboard\n\[ \] /);
  row = await patch({ action: "checklist", subitemId: row.checklist[1].id, status: "Stuck" }); assert.equal(row.checklist[1].status, "Stuck");
  row = await patch({ action: "checklist", subitemId: first.id, status: "" }); assert.equal(row.checklist[0].status, "Working on it");
  await assert.rejects(patch({ action: "checklist", subitemId: "c0123456789ab", status: "Done" }), { status: 400 });
  assert.throws(() => validateDeskPatch({ action: "checklist", subitemId: "13149902817", status: "Done", expectedUpdatedAt: v() }), { status: 400 }, "a Monday subitem id is not a checklist id here");
  assert.equal(row.lastTouch, todayEastern());
});

test("a checklist GoHighLevel did not keep whole is an error, never a quiet loss of rows", async () => {
  addLead(ghl);
  ghl.truncate.set("Desk Checklist", 300);
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  assert.deepEqual(r.pending, ["checklist"], "the handoff reports the checklist step as not done");
  assert.equal(ghl.value(LEAD, "Desk Checklist"), "", "and puts back what was there (nothing) rather than leave half a list");
  ghl.truncate.clear();
  assert.deepEqual((await retryOnboardingGhl(LEAD, DAVE)).pending, []);
  const row = (await onboardingDetailGhl(LEAD)).row;
  assert.equal(row.checklist.length, checklistFor(["Local Growth — First Year $297"]).length);
  ghl.truncate.set("Desk Checklist", 300);
  await assert.rejects(patch({ action: "checklist", subitemId: row.checklist[0].id, status: "Done" }), (e: Error & { status?: number }) => e.status === 502 && /kept \d+ of \d+ checklist rows/.test(e.message));
});

test("ready for production is refused with the reasons until everything required is done, then moves the stage", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  await assert.rejects(patch({ action: "ready" }), (e: Error & { status?: number }) => e.status === 409 && /Checklist: Intake link delivered to client/.test(e.message) && /GBP access is not verified by staff/.test(e.message) && /Agreement is Pending/.test(e.message) && /Payment is Pending/.test(e.message) && /Client intake has not been submitted/.test(e.message));
  await assert.rejects(patch({ action: "stage", stage: "ready" }), { status: 409 });
  let row = (await onboardingDetailGhl(LEAD)).row;
  for (const item of row.checklist.filter((c) => c.required)) row = await patch({ action: "checklist", subitemId: item.id, status: "Done" });
  await patch({ action: "gbp", value: "Verified" }); await patch({ action: "agreement", value: "Signed" }); await patch({ action: "payment", value: "Paid" });
  await patch({ action: "intakeReviewed" });
  row = await patch({ action: "ready" });
  assert.equal(row.stage, "ready"); assert.equal(row.health, "On Track"); assert.equal(row.profileComplete, true);
  assert.equal(ghl.value(LEAD, "Desk Profile Complete"), "Yes"); assert.equal(ghl.value(LEAD, "LSE Profile Complete"), undefined, "the LSE gate (which emails the client) is never set by the desk");
});

test("graduation: the same contact becomes a client; pressing twice changes nothing; one place at a time", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  await assert.rejects(graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: v() }, DAVE), { status: 409 }, "not from New handoff");
  await patch({ action: "owner", ownerId: "Madison" }); await patch({ action: "gbp", value: "Verified" }); await patch({ action: "stage", stage: "building" });
  assert.deepEqual((await listClientsGhl()).rows, [], "not a client yet");
  await assert.rejects(graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: "2026-09-30T00:00:00.000Z" }, DAVE), { status: 409 }, "stale version");
  const g = await graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: v() }, MADISON);
  assert.deepEqual(g, { id: LEAD, url: `https://app.gohighlevel.com/v2/location/LOCtest000000000000/contacts/detail/${LEAD}`, created: true });
  const today = todayEastern();
  const want: Record<string, unknown> = { "Desk Onboarding Stage": "Launched", "Desk Client Status": "Active", "Desk Client Health": "Too New", "Desk Pay Status": "No Billing Set Up", "Desk Pay Method": "Stripe via GHL", "Desk Client Since": today, "Desk GBP Access": "Verified", "Desk GBP Last Checked": today, "Desk Account Manager": "Madison", "Desk Next Action": `Graduated to the Clients tab ${today}` };
  for (const [name, value] of Object.entries(want)) assert.equal(ghl.value(LEAD, name), value, name);
  assert.ok(ghl.get(LEAD).tags!.includes("desk-client")); assert.equal(ghl.value(LEAD, "LSE Health"), "green");
  const clients = (await listClientsGhl()).rows;
  assert.equal(clients.length, 1); assert.equal(clients[0].id, LEAD); assert.equal(clients[0].group, "active"); assert.equal(clients[0].onboardingItem, LEAD); assert.equal(clients[0].mrr, "297");
  const writes = ghl.writes().length;
  assert.deepEqual(await graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: "" }, DAVE), { ...g, created: false });
  assert.equal(ghl.writes().length, writes, "safe to press twice");
  const note = (await onboardingDetailGhl(LEAD)).history[0];
  assert.equal(note.source, "Desk"); assert.equal(note.author, "Madison"); assert.match(note.text, /^Launched\. Bourbon Leather Company is now on the Clients tab\.$/);
  assert.equal((await listOnboardingGhl()).rows[0].stage, "launched");
});

test("new work for a client whose onboarding is finished starts a new round on the same contact; while it is still open a second handoff is only adopted", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  await patch({ action: "stage", stage: "building" });
  await graduateGhl(LEAD, { managerId: "Josh", expectedUpdatedAt: v() }, DAVE);
  assert.deepEqual((await listClientsGhl()).rows.map((r) => r.id), [LEAD]);
  const before = ghl.notesFor(LEAD).length;
  // The upsell: a new handoff (new draft id) for the same, launched, client.
  const upsell = validateHandoff(handoffForm(ghl, { handoffId: "77777777-8888-4999-8aaa-bbbbbbbbbbbb", packages: ["Google Ads $500"], monthlyAgreed: "500", setupAgreed: "", scope: "Add Google Ads" }));
  const r = await startOnboardingGhl(upsell, ctx);
  assert.deepEqual([r.itemId, r.adopted, r.pending], [LEAD, false, []]);
  assert.equal(ghl.value(LEAD, "Desk Onboarding Stage"), "New handoff"); assert.equal(ghl.value(LEAD, "Desk Handoff ID"), upsell.handoffId);
  assert.deepEqual(ghl.value(LEAD, "Desk Packages"), ["Local Growth — First Year $297", "Google Ads $500"], "the new package is added to what the client already has");
  assert.match(String(ghl.value(LEAD, "Desk Notes")), /Scope: Local SEO and a new site[\s\S]*\n\nMonthly agreed: \$500 · Setup agreed: not recorded\nScope: Add Google Ads/);
  assert.equal(ghl.value(LEAD, "Desk Client Status"), "Active"); assert.equal(ghl.value(LEAD, "Desk Account Manager"), "Josh");
  assert.equal(ghl.notesFor(LEAD).length, before + 1, "one new handoff summary");
  assert.ok(parseChecklist(String(ghl.value(LEAD, "Desk Checklist"))).length > checklistFor(["Local Growth — First Year $297"]).length, "the checklist grew by what the new package needs");
  assert.deepEqual((await listClientsGhl()).rows, [], "one place at a time: on the Onboarding tab until it launches again");
  // While that round is open, yet another draft is adopted and changes nothing.
  const writes = ghl.writes().length;
  const third = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { handoffId: "88888888-9999-4aaa-8bbb-cccccccccccc", packages: ["Max Growth"] })), ctx);
  assert.equal(third.adopted, true); assert.deepEqual(ghl.value(LEAD, "Desk Packages"), ["Local Growth — First Year $297", "Google Ads $500"]);
  assert.equal(ghl.writes().filter((w) => w.method === "PUT").length, ghl.writes().slice(0, writes).filter((w) => w.method === "PUT").length, "no field is written by an adopted handoff");
  // Launch it again: back on the Clients tab, with the client values it always had.
  await patch({ action: "stage", stage: "building" });
  await graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: v() }, DAVE);
  const client = (await listClientsGhl()).rows[0];
  assert.equal(client.id, LEAD); assert.equal(client.mrr, "797"); assert.equal(client.accountManager, "Josh");
});

test("a package GoHighLevel did not keep is an error at the handoff, and again on every retry until it is there", async () => {
  addLead(ghl);
  ghl.drop.set("Desk Packages", ["Giveaway Winner"]);
  const form = validateHandoff(handoffForm(ghl, { packages: ["Giveaway Winner", "Local Growth"], monthlyAgreed: "", setupAgreed: "" }));
  const lost = (e: Error & { status?: number }) => e.status === 502 && /GoHighLevel did not keep "Giveaway Winner" in "Desk Packages" on this contact \(it has: Local Growth\)/.test(e.message);
  await assert.rejects(startOnboardingGhl(form, ctx), lost);
  await assert.rejects(startOnboardingGhl(form, ctx), lost, "the retry does not paper over it");
  assert.equal(blobJson<HandoffRecord>(`onboarding/handoffs/${LEAD}.json`)!.steps.item.state, "pending");
  // Someone sets the packages on the contact in GoHighLevel; the next press finishes the handoff.
  ghl.drop.clear();
  ghl.get(LEAD).customFields!.find((x) => x.id === ghl.fieldId("Desk Packages"))!.value = ["Giveaway Winner", "Local Growth"];
  const done = await startOnboardingGhl(form, ctx);
  assert.deepEqual([done.pending, done.adopted], [[], false]);
  assert.ok(await winnerForContactGhl({ id: LEAD }));
});

test("looking is not changing: someone who may not change the preview opens a record and nothing is written", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  // Storage says the client submitted; the contact still says otherwise.
  const intake = blobJson<IntakeRecord>(`onboarding/intake/${LEAD}.json`)!;
  blobSeed(`onboarding/intake/${LEAD}.json`, { ...intake, submittedAt: "2026-10-01T15:00:00.000Z" });
  const writes = ghl.writes().length;
  const seen = await onboardingDetailGhl(LEAD, { mayWrite: false });
  assert.equal(seen.row.intake, "Client submitted", "the panel still shows the truth"); assert.equal(ghl.writes().length, writes); assert.equal(ghl.value(LEAD, "Desk Intake"), "Not sent");
  await onboardingDetailGhl(LEAD);
  assert.equal(ghl.value(LEAD, "Desk Intake"), "Client submitted", "someone who may change it repairs it by opening it");
});

test("a graduation that stopped before the tag is finished by the next press, without touching a field", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), ctx);
  await patch({ action: "stage", stage: "building" });
  ghl.failures.push({ match: new RegExp(`^POST /contacts/${LEAD}/tags$`), status: 500 });
  await assert.rejects(graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: v() }, DAVE));
  assert.equal(ghl.value(LEAD, "Desk Client Status"), "Active"); assert.ok(!ghl.get(LEAD).tags!.includes("desk-client")); assert.equal(ghl.notesFor(LEAD).filter((n) => n.body.includes("Launched.")).length, 0);
  const puts = ghl.writes().filter((w) => w.method === "PUT").length;
  const g = await graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: "" }, DAVE);
  assert.equal(g.id, LEAD); assert.ok(ghl.get(LEAD).tags!.includes("desk-client")); assert.equal(ghl.notesFor(LEAD).filter((n) => n.body.includes("Launched.")).length, 1);
  assert.equal(ghl.writes().filter((w) => w.method === "PUT").length, puts, "the second press only adds what was missing");
  const writes = ghl.writes().length;
  await graduateGhl(LEAD, { managerId: "", expectedUpdatedAt: "" }, DAVE);
  assert.equal(ghl.writes().length, writes, "and a third press does nothing");
});

test("a client brought over from the old board that is still onboarding keeps its client values when it graduates", async () => {
  // Choice Pressure Washing today: a client row AND an onboarding record in an early stage.
  const id = "ChoicePressureWash01";
  ghl.addContact({ id, companyName: "Choice Pressure Washing", email: "choice@example.com", tags: ["desk-onboarding", "desk-client"], fields: { "Desk Onboarding Stage": "In progress", "Desk Client Status": "At risk", "Desk Client Health": "Yellow", "Desk Pay Status": "Paid / Current", "Desk Pay Method": "QuickBooks invoice", "Desk Client Since": "2026-09-15", "Desk Account Manager": "Josh", "Desk Packages": ["Local Growth — First Year $297"], "Desk Monday Onboarding ID": "13052279909", "Desk Monday Client ID": "13125631264" } });
  assert.deepEqual((await listClientsGhl()).rows, [], "still on the Onboarding tab only");
  const g = await graduateGhl(id, { managerId: "Dave", expectedUpdatedAt: "" }, DAVE);
  assert.equal(g.created, false);
  for (const [name, value] of Object.entries({ "Desk Onboarding Stage": "Launched", "Desk Client Status": "At risk", "Desk Client Health": "Yellow", "Desk Pay Status": "Paid / Current", "Desk Pay Method": "QuickBooks invoice", "Desk Client Since": "2026-09-15", "Desk Account Manager": "Josh" })) assert.equal(ghl.value(id, name), value, name);
  assert.equal((await listClientsGhl()).rows.length, 1);
  // An old link with the Monday item id still opens the same record.
  assert.equal((await onboardingDetailGhl("13052279909")).row.id, id);
  assert.equal((await onboardingDetailGhl("13052279909")).fileScope, "13052279909", "files and intake stay where they were stored");
  await assert.rejects(onboardingDetailGhl("13052279000"), { status: 404 });
});

test("a record handed off in the Monday era keeps its stored handoff; a new draft adopts it without re-running finished steps", async () => {
  addLead(ghl, { tags: ["sales-lead", "desk-onboarding"], fields: { "Monday Lead ID": "13149403716", "Desk Onboarding Stage": "Collecting assets / access", "Desk Monday Onboarding ID": "13149876739", "Desk Handoff ID": "a4c29ea3-13e6-4b6e-9e23-3e4572fc682d", "Desk Packages": ["Local Growth — First Year $297"] } });
  const done = { state: "done", at: "2026-09-28T14:06:00.000Z" };
  blobSeed("onboarding/handoffs/13149403716.json", { version: 1, leadId: "13149403716", handoffId: "a4c29ea3-13e6-4b6e-9e23-3e4572fc682d", itemId: "13149876739", itemUrl: "https://creativecowboys.monday.com/boards/18431157561/pulses/13149876739", createdAt: "", updatedAt: "", steps: { item: done, summary: done, checklist: done, sourceLead: done, intake: done }, handoff: { ...handoffForm(ghl), handoffId: "a4c29ea3-13e6-4b6e-9e23-3e4572fc682d", leadId: "13149403716", monthlyAgreed: "297" } });
  const detail = await onboardingDetailGhl(LEAD);
  assert.equal(detail.record?.handoffId, "a4c29ea3-13e6-4b6e-9e23-3e4572fc682d"); assert.equal(detail.fileScope, "13149876739");
  const r = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { handoffId: "44444444-5555-4666-8777-888888888888" })), ctx);
  assert.equal(r.adopted, true); assert.deepEqual(r.pending, []);
  assert.equal(ghl.writes().length, 0, "every step was already done — nothing is written, no second summary note");
  assert.equal(blobKeys().filter((k) => k.startsWith("onboarding/handoffs/")).length, 1);
});
