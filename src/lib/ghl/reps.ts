// The three people who work the sales desk, with their ids in BOTH systems. No node imports — the desk
// (a client component) may import the names, and the server uses the ids.
//
// GHL user ids read off GHL → Settings → Users on the Creative Cowboys location, Oct 1 2026
// (the site's token has no users.readonly scope, so they cannot be looked up at runtime).
// Override without a deploy: GHL_REP_IDS="Dave:<id>,Josh:<id>,Keaton:<id>" on Vercel.
export type RepName = "Dave" | "Josh" | "Keaton";
export const REP_NAMES: readonly RepName[] = ["Dave", "Josh", "Keaton"] as const;

const DEFAULT_GHL_IDS: Record<RepName, string> = {
  Dave: "zqnRMqxrUZh0qBzF12Re", // dave@creativecowboys.co — Agency admin
  Josh: "m5VMI0ZpKn3kIb1JcMNb", // Joshua Pack, signs in to GHL as login@creativecowboys.co — Agency owner
  Keaton: "MS161OFLMqyNSICle1jw", // keaton@creativecowboys.co — Account admin
};
export const MONDAY_IDS: Record<RepName, string> = { Dave: "39848115", Josh: "39848217", Keaton: "116679004" };

export function ghlRepIds(env = process.env.GHL_REP_IDS): Record<RepName, string> {
  const ids = { ...DEFAULT_GHL_IDS };
  for (const pair of (env || "").split(",")) {
    const [name, id] = pair.split(":").map((s) => s.trim());
    if ((REP_NAMES as readonly string[]).includes(name) && /^[A-Za-z0-9]{10,64}$/.test(id || "")) ids[name as RepName] = id;
  }
  return ids;
}
export const ghlRepName = (userId: string | null | undefined, env?: string): RepName | "" => {
  if (!userId) return "";
  const ids = ghlRepIds(env);
  return (REP_NAMES.find((n) => ids[n] === userId) as RepName | undefined) || "";
};
export const isRepName = (v: unknown): v is RepName => typeof v === "string" && (REP_NAMES as readonly string[]).includes(v);
