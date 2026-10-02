import { CallDeskError } from "@/lib/calls/validation";
import { createCustomField, GhlError, listCustomFields, setCustomFieldOptions, type GhlFieldDef, type NewFieldDef } from "./client";

// Contact custom fields the sales desk lives on. The desk never hard-codes a GHL field id: every call
// resolves the definitions from GHL (cached 10 min) and matches by name, so Dave can add a Lead Source
// option in GHL (Settings → Custom Fields → Lead Source) and the desk shows it with no deploy.
//
// Two fields already existed on the location (created by the LSE audit flow, Sep 10 2026) and are reused:
// "Audit Score" (NUMERICAL) and "Audit Report URL" (TEXT). The rest are created by ensureSalesFields()
// — POST /api/team/ghl/setup, owner-only — or by hand in GHL with exactly these names.
export type SalesFieldKey = "leadSource" | "outreach" | "interest" | "lastContact" | "nextFollowup" | "nextFollowupTime" | "quotedMonthly" | "interestedIn" | "salesNotes" | "mondayLeadId" | "auditScore" | "auditReport";

export const LEAD_SOURCE_OPTIONS = ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] as const;
export const LEAD_SOURCE = { giveaway: "The Big Giveaway", ebook: "Ebook download", website: "Website form", facebook: "Facebook", referral: "Referral", other: "Other" } as const;
/** Outreach labels. The first 11 are byte-identical to the Monday Giveaway Leads "Outreach Status" column (read off the board
 *  Oct 1 2026) so the migration maps 1:1. "In progress" is the desk's own (Dave, Oct 2 2026: a lead the rep talked to and is
 *  still working); it sits last because that is where it is appended on the live field — see ensureSalesOptions below. The
 *  desk's call outcomes write five of these (src/lib/calls/outcomes.ts); the rest are set by hand in GHL. */
export const OUTREACH_OPTIONS = ["Not Contacted", "Contacted", "Replied", "Call Booked", "Call Held", "No answer / left voicemail", "Booked followup", "Proposal Sent", "Not Interested", "Bad contact number", "Won", "In progress"] as const;
export const INTEREST_OPTIONS = ["Cold", "Warm", "Hot"] as const;

export const SALES_FIELDS: Record<SalesFieldKey, NewFieldDef & { reuse?: boolean }> = {
  leadSource: { name: "Lead Source", dataType: "SINGLE_OPTIONS", options: [...LEAD_SOURCE_OPTIONS], position: 201 },
  outreach: { name: "Outreach Status", dataType: "SINGLE_OPTIONS", options: [...OUTREACH_OPTIONS], position: 202 },
  interest: { name: "Interest", dataType: "SINGLE_OPTIONS", options: [...INTEREST_OPTIONS], position: 203 },
  lastContact: { name: "Last Contact", dataType: "DATE", position: 204 },
  nextFollowup: { name: "Next Follow-up", dataType: "DATE", position: 205 },
  nextFollowupTime: { name: "Next Follow-up Time", dataType: "TEXT", placeholder: "HH:MM Eastern, blank = all day", position: 206 },
  quotedMonthly: { name: "Quoted Monthly", dataType: "MONETORY", position: 207 },
  interestedIn: { name: "Interested In", dataType: "TEXT", position: 208 },
  salesNotes: { name: "Sales Notes", dataType: "LARGE_TEXT", position: 209 },
  mondayLeadId: { name: "Monday Lead ID", dataType: "TEXT", placeholder: "Giveaway Leads item id this contact was imported from", position: 210 },
  auditScore: { name: "Audit Score", dataType: "NUMERICAL", reuse: true },
  auditReport: { name: "Audit Report URL", dataType: "TEXT", reuse: true },
};

/**
 * Contact fields the PUBLIC intake routes write: the playbook (ebook) form (src/lib/ghl-playbook.ts) and the Big Giveaway entry
 * (src/lib/ghl-giveaway.ts), both made on the location in September 2026. The Sales desk only READS them, to show a rep what the
 * person told us on the form (Dave, Oct 2 2026: "I can't see what he was interested in from our page"; see src/lib/calls/told.ts).
 * They are deliberately NOT in SALES_FIELDS: the field setup never creates them, never edits them and never adds an option to
 * them, and nothing on the desk writes to them. The intake routes keep writing them by id, as they always have.
 */
export type IntakeFieldKey = "playbookTrade" | "playbookCrew" | "playbookJob" | "playbookHasWebsite" | "playbookTier" | "playbookCity" | "giveawayBusinessType" | "giveawaySource";
export const INTAKE_FIELDS: Record<IntakeFieldKey, string> = {
  playbookTrade: "Playbook Trade", playbookCrew: "Playbook Crew Size", playbookJob: "Playbook Typical Job", playbookHasWebsite: "Playbook Has Website",
  playbookTier: "Playbook Tier", playbookCity: "Playbook City", giveawayBusinessType: "Giveaway Business Type", giveawaySource: "Giveaway Source",
};

export type ResolvedField = { id: string; name: string; dataType: string; options: string[] };
/** Every contact field the Sales desk reads: its own (SALES_FIELDS, which it also writes) and the intake fields (read only). */
export type SalesFields = Partial<Record<SalesFieldKey | IntakeFieldKey, ResolvedField>>;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const fieldName = (key: SalesFieldKey | IntakeFieldKey): string => (key in SALES_FIELDS ? SALES_FIELDS[key as SalesFieldKey].name : INTAKE_FIELDS[key as IntakeFieldKey]);
/** A definition's options as plain text. Anything else GoHighLevel might put in that list is left out rather than turned into text
 *  ("[object Object]" is not an option), so a list the desk cannot read comes out empty and is treated as "no list". */
const textOptions = (d: Pick<GhlFieldDef, "picklistOptions"> | undefined): string[] => (Array.isArray(d?.picklistOptions) ? (d.picklistOptions as unknown[]) : []).filter((o): o is string => typeof o === "string");
/** Match a GHL definition to a catalog entry by field key first, then by normalized name. */
export function matchField(defs: GhlFieldDef[], key: SalesFieldKey | IntakeFieldKey): GhlFieldDef | undefined {
  const want = fieldName(key);
  const wantKey = `contact.${norm(want)}`;
  return defs.find((d) => d.fieldKey && norm(d.fieldKey) === norm(wantKey)) || defs.find((d) => norm(d.name) === norm(want));
}
export function resolveFromDefs(defs: GhlFieldDef[]): SalesFields {
  const out: SalesFields = {};
  for (const key of [...Object.keys(SALES_FIELDS), ...Object.keys(INTAKE_FIELDS)] as (SalesFieldKey | IntakeFieldKey)[]) {
    const d = matchField(defs, key);
    if (d) out[key] = { id: d.id, name: d.name, dataType: d.dataType, options: textOptions(d) };
  }
  return out;
}
/** Live definitions (cached). Throws a 503 CallDeskError when GHL can't be read, so the desk says why. */
export async function salesFields(fresh = false): Promise<SalesFields> {
  const defs = await listCustomFields(fresh);
  return resolveFromDefs(defs);
}
/**
 * Lead Source field id for the PUBLIC intake routes (giveaway, playbook, website forms). Best effort and
 * bounded: uses the warm cache when there is one, otherwise ONE 3-second read with no retries, and after
 * a failure it stops asking for a minute — a GHL slowdown must never hold up a visitor's form.
 */
let intakeBlockedUntil = 0;
export async function leadSourceIdForIntake(): Promise<string | undefined> {
  if (Date.now() < intakeBlockedUntil) return undefined;
  try { return resolveFromDefs(await listCustomFields(false, { timeoutMs: 3000, retries: 0 })).leadSource?.id; }
  catch { intakeBlockedUntil = Date.now() + 60_000; return undefined; }
}
export const resetIntakeLookup = () => { intakeBlockedUntil = 0; };
export function requireField(fields: SalesFields, key: SalesFieldKey): ResolvedField {
  const f = fields[key];
  if (!f) throw new CallDeskError(`The GoHighLevel custom field "${SALES_FIELDS[key].name}" does not exist yet. An owner runs Set up GoHighLevel fields on the desk (POST /api/team/ghl/setup), or creates it in GHL Settings → Custom Fields with that exact name.`, 503);
  return f;
}
/** Lead Source options come from GHL, never from code — the catalog list only seeds the field on creation. */
export const leadSourceOptions = (fields: SalesFields): string[] => fields.leadSource?.options || [];

// ───────────────────────────── dropdown options ─────────────────────────────
/** The option on a live dropdown that matches a label: the exact spelling when it is there, otherwise the same words in another
 *  capitalisation. GoHighLevel keeps whatever was typed when the option was made, so "In Progress" added by hand is the same
 *  option as the desk's "In progress". */
export function liveOption(options: readonly string[], label: string): string | undefined {
  if (options.includes(label)) return label;
  const want = label.trim().toLowerCase();
  return options.find((o) => o.trim().toLowerCase() === want);
}
/** The dropdowns whose values the desk writes from a fixed list in code. Lead Source is deliberately NOT here: its options are
 *  Dave's to edit in GoHighLevel (the catalog list only seeds the field), so nothing in this file ever adds to it. */
export const CODE_OWNED_DROPDOWNS = ["outreach", "interest"] as const satisfies readonly SalesFieldKey[];
export type CodeOwnedDropdown = (typeof CODE_OWNED_DROPDOWNS)[number];
/** The options the desk itself writes to those dropdowns — the only ones the option step below ever adds. Outreach Status: the
 *  five call outcomes (src/lib/calls/outcomes.ts, pinned by outcomes.test.ts) and Won, which a handoff sets. The other Outreach
 *  labels came over from the Monday board and are set by hand in GoHighLevel: if an owner removes one of those, it stays removed. */
export const WRITTEN_OPTIONS: Record<CodeOwnedDropdown, readonly string[]> = {
  outreach: ["In progress", "No answer / left voicemail", "Booked followup", "Not Interested", "Bad contact number", "Won"],
  interest: INTEREST_OPTIONS,
};
/** Options the desk writes that a live dropdown does not have yet (another capitalisation counts as having it). */
const optionsMissingFrom = (key: CodeOwnedDropdown, live: readonly string[]): string[] => WRITTEN_OPTIONS[key].filter((o) => !liveOption(live, o));
const isCodeOwned = (key: SalesFieldKey): key is CodeOwnedDropdown => (CODE_OWNED_DROPDOWNS as readonly SalesFieldKey[]).includes(key);
/** What the desk says instead of writing a status GoHighLevel has no option for. Plain enough to read out to an owner. */
export const missingOptionMessage = (fieldName: string, label: string): string =>
  `"${label}" is not an option on the "${fieldName}" field in GoHighLevel yet, so nothing was saved. An owner needs to add it: run the GoHighLevel field setup for the sales dropdowns (POST /api/team/ghl/setup with scope "sales-options"), or add the option by hand in GoHighLevel under Settings, Custom Fields, ${fieldName}. Until then, choose a different outcome.`;

export type SetupReport = { present: { key: SalesFieldKey; name: string; id: string; missingOptions?: string[] }[]; created: { key: SalesFieldKey; name: string; id: string }[]; missing: { key: SalesFieldKey; name: string; dataType: string; options?: string[] }[]; failed: { key: SalesFieldKey; name: string; error: string }[]; dryRun: boolean };
/** Idempotent: creates whatever is missing (unless dryRun), never edits an existing field or its options. A field that exists
 *  but lacks an option the desk writes is listed with `missingOptions`; adding those is a separate call (ensureSalesOptions). */
export async function ensureSalesFields(dryRun = true): Promise<SetupReport> {
  const defs = await listCustomFields(true);
  const report: SetupReport = { present: [], created: [], missing: [], failed: [], dryRun };
  for (const key of Object.keys(SALES_FIELDS) as SalesFieldKey[]) {
    const def = SALES_FIELDS[key];
    const have = matchField(defs, key);
    if (have) {
      const live = textOptions(have); // an empty or unreadable list says nothing about what is missing
      const lacking = live.length && isCodeOwned(key) ? optionsMissingFrom(key, live) : [];
      report.present.push(lacking.length ? { key, name: have.name, id: have.id, missingOptions: lacking } : { key, name: have.name, id: have.id });
      continue;
    }
    if (dryRun) { report.missing.push({ key, name: def.name, dataType: def.dataType, options: def.options }); continue; }
    try {
      const created = await createCustomField({ name: def.name, dataType: def.dataType, options: def.options, placeholder: def.placeholder, position: def.position });
      report.created.push({ key, name: created.name || def.name, id: created.id });
      await new Promise((r) => setTimeout(r, 150));
    } catch (e) { report.failed.push({ key, name: def.name, error: e instanceof Error ? e.message : String(e) }); }
  }
  return report;
}

/**
 * One row per code-owned dropdown. `status`: complete = it has every option the desk writes · would-add = a dry run found
 * options to add · added = added, and read back from GoHighLevel · check = something needs a person to look at the field in
 * GoHighLevel (see `detail`) · failed = the option is not on the field (refused, not applied, or an option was lost) ·
 * skipped = nothing was sent to this field (see `detail`).
 */
export type OptionRow = {
  key: SalesFieldKey; name: string; id: string; status: "complete" | "would-add" | "added" | "check" | "failed" | "skipped";
  /** The options GoHighLevel had when this ran, in its own order. */
  live: string[];
  /** Options the desk writes that were missing — the only things this call ever adds. */
  add: string[];
  /** Dry run: the list that would be sent. Real run: the list GoHighLevel holds afterwards, read back (empty when it could not be read back). */
  after: string[];
  /** Real run only: options that were there before and are not there now. Anything here needs putting back by hand. */
  lost?: string[];
  /** Options GoHighLevel already has under another capitalisation: not added a second time. */
  spelled?: { want: string; live: string }[];
  detail: string;
};
export type OptionsReport = { dryRun: boolean; scope: "sales-options"; fields: OptionRow[]; missingFields: string[]; summary: string[]; untouched: string };
// The owner reads this report through a browser tool that blanks anything shaped like a query string, so every piece of text
// that did not come from this file (GoHighLevel's error text, a field's name, an option's label) is stripped of those characters.
const plain = (text: string) => text.replace(/[=?&]/g, " ").replace(/\s+/g, " ").trim().replace(/[.\s]+$/, "").slice(0, 300);
const quoted = (list: readonly string[]) => list.map((o) => `"${plain(o)}"`).join(", ");
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const byHand = (name: string, add: readonly string[]) => `GoHighLevel, Settings, Custom Fields, ${plain(name)}, Edit, add ${quoted(add)} spelled exactly like that, Save. The desk reads the option list from GoHighLevel, so no deploy is needed.`;
const uniq = (list: readonly string[]) => list.filter((o, i) => list.indexOf(o) === i);
const errorText = (e: unknown) => plain(e instanceof Error ? e.message : String(e));

/**
 * Adds the options the desk writes to its own dropdowns when GoHighLevel does not have them yet (Oct 2 2026: "In progress"
 * on Outreach Status). Dry run by default: it then only reports which option would be added to which field.
 *
 * Narrow on purpose. It looks at CODE_OWNED_DROPDOWNS and nothing else — never Lead Source, never a field outside the sales
 * catalog — and only at a field that still carries its catalog name, so never an "LSE …" or "Desk …" field. It only ever ADDS,
 * and only what WRITTEN_OPTIONS lists: the list it sends is what the field has now, in the field's own order, with the missing
 * options appended, so nothing is renamed, moved or removed. It will not touch a field that is not a dropdown, one GoHighLevel
 * returned no options for, or one whose options did not come back as plain text (sending a list would replace options it
 * cannot see). The list is read again right before a second field is changed. A failure is reported, not thrown, and is not
 * retried here (the client re-sends once only when GoHighLevel answers 429, which means it did nothing); after any result
 * that is not a clean add, nothing further is sent in that run. The report then says how to add the option by hand.
 */
export async function ensureSalesOptions(dryRun = true, opts: { settleMs?: number } = {}): Promise<OptionsReport> {
  const settleMs = opts.settleMs ?? 1500;
  let defs: GhlFieldDef[];
  try { defs = await listCustomFields(true); }
  catch (e) { throw new CallDeskError(`GoHighLevel's custom fields could not be read (${errorText(e)}). Nothing was changed.`, e instanceof CallDeskError ? e.status : 502); }
  const report: OptionsReport = { dryRun, scope: "sales-options", fields: [], missingFields: [], summary: [], untouched: `Only ${CODE_OWNED_DROPDOWNS.map((k) => SALES_FIELDS[k].name).join(" and ")} are looked at, and only for the options the desk itself writes. ${SALES_FIELDS.leadSource.name} is never changed from here: its options are managed in GoHighLevel.` };
  /** What can be said about one field from its definition: its options, what is missing, and any reason not to touch it. */
  const plan = (key: CodeOwnedDropdown, have: GhlFieldDef) => {
    // The list that goes back must be the list that came in. Anything but plain text options cannot be reproduced faithfully, so such a field is never sent a list.
    const raw = have.picklistOptions as unknown;
    const readable = raw === undefined || raw === null || (Array.isArray(raw) && raw.every((o) => typeof o === "string"));
    const live = readable ? textOptions(have) : [];
    const name = plain(have.name);
    let skip = "";
    if (norm(have.name) !== norm(SALES_FIELDS[key].name)) skip = `The field GoHighLevel holds under the key of "${SALES_FIELDS[key].name}" is called "${name}" now; it is not the desk's to change, so it was not touched.`;
    else if (have.dataType !== "SINGLE_OPTIONS") skip = `"${name}" is a ${plain(String(have.dataType))} field in GoHighLevel, not a dropdown; not touched.`;
    else if (!readable) skip = `GoHighLevel returned the options of "${name}" in a form this call does not understand, so it was not touched. Look at the field in GoHighLevel (Settings, Custom Fields, ${name}). The desk writes: ${quoted(WRITTEN_OPTIONS[key])}.`;
    else if (!live.length) skip = `GoHighLevel returned no options for "${name}". Sending a list would replace options this call cannot see, so it was not touched. Look at the field in GoHighLevel.`;
    const add = skip ? [] : optionsMissingFrom(key, live);
    const spelled = skip ? [] : WRITTEN_OPTIONS[key].map((want) => ({ want, live: liveOption(live, want) || "" })).filter((x) => x.live && x.live !== x.want);
    return { live, add, spelled, skip, name };
  };
  let sent = 0;      // PUTs sent in this run
  let stopped = "";  // set by the first result that is not a clean add: nothing further is sent after it
  for (const key of CODE_OWNED_DROPDOWNS) {
    let have = matchField(defs, key);
    if (!have) {
      report.missingFields.push(SALES_FIELDS[key].name);
      report.summary.push(`"${SALES_FIELDS[key].name}" does not exist in GoHighLevel yet. Create it first with the plain field setup (POST /api/team/ghl/setup, no scope).`);
      continue;
    }
    let p = plan(key, have);
    const row: OptionRow = { key, name: have.name, id: have.id, status: "complete", live: p.live, add: p.add, after: [...p.live, ...p.add], detail: "", ...(p.spelled.length ? { spelled: p.spelled } : {}) };
    report.fields.push(row);
    const settle = (status: OptionRow["status"], detail: string) => { row.status = status; row.detail = detail; report.summary.push(detail); };
    const describe = () => {
      row.live = p.live; row.add = p.add; row.after = [...p.live, ...p.add];
      if (p.spelled.length) row.spelled = p.spelled; else delete row.spelled;
      if (p.skip) { settle("skipped", p.skip); return true; }
      if (!p.add.length) { settle("complete", `"${p.name}" already has every option the desk writes (${count(p.live.length, "option")}).`); return true; }
      return false;
    };
    if (describe()) continue;
    if (dryRun) { settle("would-add", `Would add ${quoted(p.add)} to "${p.name}" (${count(p.live.length, "option")} now, ${row.after.length} after). Nothing is renamed, reordered or removed.`); continue; }
    if (stopped) { row.after = p.live; settle("skipped", `Not attempted: ${stopped} ${quoted(p.add)} ${p.add.length === 1 ? "is" : "are"} still missing from "${p.name}".`); continue; }
    if (sent > 0) {
      // Time has passed since the first read (a PUT, its read-backs, a pause). Send back the list the field has NOW, so an option added in GoHighLevel in the meantime is not dropped.
      try { defs = await listCustomFields(true); } catch (e) { row.after = p.live; stopped = `"${p.name}" could not be read again before changing it.`; settle("skipped", `Not attempted: the field list could not be read again (${errorText(e)}). ${quoted(p.add)} ${p.add.length === 1 ? "is" : "are"} still missing from "${p.name}".`); continue; }
      const again = defs.find((d) => d.id === row.id);
      if (!again) { row.after = p.live; stopped = `"${p.name}" was not in the list GoHighLevel returned the second time.`; settle("skipped", `Not attempted: ${stopped}`); continue; }
      have = again; p = plan(key, have);
      if (describe()) continue;
    }
    const before = have;
    const toSend = [...p.live, ...p.add];
    let error: unknown = null;
    sent++;
    try { await setCustomFieldOptions(before, toSend); } catch (e) { error = e; }
    const answeredNo = error instanceof GhlError;   // GoHighLevel answered, and the answer was no
    const noAnswer = !!error && !answeredNo;         // a timeout or a dropped connection: it may still have applied the change
    // What GoHighLevel holds now decides the outcome — not the answer to the PUT, which is unproven and may have timed out after applying.
    const readBack = async () => {
      const def = (await listCustomFields(true)).find((d) => d.id === before.id);
      if (!def) throw new Error("the field was not in the list GoHighLevel returned");
      return def;
    };
    let nowDef: GhlFieldDef;
    try {
      nowDef = await readBack();
      if (p.add.some((o) => !liveOption(textOptions(nowDef), o)) && !answeredNo && settleMs > 0) { await new Promise((r) => setTimeout(r, settleMs)); nowDef = await readBack(); }
    } catch (e) {
      row.after = [];
      stopped = `the change to "${p.name}" could not be confirmed.`;
      settle("check", `Sent ${quoted(p.add)} to "${p.name}"${error ? `, GoHighLevel ${answeredNo ? "answered" : "did not answer"} (${errorText(error)}),` : ""} and the field could not be read back afterwards (${errorText(e)}). What it holds now is not known: run the dry run again to see.`);
      continue;
    }
    const now = textOptions(nowDef);
    row.after = now;
    const lost = p.live.filter((o) => !now.includes(o));
    const notAdded = p.add.filter((o) => !liveOption(now, o));
    const twice = uniq(now.filter((o, i) => now.indexOf(o) !== i));
    const moved = uniq(now.filter((o) => p.live.includes(o))).join("\n") !== uniq(p.live).join("\n"); // the options it had, in the order it has them now
    const changed = [
      nowDef.name !== before.name ? `it is now called "${plain(nowDef.name)}"` : "",
      nowDef.dataType !== before.dataType ? `its type is now ${plain(String(nowDef.dataType))}` : "",
      typeof before.position === "number" && typeof nowDef.position === "number" && nowDef.position !== before.position ? `its position went from ${before.position} to ${nowDef.position}` : "",
    ].filter(Boolean);
    const had = `The ${count(p.live.length, "option")} it had ${p.live.length === 1 ? "is" : "are all"} still there.`;
    if (lost.length) {
      row.lost = lost;
      settle("failed", `"${p.name}" lost ${quoted(lost)} in this call. Put ${lost.length === 1 ? "it" : "them"} back by hand now: GoHighLevel, Settings, Custom Fields, ${p.name}, Edit. It had: ${quoted(p.live)}. It has: ${quoted(now)}.`);
    } else if (notAdded.length) {
      const status = answeredNo ? (error as GhlError).ghlStatus : 0;
      const why = noAnswer ? `GoHighLevel did not answer the request (${errorText(error)}), and the option is not on the field` : answeredNo ? `GoHighLevel answered: ${errorText(error)}` : "GoHighLevel accepted the call but the option is not on the field";
      const next = noAnswer ? `It may still be applied: run the dry run again in a minute. If it is still missing then, add it by hand: ${byHand(before.name, notAdded)}`
        : status === 429 || status >= 500 ? `Try the call again in a minute. If it keeps failing, add it by hand: ${byHand(before.name, notAdded)}`
          : `Add ${notAdded.length === 1 ? "it" : "them"} by hand instead: ${byHand(before.name, notAdded)}`;
      settle("failed", `Could not add ${quoted(notAdded)} to "${p.name}": ${why}. ${had} ${next}`);
    } else if (twice.length || moved || changed.length) {
      const what = [twice.length ? `GoHighLevel now lists ${quoted(twice)} more than once` : "", !twice.length && moved ? "the options are in a different order than before" : "", ...changed].filter(Boolean).join("; ");
      settle("check", `Added ${quoted(p.add)} to "${p.name}", and nothing was lost, but ${what}. Put that right by hand in GoHighLevel (Settings, Custom Fields, ${p.name}).`);
    } else {
      settle("added", `Added ${quoted(p.add)} to "${p.name}". GoHighLevel now lists ${count(now.length, "option")}; the ${p.live.length} it had ${p.live.length === 1 ? "is" : "are"} unchanged and in the same order.`);
    }
    if (row.status !== "added") stopped = `the change to "${p.name}" did not go cleanly.`;
    await new Promise((r) => setTimeout(r, 150));
  }
  return report;
}
