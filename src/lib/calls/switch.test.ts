import assert from "node:assert/strict";
import { test } from "node:test";
import { backendForLeadId, defaultBackend, leadsBackend, repIdFor, systemName } from "./switch";
import { ghlRepIds, ghlRepName, MONDAY_IDS } from "@/lib/ghl/reps";

test("LEADS_BACKEND defaults to monday; only the exact value 'ghl' flips it", () => {
  assert.equal(defaultBackend(undefined), "monday"); assert.equal(defaultBackend(""), "monday"); assert.equal(defaultBackend("GHL"), "monday"); assert.equal(defaultBackend("ghl"), "ghl");
});
test("?backend= on a team request previews the other roster without touching the env", () => {
  const req = (q: string) => new Request(`https://www.creativecowboys.co/api/team/calls${q}`);
  assert.equal(leadsBackend(req("?backend=ghl"), undefined), "ghl");
  assert.equal(leadsBackend(req("?backend=monday"), "ghl"), "monday");
  assert.equal(leadsBackend(req("?backend=other"), "ghl"), "ghl");
  assert.equal(leadsBackend(null, "ghl"), "ghl");
});
test("a lead id's shape says which system holds it", () => {
  assert.equal(backendForLeadId("13149403716"), "monday"); assert.equal(backendForLeadId("ocQHyuzHvysMo5N5VsXc"), "ghl"); assert.equal(backendForLeadId("C8FHl1LIfXEMI9isByB2"), "ghl");
  assert.equal(systemName("ghl"), "GoHighLevel"); assert.equal(systemName("monday"), "Monday");
});
test("rep ids per backend, with the GHL_REP_IDS override", () => {
  assert.equal(repIdFor("Dave", "monday"), MONDAY_IDS.Dave); assert.equal(repIdFor("Dave", "ghl"), "zqnRMqxrUZh0qBzF12Re");
  assert.equal(repIdFor("Josh", "ghl"), "m5VMI0ZpKn3kIb1JcMNb"); assert.equal(repIdFor("Keaton", "ghl"), "MS161OFLMqyNSICle1jw");
  const ids = ghlRepIds("Josh:newJoshId0000000000, Nobody:abc, Keaton:short");
  assert.equal(ids.Josh, "newJoshId0000000000"); assert.equal(ids.Keaton, "MS161OFLMqyNSICle1jw"); assert.equal(ids.Dave, "zqnRMqxrUZh0qBzF12Re");
  assert.equal(ghlRepName("m5VMI0ZpKn3kIb1JcMNb"), "Josh"); assert.equal(ghlRepName("stranger"), ""); assert.equal(ghlRepName(null), "");
});
