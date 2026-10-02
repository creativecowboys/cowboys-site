import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { afterEach, beforeEach, test } from "node:test";
import { contactIdForScope, ensureIntakeGhl, issueIntakeLinkGhl, scopeForRecord, submitIntakeGhl } from "./intake";
import { onboardingDetailGhl, startOnboardingGhl } from "./onboarding";
import { resolveDeskFields } from "./fields";
import { clientView, indexFile, removeFile, resolveToken, revokeIntakeLink, saveIntakeForm } from "@/lib/onboarding/intake";
import { validateHandoff, validateIntakeForm } from "@/lib/onboarding/validation";
import type { IntakeRecord } from "@/lib/onboarding/types";
import { blobJson, blobKeys, blobSeed } from "./testing/blob-stub";
import type { FakeGhl } from "./testing/fake-ghl";
import { addLead, assertOnlyDeskWrites, DAVE, handoffForm, LEAD, ORIGIN, setUp, tearDown } from "./testing/harness";

let ghl: FakeGhl;
beforeEach(() => { ghl = setUp(); });
afterEach(() => { assertOnlyDeskWrites(ghl); tearDown(ghl); });
const tokenOf = (url: string) => url.split("/onboarding/")[1];
const sha = (t: string) => createHash("sha256").update(t).digest("hex");

test("a link issued on the GoHighLevel desk: token → record → the client saves, uploads and submits; the contact shows the status", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), { origin: ORIGIN, actor: DAVE });
  const link = await issueIntakeLinkGhl(LEAD, ORIGIN);
  assert.match(link.url, /^https:\/\/www\.creativecowboys\.co\/onboarding\/[A-Za-z0-9_-]{43}$/);
  const token = tokenOf(link.url);
  assert.equal(ghl.value(LEAD, "Desk Intake"), "Link issued"); assert.equal(ghl.value(LEAD, "Desk Link"), `${ORIGIN}/admin?tab=onboarding&client=${LEAD}`);
  assert.deepEqual(blobJson(`onboarding/tokens/${sha(token)}.json`), { itemId: LEAD });
  // The public intake page resolves the token exactly as before — the stored id is just a contact id now.
  const record = await resolveToken(token);
  assert.equal(record.itemId, LEAD); assert.equal(record.contactId, LEAD);
  const view = clientView(record);
  assert.equal(view.folder, LEAD); assert.equal(view.business, "Bourbon Leather Company"); assert.equal((view as unknown as { tokenHash?: string }).tokenHash, undefined);
  await saveIntakeForm(record, validateIntakeForm({ ...record.form, services: "Wallets and belts", gbpInviteSent: true }));
  blobSeed(`onboarding/files/${LEAD}/Brand/logo.svg`, "<svg/>", "image/svg+xml");
  const withFile = await indexFile(LEAD, `onboarding/files/${LEAD}/Brand/logo.svg`, "Brand", "logo.svg");
  assert.equal(withFile.files.length, 1);
  await assert.rejects(indexFile(LEAD, "onboarding/files/SomeoneElse000000001/Brand/logo.svg", "Brand", "logo.svg"), { status: 400 });
  const submitted = await submitIntakeGhl(await resolveToken(token));
  assert.ok(submitted.submittedAt); assert.equal(ghl.value(LEAD, "Desk Intake"), "Client submitted");
  assert.equal(blobJson<IntakeRecord>(`onboarding/intake/${LEAD}.json`)!.form.services, "Wallets and belts");
  // A new link replaces the old one immediately; revoke kills it.
  const second = await issueIntakeLinkGhl(LEAD, ORIGIN);
  await assert.rejects(resolveToken(token), { status: 404 });
  assert.equal((await resolveToken(tokenOf(second.url))).itemId, LEAD); assert.equal(ghl.value(LEAD, "Desk Intake"), "Client submitted", "a re-issued link does not undo a submission");
  await revokeIntakeLink(await scopeForRecord(LEAD));
  await assert.rejects(resolveToken(tokenOf(second.url)), { status: 404 });
  await removeFile((await ensureIntakeGhl(LEAD)), `onboarding/files/${LEAD}/Brand/logo.svg`);
  assert.ok(!blobKeys().includes(`onboarding/files/${LEAD}/Brand/logo.svg`));
});

test("a link a client was sent BEFORE the switch keeps working: nothing in storage moved", async () => {
  // Choice Pressure Washing: Monday pipeline item 13052279909, intake "Link issued", files uploaded, token live.
  const OLD = "13052279909"; const token = "A".repeat(43); const id = "ChoicePressureWash01";
  const intake: IntakeRecord = { version: 1, itemId: OLD, leadId: "", business: "Choice Pressure Washing", tokenHash: sha(token), tokenIssuedAt: "2026-10-01T18:00:00.000Z", tokenExpiresAt: "2099-01-01T00:00:00.000Z", revokedAt: null, form: { business: "Choice Pressure Washing", contact: "Reese Pownall", email: "choice@example.com", phone: "", address: "", serviceAreas: "", services: "", goals: "", brandColors: "", fonts: "", website: "", references: "", competitors: "", social: "", hours: "", gbpUrl: "", gbpInviteSent: false, gbpNoProfile: false, notes: "" }, lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [{ key: `onboarding/files/${OLD}/Brand/logo.png`, name: "logo.png", size: 10, type: "image/png", category: "Brand", uploadedAt: "2026-10-01T18:05:00.000Z" }], createdAt: "", updatedAt: "", contactId: id };
  blobSeed(`onboarding/intake/${OLD}.json`, intake); blobSeed(`onboarding/tokens/${sha(token)}.json`, { itemId: OLD }); blobSeed(`onboarding/files/${OLD}/Brand/logo.png`, "png", "image/png");
  ghl.addContact({ id, companyName: "Choice Pressure Washing", email: "choice@example.com", tags: ["desk-onboarding"], fields: { "Desk Onboarding Stage": "New handoff", "Desk Intake": "Link issued", "Desk Monday Onboarding ID": OLD } });
  const before = blobKeys();
  const record = await resolveToken(token);
  assert.equal(record.itemId, OLD); assert.equal(clientView(record).folder, OLD); assert.equal(record.files.length, 1);
  await submitIntakeGhl(record);
  assert.equal(ghl.value(id, "Desk Intake"), "Client submitted", "the status lands on the imported contact");
  assert.deepEqual(blobKeys(), before, "no key was added, moved or removed");
  assert.equal(await scopeForRecord(id), OLD); assert.equal(await scopeForRecord(OLD), OLD);
  assert.equal((await ensureIntakeGhl(OLD)).files.length, 1);
  // Staff issue a fresh link after the switch: still the same record and the same files.
  const link = await issueIntakeLinkGhl(id, ORIGIN);
  assert.deepEqual(blobJson(`onboarding/tokens/${sha(tokenOf(link.url))}.json`), { itemId: OLD });
  assert.equal((await resolveToken(tokenOf(link.url))).files.length, 1);
  await assert.rejects(resolveToken(token), { status: 404 }, "the old token was replaced");
  // An import that did not stamp contactId (or a record from before the import) is still found through the contact's Monday id.
  const bare = blobJson<IntakeRecord>(`onboarding/intake/${OLD}.json`)!; delete bare.contactId; bare.submittedAt = null;
  ghl.get(id).customFields!.find((f) => f.id === ghl.fieldId("Desk Intake"))!.value = "Link issued";
  await submitIntakeGhl(bare);
  assert.equal(ghl.value(id, "Desk Intake"), "Client submitted");
});

test("storage is the truth for a submitted intake: a status write that was missed is repaired the next time the panel opens", async () => {
  addLead(ghl);
  await startOnboardingGhl(validateHandoff(handoffForm(ghl)), { origin: ORIGIN, actor: DAVE });
  const link = await issueIntakeLinkGhl(LEAD, ORIGIN);
  // GoHighLevel fails at the moment the client presses Submit: the client still gets a clean save, the status is not written.
  ghl.failures.push({ match: new RegExp(`^PUT /contacts/${LEAD}$`), status: 500 });
  const submitted = await submitIntakeGhl(await resolveToken(tokenOf(link.url)));
  assert.ok(submitted.submittedAt); assert.equal(ghl.value(LEAD, "Desk Intake"), "Link issued");
  const detail = await onboardingDetailGhl(LEAD);
  assert.equal(detail.row.intake, "Client submitted"); assert.equal(ghl.value(LEAD, "Desk Intake"), "Client submitted");
  assert.equal(detail.row.updatedAt, ghl.get(LEAD).dateUpdated, "the row carries the version after the repair, so the next change is not refused as stale");
  // And when the repair itself cannot be written, the panel still shows what storage says.
  ghl.get(LEAD).customFields!.find((x) => x.id === ghl.fieldId("Desk Intake"))!.value = "Link issued";
  ghl.failures.push({ match: new RegExp(`^PUT /contacts/${LEAD}$`), status: 500 });
  assert.equal((await onboardingDetailGhl(LEAD)).row.intake, "Client submitted");
  // A status staff set after the submit ("Reviewed") is never stepped back.
  ghl.get(LEAD).customFields!.find((x) => x.id === ghl.fieldId("Desk Intake"))!.value = "Reviewed";
  const writes = ghl.writes().length;
  assert.equal((await onboardingDetailGhl(LEAD)).row.intake, "Reviewed"); assert.equal(ghl.writes().length, writes);
});

test("a client brought over without an onboarding record can still be sent an intake link (its files stay under the client key)", async () => {
  ghl.addContact({ id: "SquirrelMadeClient01", companyName: "Squirrel Made Products", firstName: "Jeremy", email: "jeremy@squirrel.example", tags: ["desk-client"], fields: { "Desk Client Status": "Active", "Desk Packages": ["Local Growth"], "Desk Monday Client ID": "13125661635" } });
  blobSeed("onboarding/intake/c13125661635.json", { version: 1, itemId: "c13125661635", leadId: "", business: "Squirrel Made Products", tokenHash: null, tokenIssuedAt: null, tokenExpiresAt: null, revokedAt: null, form: { business: "Squirrel Made Products" }, lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [{ key: "onboarding/files/c13125661635/Brand/logo.png", name: "logo.png", size: 10, type: "image/png", category: "Brand", uploadedAt: "2026-09-25T10:00:00.000Z" }], createdAt: "", updatedAt: "" });
  const started = await startOnboardingGhl(validateHandoff(handoffForm(ghl, { handoffId: "66666666-7777-4888-8999-aaaaaaaaaaaa", leadId: "", manual: true, business: "Squirrel Made Products", contact: "Jeremy", email: "jeremy@squirrel.example", phone: "", packages: ["Local Growth"], monthlyAgreed: "", setupAgreed: "" })), { origin: ORIGIN, actor: DAVE });
  assert.equal(started.itemId, "SquirrelMadeClient01");
  const link = await issueIntakeLinkGhl("SquirrelMadeClient01", ORIGIN);
  assert.deepEqual(blobJson(`onboarding/tokens/${sha(tokenOf(link.url))}.json`), { itemId: "c13125661635" });
  const record = await resolveToken(tokenOf(link.url));
  assert.equal(record.itemId, "c13125661635"); assert.equal(record.contactId, "SquirrelMadeClient01"); assert.equal(record.files.length, 1, "the files the team already added are on the same record");
  assert.equal(clientView(record).folder, "c13125661635");
  await submitIntakeGhl(record);
  assert.equal(ghl.value("SquirrelMadeClient01", "Desk Intake"), "Client submitted");
});

test("file stores: a client that never had an onboarding record, an unknown scope, and scope → contact", async () => {
  const fields = resolveDeskFields(ghl.defs);
  ghl.addContact({ id: "SquirrelMadeClient01", companyName: "Squirrel Made Products", firstName: "Jeremy", email: "jeremy@squirrel.example", tags: ["desk-client"], fields: { "Desk Client Status": "Active", "Desk Monday Client ID": "13125661635" } });
  ghl.addContact({ id: "BornOnGhlClient00001", companyName: "Born Here Co", tags: ["desk-client"], fields: { "Desk Client Status": "Active" } });
  assert.equal(await contactIdForScope("c13125661635", fields), "SquirrelMadeClient01");
  assert.equal(await contactIdForScope("BornOnGhlClient00001", fields), "BornOnGhlClient00001");
  assert.equal(await contactIdForScope("c999", fields), null); assert.equal(await contactIdForScope("13052279909", fields), null);
  const seeded = await ensureIntakeGhl("c13125661635");
  assert.equal(seeded.itemId, "c13125661635"); assert.equal(seeded.contactId, "SquirrelMadeClient01"); assert.equal(seeded.business, "Squirrel Made Products"); assert.equal(seeded.form.email, "jeremy@squirrel.example");
  assert.equal((await ensureIntakeGhl("BornOnGhlClient00001")).itemId, "BornOnGhlClient00001");
  await assert.rejects(ensureIntakeGhl("c999"), { status: 404 });
  // A contact's files live under ONE scope: asking for the contact id of an imported client is refused rather than starting a second store.
  await assert.rejects(ensureIntakeGhl("SquirrelMadeClient01"), { status: 400 });
  // A contact that is not on the desk at all has no file store, and a client with no onboarding record has no intake to send.
  ghl.addContact({ id: "JustSomeLead00000001", companyName: "Not A Client", email: "lead@example.com", tags: ["sales-lead"] });
  await assert.rejects(ensureIntakeGhl("JustSomeLead00000001"), { status: 404 });
  await assert.rejects(issueIntakeLinkGhl("BornOnGhlClient00001", ORIGIN), { status: 404 });
  assert.equal(ghl.writes().length, 0);
});
