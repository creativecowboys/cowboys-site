import assert from "node:assert/strict";
import { test } from "node:test";
import { DESK_LOGIN_PATH, DESK_PATH, deskGate, deskHref, deskUrl, safeNext } from "./desk-path";

test("the desk lives at /admin and its links are built in one place", () => {
  assert.equal(DESK_PATH, "/admin");
  assert.equal(DESK_LOGIN_PATH, "/admin/login");
  assert.equal(deskHref(), "/admin");
  assert.equal(deskHref({ tab: "onboarding", client: "6hPHUOn0WMimeBpzeyqq" }), "/admin?tab=onboarding&client=6hPHUOn0WMimeBpzeyqq");
  assert.equal(deskHref({ tab: "clients", client: "13125661635", desk: "ghl" }), "/admin?tab=clients&client=13125661635&desk=ghl");
  assert.equal(deskHref({ tab: "", client: "", desk: "" }), "/admin", "empty values add nothing");
  assert.equal(deskHref({ lead: "abc123" }), "/admin?lead=abc123");
  assert.equal(deskUrl("https://www.creativecowboys.co", { tab: "onboarding", client: "abc" }), "https://www.creativecowboys.co/admin?tab=onboarding&client=abc");
  assert.equal(deskUrl("https://www.creativecowboys.co", { lead: "1" }), "https://www.creativecowboys.co/admin?lead=1");
  assert.equal(deskHref({ client: "a b&c" }), "/admin?client=a+b%26c", "a value can never break out of its parameter");
});

test("after sign-in only a place on the desk is honoured: /admin… or the old /leads…", () => {
  for (const ok of ["/admin", "/admin?tab=clients&client=abc", "/admin?lead=123&backend=ghl", "/admin/anything", "/leads", "/leads?tab=onboarding&client=abc&desk=ghl", "/leads/anything"]) {
    assert.equal(safeNext(ok), ok);
  }
  for (const bad of ["", null, undefined, "/", "/pricing", "/administrator", "/admin-panel", "/adminx?tab=clients", "/leadsx", "/clients/leuco", "/api/team/calls",
    "admin", "https://evil.example/admin", "//evil.example/admin", "/admin#frag", "/admin\\evil.example", "/admin/\\\\evil.example", "/admin?x=\n", `/admin?x=${"y".repeat(200)}`]) {
    assert.equal(safeNext(bad), "/admin", `${JSON.stringify(bad)} falls back to the desk`);
  }
});

test("signed out, any desk page goes to sign-in carrying the path and query; the sign-in page itself is let through", () => {
  assert.equal(deskGate("/admin", "", false), "/admin/login?next=%2Fadmin");
  assert.equal(deskGate("/admin", "?tab=clients&client=abc", false), "/admin/login?next=%2Fadmin%3Ftab%3Dclients%26client%3Dabc");
  assert.equal(deskGate("/admin/something", "?a=1", false), "/admin/login?next=%2Fadmin%2Fsomething%3Fa%3D1");
  assert.equal(deskGate("/admin/login", "", false), null);
  assert.equal(deskGate("/admin/login", "?next=%2Fadmin%3Ftab%3Dclients", false), null);
  // the sign-in page reads `next` back with URLSearchParams — the round trip must give the original address
  const to = deskGate("/admin", "?tab=onboarding&client=6hPHUOn0WMimeBpzeyqq&desk=ghl", false) as string;
  assert.equal(new URL(to, "https://www.creativecowboys.co").searchParams.get("next"), "/admin?tab=onboarding&client=6hPHUOn0WMimeBpzeyqq&desk=ghl");
  // Next's own marker on in-app navigations never ends up in the link
  assert.equal(deskGate("/admin", "?tab=clients&_rsc=1a2b3", false), "/admin/login?next=%2Fadmin%3Ftab%3Dclients");
  assert.equal(deskGate("/admin", "?_rsc=1a2b3", false), "/admin/login?next=%2Fadmin");
  // an address too long to carry falls back to the desk's front page instead of failing
  assert.equal(deskGate("/admin", `?x=${"y".repeat(300)}`, false), "/admin/login?next=%2Fadmin");
});

test("signed in, desk pages are let through and the sign-in page sends you on to the desk", () => {
  assert.equal(deskGate("/admin", "", true), null);
  assert.equal(deskGate("/admin", "?tab=clients&client=abc", true), null);
  assert.equal(deskGate("/admin/something", "", true), null);
  assert.equal(deskGate("/admin/login", "", true), "/admin");
  assert.equal(deskGate("/admin/login", "?expired=1", true), "/admin");
  assert.equal(deskGate("/admin/login", "?next=%2Fadmin%3Ftab%3Dclients%26client%3Dabc", true), "/admin?tab=clients&client=abc");
  assert.equal(deskGate("/admin/login", "?next=%2Fleads%3Flead%3D7", true), "/leads?lead=7", "an old address is passed on; next.config.ts forwards it");
  assert.equal(deskGate("/admin/login", "?next=https%3A%2F%2Fevil.example", true), "/admin");
  assert.equal(deskGate("/admin/login", "?next=%2Fpricing", true), "/admin");
  for (const loop of ["%2Fadmin%2Flogin", "%2Fadmin%2Flogin%3Fnext%3D%252Fadmin%252Flogin", "%2Fadmin%2Flogin%2Fx"]) {
    assert.equal(deskGate("/admin/login", `?next=${loop}`, true), "/admin", "never bounced back to the sign-in page");
  }
});
