import { isoDate, LEAD_TAGS, TEST_CONTACT_ID, WON_TAG } from "@/lib/calls/ghl";
import { addTags, getContact, ghl, GhlError, ghlConfigured, ghlLocationId, listCustomFields, listNotes, removeTags, searchContacts, updateContact, type GhlContact } from "@/lib/ghl/client";
import { SALES_FIELDS } from "@/lib/ghl/fields";
import { todayEastern } from "@/lib/onboarding/api";
import { mergeTemplates, parseChecklist, serializeChecklist } from "./checklist-text";
import { DESK_FIELDS, DESK_FIELD_KEYS, DESK_TAG_LIST, DESK_TAGS, deskFields, deskList, deskNumber, deskText, deskWrites, ensureDeskFields, isDeskFieldName, LSE_OVERLAPS, resolveDeskFields, toFieldValue, type DeskFieldKey, type DeskFields, type DeskSetupReport, type DeskValue } from "./fields";
import { addDeskNote } from "./notes";
import { listRecords } from "./record";
import { deskDefault } from "./switch";
import { deskTeam, type Actor } from "./team";

// Owner-only operator tooling for the Onboarding / Clients desk on GoHighLevel (Phase 2):
//   deskSetup     — create the missing "Desk …" fields (dry-run by default) and say whether a desk tag name is already taken
//   deskDiagnose  — read-only inventory: desk fields present, every field and tag on the location grouped by owner
//                   (desk / sales / LSE / other), how many onboarding records and clients exist, and EXACTLY what the desk writes
//   deskSelfTest  — writes one sample value to every desk field ON THE DESIGNATED TEST CONTACT ONLY, reads it back, clears
//                   it, restores what was there; proves the value shapes (multi-select, numbers, dates, multi-line text) against
//                   the real API before any client is touched
// Nothing here returns a secret, and nothing here reads or writes a client other than the test contact.

type LocationTag = { id?: string; name: string };
/** Every tag defined on the location. Needs locations/tags.readonly (the site's token has it). */
export async function listLocationTags(): Promise<string[]> {
  const r = await ghl<{ tags?: LocationTag[] }>("GET", `/locations/${encodeURIComponent(ghlLocationId())}/tags`);
  return (r.tags ?? []).map((t) => String(t.name)).filter(Boolean).sort();
}
const SALES_TAGS = [...LEAD_TAGS, WON_TAG] as string[];
const isLseName = (name: string, key?: string) => /^lse\b/i.test(name.trim()) || /^contact\.lse_/i.test(key || "");

/** What the desk writes — the list to check against the published automations before the cutover. */
export const deskWriteList = () => ({
  customFields: DESK_FIELD_KEYS.map((k) => DESK_FIELDS[k].name),
  salesFieldsTouched: ["Outreach Status set to Won, and Last Contact (handoff from a lead, as the Sales tab already does)", "Monday Lead ID (import only, where blank)"],
  tagsAdded: [...DESK_TAG_LIST, `${WON_TAG} (handoff from a lead, as the Sales tab already does)`],
  contactFields: ["firstName / lastName / companyName / email / phone / website / city — only where blank at handoff and import; edited on purpose from the Clients panel's contact fields", "assignedTo — only when the contact has no owner"],
  notes: "contact notes (handoff summary, desk notes, imported Monday updates)",
  tasks: "one contact task when a payment turns Card Failed or Overdue (setting DESK_PAYMENT_ALERTS to off disables it)",
  never: ["any field named LSE …", "any lse: tag", "opportunities or pipelines", "workflows", "conversations, emails or texts"],
});

export type DeskSetup = DeskSetupReport & { tags: { name: string; exists: boolean }[]; tagNote: string };
export async function deskSetup(dryRun: boolean): Promise<DeskSetup> {
  const report = await ensureDeskFields(dryRun);
  let existing: string[] = [];
  let tagNote = "A desk tag that already exists before the import means something else is using that name — check it in GoHighLevel → Settings → Tags before going on. (monday-import is the desk's own Phase-1 tag and is expected.)";
  try { existing = await listLocationTags(); } catch (e) { tagNote = `Could not list the location's tags (${e instanceof Error ? e.message : e}). Check Settings → Tags by hand for: ${DESK_TAG_LIST.join(", ")}.`; }
  return { ...report, tags: DESK_TAG_LIST.map((name) => ({ name, exists: existing.includes(name) })), tagNote };
}

export async function deskDiagnose(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { deskBackend: deskDefault(), writes: deskWriteList(), lseOverlaps: LSE_OVERLAPS, team: deskTeam().map((m) => ({ name: m.name, hasGhlUser: !!m.ghlUserId })) };
  if (!ghlConfigured()) return { ...out, note: "GHL_API_TOKEN / GHL_LOCATION_ID not set on this deployment." };
  const probe = async (name: string, fn: () => Promise<unknown>) => { try { out[name] = await fn(); } catch (e) { out[name] = { ok: false, detail: e instanceof Error ? e.message : String(e) }; } };
  let fields: DeskFields = {};
  await probe("fields", async () => {
    const defs = await listCustomFields(true);
    fields = resolveDeskFields(defs);
    const salesNames = new Set(Object.values(SALES_FIELDS).map((s) => s.name.toLowerCase()));
    const lse = defs.filter((d) => isLseName(d.name, d.fieldKey)).map((d) => d.name).sort();
    const desk = defs.filter((d) => isDeskFieldName(d.name)).map((d) => d.name).sort();
    const sales = defs.filter((d) => salesNames.has(d.name.toLowerCase())).map((d) => d.name).sort();
    const other = defs.filter((d) => !isLseName(d.name, d.fieldKey) && !isDeskFieldName(d.name) && !salesNames.has(d.name.toLowerCase())).map((d) => d.name).sort();
    return {
      onLocation: defs.length, deskPresent: DESK_FIELD_KEYS.filter((k) => fields[k]).length, deskExpected: DESK_FIELD_KEYS.length,
      deskMissing: DESK_FIELD_KEYS.filter((k) => !fields[k]).map((k) => DESK_FIELDS[k].name),
      deskNotInCatalog: desk.filter((n) => !DESK_FIELD_KEYS.some((k) => fields[k]?.name === n)),
      lseOwned: lse, salesDesk: sales, other,
    };
  });
  await probe("tags", async () => {
    const all = await listLocationTags();
    return { onLocation: all.length, lseOwned: all.filter((t) => t.startsWith("lse:")), deskOwned: DESK_TAG_LIST.map((name) => ({ name, exists: all.includes(name) })), salesDesk: SALES_TAGS.filter((t) => all.includes(t)), other: all.filter((t) => !t.startsWith("lse:") && !DESK_TAG_LIST.includes(t) && !SALES_TAGS.includes(t)) };
  });
  if (DESK_FIELD_KEYS.every((k) => fields[k])) {
    await probe("onboardingRecords", async () => (await listRecords("onboarding", fields)).length);
    await probe("clients", async () => (await listRecords("client", fields)).length);
  } else out.records = "not counted — the desk fields are not all there yet";
  return out;
}

// ───────────────────────────── self-test (test contact only) ─────────────────────────────
type Check = { field: string; dataType: string; wrote: unknown; readBack: string; ok: boolean; cleared: boolean; error?: string };
export type SelfTestReport = { dryRun: boolean; contact: string; plan?: { field: string; dataType: string; sample: unknown }[]; checks?: Check[]; passed?: number; failed?: string[]; clearFailed?: string[]; tag?: string; search?: string; note?: string; restored?: string; error?: string };

// Large-text samples are deliberately life-size: the checklist field holds a whole checklist (the biggest one the desk
// can build is ~45 rows) and a notes field can take 6,000 characters. A length limit would show here, not on a client.
const BIG_CHECKLIST = serializeChecklist(mergeTemplates([{ name: "self-test row with an owner and a due date", status: "Stuck", phase: "Build", owner: "Dave", due: "2026-10-05" }], ["Giveaway Winner", "Local Growth", "Social Ads $300", "Google Ads $500", "CRM (incl. AI Chat)", "Growth Strategy Session"]).items.map((i, n) => (n % 3 === 0 ? { ...i, status: "Done" } : i)));
const BIG_NOTES = Array.from({ length: 75 }, (_, n) => `self-test line ${String(n + 1).padStart(2, "0")} — the quick brown fox jumps over the lazy dog, twice over.`).join("\n");
function sampleFor(key: DeskFieldKey, f: DeskFields): DeskValue {
  const field = f[key]!;
  const options = field.options.length ? field.options : DESK_FIELDS[key].options || [];
  switch (field.dataType) {
    // The awkward option on purpose (a slash, parentheses, an em dash, a dollar sign): if one of those does not survive, it shows here.
    case "SINGLE_OPTIONS": case "RADIO": return options.find((o) => /[^A-Za-z0-9 ]/.test(o)) || options[0] || "";
    case "MULTIPLE_OPTIONS": case "CHECKBOX": {
      // Package labels carry an em dash and a dollar sign, a comma INSIDE a label, and parentheses — the three that could break a multi-select.
      const awkward = ["Local Growth — First Year $297", "Social Ads $1,200", "CRM (incl. AI Chat)"].filter((o) => options.includes(o));
      return awkward.length ? awkward : options.slice(0, 2);
    }
    case "DATE": return "2026-10-01";
    case "NUMERICAL": return 15;
    case "MONETORY": return 297.5;
    case "LARGE_TEXT": return key === "checklist" ? BIG_CHECKLIST : BIG_NOTES;
    default: return `desk self-test ${key}`;
  }
}
function readFor(c: GhlContact, f: DeskFields, key: DeskFieldKey): string {
  const type = f[key]!.dataType;
  if (type === "MULTIPLE_OPTIONS" || type === "CHECKBOX") return [...deskList(c, f, key)].sort().join(" | "); // GoHighLevel may hand a multi-select back in its own order
  if (type === "NUMERICAL" || type === "MONETORY") return deskNumber(c, f, key);
  if (type === "DATE") return isoDate(deskText(c, f, key));
  return deskText(c, f, key).replace(/\r\n/g, "\n").trim();
}
const expectFor = (value: DeskValue): string => (Array.isArray(value) ? [...value].sort().join(" | ") : value === null ? "" : String(value));
/** Error text for a report: no "=", "?" or "&" (the browser tool that reads these reports redacts anything shaped like a query string). */
const plain = (e: unknown): string => (e instanceof Error ? e.message : String(e)).replace(/[=?&]/g, " ").slice(0, 300);
/**
 * One PUT for all the fields; if GoHighLevel refuses the batch, one PUT per field, so the report names the field it
 * refused instead of failing the whole run on the first bad shape. Returns the refused fields and why.
 */
async function writeEach(f: DeskFields, keys: DeskFieldKey[], values: Partial<Record<DeskFieldKey, DeskValue>>): Promise<Map<DeskFieldKey, string>> {
  const refused = new Map<DeskFieldKey, string>();
  try { await updateContact(TEST_CONTACT_ID, { customFields: deskWrites(f, values) }); return refused; }
  catch (e) { if (!(e instanceof GhlError) || e.scopeProblem || e.ghlStatus === 429 || e.ghlStatus >= 500) throw e; }
  for (const k of keys) {
    try { await updateContact(TEST_CONTACT_ID, { customFields: deskWrites(f, { [k]: values[k] }) }); }
    catch (e) { refused.set(k, plain(e)); }
  }
  return refused;
}

/**
 * Round-trips every desk field on the designated test contact (never a client): write a sample, read it back,
 * clear it, restore what was there. dryRun lists what would be written. The contact is hidden from every desk list.
 */
export async function deskSelfTest(dryRun: boolean, actor: Actor): Promise<SelfTestReport> {
  const f = await deskFields(true);
  const keys = DESK_FIELD_KEYS.filter((k) => f[k]);
  const samples = Object.fromEntries(keys.map((k) => [k, sampleFor(k, f)])) as Record<DeskFieldKey, DeskValue>;
  const report: SelfTestReport = { dryRun, contact: TEST_CONTACT_ID };
  if (dryRun) return { ...report, plan: keys.map((k) => ({ field: f[k]!.name, dataType: f[k]!.dataType, sample: samples[k] })), note: `${DESK_FIELD_KEYS.length - keys.length} desk fields are missing in GoHighLevel and are not in this plan.` };
  const before = await getContact(TEST_CONTACT_ID);
  const original = Object.fromEntries(keys.map((k) => [k, (before.customFields || []).find((x) => x.id === f[k]!.id)?.value ?? ""])) as Record<DeskFieldKey, unknown>;
  try {
    const refused = await writeEach(f, keys, samples);
    const written = await getContact(TEST_CONTACT_ID);
    const checks: Check[] = keys.map((k) => { const readBack = readFor(written, f, k); return { field: f[k]!.name, dataType: f[k]!.dataType, wrote: samples[k], readBack, ok: !refused.has(k) && readBack === expectFor(samples[k]), cleared: false, ...(refused.has(k) ? { error: `write refused: ${refused.get(k)}` } : {}) }; });
    // The checklist field has to survive a real edit cycle (parse → serialize), not just a round trip of text.
    if (f.checklist && serializeChecklist(parseChecklist(deskText(written, f, "checklist"))) !== BIG_CHECKLIST) checks.find((c) => c.field === f.checklist!.name)!.ok = false;
    // Long values are reported by length, not echoed back in full.
    for (const c of checks) if (typeof c.wrote === "string" && c.wrote.length > 200) { c.wrote = `${c.wrote.length} characters`; c.readBack = `${c.readBack.length} characters`; }
    const unclearable = await writeEach(f, keys, Object.fromEntries(keys.map((k) => [k, ""])) as Record<DeskFieldKey, DeskValue>);
    const cleared = await getContact(TEST_CONTACT_ID);
    for (const c of checks) {
      const key = keys.find((k) => f[k]!.name === c.field)!;
      c.cleared = !unclearable.has(key) && readFor(cleared, f, key) === "";
      if (unclearable.has(key)) c.error = `${c.error ? `${c.error}; ` : ""}clear refused: ${unclearable.get(key)}`;
    }
    report.checks = checks; report.passed = checks.filter((c) => c.ok).length; report.failed = checks.filter((c) => !c.ok).map((c) => c.field); report.clearFailed = checks.filter((c) => !c.cleared).map((c) => c.field);
    // Tag add / remove with a desk tag, and whether the search filter the lists rely on is accepted.
    const hadTag = (before.tags || []).includes(DESK_TAGS.onboarding);
    await addTags(TEST_CONTACT_ID, [DESK_TAGS.onboarding]);
    const tagged = ((await getContact(TEST_CONTACT_ID)).tags || []).includes(DESK_TAGS.onboarding);
    if (!hadTag) await removeTags(TEST_CONTACT_ID, [DESK_TAGS.onboarding]);
    report.tag = `${DESK_TAGS.onboarding}: add ${tagged ? "ok" : "FAILED"}${hadTag ? " (was already there, left in place)" : `, removed again: ${((await getContact(TEST_CONTACT_ID)).tags || []).includes(DESK_TAGS.onboarding) ? "FAILED" : "ok"}`}`;
    try { const r = await searchContacts({ filters: [{ group: "OR", filters: [{ field: "tags", operator: "eq", value: DESK_TAGS.onboarding }, { field: `customFields.${f.obStage?.id}`, operator: "exists" }] }], pageLimit: 1 }); report.search = `tag-or-stage filter accepted (${r.total} match right now; the index lags writes by a few seconds)`; }
    catch (e) { report.search = `tag-or-stage filter REJECTED: ${plain(e)} — the lists fall back to the tag alone`; }
    // One labelled note per day, authored as whoever ran this (idempotent), so the notes path is proven too.
    const noteId = `selftest-${todayEastern()}`;
    const saved = await addDeskNote(TEST_CONTACT_ID, { text: `Desk self-test (${todayEastern()}): field round trip on the test contact. Safe to ignore.`, noteId, source: "system", actor });
    const note = (await listNotes(TEST_CONTACT_ID)).find((n) => n.id === saved.id);
    report.note = `${saved.existed ? "already there today" : "added"}; authored as ${note?.userId ? (note.userId === actor.ghlUserId ? actor.name : "another user") : "the integration (no GoHighLevel user for this sign-in)"}`;
  } catch (e) { report.error = plain(e); }
  finally {
    // Put back exactly what was there; a field that was empty is cleared in the shape its type wants ("" or []).
    const restore = keys.map((k) => ({ name: f[k]!.name, write: { id: f[k]!.id, field_value: original[k] === "" || original[k] === null ? toFieldValue(f[k]!, "") : original[k] } }));
    try {
      try { await updateContact(TEST_CONTACT_ID, { customFields: restore.map((r) => r.write) }); report.restored = "original values written back"; }
      catch (e) {
        if (!(e instanceof GhlError) || e.scopeProblem || e.ghlStatus === 429 || e.ghlStatus >= 500) throw e;
        // The batch was refused (one field's shape): put the rest back one at a time and name what is left.
        const left: string[] = [];
        for (const r of restore) { try { await updateContact(TEST_CONTACT_ID, { customFields: [r.write] }); } catch { left.push(r.name); } }
        report.restored = left.length ? `original values written back except ${left.join(", ")} — clear those on the test contact by hand` : "original values written back (one field at a time)";
      }
    } catch (e) { report.restored = `RESTORE FAILED: ${plain(e)} — clear the Desk … fields on the test contact by hand`; }
  }
  return report;
}
