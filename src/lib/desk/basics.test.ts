import assert from "node:assert/strict";
import { test } from "node:test";
import { assertMayWriteGhl, backendForRecordId, backendForScope, deskBackend, deskDefault, deskSystemName, isGhlRecordId, validateRecordId, validateScope } from "./switch";
import { actorFor, deskTeam, isTeamName, memberByGhlUser, nameForMondayId, teamOwners } from "./team";
import { ALL_PACKAGE_LABELS, joinPackages, listPrice, monthlyList, splitPackages } from "./money";
import { itemId, mergeTemplates, parseChecklist, serializeChecklist, setItemStatus, toChecklistItems } from "./checklist-text";
import { PACKAGES } from "@/lib/onboarding/config";
import { CLIENT_PACKAGES } from "@/lib/clients/config";
import { checklistFor } from "@/lib/onboarding/checklist";
import { ghlRepIds } from "@/lib/ghl/reps";

const GHL = "ocQHyuzHvysMo5N5VsXc";
const MONDAY = "13052279909";

test("DESK_BACKEND defaults to monday; only the exact value 'ghl' flips it", () => {
  for (const v of [undefined, "", "GHL", "monday", "gohighlevel", "true", " ghl"]) assert.equal(deskDefault(v), "monday", String(v));
  assert.equal(deskDefault("ghl"), "ghl");
  assert.equal(deskSystemName("ghl"), "GoHighLevel"); assert.equal(deskSystemName("monday"), "Monday");
});
test("?backend= on a team request previews the other system without touching the env", () => {
  const url = (q: string) => new Request(`https://www.creativecowboys.co/api/team/onboarding${q}`);
  assert.equal(deskBackend(url("?backend=ghl"), undefined), "ghl");
  assert.equal(deskBackend(url("?backend=monday"), "ghl"), "monday");
  assert.equal(deskBackend(url("?backend=other"), undefined), "monday");
  assert.equal(deskBackend(url(""), "ghl"), "ghl");
  assert.equal(deskBackend(null, undefined), "monday");
});
test("a record id's shape decides: a GoHighLevel id always goes to GoHighLevel; a Monday id follows the switch", () => {
  assert.equal(isGhlRecordId(GHL), true); assert.equal(isGhlRecordId(MONDAY), false); assert.equal(isGhlRecordId(`c${MONDAY}`), false, "a Monday-era client file scope is not a contact id");
  assert.equal(backendForRecordId(GHL, undefined), "ghl"); assert.equal(backendForRecordId(GHL, "ghl"), "ghl");
  assert.equal(backendForRecordId(MONDAY, undefined), "monday");
  assert.equal(backendForRecordId(MONDAY, "ghl"), "ghl", "after the flip a Monday-era id is looked up among the imported records, never sent to Monday");
  assert.equal(validateRecordId(GHL), GHL); assert.equal(validateRecordId(MONDAY), MONDAY);
  for (const bad of ["", "abc", "../x", "0123", "has space", "a".repeat(65), `c${MONDAY}`]) assert.throws(() => validateRecordId(bad), { status: 400 });
});
test("file scopes: Monday-era scopes keep working, GoHighLevel contact ids are scopes too", () => {
  for (const ok of [MONDAY, `c${MONDAY}`, GHL]) assert.equal(validateScope(ok), ok);
  for (const bad of ["", "c", "cabc", "../etc", "c0123", "x y"]) assert.throws(() => validateScope(bad), { status: 400 });
  assert.equal(backendForScope(GHL, undefined), "ghl"); assert.equal(backendForScope(`c${MONDAY}`, undefined), "monday"); assert.equal(backendForScope(`c${MONDAY}`, "ghl"), "ghl");
});
test("before the flip only an owner may change a GoHighLevel desk record; after it, everyone on the team", () => {
  assert.throws(() => assertMayWriteGhl(false, undefined), { status: 403 });
  assert.doesNotThrow(() => assertMayWriteGhl(true, undefined));
  assert.doesNotThrow(() => assertMayWriteGhl(false, "ghl"));
});

test("team: owners are names; Madison needs no GoHighLevel user; ids come from the rep table and env", () => {
  const team = deskTeam({});
  assert.deepEqual(team.map((m) => m.name), ["Dave", "Josh", "Keaton", "Madison"]);
  assert.equal(team[0].ghlUserId, ghlRepIds().Dave); assert.equal(team[3].ghlUserId, "", "Madison has no GoHighLevel user id until someone supplies one");
  assert.equal(team[3].mondayId, "");
  const withEnv = deskTeam({ GHL_REP_IDS: "Madison:MadisonGhlUser00000A", ONBOARDING_EXTRA_OWNERS: "Madison:45852318", DESK_EXTRA_TEAM: "Andy:andy@creativecowboys.co, bad, Dave:dup@x.co" });
  assert.equal(withEnv.find((m) => m.name === "Madison")!.ghlUserId, "MadisonGhlUser00000A");
  assert.equal(withEnv.find((m) => m.name === "Madison")!.mondayId, "45852318");
  assert.deepEqual(withEnv.map((m) => m.name), ["Dave", "Josh", "Keaton", "Madison", "Andy"]);
  assert.deepEqual(teamOwners().slice(0, 2), [{ id: "Dave", name: "Dave" }, { id: "Josh", name: "Josh" }]);
  assert.equal(isTeamName("Madison"), true); assert.equal(isTeamName("39848115"), false); assert.equal(isTeamName(""), false);
  assert.equal(nameForMondayId("39848217"), "Josh"); assert.equal(nameForMondayId("1"), "");
  assert.equal(memberByGhlUser(ghlRepIds().Keaton)?.name, "Keaton"); assert.equal(memberByGhlUser(""), null);
});
test("actor: the signed-in email decides whose name is on a note", () => {
  assert.deepEqual(actorFor("Josh@CreativeCowboys.co"), { name: "Josh", email: "josh@creativecowboys.co", ghlUserId: ghlRepIds().Josh });
  assert.deepEqual(actorFor("madison@creativecowboys.co"), { name: "Madison", email: "madison@creativecowboys.co", ghlUserId: "" });
  assert.equal(actorFor("howdy@creativecowboys.co").name, "Howdy");
  assert.deepEqual(actorFor(""), { name: "Team", email: "", ghlUserId: "" });
});

test("list prices match the two Monday formulas label for label", () => {
  const formula: Record<string, number> = {
    "Local Growth": 497, "Local Growth — First Year $297": 297, "Max Growth": 1497, "Expanded Reach (+5 cities)": 200,
    "Social Ads $300": 300, "Social Ads $600": 600, "Social Ads $1,200": 1200, "Google Ads $500": 500, "Google Ads $1,000": 1000, "Google Ads $1,500": 1500,
    "CRM (incl. AI Chat)": 97, "AI Chat only": 47,
    // not in the formulas: carried by Custom $/mo (or one-time)
    "AI SEO": 0, "Social Ads Custom": 0, "Google Ads Custom": 0, "Growth Strategy Session": 0, "Website hosting / care": 0, "Custom retainer": 0, "Giveaway Winner": 0,
  };
  for (const label of ALL_PACKAGE_LABELS) assert.equal(listPrice(label), formula[label], label);
  assert.deepEqual([...ALL_PACKAGE_LABELS].sort(), [...new Set([...PACKAGES, ...CLIENT_PACKAGES])].sort(), "every label on either board, nothing renamed");
  assert.equal(listPrice("Something new"), 0);
});
test("monthly list price: sum + Custom $/mo; a giveaway winner is always $0", () => {
  assert.equal(monthlyList(["Local Growth — First Year $297"], ""), 297);
  assert.equal(monthlyList(["Local Growth", "Social Ads $1,200", "CRM (incl. AI Chat)"], "150"), 497 + 1200 + 97 + 150);
  assert.equal(monthlyList(["Local Growth", "Local Growth — First Year $297"], null), 794, "both labels count, as the Monday formula did");
  assert.equal(monthlyList(["AI SEO"], 97), 97);
  assert.equal(monthlyList([], undefined), 0);
  assert.equal(monthlyList(["Giveaway Winner", "Local Growth"], 500), 0);
  assert.equal(monthlyList(["Local Growth"], "not a number"), 497);
});
test("package labels with a comma in them survive a join and a split", () => {
  const all = [...ALL_PACKAGE_LABELS];
  assert.deepEqual(splitPackages(joinPackages(all)), all);
  assert.deepEqual(splitPackages("Local Growth — First Year $297, Social Ads $1,200,Google Ads $1,000"), ["Local Growth — First Year $297", "Social Ads $1,200", "Google Ads $1,000"]);
  assert.deepEqual(splitPackages("Brand new thing, Local Growth"), ["Brand new thing", "Local Growth"]);
  assert.deepEqual(splitPackages(""), []); assert.deepEqual(splitPackages(null), []);
});

test("checklist text: round-trips, reads hand edits, and is plain enough to read in GoHighLevel", () => {
  const text = ["[x] Intake link delivered to client | Onboard", "[~] Citations submitted | Build | @Dave", "[!] Logo files received (vector preferred) | Onboard | due 2026-10-05", "[ ] Kickoff call offered | Onboard", "", "A line someone typed by hand", "[X] Capital x counts as done"].join("\n");
  const items = parseChecklist(text);
  assert.deepEqual(items.map((i) => [i.name, i.status, i.phase, i.owner, i.due]), [
    ["Intake link delivered to client", "Done", "Onboard", "", ""], ["Citations submitted", "Working on it", "Build", "Dave", ""],
    ["Logo files received (vector preferred)", "Stuck", "Onboard", "", "2026-10-05"], ["Kickoff call offered", "", "Onboard", "", ""],
    ["A line someone typed by hand", "", "", "", ""], ["Capital x counts as done", "Done", "", "", ""],
  ]);
  assert.deepEqual(parseChecklist(serializeChecklist(items)), items);
  assert.equal(serializeChecklist([{ name: "Pipes | and\nnewlines", status: "Done", phase: "Build", owner: "", due: "" }]), "[x] Pipes / and newlines | Build");
  assert.deepEqual(parseChecklist(""), []); assert.deepEqual(parseChecklist(null), []);
});
test("checklist ids are stable per name, distinct for twins, and 'required' follows the packages", () => {
  const stored = parseChecklist("[ ] Logo files received (vector preferred) | Onboard\n[ ] Kickoff call offered | Onboard\n[ ] Kickoff call offered | Onboard");
  const shown = toChecklistItems(stored, ["Local Growth"]);
  assert.equal(shown[0].id, itemId("Logo files received (vector preferred)")); assert.match(shown[0].id, /^c[0-9a-f]{12}$/);
  assert.equal(shown[2].id, `${shown[1].id}x2`);
  assert.deepEqual(shown.map((i) => i.required), [true, false, false]);
  const next = setItemStatus(stored, ["Local Growth"], shown[2].id, "Done")!;
  assert.deepEqual(next.map((i) => i.status), ["", "", "Done"]);
  assert.equal(setItemStatus(stored, ["Local Growth"], "c000000000000", "Done"), null);
});
test("merging the template adds what the packages need and never duplicates or reorders what is there", () => {
  const first = mergeTemplates([], ["Local Growth"]);
  assert.equal(first.added, checklistFor(["Local Growth"]).length);
  assert.deepEqual(first.items.map((i) => i.name), checklistFor(["Local Growth"]).map((t) => t.name));
  const done = first.items.map((i, n) => (n === 0 ? { ...i, status: "Done" } : i));
  const again = mergeTemplates(done, ["Local Growth"]);
  assert.equal(again.added, 0); assert.equal(again.items[0].status, "Done");
  const more = mergeTemplates(done, ["Local Growth", "Social Ads $300"]);
  assert.equal(more.added, 3); assert.equal(more.items.length, done.length + 3);
  assert.equal(more.items[0].status, "Done");
  // A record made from Josh's LSE template keeps its own rows; the desk rows are added after them.
  const lse = parseChecklist("[x] Welcome email + onboarding link delivered (LSE-01) | Onboard");
  const merged = mergeTemplates(lse, ["Local Growth"]);
  assert.equal(merged.items[0].name, "Welcome email + onboarding link delivered (LSE-01)"); assert.equal(merged.items[0].status, "Done");
});
