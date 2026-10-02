import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { indexForDesk, matchRow, migrateDesk, personName, planClient, planOnboarding, type MondayRow } from "./migrate";
import { deskDiagnose, deskSelfTest, deskSetup, deskWriteList } from "./admin";
import { resolveDeskFields } from "./fields";
import { listOnboardingGhl, onboardingDetailGhl } from "./onboarding";
import { clientDetailGhl, listClientsGhl } from "./clients";
import { parseChecklist } from "./checklist-text";
import { resolveToken } from "@/lib/onboarding/intake";
import { resolveFromDefs } from "@/lib/ghl/fields";
import { forgetCustomFields } from "@/lib/ghl/client";
import { COL, STAGES } from "@/lib/onboarding/config";
import { CCOL, CLIENT_GROUPS } from "@/lib/clients/config";
import type { IntakeRecord } from "@/lib/onboarding/types";
import { createHash } from "node:crypto";
import { blobJson, blobKeys, blobSeed } from "./testing/blob-stub";
import type { FakeGhl } from "./testing/fake-ghl";
import { DAVE, reps, setUp, tearDown } from "./testing/harness";
import { DESK_TAG_LIST, isDeskFieldName } from "./fields";

// The two boards as they were read on Oct 1 2026 (names real, contact details fictional), in the shapes Monday's API returns.
type Cell = { text?: string; value?: unknown };
const row = (id: string, name: string, group: { id: string; title: string }, cells: Record<string, Cell | string>, extra: Partial<MondayRow> = {}): MondayRow => ({
  id, name, group, column_values: Object.entries(cells).map(([cid, c]) => (typeof c === "string" ? { id: cid, text: c, value: JSON.stringify(c) } : { id: cid, text: c.text ?? null, value: c.value === undefined ? null : JSON.stringify(c.value) })), ...extra,
});
const person = (name: string, id: number): Cell => ({ text: name, value: { personsAndTeams: [{ id, kind: "person" }] } });
const date = (d: string): Cell => ({ text: d, value: { date: d } });
const url = (u: string, label = ""): Cell => ({ text: `${label || u} - ${u}`, value: { url: u, text: label || u } });
const stage = (id: string) => ({ id: STAGES.find((s) => s.id === id)!.group, title: id });
const group = (id: string) => ({ id: CLIENT_GROUPS.find((g) => g.id === id)!.group, title: id });
const sub = (id: string, name: string, status = "", phase = "Onboard", owner = "") => ({ id, name, column_values: [{ id: "status", text: status, value: null }, { id: "phase", text: phase, value: null }, { id: "person", text: owner, value: null }, { id: "date0", text: "", value: null }] });
const upd = (id: string, body: string, who = "Josh Pack", at = "2026-09-28T14:06:00Z") => ({ id, text_body: body, created_at: at, creator: { name: who } });

const CHOICE_OB = "13052279909", BOURBON_OB = "13149876739", ARCTIC_OB = "13061158562", LADYBUG_OB = "13176666685", TEMPLATE = "13050865473";
const SQUIRREL_CL = "13125661635", CHOICE_CL = "13125631264", CHAPELHILL_CL = "13125586889";
const HANDOFF = "a4c29ea3-13e6-4b6e-9e23-3e4572fc682d";
const pipeline = (): MondayRow[] => [
  row(CHOICE_OB, "Choice Pressure Washing", stage("new"), { [COL.health]: "On Track", [COL.onboardingOwner]: person("Dave Collum", 39848115), [COL.buildOwner]: person("Dave Collum", 39848115), [COL.contact]: "Reese Pownall", [COL.email]: "reese@choice.example", [COL.phone]: "+17705550107", [COL.businessType]: "Other Local Service", [COL.city]: "Villa Rica, GA", [COL.signed]: date("2026-09-15"), [COL.gbpAccess]: "Requested", [COL.nextAction]: "Send onboarding link (LSE-01) to Reese", [COL.lastTouch]: date("2026-10-01"), [COL.driveFolder]: url("https://drive.example/choice", "From Reese"), [COL.siteUrl]: url("https://old-choice.example", "Old unfinished WP site"), [COL.notes]: "Veteran-owned. Reese Pownall + father Vance.", [COL.package]: "Local Growth — First Year $297", [COL.payment]: "Paid", [COL.intake]: "Link issued", [COL.profileComplete]: { text: "", value: { checked: false } }, [COL.dnsPath]: "Local Growth — First Year $297" },
    { subitems: [sub("s1", "Welcome email + onboarding link delivered (LSE-01)", "Done"), sub("s2", "Citations submitted via Search Atlas Citation Builder", "Working on it", "Build", "Dave Collum"), sub("s3", "DNS cutover / go-live (CNAME only, never apex or MX)", "", "Launch")], updates: [upd("901", "Reese sent the old WP login.", "Josh Pack", "2026-09-20T12:00:00Z")] }),
  row(BOURBON_OB, "Bourbon Leather Company", stage("new"), { [COL.health]: "Not Started", [COL.onboardingOwner]: person("madison collum", 45852318), [COL.contact]: "Freddy Sumbay", [COL.email]: "freddy@bourbon.example", [COL.phone]: "13865895606", [COL.city]: "Parrish, FL", [COL.signed]: date("2026-09-28"), [COL.targetLaunch]: date("2026-09-30"), [COL.gbpAccess]: "Not Requested", [COL.nextAction]: "[due 2026-09-29] Madison: send the intake link and request assets", [COL.siteUrl]: url("https://bourbonleather.com"), [COL.notes]: "Monthly agreed: $297 · Setup agreed: not recorded\nScope: Josh makes demo", [COL.package]: "Local Growth — First Year $297", [COL.leadId]: "13149403716", [COL.handoffId]: HANDOFF, [COL.salesOwner]: person("Dave Collum", 39848115), [COL.agreement]: "Pending", [COL.payment]: "Pending", [COL.intake]: "Not sent" },
    { subitems: [sub("b1", "Intake link delivered to client"), sub("b2", "Logo files received (vector preferred)")], updates: [upd("902", `Sales → onboarding handoff Business: Bourbon Leather Company [CC-HANDOFF:${HANDOFF}]`, "Dave Collum")] }),
  row(ARCTIC_OB, "Arctic Law", stage("new"), { [COL.health]: "On Track", [COL.onboardingOwner]: person("Keaton Vanwey", 116679004), [COL.contact]: "Kaden Vanwey", [COL.email]: "Kaden@ArcticLaw.example", [COL.phone]: "8125550186", [COL.city]: "Wasilla, AK", [COL.gbpAccess]: "Verified", [COL.package]: "Local Growth — First Year $297", [COL.setup]: "436", [COL.agreement]: "Signed", [COL.payment]: "Paid", [COL.intake]: "Not sent", [COL.businessType]: "Referral", build_week: "2026-10-05 - 2026-10-11" }),
  row(LADYBUG_OB, "Ladybug Hot Sauces", stage("collecting"), { [COL.health]: "Not Started", [COL.contact]: "Erin VanDyke", [COL.email]: "", [COL.package]: "Local Growth, Social Ads $1,200", [COL.customMonthly]: "50", [COL.ghlContact]: url("https://app.gohighlevel.com/v2/location/LOC/contacts/detail/LadybugGhlContact001", "GHL"), [COL.leadId]: "LadybugGhlContact001", [COL.salesOwner]: person("Josh Pack", 39848217), [COL.searchAtlasListing]: "94266", [COL.baseline]: { text: "v", value: { checked: "true" } } }),
  row(TEMPLATE, "TEMPLATE — Duplicate me", { id: "topics", title: "Template" }, { [COL.health]: "Not Started" }, { subitems: [sub("t1", "Welcome email + onboarding link delivered (LSE-01)")] }),
];
const clients = (): MondayRow[] => [
  row(SQUIRREL_CL, "Squirrel Made Products", group("active"), { [CCOL.package]: "Local Growth — First Year $297", [CCOL.health]: "Too New", [CCOL.accountManager]: person("Josh Pack", 39848217), [CCOL.payStatus]: "No Billing Set Up", [CCOL.payMethod]: "Stripe via GHL", [CCOL.teamDesk]: { text: "v", value: { checked: "true" } }, [CCOL.gbpAccess]: "Not Requested", [CCOL.notes]: "Sept 24: Josh confirmed this IS an active monthly client." }, { updates: [upd("903", "Switched to Stripe via GHL at $297.", "Josh Pack", "2026-09-24T15:00:00Z")] }),
  row(CHOICE_CL, "Choice Pressure Washing", group("risk"), { [CCOL.package]: "Local Growth — First Year $297", [CCOL.health]: "Too New", [CCOL.accountManager]: person("Josh Pack", 39848217), [CCOL.payStatus]: "No Billing Set Up", [CCOL.payMethod]: "Stripe via GHL", [CCOL.clientSince]: date("2026-09-15"), [CCOL.teamDesk]: { text: "v", value: { checked: "true" } }, [CCOL.gbpAccess]: "Not Requested", [CCOL.onboardingItem]: CHOICE_OB, [CCOL.notes]: "Onboarded Sept 2026 on Local Growth First Year at $297.", [CCOL.billingDay]: "15", [CCOL.termEnds]: date("2027-09-14") }),
  row(CHAPELHILL_CL, "Chapelhill Church", group("active"), { [CCOL.health]: "Too New", [CCOL.payMethod]: "QuickBooks invoice", [CCOL.teamDesk]: { text: "", value: { checked: false } } }),
];

let ghl: FakeGhl;
let mondayQueries: string[];
beforeEach(() => {
  ghl = setUp(); mondayQueries = [];
  process.env.MONDAY_API_TOKEN = "nonfunctional-test-monday-token"; process.env.ONBOARDING_EXTRA_OWNERS = "Madison:45852318";
  ghl.monday = (query, variables) => { mondayQueries.push(query); assert.ok(query.trimStart().startsWith("query"), "the import only ever READS Monday"); return { boards: [{ items_page: { cursor: null, items: (variables.board as string[])[0] === "18431157561" ? pipeline() : clients() } }] }; };
  // GoHighLevel as Phase 1 left it: Bourbon's lead (imported from Monday lead 13149403716), Ladybug's and Arctic's contacts, Jeremy at Squirrel Made, and an unrelated contact.
  ghl.addContact({ id: "LeadBourbon0000000A1", firstName: "Freddy", lastName: "Sumbay", companyName: "Bourbon Leather Co", email: "freddy@bourbon.example", phone: "+13865895606", tags: ["sales-lead", "sales-won", "lse:client"], assignedTo: reps.Dave, fields: { "Monday Lead ID": "13149403716", "Outreach Status": "Won", "LSE Health": "green" } });
  ghl.addContact({ id: "LadybugGhlContact001", firstName: "Erin", lastName: "VanDyke", companyName: "Ladybug Hot Sauces", email: "erin@ladybug.example", tags: ["sales-lead"], assignedTo: reps.Dave });
  ghl.addContact({ id: "ArcticLawContact0001", firstName: "Kaden", companyName: "", email: "kaden@arcticlaw.example", phone: "+18125550186", tags: ["giveaway-entrant"] });
  ghl.addContact({ id: "SquirrelMadeJeremy01", firstName: "Jeremy", lastName: "Nutt", companyName: "Squirrel Made Products", email: "jeremy@squirrel.example", assignedTo: reps.Josh });
  ghl.addContact({ id: "SomeoneElse000000001", firstName: "Pat", companyName: "Unrelated Co", email: "pat@unrelated.example" });
});
afterEach(() => {
  const { fields, tags } = ghl.written();
  for (const name of fields) assert.ok(isDeskFieldName(name) || name === "Monday Lead ID", `the import wrote a field that is not the desk's: ${name}`);
  for (const tag of tags) assert.ok(DESK_TAG_LIST.includes(tag), `the import added a tag that is not the desk's: ${tag}`);
  assert.ok(!ghl.requests.some((r) => /opportunit/i.test(r.path)));
  tearDown(ghl);
});
const byMonday = <T extends { mondayId: string }>(rows: T[], id: string): T => rows.find((r) => r.mondayId === id)!;

test("dry run: every row is matched and described, nothing is written anywhere", async () => {
  const r = await migrateDesk({ dryRun: true });
  assert.equal(r.dryRun, true); assert.equal(r.total, 6); assert.equal(r.processed, 6); assert.equal(r.nextOffset, null); assert.equal(r.ghlContacts, 5);
  assert.deepEqual(r.rows.map((x) => [x.board, x.name, x.match, x.ghlId]), [
    ["onboarding", "Choice Pressure Washing", "create", ""],
    ["onboarding", "Bourbon Leather Company", "lead", "LeadBourbon0000000A1"],
    ["onboarding", "Arctic Law", "email", "ArcticLawContact0001"],
    ["onboarding", "Ladybug Hot Sauces", "ghl-link", "LadybugGhlContact001"],
    ["clients", "Squirrel Made Products", "company-name", "SquirrelMadeJeremy01"],
    ["clients", "Choice Pressure Washing", "onboarding-record", ""],
  ]);
  assert.deepEqual(r.skipped, { template: 1, offDesk: [{ mondayId: CHAPELHILL_CL, name: "Chapelhill Church" }] });
  assert.equal(byMonday(r.rows, CHOICE_CL).ghlName, "(the contact its onboarding record creates)");
  const choice = byMonday(r.rows, CHOICE_OB);
  assert.ok(choice.fields.includes("Desk Onboarding Stage") && choice.fields.includes("Desk Checklist") && choice.fields.includes("Desk Monday Onboarding ID"));
  assert.deepEqual(choice.contactFields.sort(), ["city", "companyName", "email", "firstName", "lastName", "phone", "state", "website"]);
  assert.ok(choice.warnings.some((w) => /DNS path "Local Growth — First Year \$297" is not an option/.test(w)), "the stray label on the board's DNS Path dropdown is reported, not imported");
  assert.ok(byMonday(r.rows, ARCTIC_OB).warnings.some((w) => /business type "Referral"/.test(w)) && byMonday(r.rows, ARCTIC_OB).warnings.some((w) => /Build Week/.test(w)));
  assert.ok(byMonday(r.rows, BOURBON_OB).warnings.some((w) => /GoHighLevel calls this business "Bourbon Leather Co"/.test(w)));
  assert.equal(ghl.writes().length, 0); assert.equal(blobKeys().length, 0);
  assert.equal(mondayQueries.length, 2);
  assert.deepEqual(r.winners, [], "no giveaway winner on either board in this fixture");
  assert.ok(!JSON.stringify(r).includes("nonfunctional-test"), "no secret in the report");
});

test("the real run: one contact per business, fields, owners, checklist, notes, tags — and a second run changes nothing", async () => {
  // Choice's client was sent an intake link before the switch; its record, files and token index are in storage under the Monday item id.
  const token = "B".repeat(43); const hash = createHash("sha256").update(token).digest("hex");
  blobSeed(`onboarding/intake/${CHOICE_OB}.json`, { version: 1, itemId: CHOICE_OB, leadId: "", business: "Choice Pressure Washing", tokenHash: hash, tokenIssuedAt: "2026-10-01T18:00:00.000Z", tokenExpiresAt: "2099-01-01T00:00:00.000Z", revokedAt: null, form: { business: "Choice Pressure Washing" }, lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [], createdAt: "", updatedAt: "" });
  blobSeed(`onboarding/tokens/${hash}.json`, { itemId: CHOICE_OB });
  const keysBefore = blobKeys();
  const r = await migrateDesk({ pauseMs: 0, dryRun: false, origin: "https://www.creativecowboys.co" });
  assert.equal(r.counts.written, 6); assert.equal(r.counts.failed, 0); assert.ok(r.rows.every((x) => x.done && !x.error));
  assert.equal(ghl.contacts.size, 6, "exactly one contact was created (Choice); nobody else was duplicated");
  // Choice: created from its onboarding row, then its Active Clients row joined the SAME contact.
  const choiceId = byMonday(r.rows, CHOICE_OB).ghlId;
  assert.equal(byMonday(r.rows, CHOICE_CL).ghlId, choiceId); assert.equal(byMonday(r.rows, CHOICE_CL).match, "onboarding-record");
  const choice = ghl.get(choiceId);
  assert.equal(choice.companyName, "Choice Pressure Washing"); assert.equal(choice.firstName, "Reese"); assert.equal(choice.email, "reese@choice.example"); assert.equal(choice.phone, "+17705550107"); assert.equal(choice.city, "Villa Rica"); assert.equal(choice.state, "GA"); assert.equal(choice.website, "https://old-choice.example");
  assert.deepEqual([...choice.tags!].sort(), ["desk-client", "desk-onboarding", "monday-import"]);
  const want: Record<string, unknown> = { "Desk Onboarding Stage": "New handoff", "Desk Onboarding Health": "On Track", "Desk Onboarding Owner": "Dave", "Desk Build Owner": "Dave", "Desk Business Type": "Other Local Service", "Desk Signed": "2026-09-15", "Desk GBP Access": "Requested", "Desk Next Action": "Send onboarding link (LSE-01) to Reese", "Desk Last Touch": "2026-10-01", "Desk Drive Folder": "https://drive.example/choice", "Desk Onboarding Payment": "Paid", "Desk Intake": "Link issued", "Desk Monday Onboarding ID": CHOICE_OB, "Desk Monday Client ID": CHOICE_CL, "Desk Client Status": "At risk", "Desk Client Health": "Too New", "Desk Pay Status": "No Billing Set Up", "Desk Pay Method": "Stripe via GHL", "Desk Client Since": "2026-09-15", "Desk Account Manager": "Josh", "Desk Billing Day": 15, "Desk Term Ends": "2027-09-14" };
  for (const [name, value] of Object.entries(want)) assert.deepEqual(ghl.value(choiceId, name), value, name);
  assert.equal(ghl.value(choiceId, "Desk DNS Path"), undefined); assert.equal(ghl.value(choiceId, "Desk Profile Complete"), undefined);
  assert.deepEqual(ghl.value(choiceId, "Desk Packages"), ["Local Growth — First Year $297"]);
  assert.equal(ghl.value(choiceId, "Desk Notes"), "Veteran-owned. Reese Pownall + father Vance.\n\nOnboarded Sept 2026 on Local Growth First Year at $297.");
  assert.equal(ghl.value(choiceId, "Desk GBP Access"), "Requested", "the client row's Not Requested never steps the onboarding record's state back");
  assert.deepEqual(parseChecklist(String(ghl.value(choiceId, "Desk Checklist"))).map((i) => [i.name, i.status, i.phase, i.owner]), [["Welcome email + onboarding link delivered (LSE-01)", "Done", "Onboard", ""], ["Citations submitted via Search Atlas Citation Builder", "Working on it", "Build", "Dave"], ["DNS cutover / go-live (CNAME only, never apex or MX)", "", "Launch", ""]]);
  assert.equal(ghl.notesFor(choiceId).length, 1); assert.equal(ghl.notesFor(choiceId)[0].body, "From the old board (Josh Pack, 2026-09-20): [CC-MONDAY-UPDATE:901] [CC-SRC:onboarding]\nReese sent the old WP login.");
  // Storage: nothing moved; the intake record learned its contact, and the link the client already has still opens it.
  assert.deepEqual(blobKeys(), keysBefore);
  assert.equal(blobJson<IntakeRecord>(`onboarding/intake/${CHOICE_OB}.json`)!.contactId, choiceId);
  assert.equal((await resolveToken(token)).itemId, CHOICE_OB);
  assert.deepEqual(byMonday(r.rows, CHOICE_OB).storage, [`intake/${CHOICE_OB}: contactId set`]);
  assert.equal(ghl.value(choiceId, "Desk Link"), `https://www.creativecowboys.co/leads?tab=onboarding&client=${choiceId}`, "a contact the import creates gets its desk link once it has an id");
  // Bourbon: matched to the lead Phase 1 imported; nothing GoHighLevel already had was overwritten; Madison mapped by Monday id.
  const bourbon = ghl.get("LeadBourbon0000000A1");
  assert.equal(bourbon.companyName, "Bourbon Leather Co"); assert.equal(bourbon.assignedTo, reps.Dave); assert.equal(ghl.value(bourbon.id, "LSE Health"), "green");
  assert.equal(ghl.value(bourbon.id, "Desk Onboarding Owner"), "Madison"); assert.equal(ghl.value(bourbon.id, "Desk Sales Owner"), "Dave"); assert.equal(ghl.value(bourbon.id, "Desk Next Action"), "Madison: send the intake link and request assets"); assert.equal(ghl.value(bourbon.id, "Desk Next Action Due"), "2026-09-29");
  assert.equal(ghl.value(bourbon.id, "Desk Handoff ID"), HANDOFF); assert.equal(ghl.value(bourbon.id, "Desk Target Launch"), "2026-09-30");
  assert.ok(ghl.notesFor(bourbon.id)[0].body.startsWith(`From the old board (Dave Collum, 2026-09-28): [CC-MONDAY-UPDATE:902] [CC-HANDOFF-SUMMARY:${HANDOFF}] [CC-SRC:onboarding]\n`), "the copied handoff summary is recognised, so a retry never posts a second one — and the markers ride on the first line");
  // Arctic: matched by email (case-insensitive); blank company filled; owner Keaton; the label the desk does not know is left out.
  const arctic = ghl.get("ArcticLawContact0001");
  assert.equal(arctic.companyName, "Arctic Law"); assert.equal(ghl.value(arctic.id, "Desk Onboarding Owner"), "Keaton"); assert.equal(ghl.value(arctic.id, "Desk Setup Amount"), 436); assert.equal(ghl.value(arctic.id, "Desk GBP Access"), "Verified"); assert.equal(ghl.value(arctic.id, "Desk Business Type"), undefined);
  assert.equal(arctic.assignedTo, null, "no sales owner on the row → the contact's owner is left alone");
  // Ladybug: matched by the board's GHL Contact link; comma-carrying package label intact; baseline gate carried.
  const lady = "LadybugGhlContact001";
  assert.deepEqual(ghl.value(lady, "Desk Packages"), ["Local Growth", "Social Ads $1,200"]); assert.equal(ghl.value(lady, "Desk Custom Monthly"), 50); assert.equal(ghl.value(lady, "Desk Onboarding Stage"), "Collecting assets / access"); assert.equal(ghl.value(lady, "Desk Baseline Captured"), "Yes"); assert.equal(ghl.value(lady, "Desk Search Atlas Listing"), "94266");
  assert.equal(ghl.get(lady).email, "erin@ladybug.example"); assert.equal(ghl.get(lady).assignedTo, reps.Dave, "an existing owner is never replaced by the board's sales owner");
  assert.equal(ghl.value(lady, "Desk Link"), `https://www.creativecowboys.co/leads?tab=onboarding&client=${lady}`);
  // Squirrel Made: a client with no onboarding record.
  assert.equal(ghl.value("SquirrelMadeJeremy01", "Desk Client Status"), "Active"); assert.deepEqual(ghl.get("SquirrelMadeJeremy01").tags, ["desk-client"]); assert.equal(ghl.notesFor("SquirrelMadeJeremy01")[0].body.startsWith("From the old board (Josh Pack, 2026-09-24): [CC-MONDAY-UPDATE:903] [CC-SRC:client]\n"), true);
  assert.equal(ghl.get("SomeoneElse000000001").customFields!.length, 0, "a contact that is not on either board is not touched");
  // The desk now reads it all back.
  const ob = (await listOnboardingGhl()).rows;
  assert.deepEqual(ob.map((x) => x.name).sort(), ["Arctic Law", "Bourbon Leather Co", "Choice Pressure Washing", "Ladybug Hot Sauces"]);
  assert.equal(ob.find((x) => x.name === "Ladybug Hot Sauces")!.monthly, "1747");
  assert.deepEqual((await listClientsGhl()).rows.map((x) => x.name), ["Squirrel Made Products"], "Choice is still onboarding, so it stays on the Onboarding tab only");
  assert.equal((await onboardingDetailGhl(CHOICE_OB)).row.id, choiceId); assert.equal((await clientDetailGhl(SQUIRREL_CL, true)).fileScope, `c${SQUIRREL_CL}`);
  assert.deepEqual((await onboardingDetailGhl(choiceId)).history.map((h) => [h.source, h.author, h.text]), [["Imported", "Josh Pack", "From the old board (Josh Pack, 2026-09-20):\nReese sent the old WP login."]]);
  // Idempotent.
  const writes = ghl.writes().length;
  const again = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(again.rows.map((x) => x.match), Array(6).fill("imported")); assert.equal(again.counts.written, 0); assert.equal(ghl.writes().length, writes, "a second run writes nothing");
  // force re-writes the fields but never copies a note twice and never replaces a checklist that is already on the contact.
  ghl.get(choiceId).customFields!.find((x) => x.id === ghl.fieldId("Desk Checklist"))!.value = "[x] Edited on the desk since";
  const forced = await migrateDesk({ pauseMs: 0, dryRun: false, force: true, onlyIds: [CHOICE_OB] });
  assert.equal(forced.total, 1); assert.equal(forced.counts.written, 1); assert.equal(ghl.notesFor(choiceId).length, 1); assert.equal(ghl.value(choiceId, "Desk Checklist"), "[x] Edited on the desk since");
});

test("one-record trial, explicit map, batches, off-desk rows, and a client row that must wait for its onboarding record", async () => {
  const trial = await migrateDesk({ pauseMs: 0, dryRun: false, onlyIds: [BOURBON_OB] });
  assert.equal(trial.total, 1); assert.equal(trial.counts.written, 1); assert.equal(ghl.value("LeadBourbon0000000A1", "Desk Onboarding Stage"), "New handoff"); assert.equal(ghl.contacts.size, 5);
  // The client board alone: Choice's row has an onboarding record that is not imported yet → it waits instead of getting a second contact.
  const clientsOnly = await migrateDesk({ pauseMs: 0, dryRun: false, boards: ["clients"] });
  assert.deepEqual(clientsOnly.rows.map((x) => [x.name, x.match, !!x.done]), [["Squirrel Made Products", "company-name", true], ["Choice Pressure Washing", "unmatched", false]]);
  assert.match(byMonday(clientsOnly.rows, CHOICE_CL).detail!, /its onboarding record \(Monday item 13052279909\) is not imported yet/); assert.equal(ghl.contacts.size, 5);
  // map pins a row to a contact; a bad map is refused, not guessed around.
  const mapped = await migrateDesk({ dryRun: true, onlyIds: [ARCTIC_OB], map: { [ARCTIC_OB]: "SomeoneElse000000001" } });
  assert.deepEqual([mapped.rows[0].match, mapped.rows[0].ghlId], ["mapped", "SomeoneElse000000001"]);
  assert.equal((await migrateDesk({ dryRun: true, onlyIds: [ARCTIC_OB], map: { [ARCTIC_OB]: "NoSuchContact0000001" } })).rows[0].match, "unmatched");
  // Batches.
  const first = await migrateDesk({ dryRun: true, offset: 0, limit: 4 });
  assert.equal(first.processed, 4); assert.equal(first.nextOffset, 4);
  assert.equal((await migrateDesk({ dryRun: true, offset: 4, limit: 4 })).nextOffset, null);
  // A giveaway winner left behind on Monday is called out: after the flip the billing guard only reads GoHighLevel.
  const base = ghl.monday!;
  ghl.monday = (q, v) => { const d = base(q, v) as { boards: { items_page: { items: MondayRow[] } }[] }; if ((v.board as string[])[0] !== "18431157561") d.boards[0].items_page.items.push(row("999", "Off-desk Winner Co", group("active"), { [CCOL.package]: "Giveaway Winner, Local Growth", [CCOL.teamDesk]: { text: "", value: { checked: false } } })); return d; };
  assert.deepEqual((await migrateDesk({ dryRun: true })).winners, [{ board: "clients", mondayId: "999", name: "Off-desk Winner Co", imported: false, protected: false }]);
  ghl.monday = base;
  // Off-desk rows only on request; with no email, phone or matching name they are unmatched unless name-only creation is allowed.
  const off = await migrateDesk({ dryRun: true, boards: ["clients"], includeOffDesk: true, onlyIds: [CHAPELHILL_CL] });
  assert.equal(off.rows[0].match, "unmatched"); assert.match(off.rows[0].detail!, /no email or phone/);
  assert.equal((await migrateDesk({ dryRun: true, boards: ["clients"], includeOffDesk: true, onlyIds: [CHAPELHILL_CL], createNameOnly: true })).rows[0].match, "create-name-only");
});

test("an email or phone another contact already holds is left off (GoHighLevel would refuse the whole write), and the report says so", async () => {
  // The board links this row to a contact with no email or phone; the row's email is Pat's and its phone is Kaden's.
  ghl.addContact({ id: "NoEmailContact000001", firstName: "Sam", companyName: "Linked Elsewhere Co" });
  const base = ghl.monday!;
  ghl.monday = (q, v) => { const d = base(q, v) as { boards: { items_page: { items: MondayRow[] } }[] }; if ((v.board as string[])[0] === "18431157561") d.boards[0].items_page.items.push(row("555", "Linked Elsewhere Co", stage("new"), { [COL.email]: "Pat@Unrelated.example", [COL.phone]: "(812) 555-0186", [COL.ghlContact]: url("https://app.gohighlevel.com/v2/location/LOC/contacts/detail/NoEmailContact000001", "GHL") }, { updates: Array.from({ length: 50 }, (_, i) => upd(`7${String(i).padStart(3, "0")}`, `update ${i + 1}`)) })); return d; };
  const dry = await migrateDesk({ dryRun: true, onlyIds: ["555"] });
  assert.deepEqual([dry.rows[0].match, dry.rows[0].ghlId], ["ghl-link", "NoEmailContact000001"]);
  assert.ok(!dry.rows[0].contactFields.includes("email") && !dry.rows[0].contactFields.includes("phone"));
  assert.ok(dry.rows[0].warnings.some((w) => /email is already on another contact \(SomeoneElse000000001\)/.test(w)) && dry.rows[0].warnings.some((w) => /phone is already on another contact \(ArcticLawContact0001\)/.test(w)));
  assert.ok(dry.rows[0].warnings.some((w) => /only the newest 50 are copied/.test(w)), "an item with a full page of updates says the older ones are not copied");
  const run = await migrateDesk({ pauseMs: 0, dryRun: false, onlyIds: ["555"] });
  assert.equal(run.counts.written, 1); assert.equal(run.rows[0].error, undefined);
  assert.equal(ghl.get("NoEmailContact000001").email, undefined); assert.equal(ghl.get("NoEmailContact000001").phone, undefined);
  assert.equal(ghl.value("NoEmailContact000001", "Desk Onboarding Stage"), "New handoff"); assert.equal(ghl.notesFor("NoEmailContact000001").length, 50);
  assert.equal(ghl.get("SomeoneElse000000001").customFields!.length, 0);
});

test("a graduated client whose onboarding item is gone, pinned by hand, still finds the files the Monday desk kept under that item", async () => {
  const GONE = "13000000001";
  blobSeed(`onboarding/intake/${GONE}.json`, { version: 1, itemId: GONE, leadId: "", business: "Squirrel Made Products", tokenHash: null, tokenIssuedAt: null, tokenExpiresAt: null, revokedAt: null, form: { business: "Squirrel Made Products" }, lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [{ key: `onboarding/files/${GONE}/Brand/logo.png`, name: "logo.png", size: 10, type: "image/png", category: "Brand", uploadedAt: "2026-09-20T10:00:00.000Z" }], createdAt: "", updatedAt: "" });
  const base = ghl.monday!;
  ghl.monday = (q, v) => { const d = base(q, v) as { boards: { items_page: { items: MondayRow[] } }[] }; if ((v.board as string[])[0] !== "18431157561") d.boards[0].items_page.items[0].column_values.push({ id: CCOL.onboardingItem, text: GONE, value: JSON.stringify(GONE) }); return d; };
  const waiting = await migrateDesk({ pauseMs: 0, dryRun: false, boards: ["clients"], onlyIds: [SQUIRREL_CL] });
  assert.equal(waiting.rows[0].match, "unmatched", "without a map the row waits for an onboarding record that will never come");
  const pinned = await migrateDesk({ pauseMs: 0, dryRun: false, boards: ["clients"], onlyIds: [SQUIRREL_CL], map: { [SQUIRREL_CL]: "SquirrelMadeJeremy01" } });
  assert.equal(pinned.counts.written, 1); assert.deepEqual(pinned.rows[0].storage, [`intake/${GONE}: contactId set`]);
  assert.equal(ghl.value("SquirrelMadeJeremy01", "Desk Monday Onboarding ID"), GONE);
  const detail = await clientDetailGhl("SquirrelMadeJeremy01", true);
  assert.equal(detail.fileScope, GONE); assert.deepEqual(detail.files.map((x) => x.name), ["logo.png"]);
  assert.deepEqual((await listOnboardingGhl()).rows, [], "carrying the id does not make the client an onboarding record");
  assert.deepEqual((await listClientsGhl()).rows.map((x) => x.name), ["Squirrel Made Products"]);
});

// A world of its own: just these rows on the two boards.
const boards = (p: MondayRow[], c: MondayRow[] = []) => { ghl.monday = (_q, v) => ({ boards: [{ items_page: { cursor: null, items: (v.board as string[])[0] === "18431157561" ? p : c } }] }); };
const onDesk = { text: "v", value: { checked: "true" } };

test("an onboarding row and a client row that reach the same contact by email (no link between them): the second adds to the first", async () => {
  ghl.addContact({ id: "AcmeRoofingContact01", firstName: "Al", companyName: "Acme Roofing", email: "al@acme.example" });
  boards(
    [row("111", "Acme Roofing", stage("building"), { [COL.email]: "al@acme.example", [COL.package]: "Giveaway Winner, Local Growth", [COL.gbpAccess]: "Verified", [COL.notes]: "onboarding notes" })],
    [row("211", "Acme Roofing", group("active"), { [CCOL.email]: "AL@acme.example", [CCOL.package]: "Local Growth", [CCOL.gbpAccess]: "Not Requested", [CCOL.notes]: "client notes", [CCOL.teamDesk]: onDesk })],
  );
  const r = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(r.rows.map((x) => [x.board, x.match, x.ghlId, !!x.done]), [["onboarding", "email", "AcmeRoofingContact01", true], ["clients", "email", "AcmeRoofingContact01", true]]);
  const id = "AcmeRoofingContact01";
  assert.deepEqual(ghl.value(id, "Desk Packages"), ["Giveaway Winner", "Local Growth"], "the client row sees what the onboarding row just wrote, and keeps the winner label");
  assert.equal(ghl.value(id, "Desk GBP Access"), "Verified"); assert.equal(ghl.value(id, "Desk Notes"), "onboarding notes\n\nclient notes");
  assert.equal(ghl.value(id, "Desk Monday Onboarding ID"), "111"); assert.equal(ghl.value(id, "Desk Monday Client ID"), "211");
  assert.deepEqual(r.winners, [{ board: "onboarding", mondayId: "111", name: "Acme Roofing", imported: true, protected: true }]);
});

test("a business new to GoHighLevel with a row on each board: one contact is created and both rows land on it", async () => {
  boards(
    [row("121", "New Both Co", stage("launched"), { [COL.email]: "both@new.example", [COL.package]: "Local Growth" })],
    [row("221", "New Both Co", group("active"), { [CCOL.email]: "both@new.example", [CCOL.package]: "Local Growth", [CCOL.payStatus]: "Paid / Current", [CCOL.teamDesk]: onDesk })],
  );
  const dry = await migrateDesk({ dryRun: true });
  assert.deepEqual(dry.rows.map((x) => [x.board, x.match, x.ghlName]), [["onboarding", "create", ""], ["clients", "email", "(the contact row 121 creates in this run)"]]);
  assert.equal(ghl.writes().length, 0);
  const run = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(run.rows.map((x) => [x.match, !!x.done]), [["create", true], ["email", true]]); assert.equal(run.rows[0].ghlId, run.rows[1].ghlId); assert.equal(ghl.contacts.size, 6);
  const id = run.rows[0].ghlId;
  assert.deepEqual([...ghl.get(id).tags!].sort(), ["desk-client", "desk-onboarding", "monday-import"]); assert.equal(ghl.value(id, "Desk Pay Status"), "Paid / Current"); assert.equal(ghl.value(id, "Desk Onboarding Stage"), "Launched");
  assert.deepEqual((await listClientsGhl()).rows.map((x) => x.name), ["New Both Co"], "launched, so it shows on the Clients tab");
});

test("two rows of one board never land on one contact: the second is refused, in the dry run too", async () => {
  // One person, two businesses, one email — and GoHighLevel has no contact for either yet.
  boards([
    row("311", "Brand One Plumbing", stage("new"), { [COL.email]: "owner@brands.example", [COL.package]: "Local Growth" }),
    row("312", "Brand Two HVAC", stage("collecting"), { [COL.email]: "Owner@brands.example", [COL.package]: "Max Growth" }),
  ]);
  const dry = await migrateDesk({ dryRun: true });
  assert.deepEqual(dry.rows.map((x) => x.match), ["create", "unmatched"]);
  assert.match(dry.rows[1].detail!, /row 311 creates a contact with the same email or phone, and one contact cannot be two onboarding records/);
  const run = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(run.rows.map((x) => [x.name, x.match, !!x.done]), [["Brand One Plumbing", "create", true], ["Brand Two HVAC", "unmatched", false]]);
  assert.match(run.rows[1].detail!, /already carries onboarding record item 311 from the old board/); assert.equal(run.rows[1].candidates!.length, 1);
  const id = run.rows[0].ghlId;
  assert.equal(ghl.contacts.size, 6); assert.equal(ghl.value(id, "Desk Monday Onboarding ID"), "311"); assert.deepEqual(ghl.value(id, "Desk Packages"), ["Local Growth"]); assert.equal(ghl.value(id, "Desk Onboarding Stage"), "New handoff");
  // Running it again changes nothing: the first stays imported, the second stays refused until it has a contact of its own.
  const again = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(again.rows.map((x) => x.match), ["imported", "unmatched"]); assert.equal(ghl.value(id, "Desk Monday Onboarding ID"), "311");
  const own = ghl.addContact({ id: "BrandTwoOwnContact01", companyName: "Brand Two HVAC" });
  const pinned = await migrateDesk({ pauseMs: 0, dryRun: false, onlyIds: ["312"], map: { "312": own.id } });
  assert.equal(pinned.counts.written, 1); assert.equal(ghl.value(own.id, "Desk Monday Onboarding ID"), "312"); assert.equal(ghl.get(own.id).email, undefined, "the shared email stays on the first contact");
  // And two rows that match one EXISTING contact: refused before anything is written, dry run included.
  boards([row("411", "Twin A", stage("new"), { [COL.email]: "pat@unrelated.example" }), row("412", "Twin B", stage("new"), { [COL.email]: "pat@unrelated.example" })]);
  assert.deepEqual((await migrateDesk({ dryRun: true })).rows.map((x) => x.match), ["email", "unmatched"]);
});

test("a giveaway winner is never brought over without the label: the row is blocked, and the winners list says who is protected", async () => {
  boards([row("511", "Winner Co", stage("new"), { [COL.email]: "win@winner.example", [COL.package]: "Giveaway Winner, Local Growth" })]);
  const def = ghl.defs.find((d) => d.name === "Desk Packages")!;
  const full = def.picklistOptions;
  def.picklistOptions = (full || []).filter((o) => o !== "Giveaway Winner"); forgetCustomFields();
  const dry = await migrateDesk({ dryRun: true });
  assert.match(dry.rows[0].detail!, /^BLOCKED — a real run will refuse this row: "Giveaway Winner" is not an option on Desk Packages in GoHighLevel/);
  const run = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.equal(run.counts.failed, 1); assert.equal(run.counts.written, 0); assert.match(run.rows[0].error!, /^not imported: "Giveaway Winner" is not an option/);
  assert.equal(ghl.contacts.size, 5, "no contact was created"); assert.equal(ghl.writes().length, 0);
  assert.deepEqual(run.winners, [{ board: "onboarding", mondayId: "511", name: "Winner Co", imported: false, protected: false }]);
  // With the option back, it goes over and is protected.
  def.picklistOptions = full; forgetCustomFields();
  const ok = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(ok.winners, [{ board: "onboarding", mondayId: "511", name: "Winner Co", imported: true, protected: true }]);
  // A winner whose contact lost the label in GoHighLevel since is called out: imported, not protected.
  ghl.get(ok.rows[0].ghlId).customFields!.find((x) => x.id === ghl.fieldId("Desk Packages"))!.value = ["Local Growth"];
  assert.deepEqual((await migrateDesk({ dryRun: true })).winners, [{ board: "onboarding", mondayId: "511", name: "Winner Co", imported: true, protected: false }]);
});

test("a run that stopped after the fields were written is finished by the next one, not skipped as imported", async () => {
  boards([row("611", "Half Done Co", stage("new"), { [COL.email]: "half@done.example" }, { updates: [upd("801", "first update"), upd("802", "second update")] })]);
  blobSeed("onboarding/intake/611.json", { version: 1, itemId: "611", leadId: "", business: "Half Done Co", tokenHash: null, tokenIssuedAt: null, tokenExpiresAt: null, revokedAt: null, form: { business: "Half Done Co" }, lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [], createdAt: "", updatedAt: "" });
  ghl.failures.push({ match: /^POST \/contacts\/[^/]+\/tags$/, status: 500 });
  const first = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.equal(first.counts.failed, 1); assert.match(first.rows[0].error!, /GoHighLevel error 500 on POST/);
  const id = [...ghl.contacts.values()].find((c) => c.companyName === "Half Done Co")!.id;
  assert.equal(ghl.value(id, "Desk Monday Onboarding ID"), "611"); assert.deepEqual(ghl.get(id).tags, []); assert.equal(ghl.notesFor(id).length, 0);
  const dry = await migrateDesk({ dryRun: true });
  assert.equal(dry.rows[0].match, "imported"); assert.match(dry.rows[0].detail!, /^already imported, but an earlier run did not finish: tag desk-onboarding, 2 updates to copy as notes, storage link intake\/611 — the next real run completes it$/);
  const second = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.equal(second.counts.finished, 1); assert.equal(second.counts.written, 0); assert.equal(second.counts.failed, 0);
  assert.match(second.rows[0].detail!, /^already imported — finished what an earlier run left: tag desk-onboarding, 2 updates copied as notes, storage link intake\/611$/);
  assert.deepEqual(ghl.get(id).tags, ["desk-onboarding"]); assert.equal(ghl.notesFor(id).length, 2); assert.equal(blobJson<IntakeRecord>("onboarding/intake/611.json")!.contactId, id);
  const writes = ghl.writes().length;
  const third = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.equal(third.rows[0].detail, "already imported — skipped (force re-writes it)"); assert.equal(ghl.writes().length, writes);
});

test("a contact GoHighLevel's search has not caught up with is matched, not overwritten: nothing it holds is replaced", async () => {
  boards([row("711", "Board Name LLC", stage("new"), { [COL.email]: "fresh@lead.example", [COL.contact]: "Board Person", [COL.salesOwner]: person("Josh Pack", 39848217), [COL.package]: "Local Growth" })]);
  ghl.settle(); ghl.lag = true; // the search index is a few seconds behind…
  ghl.addContact({ id: "FreshLeadContact0001", firstName: "Fresh", lastName: "Lead", companyName: "Fresh Lead LLC", email: "fresh@lead.example", tags: ["website-form"], assignedTo: reps.Dave }); // …and this contact arrived in those seconds
  const run = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.equal(run.counts.written, 1); assert.equal(run.rows[0].ghlId, "FreshLeadContact0001"); assert.equal(ghl.contacts.size, 6, "no second contact");
  const c = ghl.get("FreshLeadContact0001");
  assert.equal(c.firstName, "Fresh"); assert.equal(c.companyName, "Fresh Lead LLC"); assert.equal(c.assignedTo, reps.Dave, "its owner is not replaced by the board's sales owner");
  assert.deepEqual(c.tags, ["website-form", "desk-onboarding"], "it was not created by the import, so it is not tagged monday-import");
  assert.ok(run.rows[0].warnings.some((w) => /GoHighLevel already had a contact with this email or phone \(FreshLeadContact0001\)/.test(w)));
  assert.equal(ghl.value("FreshLeadContact0001", "Desk Onboarding Stage"), "New handoff"); assert.equal(ghl.value("FreshLeadContact0001", "Desk Link"), undefined);
});

test("search results that come without the name pair never make the import overwrite a name: every matched contact is read fresh", async () => {
  ghl.searchOmitsNames = true;
  const dry = await migrateDesk({ dryRun: true, onlyIds: [BOURBON_OB] });
  assert.deepEqual(dry.rows[0].contactFields.sort(), ["city", "state", "website"], "the lead already has a name, an email and a phone");
  await migrateDesk({ pauseMs: 0, dryRun: false, onlyIds: [BOURBON_OB] });
  const c = ghl.get("LeadBourbon0000000A1");
  assert.equal(c.firstName, "Freddy"); assert.equal(c.lastName, "Sumbay"); assert.equal(c.companyName, "Bourbon Leather Co");
});

test("the import proves what GoHighLevel kept: a dropped package fails the row, and files left under another key are called out", async () => {
  ghl.drop.set("Desk Packages", ["Social Ads $1,200"]);
  const run = await migrateDesk({ pauseMs: 0, dryRun: false, onlyIds: [LADYBUG_OB] });
  assert.equal(run.counts.failed, 1); assert.match(run.rows[0].error!, /GoHighLevel did not keep "Social Ads \$1,200" in Desk Packages on LadybugGhlContact001/);
  ghl.drop.clear();
  // An unlinked client row whose files sit under its own key, for a business whose contact keeps its files under the onboarding key.
  ghl.addContact({ id: "AcmeRoofingContact01", firstName: "Al", companyName: "Acme Roofing", email: "al@acme.example" });
  boards(
    [row("111", "Acme Roofing", stage("building"), { [COL.email]: "al@acme.example", [COL.package]: "Local Growth" })],
    [row("211", "Acme Roofing", group("active"), { [CCOL.email]: "al@acme.example", [CCOL.package]: "Local Growth", [CCOL.teamDesk]: onDesk })],
  );
  blobSeed("onboarding/intake/c211.json", { version: 1, itemId: "c211", leadId: "", business: "Acme Roofing", tokenHash: null, tokenIssuedAt: null, tokenExpiresAt: null, revokedAt: null, form: { business: "Acme Roofing" }, lastSavedAt: null, submittedAt: null, reviewedAt: null, files: [{ key: "onboarding/files/c211/Brand/logo.png", name: "logo.png", size: 10, type: "image/png", category: "Brand", uploadedAt: "2026-09-25T10:00:00.000Z" }], createdAt: "", updatedAt: "" });
  const both = await migrateDesk({ pauseMs: 0, dryRun: false });
  assert.deepEqual(both.rows.map((x) => !!x.done), [true, true]);
  assert.ok(both.rows[1].warnings.some((w) => /1 file added on the Clients tab is stored under c211, but this contact's files live under 111 — it will not show on the desk after the switch unless moved/.test(w)));
});

test("matching order and its tie-breaks", () => {
  const f = resolveDeskFields(ghl.defs); const sales = resolveFromDefs(ghl.defs);
  const contacts = [...ghl.contacts.values()];
  contacts.push({ id: "TwinNameContact00001", companyName: "Twin Name LLC" }, { id: "TwinNameContact00002", companyName: "twin name llc" }, { id: "AlreadyImported00001", customFields: [{ id: ghl.fieldId("Desk Monday Onboarding ID"), value: "777" }, { id: ghl.fieldId("Desk Stripe Customer ID"), value: "cus_ABC" }] });
  const ix = indexForDesk(contacts, f, sales);
  const m = (r: MondayRow, over: Record<string, string> = {}, kind: "onboarding" | "client" = "onboarding", opts = {}) => { const x = matchRow({ row: r, kind, email: "", phone: "", leadId: "", onboardingItem: "", stripeCustomer: "", stripeEmail: "", ...over }, ix, opts); return [x.match, x.contact?.id || ""]; };
  const r = (id: string, name = "Nobody Co") => row(id, name, stage("new"), {});
  assert.deepEqual(m(r("777"), { email: "freddy@bourbon.example" }), ["imported", "AlreadyImported00001"], "an id already imported beats everything");
  assert.deepEqual(m(r("1"), { leadId: "13149403716", email: "pat@unrelated.example" }), ["lead", "LeadBourbon0000000A1"], "the lead it was handed off from beats the email");
  assert.deepEqual(m(r("1"), { leadId: "LadybugGhlContact001" }), ["lead", "LadybugGhlContact001"]);
  assert.deepEqual(m(r("1"), { stripeCustomer: "cus_ABC" }, "client"), ["stripe", "AlreadyImported00001"]);
  assert.deepEqual(m(r("1"), { stripeCustomer: "cus_NEW", stripeEmail: "jeremy@squirrel.example" }, "client"), ["stripe", "SquirrelMadeJeremy01"]);
  assert.deepEqual(m(r("1"), { email: " KADEN@arcticlaw.example " }), ["email", "ArcticLawContact0001"]);
  assert.deepEqual(m(r("1"), { phone: "(812) 555-0186" }), ["phone", "ArcticLawContact0001"]);
  assert.deepEqual(m(r("1", "Squirrel Made Products!")), ["company-name", "SquirrelMadeJeremy01"]);
  const twins = matchRow({ row: r("1", "Twin Name LLC"), kind: "onboarding", email: "", phone: "", leadId: "", onboardingItem: "", stripeCustomer: "", stripeEmail: "" }, ix);
  assert.equal(twins.match, "unmatched"); assert.equal(twins.candidates!.length, 2);
  assert.deepEqual(m(r("1"), { email: "new@person.example" }), ["create", ""]);
  assert.deepEqual(m(r("1")), ["unmatched", ""]); assert.deepEqual(m(r("1"), {}, "onboarding", { createNameOnly: true }), ["create-name-only", ""]);
});

test("plans: only desk fields, blanks are left blank, GoHighLevel's own details win, people map by Monday id", () => {
  const f = resolveDeskFields(ghl.defs);
  const p = planOnboarding(pipeline()[1], ghl.get("LeadBourbon0000000A1"), f);
  assert.deepEqual(p.native, { website: "https://bourbonleather.com", city: "Parrish", state: "FL" }, "only what GoHighLevel has blank is filled; name, company, email, phone and owner are not touched"); assert.equal(p.salesLeadId, "13149403716"); assert.deepEqual(p.tags, ["desk-onboarding"]);
  assert.equal(p.values.obOwner, "Madison"); assert.equal(p.values.dnsPath, undefined); assert.equal(p.values.profileComplete, undefined);
  const fresh = planOnboarding(pipeline()[1], null, f);
  assert.deepEqual(fresh.native, { firstName: "Freddy", lastName: "Sumbay", companyName: "Bourbon Leather Company", email: "freddy@bourbon.example", phone: "+13865895606", website: "https://bourbonleather.com", city: "Parrish", state: "FL", assignedTo: reps.Dave });
  const c = planClient(clients()[0], ghl.get("SquirrelMadeJeremy01"), f);
  assert.equal(c.values.clientStatus, "Active"); assert.equal(c.values.accountManager, "Josh"); assert.deepEqual(c.values.packages, ["Local Growth — First Year $297"]); assert.deepEqual(c.tags, ["desk-client"]); assert.deepEqual(c.native, {});
  delete process.env.ONBOARDING_EXTRA_OWNERS;
  assert.equal(personName(pipeline()[1], COL.onboardingOwner), "Madison", "with no id on file the first name Monday shows still finds the team member");
  assert.equal(personName(row("1", "x", stage("new"), { [COL.onboardingOwner]: person("Matt Cillo", 5) }), COL.onboardingOwner), "", "someone who is not on the desk team is left blank, and the plan says so");
});

test("setup, diag and the self-test: what the desk writes is spelled out, and the self-test only ever touches the test contact", async () => {
  // Before the fields exist.
  ghl.defs = ghl.defs.filter((d) => !isDeskFieldName(d.name));
  const dry = await deskSetup(true);
  assert.equal(dry.missing.length, 43); assert.equal(ghl.writes().length, 0);
  assert.deepEqual(dry.tags, [{ name: "desk-onboarding", exists: false }, { name: "desk-client", exists: false }, { name: "monday-import", exists: false }]);
  const before = await deskDiagnose() as { fields: { deskPresent: number; deskMissing: string[]; lseOwned: string[] }; records?: string };
  assert.equal(before.fields.deskPresent, 0); assert.equal(before.fields.deskMissing.length, 43); assert.match(String(before.records), /not counted/);
  // Create them (the fake answers instantly; the real call pauses between fields).
  for (const m of dry.missing) ghl.addField(m.name, m.dataType, m.options);
  const diag = await deskDiagnose() as { deskBackend: string; fields: { deskPresent: number; lseOwned: string[]; salesDesk: string[]; other: string[]; deskNotInCatalog: string[] }; tags: { lseOwned: string[]; deskOwned: { name: string; exists: boolean }[]; other: string[] }; onboardingRecords: number; clients: number; writes: ReturnType<typeof deskWriteList> };
  assert.equal(diag.deskBackend, "monday"); assert.equal(diag.fields.deskPresent, 43); assert.deepEqual(diag.fields.deskNotInCatalog, []);
  assert.ok(diag.fields.lseOwned.includes("LSE Health") && diag.fields.lseOwned.includes("LSE Term End")); assert.ok(diag.fields.salesDesk.includes("Lead Source")); assert.deepEqual(diag.fields.other, []);
  assert.deepEqual(diag.tags.lseOwned, ["lse:cancel-request", "lse:client", "lse:payment-failed", "lse:red"]); assert.ok(diag.tags.other.includes("giveaway-entrant") === false && diag.tags.deskOwned.every((t) => !t.exists));
  assert.equal(diag.onboardingRecords, 0); assert.equal(diag.clients, 0);
  assert.equal(diag.writes.customFields.length, 43); assert.ok(diag.writes.customFields.every(isDeskFieldName)); assert.ok(diag.writes.never.includes("any lse: tag"));
  assert.ok(!JSON.stringify(diag).includes("nonfunctional-test"));
  // Self-test: dry run is a plan; the real run round-trips every field on the test contact and puts back what was there.
  const TEST = "C8FHl1LIfXEMI9isByB2";
  ghl.addContact({ id: TEST, companyName: "Test — Claude", tags: ["sales-lead"], fields: { "Desk Notes": "was here before", "Lead Source": "Other" } });
  const plan = await deskSelfTest(true, DAVE);
  assert.equal(plan.plan!.length, 43); assert.equal(ghl.writes().length, 0);
  const run = await deskSelfTest(false, DAVE);
  assert.equal(run.error, undefined); assert.equal(run.passed, 43); assert.deepEqual(run.failed, []); assert.deepEqual(run.clearFailed, []);
  assert.match(run.tag!, /desk-onboarding: add ok, removed again: ok/); assert.match(run.search!, /accepted/); assert.equal(run.restored, "original values written back");
  assert.match(run.note!, /^added; authored as Dave; \d{4} characters kept whole$/, "a note as long as the desk accepts keeps its marker");
  assert.equal(run.version, "dateUpdated moved on the field write; moved on the tag add");
  assert.match(run.searchCarries!, /^firstName NO, lastName NO, contactName yes, companyName yes, .*tags yes, customFields yes, assignedTo yes, dateUpdated yes$/);
  assert.equal(ghl.value(TEST, "Desk Notes"), "was here before"); assert.equal(ghl.value(TEST, "Desk Onboarding Stage"), ""); assert.deepEqual(ghl.value(TEST, "Desk Packages"), []); assert.deepEqual(ghl.get(TEST).tags, ["sales-lead"]); assert.equal(ghl.value(TEST, "Lead Source"), "Other");
  assert.ok(ghl.writes().every((w) => w.path.startsWith(`/contacts/${TEST}`)), "no other contact was written");
  assert.match((await deskSelfTest(false, DAVE)).note!, /^already there today/);
  assert.equal(ghl.notesFor(TEST).length, 1);
  // Nothing in these reports looks like a query string: the browser tool that reads them on production redacts anything that does.
  assert.ok(!/[=?&]/.test(JSON.stringify([diag.writes, run])), "no =, ? or & in the write list or the self-test report");
  // The awkward labels are the ones tested: an em dash and a dollar sign, a comma inside a label, parentheses, a slash.
  assert.deepEqual(plan.plan!.find((x) => x.field === "Desk Packages")!.sample, ["Local Growth — First Year $297", "Social Ads $1,200", "CRM (incl. AI Chat)"]);
  assert.equal(plan.plan!.find((x) => x.field === "Desk Pay Status")!.sample, "Paid / Current");
});

test("self-test: a field GoHighLevel refuses is named, the others are still proven, and the contact is put back", async () => {
  const TEST = "C8FHl1LIfXEMI9isByB2";
  ghl.addContact({ id: TEST, companyName: "Test — Claude", fields: { "Desk Notes": "was here before" } });
  ghl.refuse.add("Desk Billing Day");
  const run = await deskSelfTest(false, DAVE);
  assert.equal(run.error, undefined); assert.equal(run.passed, 42); assert.deepEqual(run.failed, ["Desk Billing Day"]); assert.deepEqual(run.clearFailed, ["Desk Billing Day"]);
  assert.match(run.checks!.find((c) => c.field === "Desk Billing Day")!.error!, /^write refused: GoHighLevel error 422 .*Desk Billing Day.*; clear refused: /);
  assert.match(run.restored!, /^original values written back except Desk Billing Day — clear those on the test contact by hand$/);
  assert.equal(ghl.value(TEST, "Desk Notes"), "was here before"); assert.equal(ghl.value(TEST, "Desk Billing Day"), undefined); assert.deepEqual(ghl.value(TEST, "Desk Packages"), []);
  assert.ok(ghl.writes().every((w) => w.path.startsWith(`/contacts/${TEST}`)), "no other contact was written");
  assert.ok(!/[=?&]/.test(JSON.stringify(run)));
});
