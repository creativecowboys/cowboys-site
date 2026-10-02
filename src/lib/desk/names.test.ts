import assert from "node:assert/strict";
import { test } from "node:test";
import { businessShown, contactLine, displayName, nameKey, personShown, sameName } from "./names";

// How names are shown on the desk's lists and panel headers (Oct 2 2026). Display only: see ./names.ts.

test("same name: capitals, punctuation and spacing do not make two names", () => {
  // The legacy clients as production lists them: the business as stored, the contact as GoHighLevel's search returns it.
  for (const [business, contact] of [
    ["Whiten Pools, Inc.", "whiten pools, inc."], ["Met Lane and Associates, P.C.", "met lane and associates, p.c."],
    ["Law Office of John B. Jackson and Associates", "law office of john b. jackson and associates"], ["The Grove at DeFoor Farm", "the grove at defoor farm"],
    ["McKinley Roofing and Restoration", "mckinley roofing and restoration"], ["LEUCO", "leuco"], ["Southeastern PCG", "southeastern pcg"],
  ]) assert.equal(sameName(business, contact), true, business);
  assert.equal(sameName("Whiten Pools, Inc.", "  whiten   pools inc "), true, "extra spaces and missing punctuation");
  assert.equal(sameName("Met Lane and Associates, P.C.", "Met Lane & Associates PC"), true, "& is and; P.C. is PC");
  assert.equal(sameName("Smith-Jones Plumbing", "smith jones plumbing"), true);
  assert.equal(sameName("O'Brien's", "OBRIENS"), true);
  assert.equal(sameName("Café Olé", "CAFÉ OLÉ"), true, "letters outside a–z are letters too");
  assert.equal(sameName("Café Olé", "Café Olé"), true, "the same accent typed two ways");
});

test("same name: a different name is a different name, and a blank is never the same as anything", () => {
  assert.equal(sameName("Squirrel Made Products", "samuel johnson"), false);
  assert.equal(sameName("Whiten Pools, Inc.", "Whiten Pools"), false, "a shorter name is another name");
  assert.equal(sameName("Choice Enterprises", "Choice Pressure Washing"), false);
  assert.equal(sameName("Studio 54", "Studio 45"), false, "digits count");
  assert.equal(sameName("", ""), false); assert.equal(sameName("", "x"), false); assert.equal(sameName("Acme", ""), false);
  assert.equal(sameName(null, undefined), false); assert.equal(sameName("...", "---"), false, "nothing but punctuation is a blank");
  assert.equal(sameName("山田工業", "山田"), false); assert.equal(sameName("山田工業", "山田 工業"), true, "a name with no Latin letters still compares");
  assert.equal(nameKey("  Whiten Pools, Inc. "), "whitenpoolsinc"); assert.equal(nameKey("A&B"), nameKey("a and b")); assert.equal(nameKey(undefined), "");
});

test("display casing: a name with no capitals gets them back, word by word", () => {
  // The three the desk showed lower-cased on Oct 2 2026, and what their open panels said.
  assert.equal(displayName("samuel johnson"), "Samuel Johnson");
  assert.equal(displayName("freddy sumbay"), "Freddy Sumbay");
  assert.equal(displayName("reese pownall"), "Reese Pownall");
  assert.equal(displayName("cher"), "Cher");
  assert.equal(displayName("mary-jane watson"), "Mary-Jane Watson");
  assert.equal(displayName("sean o'brien"), "Sean O'Brien"); assert.equal(displayName("nia d’angelo"), "Nia D’Angelo");
  assert.equal(displayName("erin mckay"), "Erin McKay"); assert.equal(displayName("ronald mcdonald"), "Ronald McDonald");
  assert.equal(displayName("j.r. smith iii"), "J.R. Smith III"); assert.equal(displayName("st. john rivers"), "St. John Rivers");
  assert.equal(displayName("josé ángel"), "José Ángel"); assert.equal(displayName("élodie"), "Élodie");
  assert.equal(displayName("ana  maria"), "Ana  Maria", "the spacing is not touched");
  // Shapes found among the 812 leads on the production roster on Oct 2 2026 (the names here are made up).
  assert.equal(displayName("pat & lee marsh"), "Pat & Lee Marsh"); assert.equal(displayName("pat and lee marsh"), "Pat and Lee Marsh");
  assert.equal(displayName("dana (kim and kit) marsh"), "Dana (Kim and Kit) Marsh"); assert.equal(displayName("k. dana marsh"), "K. Dana Marsh");
  assert.equal(displayName("dana lee -marsh"), "Dana Lee -Marsh"); assert.equal(displayName("zi'na marsh"), "Zi'na Marsh", "an apostrophe mid-name is not O'Brien");
  for (const [raw, shown] of [["mckinney", "McKinney"], ["mcallister", "McAllister"], ["mcgee", "McGee"], ["mcintosh", "McIntosh"], ["mcwilliams", "McWilliams"]]) assert.equal(displayName(raw), shown);
  assert.equal(displayName("and"), "And", "a first word is always capitalised");
});

test("display casing: nothing clever where a guess would be wrong", () => {
  assert.equal(displayName("joe's pizza"), "Joe's Pizza", "a possessive is not O'Brien");
  assert.equal(displayName("macy mack"), "Macy Mack", "mac is not Mc");
  assert.equal(displayName("mcm"), "Mcm"); assert.equal(displayName("ii"), "Ii", "a numeral only after a name");
  assert.equal(displayName("vi nguyen"), "Vi Nguyen");
  assert.equal(displayName("3rd street bakery"), "3rd Street Bakery", "a word that starts with a digit is left as it is");
  assert.equal(displayName("(bob) smith"), "(Bob) Smith"); assert.equal(displayName("\"bob\" smith"), "\"Bob\" Smith");
  assert.equal(displayName("ann@example.com"), "ann@example.com", "an email address is not a name");
  assert.equal(displayName("12345"), "12345"); assert.equal(displayName("---"), "---");
});

test("display casing: a name that carries a capital is shown exactly as it is stored", () => {
  for (const stored of ["Samuel Johnson", "DeShawn McKnight", "Erin VanDyke", "JOHN SMITH", "john Smith", "van der Berg, Anna", "LEUCO", "Whiten Pools, Inc.", "eBay seller", " Padded Name "]) assert.equal(displayName(stored), stored);
  // So it is safe to run twice, and safe on a row that already came from the record itself.
  for (const raw of ["samuel johnson", "sean o'brien", "erin mckay", "j.r. smith iii", "mary-jane watson"]) assert.equal(displayName(displayName(raw)), displayName(raw));
  assert.equal(displayName(""), ""); assert.equal(displayName(null), ""); assert.equal(displayName(undefined), "");
});

test("the contact person beside a business: nobody when the contact only repeats the business", () => {
  assert.equal(personShown("Squirrel Made Products", "samuel johnson"), "Samuel Johnson");
  assert.equal(personShown("Whiten Pools, Inc.", "whiten pools, inc."), "", "a legacy client's row, built from the search");
  assert.equal(personShown("Whiten Pools, Inc.", "Whiten Pools, Inc."), "", "the same client's panel, read by id");
  assert.equal(personShown("Whiten Pools, Inc.", ""), ""); assert.equal(personShown("Whiten Pools, Inc.", "   "), ""); assert.equal(personShown("Whiten Pools, Inc.", null), "");
  assert.equal(personShown("", "samuel johnson"), "Samuel Johnson", "no business name: there is nothing to repeat");
  assert.equal(personShown("Whiten Pools, Inc.", "Jane Doe"), "Jane Doe", "a real person typed into the panel shows at once");
});

test("the line under the business name: the person, then the row's extras", () => {
  // Clients tab.
  assert.equal(contactLine("Squirrel Made Products", "samuel johnson", ["since 2026-09-24"]), "Samuel Johnson · since 2026-09-24");
  assert.equal(contactLine("Whiten Pools, Inc.", "whiten pools, inc.", [""]), "", "a legacy row: the line is left out");
  assert.equal(contactLine("Whiten Pools, Inc.", "whiten pools, inc.", ["since 2019-03-01"]), "since 2019-03-01");
  assert.equal(contactLine("Acme", "", [""]), "no contact", "no contact on the record is still said");
  assert.equal(contactLine("Acme", "", ["since 2026-01-05"]), "no contact · since 2026-01-05");
  // Onboarding and Sales rows (a city instead of a date; the Sales desk has its own wording for a missing contact).
  assert.equal(contactLine("Choice Enterprises", "reese pownall", ["Villa Rica, GA"]), "Reese Pownall · Villa Rica, GA");
  assert.equal(contactLine("Bourbon Leather Company", "freddy sumbay", [""], "Contact not supplied"), "Freddy Sumbay");
  assert.equal(contactLine("Acme", "", ["Atlanta, GA"], "Contact not supplied"), "Contact not supplied · Atlanta, GA");
  assert.equal(contactLine("samuel johnson", "samuel johnson", ["Villa Rica, GA"], "Contact not supplied"), "Villa Rica, GA", "a lead with no business name: the name is the title, not repeated under it");
  assert.equal(contactLine("Acme", "Jane Doe", [false, null, undefined, "x"]), "Jane Doe · x");
  assert.equal(contactLine("Acme", "Jane Doe"), "Jane Doe");
});

test("the title: a business name is never re-cased; a contact's name standing in for one is shown as a contact's name", () => {
  assert.equal(businessShown("Whiten Pools, Inc.", "whiten pools, inc."), "Whiten Pools, Inc.");
  assert.equal(businessShown("acme plumbing", "john smith"), "acme plumbing", "a business typed in lower case stays as typed");
  assert.equal(businessShown("LEUCO", "leuco"), "LEUCO");
  assert.equal(businessShown("samuel johnson", "samuel johnson"), "Samuel Johnson", "no business on the lead: the server put the contact's name there");
  assert.equal(businessShown("Samuel Johnson", "Samuel Johnson"), "Samuel Johnson");
  assert.equal(businessShown("ann@example.com", "ann@example.com"), "ann@example.com");
  assert.equal(businessShown("", ""), ""); assert.equal(businessShown("Acme", ""), "Acme"); assert.equal(businessShown(null, null), "");
});
