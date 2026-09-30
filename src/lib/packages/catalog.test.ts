import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLines, CATALOG, monthlyTotal, termFor } from "./catalog";

// Dave, Sep 30 2026: Local Growth is $297/mo on a 12-month agreement, $497/mo month-to-month.
// The old "first 12 months, then $497" step-up is gone — a 12-month client renews at $297.
test("Local Growth defaults to the 12-month agreement at 297 and says so on the line", () => {
  const [line] = buildLines([{ key: "local-growth" }]);
  assert.equal(line.amount, 297);
  assert.equal(line.name, "Local Growth — 12-month agreement");
  assert.equal(line.termMonths, 12);
  assert.match(line.termNote || "", /12-month agreement/);
  assert.match(line.termNote || "", /renews .* \$297\/mo/);
  assert.match(line.termNote || "", /month-to-month at \$497\/mo/);
  assert.doesNotMatch(line.termNote || "", /first/i);
  assert.match(line.description, /\$497\/mo/);
  assert.deepEqual(buildLines([{ key: "local-growth", term: "12-month" }]), [line]);
});

test("Local Growth month-to-month bills 497 with no term and no renewal task", () => {
  const [line] = buildLines([{ key: "local-growth", term: "month-to-month" }]);
  assert.equal(line.amount, 497);
  assert.equal(line.name, "Local Growth — month-to-month");
  assert.equal(line.termMonths, undefined);
  assert.match(line.termNote || "", /\$497\/mo month-to-month/);
  assert.throws(() => buildLines([{ key: "local-growth", term: "first-year" }]), /Pick a term/);
});

test("catalog terms: the 12-month agreement is the default; Max Growth has no terms", () => {
  const lg = CATALOG.find((c) => c.key === "local-growth")!;
  assert.equal(termFor(lg)?.key, "12-month");
  assert.equal(termFor(lg, "month-to-month")?.amount, 497);
  assert.equal(termFor(CATALOG.find((c) => c.key === "max-growth")!), undefined);
  assert.equal(buildLines([{ key: "max-growth" }])[0].amount, 1497);
});

test("monthly totals add the chosen term to the other lines", () => {
  assert.equal(monthlyTotal(buildLines([{ key: "local-growth" }, { key: "crm" }, { key: "google-ads", tier: "1000" }])), 297 + 97 + 1000);
  assert.equal(monthlyTotal(buildLines([{ key: "local-growth", term: "month-to-month" }, { key: "crm" }, { key: "google-ads", tier: "1000" }])), 497 + 97 + 1000);
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
