import assert from "node:assert/strict";
import { test } from "node:test";
import type { CallLead } from "@/app/leads/types";
import { CALL_OUTCOMES, mondayOutcome, outreachStatus } from "./outcomes";
import { CALL_OWNERS, compareLeads, contactStage, filterRoster, inRosterView, isOffCallList, matchesOwner, mergeRoster, NO_CALL_TAGS, noCallTagsOf, OFF_LIST_LABELS, OFF_LIST_VIEW, offListReasons } from "./roster";

function lead(id: string, changes: Partial<CallLead> & { ownerIds?: string[] } = {}): CallLead & { ownerIds?: string[] } {
  return {
    id, name: `Lead ${id}`, contact: "", email: "", phone: "", website: "", city: "",
    owner: "", ownerId: "", ownerName: "", outreach: "", interest: "", notes: "", lastContact: "",
    nextFollowup: "", nextFollowupTime: "", quotedMonthly: "", interestedIn: "", auditScore: "", auditReport: "",
    group: "", leadSource: "", updatedAt: "2026-09-22T12:00:00Z", recordUrl: "", ...changes,
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
    assert.notEqual(contactStage(lead("saved", { outreach: outreachStatus(outcome) })), "new");
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

// ── Off the call list (Dave, Oct 1 2026): Not Interested, or a do-not-contact / fake-lead tag in GoHighLevel ──
const view = (leads: CallLead[], v: string, search = "") => filterRoster(leads, { view: v, owner: "", status: "", source: "", search }).map(({ id }) => id);

test("a lead is off the call list when it is Not Interested or carries a no-call tag, and for no other reason", () => {
  assert.deepEqual(offListReasons(lead("ni", { outreach: "Not Interested" })), ["not-interested"]);
  assert.deepEqual(offListReasons(lead("ni2", { outreach: " not interested " })), ["not-interested"]);
  assert.deepEqual(offListReasons(lead("dnc", { outreach: "Replied", noCallTags: ["do-not-contact"] })), ["do-not-contact"]);
  assert.deepEqual(offListReasons(lead("fake", { noCallTags: ["fake-lead"] })), ["fake-lead"]);
  assert.deepEqual(offListReasons(lead("all", { outreach: "Not Interested", noCallTags: ["fake-lead", "do-not-contact"] })), ["not-interested", "do-not-contact", "fake-lead"]);
  for (const outreach of ["", "Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Bad contact number", "Won", "In progress"]) {
    assert.equal(isOffCallList(lead("on", { outreach })), false, `${outreach || "a blank status"} stays on the call list`);
  }
  // Tags nobody has explained (Dave's concept-* and AI tags) are not acted on; neither is a Monday lead, which has no tags at all.
  assert.equal(isOffCallList(lead("other", { noCallTags: ["concept-not-interested", "spoke-to-ai", "ai-booked", "giveaway-entrant"] })), false);
  assert.equal(isOffCallList(lead("monday")), false);
  for (const reason of ["not-interested", ...NO_CALL_TAGS] as const) assert.ok(OFF_LIST_LABELS[reason], `${reason} has a badge label`);
  assert.deepEqual([OFF_LIST_LABELS["not-interested"], OFF_LIST_LABELS["do-not-contact"], OFF_LIST_LABELS["fake-lead"]], ["Not interested", "Do not contact", "Fake lead"]);
});

test("noCallTagsOf picks exactly the two no-call tags out of a contact's tags, whatever their case or order", () => {
  assert.deepEqual(noCallTagsOf(["giveaway-entrant", "Fake-Lead ", "DO-NOT-CONTACT", "concept-not-interested"]), ["do-not-contact", "fake-lead"]);
  assert.deepEqual(noCallTagsOf(["do-not-contact-later", "not-a-fake-lead", "do not contact", "donotcontact"]), []);
  for (const empty of [undefined, null, [], "do-not-contact" as unknown as string[]]) assert.deepEqual(noCallTagsOf(empty), []);
});

test("Show leads: an off-list lead is in no view but 'Not interested / do not call', which lists exactly those", () => {
  const leads = [
    lead("new"), lead("active", { outreach: "Replied", lastContact: "2026-09-30" }), lead("won", { outreach: "Won" }), lead("bad", { outreach: "Bad contact number" }),
    lead("ni", { outreach: "Not Interested", lastContact: "2026-10-01" }),
    lead("dnc", { outreach: "Not Contacted", noCallTags: ["do-not-contact"] }),
    lead("fake", { outreach: "Replied", lastContact: "2026-09-29", noCallTags: ["fake-lead"] }),
  ];
  assert.deepEqual(view(leads, "all"), ["new", "active", "bad", "won"]);
  assert.deepEqual(view(leads, "new"), ["new"]); // a tagged Not Contacted lead is not offered as a first call
  assert.deepEqual(view(leads, "active"), ["active"]);
  assert.deepEqual(view(leads, "closed"), ["bad", "won"]); // Won and Bad contact number are where they were; Not Interested moved out
  assert.deepEqual(view(leads, OFF_LIST_VIEW).sort(), ["dnc", "fake", "ni"]);
  assert.equal(view(leads, "all").length + view(leads, OFF_LIST_VIEW).length, leads.length);
  for (const l of leads) assert.notEqual(inRosterView(l, "all"), inRosterView(l, OFF_LIST_VIEW), `${l.id} is on exactly one of the two lists`);
  assert.deepEqual(view([lead("only")], OFF_LIST_VIEW), []);
});

test("search finds an off-list lead only when the off-list view is on", () => {
  const leads = [
    lead("1", { name: "Vintage Vault Antiques", outreach: "Not Interested" }), lead("2", { name: "Vintage Vinyl" }),
    lead("3", { name: "Faux Co", contact: "Vince Vintage", email: "vince@example.com", noCallTags: ["fake-lead"] }),
  ];
  assert.deepEqual(view(leads, "all", "vintage"), ["2"]);
  assert.deepEqual(view(leads, "all", "Vintage Vault"), []);
  assert.deepEqual(view(leads, "closed", "vault"), []);
  assert.deepEqual(view(leads, "all", "vince@example.com"), []);
  assert.deepEqual(view(leads, OFF_LIST_VIEW, "vintage").sort(), ["1", "3"]);
  assert.deepEqual(view(leads, OFF_LIST_VIEW, "VINTAGE VAULT"), ["1"]);
});

test("changing the status back puts a lead back on the list; a tag keeps it off until the tag is gone", () => {
  const marked = lead("x", { outreach: "Not Interested", lastContact: "2026-10-01" });
  assert.equal(inRosterView(marked, "all"), false);
  const undone = { ...marked, outreach: "Booked followup" };
  assert.equal(inRosterView(undone, "all"), true); assert.equal(inRosterView(undone, "active"), true); assert.equal(inRosterView(undone, OFF_LIST_VIEW), false);
  const tagged = { ...undone, noCallTags: ["do-not-contact"] };
  assert.equal(inRosterView(tagged, "all"), false); assert.deepEqual(offListReasons(tagged), ["do-not-contact"]);
  assert.equal(inRosterView({ ...tagged, noCallTags: [] }, "all"), true);
});

test("owner, status and lead-source filters still apply inside every view", () => {
  const dave = CALL_OWNERS[0].id, josh = CALL_OWNERS[1].id;
  const leads = [
    lead("a", { ownerId: dave, outreach: "Replied", lastContact: "2026-09-30", leadSource: "Facebook" }),
    lead("b", { ownerId: josh, outreach: "Replied", lastContact: "2026-09-29", leadSource: "Referral" }),
    lead("c", { ownerId: dave, outreach: "Not Interested", leadSource: "Facebook" }),
    lead("d", { ownerId: josh, outreach: "Call Booked", noCallTags: ["do-not-contact"] }),
  ];
  const pick = (f: Partial<Parameters<typeof filterRoster>[1]>) => filterRoster(leads, { view: "all", owner: "", status: "", source: "", search: "", ...f }).map(({ id }) => id);
  assert.deepEqual(pick({ owner: dave }), ["a"]); assert.deepEqual(pick({ status: "Replied" }), ["b", "a"]); assert.deepEqual(pick({ source: "Referral" }), ["b"]);
  assert.deepEqual(pick({ status: "Not Interested" }), []); // only the off-list view has them
  assert.deepEqual(pick({ view: OFF_LIST_VIEW, owner: dave }), ["c"]); assert.deepEqual(pick({ view: OFF_LIST_VIEW, status: "Call Booked" }), ["d"]);
  assert.deepEqual(pick({ view: OFF_LIST_VIEW, source: "none" }), ["d"]); assert.deepEqual(pick({ view: OFF_LIST_VIEW, owner: "unassigned" }), []);
});

test("a roster reload keeps the newer copy of a lead, so a lagging search cannot put a just-marked lead back on the list", () => {
  const stale = lead("x", { outreach: "Not Contacted", updatedAt: "2026-10-01T14:00:00.000Z" });
  const saved = lead("x", { outreach: "Not Interested", updatedAt: "2026-10-01T14:05:00.000Z" });
  const other = lead("y", { updatedAt: "2026-10-01T10:00:00.000Z" });
  assert.deepEqual(mergeRoster([saved, other], [stale, other]).map((l) => l.outreach), ["Not Interested", ""]); // search still lagging: keep what the tab knows
  assert.equal(view(mergeRoster([saved, other], [stale, other]), "all").includes("x"), false);
  assert.equal(mergeRoster([stale], [saved])[0].outreach, "Not Interested"); // search caught up: take the new row
  const later = lead("x", { outreach: "Booked followup", updatedAt: "2026-10-01T15:00:00.000Z" });
  assert.equal(mergeRoster([saved], [later])[0].outreach, "Booked followup"); // someone changed it back since: the newer row wins
  assert.equal(mergeRoster([saved], [{ ...stale, updatedAt: saved.updatedAt }])[0].outreach, "Not Contacted"); // same version: the server's row
  assert.deepEqual(mergeRoster([saved, other], [other]).map(({ id }) => id), ["y"]); // gone from the roster: dropped
  assert.equal(mergeRoster([lead("x", { outreach: "Won", updatedAt: "not a date" })], [stale])[0].outreach, "Not Contacted");
  assert.deepEqual(mergeRoster([], [stale, other]).map(({ id }) => id), ["x", "y"]);
  // "Load more" appends a page and keeps the order, with the same rule for a lead both pages carry.
  assert.deepEqual(mergeRoster([saved, other], [stale, lead("z")], true).map((l) => `${l.id}:${l.outreach}`), ["x:Not Interested", "y:", "z:"]);
});

// ── "In progress" (Dave, Oct 2 2026): the rep talked to the lead and is still working it ──
test("In progress is a working lead: active whatever its dates, on the call list, never a first call and never closed", () => {
  for (const outreach of ["In progress", "In Progress", " in progress "]) for (const lastContact of ["2026-10-02", ""]) {
    const l = lead("wip", { outreach, lastContact });
    assert.equal(contactStage(l), "active", `${outreach} / ${lastContact || "no contact date"}`);
    assert.equal(isOffCallList(l), false); assert.deepEqual(offListReasons(l), []);
    assert.deepEqual(["all", "new", "active", "closed", OFF_LIST_VIEW].map((v) => inRosterView(l, v)), [true, false, true, false, false]);
  }
  // On the Monday board the same outcome is recorded as Contacted, which is a working status too.
  assert.equal(contactStage(lead("monday", { outreach: mondayOutcome("In progress"), lastContact: "2026-10-02" })), "active");
});

test("In progress in the roster: under Contacted / working on, pickable in the status filter, ordered by oldest contact like any working lead", () => {
  const leads = [
    lead("fresh", { name: "Never Called" }),
    lead("wip-today", { name: "Talked Today", outreach: "In progress", lastContact: "2026-10-02", nextFollowup: "2026-10-09", nextFollowupTime: "09:30" }),
    lead("wip-old", { name: "Talked Last Week", outreach: "In progress", lastContact: "2026-09-25" }),
    lead("booked", { name: "Booked", outreach: "Booked followup", lastContact: "2026-09-30" }),
    lead("won", { name: "Won Co", outreach: "Won", lastContact: "2026-10-01" }),
    lead("ni", { name: "Said No", outreach: "Not Interested", lastContact: "2026-10-01" }),
  ];
  assert.deepEqual(view(leads, "all"), ["fresh", "wip-old", "booked", "wip-today", "won"]); // new first, then working leads oldest contact first, closed last
  assert.deepEqual(view(leads, "active"), ["wip-old", "booked", "wip-today"]);
  assert.deepEqual(view(leads, "new"), ["fresh"]); assert.deepEqual(view(leads, "closed"), ["won"]); assert.deepEqual(view(leads, OFF_LIST_VIEW), ["ni"]);
  assert.deepEqual(filterRoster(leads, { view: "all", owner: "", status: "In progress", source: "", search: "" }).map(({ id }) => id), ["wip-old", "wip-today"]);
  assert.deepEqual(filterRoster(leads, { view: OFF_LIST_VIEW, owner: "", status: "In progress", source: "", search: "" }), []);
  // The desk builds its status filter from the statuses of the leads a view can show: In progress is offered on the normal list once a lead has it.
  assert.ok([...new Set(leads.filter((l) => !isOffCallList(l)).map((l) => l.outreach).filter(Boolean))].includes("In progress"));
});

test("saving a Not interested lead as In progress puts it back on the call list; saving In progress as Not interested takes it off", () => {
  const off = lead("x", { outreach: "Not Interested", lastContact: "2026-10-01" });
  const back = { ...off, outreach: "In progress", lastContact: "2026-10-02" };
  assert.equal(inRosterView(off, "all"), false); assert.equal(inRosterView(back, "all"), true); assert.equal(inRosterView(back, "active"), true);
  assert.equal(inRosterView({ ...back, outreach: "Not Interested" }, "all"), false);
  assert.equal(inRosterView({ ...back, noCallTags: ["do-not-contact"] }, "all"), false); // a no-call tag still wins over any status
});
