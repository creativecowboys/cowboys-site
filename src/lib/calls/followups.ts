import { createHmac, timingSafeEqual } from "node:crypto";
import type { CallLead } from "@/app/leads/types";

// Per-rep follow-up calendars (Dave, Sep 26 2026): each of Dave / Josh / Keaton subscribes to a private
// iCalendar feed of the leads they own that have a Next Follow-up on the Giveaway Leads board. Pure
// helpers here (unit-tested); the routes do the Monday reads.
import { TZ, zonedToUtc } from "./followup-time";
import { isOffCallList } from "./roster";
import { deskUrl } from "@/lib/desk-path";
export { TZ, HOUR_OPTIONS, prettyTime, mondayDateValue, utcToZoned, zonedToUtc } from "./followup-time";
export const REPS = [
  { slug: "dave", name: "Dave", mondayId: "39848115", email: "dave@creativecowboys.co" },
  { slug: "josh", name: "Josh", mondayId: "39848217", email: "josh@creativecowboys.co" },
  { slug: "keaton", name: "Keaton", mondayId: "116679004", email: "keaton@creativecowboys.co" },
] as const;
export type Rep = (typeof REPS)[number];
export const repBySlug = (slug: string) => REPS.find((r) => r.slug === slug) || null;
export const repByEmail = (email: string) => REPS.find((r) => r.email === email.toLowerCase()) || null;

/** Feed key: HMAC of the rep slug under the site secret, so nothing has to be stored. Rotating NEXTAUTH_SECRET rotates every feed. */
export function feedKey(slug: string, secret = process.env.NEXTAUTH_SECRET || ""): string {
  return createHmac("sha256", secret).update(`followups-feed:${slug}`).digest("base64url").slice(0, 32);
}
export function feedKeyMatches(slug: string, key: string, secret = process.env.NEXTAUTH_SECRET || ""): boolean {
  const a = Buffer.from(feedKey(slug, secret)); const b = Buffer.from(key || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
const fold = (line: string) => { const out: string[] = []; let s = line; while (s.length > 72) { out.push(s.slice(0, 72)); s = " " + s.slice(72); } out.push(s); return out.join("\r\n"); };
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const VTIMEZONE = ["BEGIN:VTIMEZONE", "TZID:America/New_York", "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0400", "TZNAME:EDT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT", "BEGIN:STANDARD", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0500", "TZNAME:EST", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD", "END:VTIMEZONE"];

export type FollowupLead = Pick<CallLead, "id" | "name" | "contact" | "phone" | "email" | "city" | "nextFollowup" | "outreach" | "notes" | "updatedAt"> & { nextFollowupTime?: string; noCallTags?: string[] };

/** Build the iCalendar text for one rep. Leads without a follow-up date are skipped, and so are dead leads: Bad contact number, and anything off the
 *  call list (Not Interested, or a `do-not-contact` / `fake-lead` tag in GoHighLevel — see isOffCallList in ./roster.ts). Won leads stay. */
export function buildFeed(rep: Rep, leads: FollowupLead[], origin: string, now = new Date()): string {
  // Won stays in: a handed-off client with a booked call (kickoff, check-in) is a real appointment (Dave, Sep 28 2026).
  const closed = new Set(["not interested", "bad contact number"]);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Creative Cowboys//Follow-ups//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:Follow-ups · ${rep.name}`, `X-WR-TIMEZONE:${TZ}`, "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H", ...VTIMEZONE];
  for (const lead of leads) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lead.nextFollowup) || closed.has(lead.outreach.trim().toLowerCase()) || isOffCallList(lead)) continue;
    const desc = [
      lead.contact && `Contact: ${lead.contact}`, lead.phone && `Phone: ${lead.phone}`, lead.email && `Email: ${lead.email}`, lead.city && `Location: ${lead.city}`,
      lead.outreach && `Status: ${lead.outreach}`, lead.notes && `Notes: ${lead.notes.slice(0, 600)}`, `Open on the desk: ${deskUrl(origin, { lead: lead.id })}`,
    ].filter(Boolean).join("\n");
    const ev = ["BEGIN:VEVENT", `UID:followup-${lead.id}@creativecowboys.co`, `DTSTAMP:${stamp(now)}`, `SUMMARY:${esc(`Follow-up: ${lead.name}`)}`, `DESCRIPTION:${esc(desc)}`, `URL:${deskUrl(origin, { lead: lead.id })}`, "CATEGORIES:Follow-up"];
    if (lead.nextFollowupTime && /^\d{2}:\d{2}$/.test(lead.nextFollowupTime)) {
      const start = lead.nextFollowup.replace(/-/g, "") + "T" + lead.nextFollowupTime.replace(":", "") + "00";
      const [h, m] = lead.nextFollowupTime.split(":").map(Number); const endMins = h * 60 + m + 30;
      const end = lead.nextFollowup.replace(/-/g, "") + "T" + `${String(Math.floor(endMins / 60)).padStart(2, "0")}${String(endMins % 60).padStart(2, "0")}00`;
      ev.push(`DTSTART;TZID=${TZ}:${start}`, `DTEND;TZID=${TZ}:${end}`, "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Follow-up call", "TRIGGER:-PT15M", "END:VALARM");
    } else {
      const d = lead.nextFollowup.replace(/-/g, ""); const next = new Date(Date.UTC(Number(lead.nextFollowup.slice(0, 4)), Number(lead.nextFollowup.slice(5, 7)) - 1, Number(lead.nextFollowup.slice(8, 10)) + 1)).toISOString().slice(0, 10).replace(/-/g, "");
      ev.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`, "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Follow-up call today", "TRIGGER;VALUE=DATE-TIME:" + stamp(zonedToUtc(lead.nextFollowup, "08:30")), "END:VALARM");
    }
    ev.push("END:VEVENT");
    lines.push(...ev);
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
