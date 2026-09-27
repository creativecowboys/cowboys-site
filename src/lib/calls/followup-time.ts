// Follow-up time helpers: no Node imports, safe to import from client components (the desk) and the server.
export const TZ = "America/New_York";

/** Offset (minutes east of UTC) of a zone at a given UTC instant. */
function offsetMinutes(utc: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(utc);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return Math.round((asUtc - utc.getTime()) / 60000);
}
/** "2026-09-28" + "09:00" in `tz` → UTC Date. */
export function zonedToUtc(date: string, time: string, tz = TZ): Date {
  const [y, m, d] = date.split("-").map(Number); const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const utc = guess - offsetMinutes(new Date(guess), tz) * 60000;
  return new Date(utc - (offsetMinutes(new Date(utc), tz) - offsetMinutes(new Date(guess), tz)) * 60000);
}
/** UTC "HH:MM:SS" on `date` (Monday stores date-column times in UTC) → local "HH:MM" and possibly shifted local date. */
export function utcToZoned(date: string, timeUtc: string, tz = TZ): { date: string; time: string } {
  const [y, m, d] = date.split("-").map(Number); const [hh, mm] = timeUtc.split(":").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(utc).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
/** Monday date-column value for a local date (+ optional local time). */
export function mondayDateValue(date: string, time?: string): { date: string; time?: string } {
  if (!time) return { date };
  const utc = zonedToUtc(date, time);
  return { date: utc.toISOString().slice(0, 10), time: utc.toISOString().slice(11, 19) };
}
export const HOUR_OPTIONS = Array.from({ length: 20 }, (_, i) => { const mins = 8 * 60 + i * 30; const h = Math.floor(mins / 60), m = mins % 60; return { value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, label: `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}` }; });
export const prettyTime = (t: string) => HOUR_OPTIONS.find((o) => o.value === t)?.label || t;
