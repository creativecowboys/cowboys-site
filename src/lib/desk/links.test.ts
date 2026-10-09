import assert from "node:assert/strict";
import { test } from "node:test";
import { byLinkName, checkLinkFields, linkLabel, linkMatches, normalizeLinkUrl, safeLinkHref, LINK_LIMITS } from "./link-rules";
import { addLink, deleteLink, editLink, listLinks, LinkStorageConflict, type LinkStorage, type StoredLink } from "./links";
import { CallDeskError } from "@/lib/calls/validation";

// The Back Office Links tab (Oct 9 2026): what a link may hold, and the shared list's read → change → write-if-unchanged.

// An in-memory stand-in for the Blob document with real ETag behaviour: a write must name the ETag it read, a create
// fails if the document exists. `race` lets a test slip another writer in between a read and the write that follows.
function memory(initial?: StoredLink[]) {
  let text: string | null = initial ? JSON.stringify({ version: 1, links: initial }) : null;
  let etag = text ? 1 : 0;
  const log = { reads: 0, writes: 0, conflicts: 0 };
  let race: (() => void) | null = null;
  const storage: LinkStorage = {
    async read() { log.reads++; return text === null ? null : { text, etag: `"e${etag}"` }; },
    async write(next, expected) {
      if (race) { const r = race; race = null; r(); }
      const current = text === null ? null : `"e${etag}"`;
      if (expected === null ? current !== null : expected !== current) { log.conflicts++; throw new LinkStorageConflict("changed"); }
      text = next; etag++; log.writes++;
    },
  };
  return {
    storage, log,
    links: (): StoredLink[] => (text === null ? [] : JSON.parse(text).links),
    /** Someone else saves this list right before our next write lands. */
    raceWith(links: StoredLink[]) { race = () => { text = JSON.stringify({ version: 1, links }); etag++; }; },
  };
}
const dave = { name: "Dave", email: "dave@creativecowboys.co" };
const josh = { name: "Josh", email: "josh@creativecowboys.co" };
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const now = new Date("2026-10-09T15:00:00.000Z");
const stored = (n: number, name: string, url: string, extra: Partial<StoredLink> = {}): StoredLink =>
  ({ id: id(n), name, url, note: "", addedBy: "Dave", addedByEmail: "dave@creativecowboys.co", addedAt: "2026-10-01T12:00:00.000Z", rev: 1, ...extra });
const fails = async (promise: Promise<unknown>, status: number, pattern: RegExp) => {
  await assert.rejects(promise, (e: unknown) => e instanceof CallDeskError && e.status === status && pattern.test(e.message));
};

test("addresses: web links only, https added when the scheme is missing", () => {
  assert.deepEqual(normalizeLinkUrl("https://dashboard.searchatlas.com/gbp"), { ok: true, url: "https://dashboard.searchatlas.com/gbp" });
  assert.deepEqual(normalizeLinkUrl("  app.gohighlevel.com/location/abc  "), { ok: true, url: "https://app.gohighlevel.com/location/abc" });
  assert.deepEqual(normalizeLinkUrl("HTTP://Example.COM"), { ok: true, url: "http://example.com/" });
  assert.deepEqual(normalizeLinkUrl("//example.com/x"), { ok: true, url: "https://example.com/x" });
  assert.deepEqual(normalizeLinkUrl("example.com:8080/x?a=1#top"), { ok: true, url: "https://example.com:8080/x?a=1#top" }, "a port is not a scheme");
  assert.equal(normalizeLinkUrl("https://us02web.zoom.us/j/123?pwd=abc").ok, true, "a meeting link with its passcode is still a link");
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox", "file:///etc/passwd",
    "mailto:dave@creativecowboys.co", "ftp://example.com", "tel:4043959092", "blob:https://example.com/x", "localhost:3000"]) {
    const r = normalizeLinkUrl(bad);
    assert.equal(r.ok, false, bad);
    if (!r.ok) assert.match(r.error, /Only web links/, bad);
  }
  for (const bad of ["", "   ", "java\nscript:alert(1)", "https://exa mple.com", "https://example.com/\u0000", "\u0001https://example.com", "just words", "https://localhost/x", "http//example.com", "https://.com", "https://example..com"]) {
    assert.equal(normalizeLinkUrl(bad).ok, false, JSON.stringify(bad));
  }
  assert.equal(normalizeLinkUrl(undefined).ok, false);
  assert.equal(normalizeLinkUrl(42).ok, false);
  const login = normalizeLinkUrl("https://dave:hunter2@example.com/");
  assert.equal(login.ok, false); if (!login.ok) assert.match(login.error, /username or password/);
  assert.equal(normalizeLinkUrl(`https://example.com/${"a".repeat(LINK_LIMITS.url)}`).ok, false, "too long");
});

test("fields: name required and on one line, note optional, the first problem is the one reported", () => {
  assert.deepEqual(checkLinkFields({ name: "  Search\n Atlas \t dashboard ", url: "searchatlas.com", note: " GBP\r\nwork " }),
    { ok: true, value: { name: "Search Atlas dashboard", url: "https://searchatlas.com/", note: "GBP work" } });
  assert.deepEqual(checkLinkFields({ name: "x", url: "x.co" }), { ok: true, value: { name: "x", url: "https://x.co/", note: "" } });
  assert.deepEqual(checkLinkFields({ name: "Na\u0000me", url: "x.co", note: null }), { ok: true, value: { name: "Name", url: "https://x.co/", note: "" } });
  const cases: [unknown, string][] = [
    [{ name: "", url: "x.co" }, "name"], [{ name: "   ", url: "x.co" }, "name"], [{ url: "x.co" }, "name"], [{ name: 5, url: "x.co" }, "name"],
    [{ name: "a".repeat(LINK_LIMITS.name + 1), url: "x.co" }, "name"], [{ name: "ok", url: "" }, "url"], [{ name: "ok", url: "javascript:x" }, "url"],
    [{ name: "ok", url: "x.co", note: 3 }, "note"], [{ name: "ok", url: "x.co", note: "n".repeat(LINK_LIMITS.note + 1) }, "note"],
    [null, "name"], [[], "name"], ["text", "name"],
  ];
  for (const [input, field] of cases) {
    const r = checkLinkFields(input);
    assert.equal(r.ok, false, JSON.stringify(input));
    if (!r.ok) assert.equal(r.field, field, JSON.stringify(input));
  }
});

test("display helpers: only http(s) ever reaches an href; labels, order and search", () => {
  assert.equal(safeLinkHref("https://example.com/a"), "https://example.com/a");
  assert.equal(safeLinkHref("javascript:alert(1)"), null);
  assert.equal(safeLinkHref("data:text/html,x"), null);
  assert.equal(safeLinkHref("not a url"), null);
  assert.equal(safeLinkHref(undefined), null);
  assert.equal(linkLabel("https://www.searchatlas.com/"), "searchatlas.com");
  assert.equal(linkLabel("https://app.gohighlevel.com/v2/location/x?tab=1"), "app.gohighlevel.com/v2/location/x?tab=1");
  const list = [{ name: "beta", url: "b" }, { name: "Alpha", url: "a" }, { name: "alpha", url: "0" }, { name: "Link 10", url: "c" }, { name: "Link 9", url: "d" }];
  assert.deepEqual([...list].sort(byLinkName).map((l) => `${l.name}|${l.url}`), ["alpha|0", "Alpha|a", "beta|b", "Link 9|d", "Link 10|c"]);
  const link = { name: "GHL sub-account", url: "https://app.gohighlevel.com/", note: "Creative Cowboys location", addedBy: "Josh" };
  assert.equal(linkMatches(link, ""), true);
  assert.equal(linkMatches(link, "  ghl  cowboys "), true, "every word, anywhere");
  assert.equal(linkMatches(link, "gohighlevel"), true);
  assert.equal(linkMatches(link, "josh"), true);
  assert.equal(linkMatches(link, "ghl stripe"), false);
});

test("add: saved A to Z with who and when; the browser never gets an email address", async () => {
  const m = memory();
  assert.deepEqual((await listLinks(m.storage)).links, [], "no document yet = an empty list");
  await addLink({ id: id(2), name: "Stripe", url: "dashboard.stripe.com", note: "Billing" }, dave, now, m.storage);
  const data = await addLink({ id: id(1), name: "Search Atlas", url: "https://dashboard.searchatlas.com/", note: "" }, josh, now, m.storage);
  assert.deepEqual(data.links.map((l) => l.name), ["Search Atlas", "Stripe"]);
  assert.deepEqual(data.links[0], { id: id(1), name: "Search Atlas", url: "https://dashboard.searchatlas.com/", note: "", addedBy: "Josh", addedAt: now.toISOString(), rev: 1 });
  assert.equal(JSON.stringify(data).includes("@"), false, "no email in the answer");
  assert.equal(m.links().find((l) => l.id === id(1))?.addedByEmail, "josh@creativecowboys.co", "but it is kept in storage");
  assert.equal(data.limits.count, LINK_LIMITS.count);
});

test("add: a retry of the same add saves once; a second link to the same address is refused", async () => {
  const m = memory();
  await addLink({ id: id(1), name: "GHL", url: "app.gohighlevel.com" }, dave, now, m.storage);
  const writes = m.log.writes;
  const again = await addLink({ id: id(1), name: "GHL", url: "app.gohighlevel.com" }, dave, now, m.storage);
  assert.equal(again.links.length, 1); assert.equal(m.log.writes, writes, "nothing written for the retry");
  await fails(addLink({ id: id(2), name: "HighLevel", url: "https://app.gohighlevel.com/" }, josh, now, m.storage), 409, /already saved, as “GHL”/);
  await fails(addLink({ id: "not-a-uuid", name: "x", url: "x.co" }, dave, now, m.storage), 400, /Reload/);
  await fails(addLink({ id: id(3), name: "x", url: "javascript:alert(1)" }, dave, now, m.storage), 400, /Only web links/);
  await fails(addLink({ id: id(3), name: "", url: "x.co" }, dave, now, m.storage), 400, /name/);
  assert.equal(m.links().length, 1);
});

test("add: the list stops at the limit", async () => {
  const full = Array.from({ length: LINK_LIMITS.count }, (_, i) => stored(i + 10, `Link ${i}`, `https://example${i}.com/`));
  const m = memory(full);
  await fails(addLink({ id: id(1), name: "One more", url: "one-more.com" }, dave, now, m.storage), 400, /full/);
});

test("two people saving at once: neither change is lost", async () => {
  const m = memory([stored(1, "Alpha", "https://alpha.com/")]);
  // Josh's add lands between Dave's read and Dave's write.
  m.raceWith([...m.links(), stored(2, "Josh's link", "https://josh.example.com/", { addedBy: "Josh" })]);
  const data = await addLink({ id: id(3), name: "Dave's link", url: "dave.example.com" }, dave, now, m.storage);
  assert.equal(m.log.conflicts, 1, "the first write was refused");
  assert.deepEqual(data.links.map((l) => l.name), ["Alpha", "Dave's link", "Josh's link"]);
  assert.deepEqual(m.links().map((l) => l.name).sort(), ["Alpha", "Dave's link", "Josh's link"]);
});

test("two first-ever adds at once: the second is applied on top of the first", async () => {
  const m = memory();
  m.raceWith([stored(2, "First", "https://first.com/")]);
  const data = await addLink({ id: id(1), name: "Second", url: "second.com" }, dave, now, m.storage);
  assert.deepEqual(data.links.map((l) => l.name), ["First", "Second"]);
});

test("a write that keeps losing gives up and asks the person to try again", async () => {
  const storage: LinkStorage = { async read() { return { text: JSON.stringify({ version: 1, links: [] }), etag: '"x"' }; }, async write() { throw new LinkStorageConflict("busy"); } };
  await fails(addLink({ id: id(1), name: "x", url: "x.co" }, dave, now, storage), 409, /same moment/);
});

test("edit: changes name, address and note, bumps rev, keeps who added it", async () => {
  const m = memory([stored(1, "Alpha", "https://alpha.com/"), stored(2, "Beta", "https://beta.com/")]);
  const data = await editLink(id(1), { name: "Zulu", url: "zulu.com/x", note: "renamed", rev: 1 }, josh, now, m.storage);
  const zulu = data.links.find((l) => l.id === id(1));
  assert.deepEqual(zulu, { id: id(1), name: "Zulu", url: "https://zulu.com/x", note: "renamed", addedBy: "Dave", addedAt: "2026-10-01T12:00:00.000Z", updatedBy: "Josh", updatedAt: now.toISOString(), rev: 2 });
  assert.deepEqual(data.links.map((l) => l.name), ["Beta", "Zulu"], "re-sorted");
  // Saving the same text again writes nothing, even from a screen that still says rev 1.
  const writes = m.log.writes;
  await editLink(id(1), { name: "Zulu", url: "https://zulu.com/x", note: "renamed", rev: 1 }, josh, now, m.storage);
  assert.equal(m.log.writes, writes);
});

test("edit: a stale screen, a deleted link, a duplicate address and a bad address are all refused", async () => {
  const m = memory([stored(1, "Alpha", "https://alpha.com/", { rev: 3 }), stored(2, "Beta", "https://beta.com/")]);
  await fails(editLink(id(1), { name: "Alpha 2", url: "alpha.com", rev: 2 }, dave, now, m.storage), 409, /changed this link/);
  await fails(editLink(id(9), { name: "x", url: "x.co", rev: 1 }, dave, now, m.storage), 404, /deleted/);
  await fails(editLink(id(1), { name: "Alpha", url: "beta.com", rev: 3 }, dave, now, m.storage), 409, /already saved, as “Beta”/);
  await fails(editLink(id(1), { name: "Alpha", url: "data:text/html,x", rev: 3 }, dave, now, m.storage), 400, /Only web links/);
  await fails(editLink(id(1), { name: "Alpha", url: "alpha.com" }, dave, now, m.storage), 400, /Reload/);
  await fails(editLink(id(1), { name: "Alpha", url: "alpha.com", rev: "3" }, dave, now, m.storage), 400, /Reload/);
  await fails(editLink("../../etc", { name: "x", url: "x.co", rev: 1 }, dave, now, m.storage), 404, /not found/);
  assert.deepEqual(m.links().map((l) => [l.name, l.url, l.rev]), [["Alpha", "https://alpha.com/", 3], ["Beta", "https://beta.com/", 1]], "nothing changed");
});

test("delete: gone at once; deleting one already gone is fine; ids are checked", async () => {
  const m = memory([stored(1, "Alpha", "https://alpha.com/"), stored(2, "Beta", "https://beta.com/")]);
  assert.deepEqual((await deleteLink(id(1), m.storage)).links.map((l) => l.name), ["Beta"]);
  const writes = m.log.writes;
  assert.deepEqual((await deleteLink(id(1), m.storage)).links.map((l) => l.name), ["Beta"]);
  assert.equal(m.log.writes, writes, "nothing written for a second delete");
  await fails(deleteLink("nope", m.storage), 404, /not found/);
  assert.deepEqual(m.links().map((l) => l.name), ["Beta"]);
});

test("an unreadable document is reported, never overwritten", async () => {
  let wrote = false;
  const storage: LinkStorage = { async read() { return { text: "{not json", etag: '"x"' }; }, async write() { wrote = true; } };
  await fails(listLinks(storage), 500, /unreadable/);
  await fails(addLink({ id: id(1), name: "x", url: "x.co" }, dave, now, storage), 500, /unreadable/);
  assert.equal(wrote, false);
});
