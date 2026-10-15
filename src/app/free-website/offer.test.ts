import assert from "node:assert/strict";
import { test } from "node:test";
import { ADDONS, checkoutUrl, PLANS, summarize, totals } from "./offer";

test("totals: first month today, monthly after, one-time items only today", () => {
  const t = totals({ plan: "basic", addons: ["ai-chat", "custom-domain"], oneTime: ["gbp-optimization"] });
  assert.equal(t.monthly, 30 + 19 + 5);
  assert.equal(t.oneTime, 97);
  assert.equal(t.today, 30 + 19 + 5 + 97);
  assert.equal(totals({ plan: "basic", addons: [], oneTime: [] }).today, 30);
});

test("Website Pro never bills the add-ons it already includes", () => {
  const pro = PLANS.find((p) => p.key === "pro")!;
  const t = totals({ plan: "pro", addons: ["ai-chat", "lead-text-alerts", "custom-domain", "online-booking"], oneTime: [] });
  assert.equal(t.monthly, 69 + 19, "only booking is extra");
  assert.deepEqual(t.lines.map((l) => l.name), ["Website Pro", "Online Booking"]);
  for (const k of pro.bundled) assert.ok(ADDONS.some((a) => a.key === k), `${k} is a real add-on`);
});

test("summary reads like a receipt", () => {
  assert.equal(summarize({ plan: "pro", addons: ["online-booking"], oneTime: ["gbp-optimization"] }),
    "Website Pro + Online Booking + Google Business Profile Optimization (one-time) · $185 today, then $88/mo");
});

test("checkout link: null until the order form exists, then carries the selection and the ad parameters", () => {
  const sel = { plan: "pro" as const, addons: ["online-booking" as const], oneTime: [] };
  delete process.env.NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO;
  assert.equal(checkoutUrl(sel, "?utm_source=fb"), null);
  process.env.NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO = "https://link.creativecowboys.co/pro";
  const url = new URL(checkoutUrl(sel, "?utm_source=fb&fbclid=abc&junk=1")!);
  assert.equal(url.origin + url.pathname, "https://link.creativecowboys.co/pro");
  assert.equal(url.searchParams.get("plan"), "pro");
  assert.equal(url.searchParams.get("addons"), "online-booking");
  assert.equal(url.searchParams.get("utm_source"), "fb");
  assert.equal(url.searchParams.get("fbclid"), "abc");
  assert.equal(url.searchParams.get("junk"), null);
  assert.equal(checkoutUrl({ ...sel, plan: "basic" }, ""), null, "each plan has its own form");
  process.env.NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO = "not a url";
  assert.equal(checkoutUrl(sel, ""), null);
  delete process.env.NEXT_PUBLIC_FREE_SITE_CHECKOUT_URL_PRO;
});
