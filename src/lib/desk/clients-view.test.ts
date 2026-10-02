import assert from "node:assert/strict";
import { test } from "node:test";
import { churnedMatches, clientCountLabel, clientCounts, currentClients, filterClients, isChurned, monthlyTotal, appliedKind, type ClientFilters } from "./clients-view";
import { clientOrder, effectiveKind, isKind } from "./legacy";
import type { ClientRow } from "@/lib/clients/types";

// Churned clients leave the Clients tab's default view (Oct 2 2026): the default filter, the counts, the monthly total.
const base: ClientRow = {
  id: "c1", name: "Client", url: "", updatedAt: "2026-10-02T12:00:00.000Z", group: "active", groupTitle: "Active", health: "Too New",
  packages: "", mrr: "0", customMonthly: "", accountManager: "Josh", accountManagerIds: ["Josh"],
  contact: "", email: "", phone: "", website: "", gbpUrl: "", ghlContact: "", driveFolder: "", notes: "",
  payStatus: "No Billing Set Up", payMethod: "QuickBooks invoice", billingDay: "", nextBill: "", lastPayment: "", clientSince: "", termEnds: "", lastReport: "",
  gbpAccess: "", gbpChecked: "", stripeCustomer: "", onboardingItem: "", teamDesk: true, searchAtlasListing: "", gbpLive: null, flags: [],
};
const row = (name: string, over: Partial<ClientRow> = {}): ClientRow => ({ ...base, id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, ...over });
const legacy = (name: string, over: Partial<ClientRow> = {}) => row(name, { legacy: true, contact: name.toLowerCase(), ...over });
const ALL: ClientFilters = { kind: "", manager: "", group: "", only: "", search: "" };
const names = (rows: ClientRow[]) => rows.map((r) => r.name);

// The tab as production had it on Oct 2 2026: one desk client and the 17 legacy clients, two of which Dave said to remove.
const LEGACY = ["Fire Bible", "Southeastern PCG", "LEUCO", "Sconyers Concrete Inc", "Defoor Plumbing", "Harmonic Production Services", "The Grove at DeFoor Farm", "McKinley Roofing and Restoration",
  "Innovative Construction Group", "Commercial Insurance Agency", "Met Lane and Associates, P.C.", "Law Office of John B. Jackson and Associates", "Dunwoody Christian Academy", "Chapelhill Church", "Whiten Pools, Inc."];
const squirrel = row("Squirrel Made Products", { legacy: false, contact: "samuel johnson", email: "squirrel@example.com", packages: "Local Growth — First Year $297", mrr: "297", payMethod: "Stripe via GHL", flags: ["gbp", "report", "no-stripe"] });
const desk = (): ClientRow[] => [
  squirrel,
  ...LEGACY.map((n) => legacy(n, n === "Defoor Plumbing" || n === "Sconyers Concrete Inc" ? { packages: "Local Growth", mrr: "497" } : {})),
  legacy("CDM Systems", { group: "churned", groupTitle: "Churned" }),
  legacy("Georgia Truck Parking", { group: "churned", groupTitle: "Churned" }),
];

test("the default view leaves churned clients out; the Churned filter is the way to see them", () => {
  const rows = desk();
  const shown = filterClients(rows, ALL);
  assert.equal(shown.length, 16);
  assert.ok(shown.every((r) => !isChurned(r)));
  assert.ok(!names(shown).includes("CDM Systems") && !names(shown).includes("Georgia Truck Parking"));
  assert.equal(shown[0].name, "Squirrel Made Products", "the flagged desk client still leads the list");
  assert.deepEqual(names(shown).slice(1), [...LEGACY].sort((a, b) => a.localeCompare(b)), "then the legacy clients by name");
  assert.deepEqual(names(filterClients(rows, { ...ALL, group: "churned" })), ["CDM Systems", "Georgia Truck Parking"]);
  assert.equal(filterClients(rows, { ...ALL, group: "active" }).length, 16, "every other group filter is what it was");
  assert.equal(filterClients(rows, { ...ALL, group: "paused" }).length, 0);
  assert.deepEqual(names(currentClients(rows)).length, 16);
});

test("a search on the default view does not surface a churned client; with the Churned filter on it does", () => {
  const rows = desk();
  assert.deepEqual(names(filterClients(rows, { ...ALL, search: "cdm" })), []);
  assert.deepEqual(names(filterClients(rows, { ...ALL, search: "truck parking" })), []);
  assert.deepEqual(names(filterClients(rows, { ...ALL, group: "churned", search: "cdm" })), ["CDM Systems"]);
  assert.deepEqual(names(filterClients(rows, { ...ALL, group: "churned", search: "TRUCK" })), ["Georgia Truck Parking"]);
  assert.deepEqual(names(filterClients(rows, { ...ALL, search: "pools" })), ["Whiten Pools, Inc."], "a current client is found as before");
  // The list only says that churned matches exist (and how many), so nobody wonders where a client went.
  assert.equal(churnedMatches(rows, { ...ALL, search: "cdm" }), 1);
  assert.equal(churnedMatches(rows, { ...ALL, search: "c" }), 2);
  assert.equal(churnedMatches(rows, { ...ALL, search: "pools" }), 0);
  assert.equal(churnedMatches(rows, ALL), 0, "nothing typed: nothing to say");
  assert.equal(churnedMatches(rows, { ...ALL, search: "   " }), 0);
  assert.equal(churnedMatches(rows, { ...ALL, group: "churned", search: "cdm" }), 0, "they are on the list already");
  assert.equal(churnedMatches(rows, { ...ALL, group: "active", search: "cdm" }), 0, "a chosen group is the whole answer");
  assert.equal(churnedMatches(rows, { ...ALL, search: "cdm", manager: "Dave" }), 0, "the other filters still apply to the hint");
  assert.equal(churnedMatches(rows, { ...ALL, search: "cdm", manager: "Josh" }), 1);
});

test("counts: churned clients are not on the desk, not in the legacy count, and are counted apart", () => {
  const rows = desk();
  assert.deepEqual(clientCounts(rows), { total: 16, desk: 1, legacy: 15, churned: 2 });
  assert.equal(clientCountLabel(rows), "16 on the desk · 15 legacy · 2 churned");
  // Nobody churned: the header reads exactly as it did.
  const before = rows.map((r) => ({ ...r, group: "active" as const }));
  assert.deepEqual(clientCounts(before), { total: 18, desk: 1, legacy: 17, churned: 0 });
  assert.equal(clientCountLabel(before), "18 on the desk · 17 legacy");
  assert.equal(clientCountLabel([squirrel]), "1 on the desk"); assert.equal(clientCountLabel([]), "0 on the desk");
  // A churned desk client is counted the same way; paused, at-risk and payment-issue clients are still on the desk.
  assert.equal(clientCountLabel([squirrel, row("Gone Co", { group: "churned" })]), "1 on the desk · 1 churned");
  assert.equal(clientCountLabel([row("A", { group: "paused" }), row("B", { group: "risk" }), row("C", { group: "issue" }), row("D", { group: "unknown" })]), "4 on the desk");
  assert.equal(clientCountLabel([legacy("Old Co", { group: "churned" })]), "0 on the desk · 1 churned", "everyone gone: still said plainly");
});

test("the monthly total leaves churned (and paused) clients out", () => {
  const rows = desk();
  assert.equal(monthlyTotal(rows), 297 + 497 + 497);
  const churnedPayer = rows.map((r) => (r.name === "Defoor Plumbing" ? { ...r, group: "churned" as const } : r));
  assert.equal(monthlyTotal(churnedPayer), 297 + 497, "a client that leaves takes its amount out of the total");
  assert.equal(monthlyTotal(rows.map((r) => (r.name === "Defoor Plumbing" ? { ...r, group: "paused" as const } : r))), 297 + 497);
  assert.equal(monthlyTotal(rows.map((r) => (r.name === "Defoor Plumbing" ? { ...r, group: "risk" as const } : r))), 297 + 497 + 497, "at risk still pays");
  assert.equal(monthlyTotal([row("X", { mrr: "" }), row("Y", { mrr: "abc" }), row("Z", { mrr: "50" })]), 50);
  assert.equal(monthlyTotal([]), 0);
});

test("the desk / legacy filter and the other filters work on what is left", () => {
  const rows = desk();
  assert.equal(filterClients(rows, { ...ALL, kind: "legacy" }).length, 15);
  assert.deepEqual(names(filterClients(rows, { ...ALL, kind: "desk" })), ["Squirrel Made Products"]);
  assert.equal(filterClients(rows, { ...ALL, kind: "legacy", group: "churned" }).length, 2);
  assert.equal(filterClients(rows, { ...ALL, kind: "desk", group: "churned" }).length, 0);
  assert.deepEqual(names(filterClients(rows, { ...ALL, only: "problems" })), ["Squirrel Made Products"]);
  assert.equal(filterClients(rows, { ...ALL, manager: "Josh" }).length, 16); assert.equal(filterClients(rows, { ...ALL, manager: "unassigned" }).length, 0);
  // The kind filter only exists while a CURRENT client is legacy. With the only legacy clients churned, a filter left on
  // "Legacy" must not empty the list (there would be no control on screen to undo it).
  const onlyChurnedLegacy = [squirrel, legacy("CDM Systems", { group: "churned" })];
  assert.equal(appliedKind("legacy", onlyChurnedLegacy), ""); assert.equal(appliedKind("legacy", rows), "legacy");
  assert.deepEqual(names(filterClients(onlyChurnedLegacy, { ...ALL, kind: "legacy" })), ["Squirrel Made Products"]);
  assert.deepEqual(names(filterClients(onlyChurnedLegacy, { ...ALL, kind: "legacy", group: "churned" })), ["CDM Systems"]);
});

test("moving a client back out of Churned puts it back on the list and in the counts", () => {
  const rows = desk().map((r) => (r.name === "CDM Systems" ? { ...r, group: "active" as const, groupTitle: "Active" } : r));
  assert.ok(names(filterClients(rows, ALL)).includes("CDM Systems"));
  assert.equal(clientCountLabel(rows), "17 on the desk · 16 legacy · 1 churned");
  assert.deepEqual(names(filterClients(rows, { ...ALL, group: "churned" })), ["Georgia Truck Parking"]);
});

test("with nobody churned the list is exactly what the tab computed before", () => {
  // The filter line as it stood in src/app/leads/clients.tsx before this change.
  const old = (rows: ClientRow[], f: ClientFilters) => rows.filter((r) =>
    isKind(r, effectiveKind(f.kind, rows)) &&
    (!f.manager || (f.manager === "unassigned" ? r.accountManagerIds.length === 0 : r.accountManagerIds.includes(f.manager))) &&
    (!f.group || r.group === f.group) &&
    (f.only !== "problems" || r.flags.length > 0) && (f.only !== "payment" || r.flags.includes("payment")) && (f.only !== "gbp" || r.flags.includes("gbp") || r.flags.includes("gbp-recheck")) &&
    `${r.name} ${r.contact} ${r.email} ${r.packages}`.toLowerCase().includes(f.search.toLowerCase()),
  ).sort(clientOrder);
  const rows: ClientRow[] = [
    squirrel, legacy("Whiten Pools, Inc."), legacy("Chapelhill Church", { group: "paused" }), legacy("Late Payer", { group: "issue", flags: ["payment"] }),
    row("Risky Co", { group: "risk", accountManager: "Dave", accountManagerIds: ["Dave"], flags: ["gbp-recheck"] }), row("Nobody's Co", { accountManager: "", accountManagerIds: [], flags: ["term"] }), row("Odd Group", { group: "unknown" }),
  ];
  let checked = 0;
  for (const kind of ["", "desk", "legacy"] as const) for (const manager of ["", "Josh", "Dave", "unassigned"]) for (const group of ["", "issue", "active", "risk", "paused"])
    for (const only of ["", "problems", "payment", "gbp"] as const) for (const search of ["", "co", "WHITEN", "squirrel@", "zzz", " "]) {
      const f = { kind, manager, group, only, search };
      assert.deepEqual(filterClients(rows, f), old(rows, f), JSON.stringify(f)); checked++;
    }
  assert.equal(checked, 3 * 4 * 5 * 4 * 6);
  assert.equal(clientCountLabel(rows), "7 on the desk · 3 legacy");
});
