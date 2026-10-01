import assert from "node:assert/strict";
import { test } from "node:test";
import { matchWinner, type Winner } from "./winners";

const w = (over: Partial<Winner>): Winner => ({ itemId: "1", name: "Bourbon Leather Company", board: "Onboarding Pipeline", url: "u", email: "", phone: "", ghl: "", ...over });

test("a GHL contact matches its giveaway-winner row by contact id, email, phone or exact business name", () => {
  const rows = [w({ email: "Freddy@Bourbon.example", phone: "+1 (386) 589-5606", ghl: "https://app.gohighlevel.com/v2/location/x/contacts/detail/AbC123xyz" })];
  assert.ok(matchWinner({ id: "AbC123xyz" }, rows));
  assert.ok(matchWinner({ email: "freddy@bourbon.example " }, rows));
  assert.ok(matchWinner({ phone: "386-589-5606" }, rows));
  assert.ok(matchWinner({ company: "Bourbon Leather Company" }, rows));
  assert.ok(matchWinner({ company: "bourbon leather company!" }, rows));
});

test("near misses and empty fields never match", () => {
  const rows = [w({ name: "Ace", email: "", phone: "555", ghl: "" })];
  assert.equal(matchWinner({ id: "", email: "", phone: "", company: "Ace" }, rows), null); // names under 4 chars are ignored
  assert.equal(matchWinner({ company: "Bourbon Leather" }, [w({})]), null);
  assert.equal(matchWinner({ phone: "555" }, rows), null);
  assert.equal(matchWinner({ email: "someone@else.example" }, [w({ email: "freddy@bourbon.example" })]), null);
});
