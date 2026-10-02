import assert from "node:assert/strict";
import { test } from "node:test";
import { billedOutside, clientOrder, deskCountLabel, effectiveKind, gbpTracked, isKind, isLegacyRow, kindCounts, stripeFollowed, type ClientKind } from "./legacy";
import { flagsFor } from "@/lib/clients/board";
import type { ClientRow } from "@/lib/clients/types";

// Legacy clients (Oct 2 2026): the marker on a row, the Clients tab's kind filter and header count, and the flag rules.
// The desk as it will look once the old Active Clients rows are in: one client run on the desk and the agency's long-standing ones.
const TODAY = "2026-10-02";
const base: Omit<ClientRow, "flags"> = {
  id: "c1", name: "Client", url: "", updatedAt: "2026-10-02T12:00:00.000Z", group: "active", groupTitle: "Active", health: "Too New",
  packages: "", mrr: "0", customMonthly: "", accountManager: "Josh", accountManagerIds: ["Josh"],
  contact: "", email: "", phone: "", website: "", gbpUrl: "", ghlContact: "", driveFolder: "", notes: "",
  payStatus: "No Billing Set Up", payMethod: "QuickBooks invoice", billingDay: "", nextBill: "", lastPayment: "", clientSince: "", termEnds: "", lastReport: "",
  gbpAccess: "", gbpChecked: "", stripeCustomer: "", onboardingItem: "", teamDesk: true, searchAtlasListing: "", gbpLive: null,
};
const legacy = (over: Partial<Omit<ClientRow, "flags">> = {}) => ({ ...base, legacy: true, ...over });
const desk = (over: Partial<Omit<ClientRow, "flags">> = {}) => ({ ...base, legacy: false, payMethod: "Stripe via GHL", gbpAccess: "Not Requested", ...over });
const live = (verified: boolean, ok = true) => ({ ok, verified } as unknown as NonNullable<ClientRow["gbpLive"]>);

test("the marker: only an explicit true is legacy — a Monday row and a desk client (no marker, or false) are not", () => {
  assert.equal(isLegacyRow({ legacy: true }), true);
  assert.equal(isLegacyRow({ legacy: false }), false);
  assert.equal(isLegacyRow({}), false, "every Monday row, and every row from before the marker existed");
});

test("the Clients tab: header count, and the All / Desk / Legacy filter", () => {
  const rows = [desk({ id: "squirrel" }), ...Array.from({ length: 17 }, (_, i) => legacy({ id: `old${i}` }))];
  assert.deepEqual(kindCounts(rows), { total: 18, desk: 1, legacy: 17 });
  assert.equal(deskCountLabel(rows), "18 on the desk · 17 legacy");
  assert.equal(deskCountLabel([desk()]), "1 on the desk", "with no legacy client the header reads exactly as it did");
  assert.equal(deskCountLabel([]), "0 on the desk");
  const pick = (kind: ClientKind) => rows.filter((r) => isKind(r, kind)).length;
  assert.deepEqual([pick(""), pick("desk"), pick("legacy")], [18, 1, 17]);
  assert.equal(isKind({}, "desk"), true); assert.equal(isKind({}, "legacy"), false);
  // A filter left on "Legacy" after the last legacy client was un-marked must not leave an empty list with no way back.
  assert.equal(effectiveKind("legacy", rows), "legacy"); assert.equal(effectiveKind("legacy", [desk()]), ""); assert.equal(effectiveKind("desk", [desk()]), ""); assert.equal(effectiveKind("", rows), "");
});

test("flags for a desk client are what they always were", () => {
  // The one desk client on production on Oct 2 2026 (Squirrel Made Products): nothing about these rules moved.
  assert.deepEqual(flagsFor(desk(), TODAY), ["gbp", "report", "no-stripe"]);
  assert.deepEqual(flagsFor({ ...desk(), legacy: undefined }, TODAY), ["gbp", "report", "no-stripe"], "no marker at all (a Monday row) is the same");
  assert.deepEqual(flagsFor(desk({ gbpAccess: "" }), TODAY), ["gbp", "report", "no-stripe"], "a blank GBP state is a problem for a desk client");
  assert.deepEqual(flagsFor(desk({ gbpAccess: "Verified", stripeCustomer: "cus_1", lastReport: "2026-09-20" }), TODAY), ["gbp-recheck"], "verified but never checked");
  assert.deepEqual(flagsFor(desk({ gbpAccess: "Verified", gbpChecked: "2026-06-01", stripeCustomer: "cus_1", lastReport: "2026-08-01" }), TODAY), ["gbp-recheck", "report"]);
  assert.deepEqual(flagsFor(desk({ gbpAccess: "Verified", gbpChecked: "2026-09-01", stripeCustomer: "cus_1", lastReport: "2026-09-20", termEnds: "2026-10-20" }), TODAY), ["term"]);
  assert.deepEqual(flagsFor(desk({ gbpAccess: "No GBP Exists", stripeCustomer: "cus_1", lastReport: "2026-09-20", payStatus: "Card Failed" }), TODAY), ["payment"]);
  assert.deepEqual(flagsFor(desk({ group: "paused", gbpAccess: "No GBP Exists", stripeCustomer: "cus_1" }), TODAY), [], "no report nag while paused");
});

test("a legacy client is quiet: a blank means not tracked here, not a problem", () => {
  // Exactly what the 17 old Active Clients rows carry: Active, QuickBooks invoice, no GBP state, no report date, no term.
  assert.deepEqual(flagsFor(legacy(), TODAY), []);
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "Not Requested" }), TODAY), []);
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "Verified" }), TODAY), [], "verified with no check stamped: no recheck is asked for");
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "No GBP Exists" }), TODAY), []);
  assert.deepEqual(flagsFor(legacy({ payMethod: "" }), TODAY), [], "no payment method on file is not a Stripe problem");
  assert.deepEqual(flagsFor(legacy({ payMethod: "Check" }), TODAY), []);
});

test("a legacy client is flagged for what its record does track", () => {
  // GBP: tracked once the listing is linked, or someone set Requested / Lost / recheck, or a check was stamped.
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "Requested" }), TODAY), ["gbp"]);
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "Lost / recheck" }), TODAY), ["gbp"]);
  assert.deepEqual(flagsFor(legacy({ searchAtlasListing: "94742", gbpLive: live(false) }), TODAY), ["gbp"], "a linked listing that Search Atlas reads as unverified");
  assert.deepEqual(flagsFor(legacy({ searchAtlasListing: "97647", gbpLive: live(true) }), TODAY), []);
  assert.deepEqual(flagsFor(legacy({ searchAtlasListing: "97647", gbpLive: live(false, false), gbpAccess: "" }), TODAY), [], "a failed Search Atlas read falls back to the stored state, which is blank");
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "Verified", gbpChecked: "2026-09-01" }), TODAY), []);
  assert.deepEqual(flagsFor(legacy({ gbpAccess: "Verified", gbpChecked: "2026-06-01" }), TODAY), ["gbp-recheck"], "a check that was stamped and is now over 90 days old");
  // Reports: only once one has been logged here.
  assert.deepEqual(flagsFor(legacy({ lastReport: "2026-09-20" }), TODAY), []);
  assert.deepEqual(flagsFor(legacy({ lastReport: "2026-08-01" }), TODAY), ["report"]);
  assert.deepEqual(flagsFor(legacy({ lastReport: "2026-08-01", group: "paused" }), TODAY), []);
  // Payment, term and a Stripe method with no customer are the same for everyone: each is something a person put on the record.
  assert.deepEqual(flagsFor(legacy({ payStatus: "Overdue" }), TODAY), ["payment"]);
  assert.deepEqual(flagsFor(legacy({ group: "issue" }), TODAY), ["payment"]);
  assert.deepEqual(flagsFor(legacy({ termEnds: "2026-10-20" }), TODAY), ["term"]);
  assert.deepEqual(flagsFor(legacy({ payMethod: "Stripe via GHL" }), TODAY), ["no-stripe"]);
  assert.deepEqual(flagsFor(legacy({ payMethod: "Stripe via GHL", stripeCustomer: "cus_1" }), TODAY), []);
});

test("un-marking a legacy client puts every desk rule back", () => {
  const row = legacy();
  assert.deepEqual(flagsFor(row, TODAY), []);
  assert.deepEqual(flagsFor({ ...row, legacy: false }, TODAY), ["gbp", "report"], "QuickBooks invoice: still no Stripe flag, but GBP and reports are now expected");
});

test("Stripe is only followed for a legacy client once Stripe is part of its record; GBP shows as tracked the same way", () => {
  assert.equal(stripeFollowed(desk()), true); assert.equal(stripeFollowed({ payMethod: "QuickBooks invoice", stripeCustomer: "" }), true, "a desk client, whatever its method");
  assert.equal(stripeFollowed(legacy()), false, "a legacy client billed by QuickBooks invoice is never looked up in Stripe by email");
  assert.equal(stripeFollowed(legacy({ payMethod: "" })), false);
  assert.equal(stripeFollowed(legacy({ stripeCustomer: "cus_1" })), true); assert.equal(stripeFollowed(legacy({ payMethod: "Stripe via GHL" })), true);
  // The payment column: a legacy client billed outside GoHighLevel shows HOW it is billed while nobody has set a status here.
  assert.equal(billedOutside(legacy()), true); assert.equal(billedOutside(legacy({ payStatus: "" })), true); assert.equal(billedOutside(legacy({ payMethod: "" })), true);
  assert.equal(billedOutside(legacy({ payStatus: "Paid / Current" })), false); assert.equal(billedOutside(legacy({ payStatus: "Overdue" })), false, "a status someone set is shown as it is");
  assert.equal(billedOutside(legacy({ payMethod: "Stripe via GHL" })), false); assert.equal(billedOutside(legacy({ stripeCustomer: "cus_1" })), false);
  assert.equal(billedOutside(desk()), false); assert.equal(billedOutside(desk({ payMethod: "QuickBooks invoice" })), false, "never for a desk client");
  assert.equal(gbpTracked(desk({ gbpAccess: "" })), true);
  assert.equal(gbpTracked(legacy()), false); assert.equal(gbpTracked(legacy({ gbpAccess: "Not Requested" })), false);
  for (const over of [{ gbpAccess: "Requested" }, { gbpAccess: "Verified" }, { gbpAccess: "No GBP Exists" }, { gbpChecked: "2026-09-01" }, { searchAtlasListing: "94742" }, { gbpLive: live(false, false) }]) assert.equal(gbpTracked(legacy(over)), true, JSON.stringify(over));
});

test("the list order: problems first as always, then desk clients ahead of legacy ones", () => {
  const r = (name: string, flags: ClientRow["flags"], isLegacy?: boolean) => ({ name, flags, legacy: isLegacy });
  const names = (rows: ReturnType<typeof r>[]) => [...rows].sort(clientOrder).map((x) => x.name);
  // No legacy client: exactly the order the tab always had (payment issue, most flags, name).
  const old = (a: ReturnType<typeof r>, b: ReturnType<typeof r>) => Number(b.flags.includes("payment")) - Number(a.flags.includes("payment")) || b.flags.length - a.flags.length || a.name.localeCompare(b.name);
  const deskOnly = [r("Zeta", []), r("Alpha", ["gbp"]), r("Mid", ["payment"]), r("Beta", ["gbp", "report"]), r("Aardvark", []), r("Late", ["report", "payment", "gbp"])];
  assert.deepEqual(names(deskOnly), [...deskOnly].sort(old).map((x) => x.name));
  assert.deepEqual(names(deskOnly), ["Late", "Mid", "Beta", "Alpha", "Aardvark", "Zeta"]);
  // With legacy clients: nothing flagged → the desk's clients, then the legacy ones, each by name.
  assert.deepEqual(names([r("Whiten Pools", [], true), r("Squirrel Made", [], false), r("Chapelhill", [], true), r("Arctic Law", [])]), ["Arctic Law", "Squirrel Made", "Chapelhill", "Whiten Pools"]);
  // A problem still comes first, whoever has it.
  assert.deepEqual(names([r("Squirrel Made", ["gbp", "report", "no-stripe"]), r("Whiten Pools", ["payment"], true), r("Chapelhill", [], true), r("Sconyers", ["gbp"], true), r("Choice", ["gbp"])]), ["Whiten Pools", "Squirrel Made", "Choice", "Sconyers", "Chapelhill"]);
});
