import assert from "node:assert/strict";
import { test } from "node:test";
import { checklistFor, missingRequired, readinessProblems } from "./checklist";
import type { ChecklistItem } from "./types";

const item = (name: string, status = "", required = true): ChecklistItem => ({ id: name, name, status, owner: "", due: "", phase: "Onboard", required });

test("checklist follows the packages sold and never duplicates a row", () => {
  const seo = checklistFor(["Local Growth — First Year $297"]).map((t) => t.name);
  assert.ok(seo.includes("GBP access: verified by staff (or No GBP Exists confirmed)"));
  assert.ok(seo.includes("Domain / DNS path confirmed with client"));
  assert.ok(!seo.some((n) => /Meta Business/.test(n)));
  const ads = checklistFor(["Social Ads $600", "Google Ads $500"]).map((t) => t.name);
  assert.equal(ads.filter((n) => n === "Ad budget + billing method confirmed").length, 1);
  assert.ok(!ads.some((n) => /GBP access/.test(n)));
});

test("readiness is an explicit check of required items plus access, agreement, payment and intake", () => {
  const base = { checklist: [item("Logo files received (vector preferred)", "Done"), item("Photos received (team, work, location)", "", false)], gbpAccess: "Requested", agreement: "Unknown", payment: "Pending", intake: "Link issued", packages: "Local Growth" };
  const problems = readinessProblems(base);
  assert.ok(problems.some((p) => p.includes("GBP access is not verified")), "requested ≠ verified");
  assert.ok(problems.some((p) => p.startsWith("Agreement")));
  assert.ok(problems.some((p) => p.startsWith("Payment")));
  assert.ok(problems.some((p) => p.includes("intake")));
  assert.equal(missingRequired(base.checklist).length, 0, "optional rows never block");
  const ready = readinessProblems({ ...base, gbpAccess: "No GBP Exists", agreement: "Not required", payment: "Deposit paid", intake: "Client submitted" });
  assert.deepEqual(ready, []);
  const adsOnly = readinessProblems({ ...base, packages: "Google Ads $500", gbpAccess: "Not Requested", agreement: "Signed", payment: "Paid", intake: "Reviewed" });
  assert.deepEqual(adsOnly, [], "GBP is only required for SEO packages");
});

test("an open required row blocks readiness", () => {
  const problems = readinessProblems({ checklist: [item("Intake link delivered to client", "Working on it")], gbpAccess: "Verified", agreement: "Signed", payment: "Paid", intake: "Reviewed", packages: "Local Growth" });
  assert.deepEqual(problems, ["Checklist: Intake link delivered to client"]);
});
