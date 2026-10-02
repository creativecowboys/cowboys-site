// TEST ONLY. Shared set-up for the desk tests: an in-memory GoHighLevel with Josh's LSE fields and tags on it,
// an in-memory Blob, a lead to hand off, and the invariant every GoHighLevel-desk test ends on — nothing but
// desk-owned fields and tags was written, and Monday was never called. Never imported by application code.
import assert from "node:assert/strict";
import { ghlRepIds } from "@/lib/ghl/reps";
import { SALES_FIELDS } from "@/lib/ghl/fields";
import { WON_TAG } from "@/lib/calls/ghl";
import type { GhlContact } from "@/lib/ghl/client";
import type { HandoffForm } from "@/lib/onboarding/types";
import { DESK_TAG_LIST, isDeskFieldName } from "../fields";
import type { Actor } from "../team";
import { blobReset } from "./blob-stub";
import { FakeGhl } from "./fake-ghl";

export const LEAD = "LeadBourbon0000000A1";
export const ORIGIN = "https://www.creativecowboys.co";
export const reps = ghlRepIds();
export const DAVE: Actor = { name: "Dave", email: "dave@creativecowboys.co", ghlUserId: reps.Dave };
export const MADISON: Actor = { name: "Madison", email: "madison@creativecowboys.co", ghlUserId: "" };

const KEEP = ["DESK_BACKEND", "BLOB_READ_WRITE_TOKEN", "STRIPE_SECRET_KEY", "SEARCH_ATLAS_API_KEY", "DESK_PAYMENT_ALERTS", "GHL_REP_IDS", "DESK_EXTRA_TEAM", "ONBOARDING_EXTRA_OWNERS", "MONDAY_API_TOKEN", "GHL_API_TOKEN", "GHL_LOCATION_ID"] as const;
let saved: Record<string, string | undefined> = {};

/** A fresh world: fake GoHighLevel installed over fetch (LSE fields + every sales and desk field), empty Blob, no Monday token. */
export function setUp(): FakeGhl {
  saved = Object.fromEntries(KEEP.map((k) => [k, process.env[k]]));
  for (const k of KEEP) delete process.env[k];
  process.env.BLOB_READ_WRITE_TOKEN = "nonfunctional-test-blob-token";
  blobReset();
  return new FakeGhl().install().addLseFields().addAllFields();
}
export function tearDown(ghl: FakeGhl): void {
  ghl.restore();
  for (const k of KEEP) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
}

/** A sales lead the way the Sales tab leaves it: giveaway entrant, owned by Dave, a call booked — and carrying an LSE value the desk must never touch. */
export function addLead(ghl: FakeGhl, over: Partial<GhlContact> & { fields?: Record<string, unknown> } = {}): GhlContact {
  const { fields, ...rest } = over;
  return ghl.addContact({
    id: LEAD, firstName: "Freddy", lastName: "Sumbay", companyName: "Bourbon Leather Company", email: "freddy@bourbon.example", phone: "+13865895606", website: "https://bourbonleather.com", city: "Parrish", state: "FL",
    tags: ["giveaway-entrant", "sales-lead", "lse:client"], assignedTo: reps.Dave,
    fields: { "Lead Source": "The Big Giveaway", "Outreach Status": "Call Booked", "LSE Health": "green", "LSE Term End": "2027-09-28", ...fields }, ...rest,
  });
}
export function handoffForm(ghl: FakeGhl, over: Partial<HandoffForm> = {}): HandoffForm {
  const leadId = over.leadId ?? LEAD;
  return {
    handoffId: "6f1c2a4e-3b7d-4c8e-9f01-23456789abcd", leadId, expectedUpdatedAt: leadId && ghl.contacts.has(leadId) ? String(ghl.get(leadId).dateUpdated) : "",
    business: "Bourbon Leather Company", contact: "Freddy Sumbay", email: "freddy@bourbon.example", phone: "(386) 589-5606", website: "bourbonleather.com", city: "Parrish, FL",
    businessType: "Ecommerce", salesOwner: "Dave", packages: ["Local Growth — First Year $297"], monthlyAgreed: "297", setupAgreed: "497",
    scope: "Local SEO and a new site", exclusions: "", goals: "New site", context: "", startDate: "2026-10-15", agreement: "Pending", payment: "Pending", nextAction: "", nextOwner: "Madison", nextDue: "2026-10-03", ...over,
  };
}

const SALES_NAMES = new Set(Object.values(SALES_FIELDS).map((f) => f.name));
/** The promise of Phase 2, checked after every flow: only "Desk …" fields (plus the Sales tab's own fields when a lead is marked Won), only desk tags, no Monday. */
export function assertOnlyDeskWrites(ghl: FakeGhl): void {
  const { fields, tags } = ghl.written();
  for (const name of fields) assert.ok(isDeskFieldName(name) || SALES_NAMES.has(name), `wrote a field that is not the desk's: ${name}`);
  for (const name of fields) assert.ok(!/^lse/i.test(name), `wrote an LSE field: ${name}`);
  for (const tag of tags) assert.ok(DESK_TAG_LIST.includes(tag) || tag === WON_TAG, `added a tag that is not the desk's: ${tag}`);
  assert.equal(ghl.mondayCalls(), 0, "the GoHighLevel desk called Monday");
  assert.ok(!ghl.requests.some((r) => /opportunit/i.test(r.path)), "the desk touched an opportunity");
}
