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
  const unfolded = ics.replace(/\r\n /g, "");
  assert.match(unfolded, /Open on the desk: https:\/\/www\.creativecowboys\.co\/admin\?lead=1\\n|Open on the desk: https:\/\/www\.creativecowboys\.co\/admin\?lead=1\r\n/, "the description links to the desk at /admin");
  assert.match(unfolded, /\r\nURL:https:\/\/www\.creativecowboys\.co\/admin\?lead=1\r\n/, "so does the event's URL");
  assert.doesNotMatch(unfolded, /\/leads/, "nothing new is built with the desk's old address");
  assert.ok(ics.split("\r\n").every((l) => l.length <= 75), "lines are folded");
});

test("the feed skips a lead that is off the call list, whatever its status; other tags change nothing", () => {
  const base = { contact: "Pat", phone: "770-555-0100", email: "pat@example.com", city: "Villa Rica", notes: "", updatedAt: "" };
  const ics = buildFeed(REPS[0], [
    { id: "1", name: "Still Calling Co", outreach: "Booked followup", nextFollowup: "2026-10-05", ...base },
    { id: "2", name: "Tagged Do Not Contact", outreach: "Booked followup", nextFollowup: "2026-10-05", noCallTags: ["do-not-contact"], ...base },
    { id: "3", name: "Tagged Fake", outreach: "", nextFollowup: "2026-10-06", nextFollowupTime: "10:00", noCallTags: ["fake-lead"], ...base },
    { id: "4", name: "Said No", outreach: "Not Interested", nextFollowup: "2026-10-06", ...base },
    { id: "5", name: "Won Yet Tagged", outreach: "Won", nextFollowup: "2026-10-07", noCallTags: ["do-not-contact"], ...base },
    { id: "6", name: "Won Client", outreach: "Won", nextFollowup: "2026-10-07", ...base },
    { id: "7", name: "Untagged Reply", outreach: "Replied", nextFollowup: "2026-10-08", noCallTags: [], ...base },
    { id: "8", name: "Wrong Number", outreach: "Bad contact number", nextFollowup: "2026-10-08", ...base },
  ], "https://www.creativecowboys.co", new Date("2026-10-01T12:00:00Z"));
  const summaries = ics.replace(/\r\n /g, "").split("\r\n").filter((l) => l.startsWith("SUMMARY:")).map((l) => l.slice("SUMMARY:Follow-up: ".length));
  assert.deepEqual(summaries, ["Still Calling Co", "Won Client", "Untagged Reply"]);
});

test("an In progress lead with a follow-up is on the rep's calendar, timed or all-day; without a date it is not", () => {
  const base = { contact: "Pat", phone: "770-555-0100", email: "pat@example.com", city: "Villa Rica", notes: "", updatedAt: "" };
  const ics = buildFeed(REPS[0], [
    { id: "wipTimed0000000000000", name: "Working Timed", outreach: "In progress", nextFollowup: "2026-10-09", nextFollowupTime: "09:30", ...base },
    { id: "wipAllDay000000000000", name: "Working All Day", outreach: "In progress", nextFollowup: "2026-10-12", ...base },
    { id: "wipNoDate000000000000", name: "Working No Date", outreach: "In progress", nextFollowup: "", ...base },
    { id: "wipSpelled00000000000", name: "Working Hand Spelled", outreach: "In Progress", nextFollowup: "2026-10-13", ...base },
    { id: "4", name: "Recorded As Contacted", outreach: "Contacted", nextFollowup: "2026-10-14", ...base }, // what the Monday board holds for the same outcome
  ], "https://www.creativecowboys.co", new Date("2026-10-02T12:00:00Z"));
  const unfolded = ics.replace(/\r\n /g, "");
  const summaries = unfolded.split("\r\n").filter((l) => l.startsWith("SUMMARY:")).map((l) => l.slice("SUMMARY:Follow-up: ".length));
  assert.deepEqual(summaries, ["Working Timed", "Working All Day", "Working Hand Spelled", "Recorded As Contacted"]);
  assert.match(unfolded, /UID:followup-wipTimed0000000000000@creativecowboys\.co\r\n[\s\S]*?DTSTART;TZID=America\/New_York:20261009T093000\r\nDTEND;TZID=America\/New_York:20261009T100000/);
  assert.match(unfolded, /DTSTART;VALUE=DATE:20261012\r\nDTEND;VALUE=DATE:20261013/);
  assert.match(unfolded, /Status: In progress\\n/, "the event says where the lead stands");
});
