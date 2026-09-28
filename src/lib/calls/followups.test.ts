import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFeed, feedKey, feedKeyMatches, mondayDateValue, REPS, utcToZoned, zonedToUtc } from "./followups";

test("eastern time round-trips through Monday's UTC date+time", () => {
  assert.equal(zonedToUtc("2026-09-28", "09:00").toISOString(), "2026-09-28T13:00:00.000Z"); // EDT
  assert.equal(zonedToUtc("2026-12-15", "09:00").toISOString(), "2026-12-15T14:00:00.000Z"); // EST
  assert.deepEqual(mondayDateValue("2026-09-28", "09:00"), { date: "2026-09-28", time: "13:00:00" });
  assert.deepEqual(mondayDateValue("2026-09-28", "21:30"), { date: "2026-09-29", time: "01:30:00" }, "late evening crosses the UTC date line");
  assert.deepEqual(utcToZoned("2026-09-29", "01:30:00"), { date: "2026-09-28", time: "21:30" });
  assert.deepEqual(mondayDateValue("2026-09-28"), { date: "2026-09-28" });
});

test("feed keys are per rep and constant-time checked", () => {
  const k = feedKey("dave", "s3cret");
  assert.equal(k.length, 32);
  assert.notEqual(k, feedKey("josh", "s3cret"));
  assert.equal(feedKeyMatches("dave", k, "s3cret"), true);
  assert.equal(feedKeyMatches("dave", k, "other"), false);
  assert.equal(feedKeyMatches("dave", "", "s3cret"), false);
});

test("the feed emits timed and all-day events and skips closed or undated leads", () => {
  const base = { contact: "Pat", phone: "770-555-0100", email: "pat@example.com", city: "Villa Rica", notes: "Wants a site, budget TBD", updatedAt: "" };
  const ics = buildFeed(REPS[0], [
    { id: "1", name: "Ladybug Hot Sauces", outreach: "Booked followup", nextFollowup: "2026-09-28", nextFollowupTime: "09:00", ...base },
    { id: "2", name: "Arctic Law", outreach: "Call Held", nextFollowup: "2026-09-29", ...base },
    { id: "3", name: "Closed Co", outreach: "Not Interested", nextFollowup: "2026-09-29", ...base },
    { id: "4", name: "No date", outreach: "Replied", nextFollowup: "", ...base },
    { id: "5", name: "Won Client", outreach: "Won", nextFollowup: "2026-09-30", nextFollowupTime: "13:30", ...base },
  ], "https://www.creativecowboys.co", new Date("2026-09-26T12:00:00Z"));
  assert.match(ics, /X-WR-CALNAME:Follow-ups · Dave/);
  assert.match(ics, /UID:followup-1@creativecowboys\.co/);
  assert.match(ics, /DTSTART;TZID=America\/New_York:20260928T090000/);
  assert.match(ics, /DTEND;TZID=America\/New_York:20260928T093000/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260929/);
  assert.match(ics, /DTEND;VALUE=DATE:20260930/);
  assert.doesNotMatch(ics, /Closed Co/);
  assert.doesNotMatch(ics, /No date/);
  assert.match(ics, /SUMMARY:Follow-up: Won Client/, "won clients with a booked call stay on the calendar");
  assert.match(ics, /DTSTART;TZID=America\/New_York:20260930T133000/);
  assert.match(ics, /SUMMARY:Follow-up: Ladybug Hot Sauces/);
  assert.match(ics, /leads\?lead=1/);
  assert.ok(ics.split("\r\n").every((l) => l.length <= 75), "lines are folded");
});
