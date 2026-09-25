import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLines, monthlyTotal } from "./catalog";

test("first-year Local Growth bills 297 and notes the step-up", () => {
  const lines = buildLines([{ key: "local-growth", promo: true }]);
  assert.equal(lines[0].amount, 297); assert.match(lines[0].promoNote || "", /497/);
  assert.equal(monthlyTotal(buildLines([{ key: "local-growth" }, { key: "crm" }, { key: "google-ads", tier: "1000" }])), 497 + 97 + 1000);
});

test("catalog rules: one plan, add-on requirements, conflicts, tiers, custom lines", () => {
  assert.throws(() => buildLines([{ key: "local-growth" }, { key: "max-growth" }]), /one plan/);
  assert.throws(() => buildLines([{ key: "expanded-reach" }]), /requires/);
  assert.throws(() => buildLines([{ key: "ai-seo-standalone" }, { key: "local-growth" }]), /can't be combined/);
  assert.throws(() => buildLines([{ key: "social-ads" }]), /Pick a tier/);
  assert.throws(() => buildLines([{ key: "custom", name: "", amount: 50 }]), /Custom line/);
  assert.throws(() => buildLines([]), /at least one/);
  assert.equal(buildLines([{ key: "custom", name: "Photo day", amount: 150 }])[0].amount, 150);
});
