import assert from "node:assert/strict";
import { test } from "node:test";
import type { CallLead } from "@/app/leads/types";
import { CALL_OUTCOMES, mondayOutcome } from "./outcomes";
import { CALL_OWNERS, compareLeads, contactStage, matchesOwner } from "./roster";

function lead(id: string, changes: Partial<CallLead> & { ownerIds?: string[] } = {}): CallLead & { ownerIds?: string[] } {
  return {
    id, name: `Lead ${id}`, contact: "", email: "", phone: "", website: "", city: "",
    owner: "", ownerId: "", outreach: "", interest: "", notes: "", lastContact: "",
    nextFollowup: "", quotedMonthly: "", interestedIn: "", auditScore: "", auditReport: "",
    group: "", updatedAt: "2026-09-22T12:00:00Z", mondayUrl: "", ...changes,
  };
}

test("new leads precede active contacts, with closed outcomes last", () => {
  const leads = [
    lead("closed", { name: "A closed lead", outreach: "Not Interested" }),
    lead("active", { name: "A contacted lead", outreach: "Contacted" }),
    lead("new", { name: "Z new lead", outreach: "Not Contacted" }),
    lead("blank", { name: "B new lead" }),
  ];
  assert.deepEqual(leads.sort(compareLeads).map(({ id }) => id), ["blank", "new", "active", "closed"]);
});

test("contact date keeps a lead out of the first-call queue even if its status is blank or reset", () => {
  for (const outreach of ["", "Not Contacted", " not contacted "]) {
    assert.equal(contactStage(lead("called", { outreach, lastContact: "2026-09-21" })), "active");
  }
  assert.equal(contactStage(lead("new", { outreach: " Not Contacted ", lastContact: " " })), "new");
});

test("each saved call outcome removes first-call eligibility before its date arrives", () => {
  for (const outcome of CALL_OUTCOMES) {
    assert.notEqual(contactStage(lead("saved", { outreach: mondayOutcome(outcome) })), "new");
  }
  for (const outreach of ["Not interested", "Not Interested", "Bad contact number", "Won"]) {
    assert.equal(contactStage(lead("closed", { outreach })), "closed");
  }
  assert.equal(contactStage(lead("unknown", { outreach: "Awaiting reply" })), "active");
});

test("oldest contact goes first within a stage, with unknown dates before known dates", () => {
  const active = (id: string, lastContact: string) => lead(id, { outreach: "Booked followup", lastContact });
  const leads = [active("newest", "2026-09-22"), active("older", "2026-09-18"), active("missing", "")];
  assert.deepEqual(leads.sort(compareLeads).map(({ id }) => id), ["missing", "older", "newest"]);
  assert.ok(compareLeads(active("invalid", "not a date"), active("known", "2026-09-18")) < 0);
});

test("record updates and reassignment do not reorder the calling queue", () => {
  const leads = [
    lead("1", { name: "Zebra", outreach: "Contacted", lastContact: "2026-09-20" }),
    lead("2", { name: "Alpha" }),
    lead("3", { name: "Beta", outreach: "Contacted", lastContact: "2026-09-19" }),
  ];
  const order = [...leads].sort(compareLeads).map(({ id }) => id);
  const updated = leads.map((item, index) => ({ ...item, updatedAt: `2030-01-0${index + 1}T00:00:00Z`, ownerId: CALL_OWNERS[index].id }));
  assert.deepEqual(updated.sort(compareLeads).map(({ id }) => id), order);
});

test("equal dates use business name then ID for stable ordering independent of input order", () => {
  const leads = [lead("3", { name: "Beta" }), lead("2", { name: "Alpha" }), lead("1", { name: "Alpha" })];
  assert.deepEqual([...leads].sort(compareLeads).map(({ id }) => id), ["1", "2", "3"]);
  assert.deepEqual(leads.reverse().sort(compareLeads).map(({ id }) => id), ["1", "2", "3"]);
  assert.equal(compareLeads(lead("same", { outreach: "Contacted" }), lead("same", { outreach: "Contacted" })), 0);
});

test("owner choices include all three callers and match IDs instead of display names", () => {
  assert.deepEqual(CALL_OWNERS.map(({ name }) => name), ["Dave", "Josh", "Keaton"]);
  for (const owner of CALL_OWNERS) {
    const assigned = lead(owner.id, { owner: "Renamed Monday display name", ownerId: owner.id });
    assert.equal(matchesOwner(assigned, owner.id), true);
    assert.equal(matchesOwner(assigned, owner.name), false);
    assert.equal(matchesOwner(assigned, "unassigned"), false);
    assert.equal(matchesOwner(assigned, ""), true);
  }
  assert.equal(matchesOwner(lead("empty"), "unassigned"), true);
  assert.equal(matchesOwner(lead("empty"), "all"), true);
});

test("multi-owner records appear for each assigned caller and explicit empty assignments stay unassigned", () => {
  const shared = lead("shared", { ownerId: CALL_OWNERS[0].id, ownerIds: [CALL_OWNERS[0].id, CALL_OWNERS[2].id] });
  assert.equal(matchesOwner(shared, CALL_OWNERS[0].id), true);
  assert.equal(matchesOwner(shared, CALL_OWNERS[2].id), true);
  assert.equal(matchesOwner(shared, CALL_OWNERS[1].id), false);
  assert.equal(matchesOwner(shared, "unassigned"), false);
  const cleared = lead("cleared", { ownerId: CALL_OWNERS[0].id, ownerIds: [] });
  assert.equal(matchesOwner(cleared, "unassigned"), true);
  assert.equal(matchesOwner(cleared, CALL_OWNERS[0].id), false);
});
