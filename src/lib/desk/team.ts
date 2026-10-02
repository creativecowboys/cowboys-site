import { ghlRepIds, MONDAY_IDS, REP_NAMES, type RepName } from "@/lib/ghl/reps";

// The people who work the Onboarding and Clients tabs. On GoHighLevel an owner is stored on the contact
// BY NAME (Desk Onboarding Owner, Desk Build Owner, Desk Account Manager, Desk Sales Owner), so someone
// can own a client without having a GoHighLevel user — Madison runs onboarding and has none on file.
// A GoHighLevel user id is only needed to author a note or a task AS that person; without one the note
// is saved by the integration and still carries the person's name.
//
// No deploy needed to change the roster:
//   DESK_EXTRA_TEAM="Name:email,Name:email"      add people (name shown on the desk, their sign-in email)
//   GHL_REP_IDS="Madison:<GoHighLevel user id>"   give anyone a GoHighLevel user id (same variable the Sales tab reads)
//   ONBOARDING_EXTRA_OWNERS="Madison:<Monday id>" already set on Vercel; only read here to map Monday people in the import
export type TeamMember = { name: string; email: string; ghlUserId: string; mondayId: string };
export type Actor = { name: string; email: string; ghlUserId: string };

const BASE: { name: string; email: string }[] = [
  { name: "Dave", email: "dave@creativecowboys.co" },
  { name: "Josh", email: "josh@creativecowboys.co" },
  { name: "Keaton", email: "keaton@creativecowboys.co" },
  { name: "Madison", email: "madison@creativecowboys.co" },
];
const NAME = /^[A-Za-z][A-Za-z .'-]{0,39}$/;
const pairs = (env: string | undefined): [string, string][] =>
  (env || "").split(",").map((p) => p.split(":").map((s) => s.trim())).filter((p) => p.length >= 2 && p[0] && p[1]).map((p) => [p[0], p[1]] as [string, string]);

export function deskTeam(env: Record<string, string | undefined> = process.env): TeamMember[] {
  const people = [...BASE];
  for (const [name, email] of pairs(env.DESK_EXTRA_TEAM)) {
    if (NAME.test(name) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !people.some((p) => p.name.toLowerCase() === name.toLowerCase())) people.push({ name, email: email.toLowerCase() });
  }
  const reps = ghlRepIds(env.GHL_REP_IDS);
  const ghlExtra = new Map(pairs(env.GHL_REP_IDS).filter(([, id]) => /^[A-Za-z0-9]{10,64}$/.test(id)));
  const mondayExtra = new Map(pairs(env.ONBOARDING_EXTRA_OWNERS).filter(([, id]) => /^\d{1,12}$/.test(id)));
  return people.map((p) => {
    const rep = (REP_NAMES as readonly string[]).includes(p.name) ? (p.name as RepName) : null;
    return { name: p.name, email: p.email, ghlUserId: rep ? reps[rep] : ghlExtra.get(p.name) || "", mondayId: rep ? MONDAY_IDS[rep] : mondayExtra.get(p.name) || "" };
  });
}

/** Owner choices for the desk's selects. On GoHighLevel the "id" of an owner is simply the name. */
export const teamOwners = (): { id: string; name: string }[] => deskTeam().map((m) => ({ id: m.name, name: m.name }));
export const isTeamName = (v: unknown): v is string => typeof v === "string" && deskTeam().some((m) => m.name === v);
export const memberByName = (name: string): TeamMember | null => deskTeam().find((m) => m.name === name) || null;
export const memberByGhlUser = (userId: string | null | undefined): TeamMember | null => (userId ? deskTeam().find((m) => m.ghlUserId && m.ghlUserId === userId) || null : null);
/** A Monday person id (people column) → the desk name. Used only by the Monday → GoHighLevel import. */
export const nameForMondayId = (id: string): string => deskTeam().find((m) => m.mondayId && m.mondayId === id)?.name || "";

/**
 * Who this sign-in is, for the desk's top bar (the name beside "Sign out"). The same name a note is saved under.
 * Null when the session carries no address: the bar then shows the Sign out control alone.
 */
export function signedInAs(email: string | null | undefined): { name: string; email: string } | null {
  const actor = actorFor(email);
  return actor.email ? { name: actor.name, email: actor.email } : null;
}

/** Who is signed in, for note authorship. An address outside the roster still gets a readable name; no session email = "Team". */
export function actorFor(email: string | null | undefined): Actor {
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { name: "Team", email: "", ghlUserId: "" };
  const member = deskTeam().find((m) => m.email === clean);
  if (member) return { name: member.name, email: clean, ghlUserId: member.ghlUserId };
  const local = clean.split("@")[0].replace(/[^a-z]+/g, " ").trim().split(" ")[0] || "team";
  return { name: local.charAt(0).toUpperCase() + local.slice(1), email: clean, ghlUserId: "" };
}
