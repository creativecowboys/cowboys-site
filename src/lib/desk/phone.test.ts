import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPhone, phoneMatches, phoneToSave, usPhoneDigits } from "./phone";

// How phone numbers are shown in the Back Office (Oct 9 2026). Display only: see ./phone.ts.

test("a US number is shown as (417) 623-9318 however it is stored", () => {
  for (const stored of [
    "+14176239318", "4176239318", "14176239318", "+1 417 623 9318", "+1 (417) 623-9318", "1-417-623-9318", "417-623-9318",
    "417.623.9318", "(417)623-9318", "(417) 623-9318", " 417 623 9318 ", "417/623-9318", "417–623–9318", "+1-417-623-9318",
    "417 623 9318",
  ]) assert.equal(formatPhone(stored), "(417) 623-9318", stored);
  assert.equal(formatPhone("+18005551212"), "(800) 555-1212", "toll-free numbers are North American numbers too");
  assert.equal(formatPhone("+16045550100"), "(604) 555-0100", "Canada shares +1");
});

test("formatting a formatted number gives the same text back", () => {
  for (const stored of ["+14176239318", "417.623.9318 x12", "+44 20 7946 0958", "", "call the office"]) {
    const once = formatPhone(stored);
    assert.equal(formatPhone(once), once, stored);
  }
});

test("an extension is kept when it is easy to read", () => {
  for (const stored of ["417-623-9318 x123", "417-623-9318x123", "4176239318 X123", "(417) 623-9318 ext 123", "(417) 623-9318 ext. 123", "+1 417 623 9318 Ext.123", "417.623.9318 extension 123", "417-623-9318 #123"]) {
    assert.equal(formatPhone(stored), "(417) 623-9318 ext. 123", stored);
  }
  assert.equal(formatPhone("417-623-9318,,123"), "417-623-9318,,123", "a dialling pause is not an extension we can read: left as stored");
  assert.equal(formatPhone("417-623-9318 x"), "417-623-9318 x", "an x with nothing after it is left as stored");
});

test("anything that is not a US or Canadian number is left as stored, trimmed", () => {
  assert.equal(formatPhone("+44 20 7946 0958"), "+44 20 7946 0958", "UK");
  assert.equal(formatPhone("+447911123456"), "+447911123456", "UK mobile, E.164");
  assert.equal(formatPhone("+4176239318"), "+4176239318", "a + and ten digits is another country's number, not ours missing its 1");
  assert.equal(formatPhone("+52 55 1234 5678"), "+52 55 1234 5678", "Mexico");
  assert.equal(formatPhone("  +33 1 23 45 67 89  "), "+33 1 23 45 67 89", "trimmed, nothing else");
  assert.equal(formatPhone("623-9318"), "623-9318", "seven digits: no area code to show");
  assert.equal(formatPhone("55498"), "55498", "a short code");
  assert.equal(formatPhone("1234567890"), "1234567890", "area code 123 does not exist: junk stays as it is");
  assert.equal(formatPhone("4171234567"), "4171234567", "an exchange cannot start with 1");
  assert.equal(formatPhone("24176239318"), "24176239318", "eleven digits not starting with 1");
  assert.equal(formatPhone("417623931812"), "417623931812", "twelve digits");
  assert.equal(formatPhone("417-623-9318 or 417-555-0100"), "417-623-9318 or 417-555-0100", "two numbers and words");
  assert.equal(formatPhone("call the office"), "call the office");
  assert.equal(formatPhone("tracy@anchorpayservices.com"), "tracy@anchorpayservices.com");
});

test("a blank is blank", () => {
  assert.equal(formatPhone(""), "");
  assert.equal(formatPhone("   "), "");
  assert.equal(formatPhone(null), "");
  assert.equal(formatPhone(undefined), "");
  assert.equal(usPhoneDigits(null), "");
});

test("usPhoneDigits gives the ten digits of a North American number and nothing else", () => {
  assert.equal(usPhoneDigits("+14176239318"), "4176239318");
  assert.equal(usPhoneDigits("(417) 623-9318"), "4176239318");
  assert.equal(usPhoneDigits("417-623-9318 x12"), "", "an extension is not part of the number");
  assert.equal(usPhoneDigits("+447911123456"), "");
});

test("a search finds a phone number whichever way it is typed", () => {
  for (const stored of ["+14176239318", "4176239318", "14176239318", "(417) 623-9318", "417.623.9318 x12"]) {
    for (const typed of ["4176239318", "417-623-9318", "(417) 623", "(417) 623-9318", "417.623.9318", "+1 417 623 9318", "14176239318", "1-417", "623-9318", "9318", " 417 "]) {
      assert.equal(phoneMatches(stored, typed), true, `${stored} / ${typed}`);
    }
  }
  assert.equal(phoneMatches("+44 20 7946 0958", "7946 0958"), true, "a number from another country is found by its digits too");
});

test("a search that is not a phone number never matches on the phone", () => {
  assert.equal(phoneMatches("+14176239318", "4175551234"), false, "a different number");
  assert.equal(phoneMatches("+14176239318", "(417) 555"), false);
  assert.equal(phoneMatches("+14176239318", "41"), false, "fewer than three digits is too little to look for");
  assert.equal(phoneMatches("+14176239318", "1"), false);
  assert.equal(phoneMatches("+14176239318", "Unit 417"), false, "letters in the search: it is a name or address search");
  assert.equal(phoneMatches("+14176239318", "tracy"), false);
  assert.equal(phoneMatches("+14176239318", ""), false, "an empty search is handled by the text search (it shows everything)");
  assert.equal(phoneMatches("", "417"), false, "no phone on file");
  assert.equal(phoneMatches(null, "417"), false);
  assert.equal(phoneMatches("call the office", "417"), false);
});

test("an editable phone box sends the stored number back unless someone changed it", () => {
  assert.equal(phoneToSave("(417) 623-9318", "+14176239318"), "+14176239318", "left alone: sent exactly as stored");
  assert.equal(phoneToSave("(417) 623-9318 ext. 12", "417.623.9318 x12"), "417.623.9318 x12");
  assert.equal(phoneToSave("+44 20 7946 0958", "+44 20 7946 0958"), "+44 20 7946 0958");
  assert.equal(phoneToSave("+44 20 7946 0958", " +44 20 7946 0958 "), " +44 20 7946 0958 ", "the stored text, even its spaces");
  assert.equal(phoneToSave("(417) 555-0100", "+14176239318"), "(417) 555-0100", "a new number is sent as typed");
  assert.equal(phoneToSave("", "+14176239318"), "", "a cleared box is sent cleared (the server decides what that means, as before)");
  assert.equal(phoneToSave("4175550100", ""), "4175550100", "a number added where there was none");
  assert.equal(phoneToSave("", ""), "");
});
