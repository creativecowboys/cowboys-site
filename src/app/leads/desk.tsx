"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CallDraft, CallHistory, CallLead, CallsPageData, LeadsBackend, SaveCallResult } from "./types";
import { CALL_OUTCOMES, isCallOutcome, mondayOutcome, outreachStatus, type CallOutcome } from "@/lib/calls/outcomes";
import { CALL_OWNERS, filterRoster, isOffCallList, mergeRoster, offListReasons, OFF_LIST_LABELS, OFF_LIST_VIEW, type OffListReason } from "@/lib/calls/roster";
import { HOUR_OPTIONS, prettyTime } from "@/lib/calls/followup-time";
import { REP_NAMES, type RepName } from "@/lib/ghl/reps";
import { RefreshIcon } from "./icons";
import "./calls.css";

type Entry = { draft: CallDraft; dirty: boolean; result?: SaveCallResult };
type Entries = Record<string, Entry>;
const steps = ["Connect", "Discover", "Recommend", "Wrap up"];
const reps = REP_NAMES;
type AssignName = RepName | "";
// Owner identity comes from the server with every roster load (Monday person ids or GHL user ids, per
// LEADS_BACKEND) — the browser never hard-codes either system's ids. `ownerName` on each lead is computed server-side.
const outcomes = CALL_OUTCOMES;
const demoLeads: CallLead[] = [
  { id: "demo-1", name: "Juniper & Co. Garden Care", contact: "Alex Example", email: "alex@example.com", phone: "", website: "https://example.com", city: "Sample City", owner: "Josh", ownerId: "39848217", ownerName: "Josh", outreach: "Not Contacted", interest: "Warm", notes: "Fictional submission: looking for a steadier stream of local customers. Asked about a website refresh.", lastContact: "", nextFollowup: "", quotedMonthly: "", interestedIn: "Website, local search", auditScore: "62", auditReport: "", group: "Giveaway entries", leadSource: "The Big Giveaway", updatedAt: "demo-version-1", recordUrl: "", nextFollowupTime: "" },
  { id: "demo-2", name: "North Star Home Services", contact: "Taylor Example", email: "taylor@example.com", phone: "", website: "", city: "Sample Town", owner: "Dave", ownerId: "39848115", ownerName: "Dave", outreach: "Call Booked", interest: "Hot", notes: "Fictional submission: referrals are strong; wants help following up with inquiries.", lastContact: "", nextFollowup: "", quotedMonthly: "97", interestedIn: "CRM", auditScore: "", auditReport: "", group: "Giveaway entries", leadSource: "Website form", updatedAt: "demo-version-2", recordUrl: "", nextFollowupTime: "" },
];
const demoPage: CallsPageData = { leads: demoLeads, cursor: null, boardName: "Christmas in September", system: "monday", systemName: "Monday", owners: CALL_OWNERS.map((o) => ({ id: o.id, name: o.name })), leadSources: ["The Big Giveaway", "Facebook", "Ebook download", "Website form", "Referral", "Other"] };
function fresh(lead: CallLead, rep: CallDraft["rep"]): Entry {
  return { dirty: false, draft: { callId: crypto.randomUUID(), leadId: lead.id, expectedUpdatedAt: lead.updatedAt, rep, goal: "", currentMarketing: "", challenge: "", budget: "", timing: "", recommendation: "", notes: "", nextStep: "", outcome: "", interest: "", followupDate: "", followupTime: "", quotedMonthly: "" } };
}
/** A result saved by the pre-GHL build (still in this tab's sessionStorage across a deploy) carries `mondayUrl`, not `recordUrl`. */
const savedUrl = (r: SaveCallResult): string => r.recordUrl || (r as { mondayUrl?: string }).mondayUrl || "";
/** The opener names how the lead found us, by Lead Source (giveaway entrants still hear Christmas in September). */
function openerFor(source: string): string {
  const s = source.toLowerCase();
  if (!s || s.includes("giveaway")) return "Thanks for entering Christmas in September.";
  if (s.includes("ebook") || s.includes("playbook")) return "Thanks for grabbing the playbook.";
  if (s.includes("website") || s.includes("form")) return "Thanks for reaching out on our site.";
  if (s.includes("referral")) return "Thanks for taking the call — glad we were pointed your way.";
  if (s.includes("facebook")) return "Thanks for connecting with us on Facebook.";
  return "Thanks for your interest in Creative Cowboys.";
}
function safeUrl(value: string | undefined | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  try { const u = new URL(value.includes(":") ? value : `https://${value}`); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; }
}
/** Why a lead is off the call list, as badges (roster row and lead header). Renders nothing for a lead that is on the list. */
function OffBadges({ lead }: { lead: CallLead }) {
  const reasons = offListReasons(lead);
  return reasons.length ? <span className="call-off-badges">{reasons.map(r => <span key={r} className="call-off-badge">{OFF_LIST_LABELS[r]}</span>)}</span> : null;
}
/** What "off the call list" means for this lead and how to undo it. Tags are Dave's, set in GoHighLevel: the desk never adds or removes one. */
function offListHelp(reasons: OffListReason[], ghl: boolean): string {
  const tags = reasons.filter(r => r !== "not-interested");
  const said = reasons.includes("not-interested");
  const parts = [!ghl ? "Still on the Monday board." : said ? "Still in GoHighLevel for email campaigns and newsletters." : "Nothing about the contact changed in GoHighLevel."];
  if (said) parts.push(`Marked Not Interested by mistake? Save a call with a different outcome${ghl ? ", or change Outreach Status in GoHighLevel" : ""}.`);
  if (tags.length) parts.push(`The ${tags.join(" and ")} ${tags.length > 1 ? "tags are" : "tag is"} removed in GoHighLevel, not here${said ? `; the lead stays off the list until ${tags.length > 1 ? "they are" : "it is"}` : ""}.`);
  return parts.join(" ");
}
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again; your draft stays in this tab." : "The lead system could not complete that request. Please try again.")), { status: response.status });
  return data;
}
export default function Desk({ demo = false, onStartOnboarding, onOpenPackages }: { demo?: boolean; onStartOnboarding?: (lead: CallLead) => void; onOpenPackages?: (lead: CallLead | null) => void }) {
  const storageKey = demo ? "cc-call-desk-demo-v1" : "cc-call-desk-v1";
  const [leads, setLeads] = useState<CallLead[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [board, setBoard] = useState("Giveaway leads");
  const [system, setSystem] = useState<LeadsBackend>("monday");
  const [crm, setCrm] = useState("Monday"); // "Monday" | "GoHighLevel" — named in copy so a rep knows where a save went
  const [owners, setOwners] = useState<{ id: string; name: RepName }[]>(CALL_OWNERS.map((o) => ({ id: o.id, name: o.name })));
  const [leadSources, setLeadSources] = useState<string[]>([]);
  const [tagsRead, setTagsRead] = useState(true); // false = GHL sent the roster without contact tags, so do-not-contact / fake-lead cannot be seen
  const [source, setSource] = useState("");
  const [sourceSaving, setSourceSaving] = useState(false);
  const ownerNameFor = (id: string): AssignName => owners.find((o) => o.id === id)?.name || "";
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [spin, setSpin] = useState(false); // one visible turn per click, even when the list answers fast
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<CallLead | null>(null);
  const [history, setHistory] = useState<CallHistory[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [entries, setEntries] = useState<Entries>({});
  const entriesRef = useRef<Entries>({});
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");
  const [queue, setQueue] = useState("all");
  const [step, setStep] = useState(0);
  const [rep, setRep] = useState<CallDraft["rep"]>("Dave");
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const assignmentLock = useRef(false);
  const assign = async (owner: AssignName) => {
    if (!detail || assignmentLock.current || saveLock.current) return;
    const id = detail.id;
    const currentEntry = entriesRef.current[id];
    if (!currentEntry || currentEntry.result) return;
    assignmentLock.current = true;
    setAssigning(true); setAssignError("");
    try {
      const data = demo
        ? { lead: { ...detail, owner, ownerName: owner, ownerId: owners.find((o) => o.name === owner)?.id || "" } }
        : await json<{ lead: CallLead }>(await fetch(`/api/team/calls/${encodeURIComponent(id)}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, expectedUpdatedAt: currentEntry.draft.expectedUpdatedAt }),
        }));
      setDetail(data.lead);
      setLeads(prev => prev.map(l => l.id === id ? data.lead : l));
      // Assignment changes the record's version. Keep the notes and carry forward
      // the confirmed version so our own assignment doesn't block the next save.
      const latest = entriesRef.current[id];
      if (latest && !latest.result) commit({ ...entriesRef.current, [id]: {
        ...latest,
        dirty: latest.dirty || (!!owner && latest.draft.rep !== owner),
        draft: { ...latest.draft, ...(owner ? { rep: owner } : {}), expectedUpdatedAt: data.lead.updatedAt },
      } });
      if (owner) setRep(owner);
      setSaveError("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not assign. Try again.";
      setAssignError(message);
      if ((e as { status?: number }).status === 409) { setConflict(true); setSaveError(message); }
    } finally { assignmentLock.current = false; setAssigning(false); }
  };
  /** Change the Lead Source dropdown (GHL leads). Same version rules as assignment; the draft is kept. */
  const changeSource = async (value: string) => {
    if (!detail || !value || value === detail.leadSource || assignmentLock.current || saveLock.current || demo) return;
    const id = detail.id;
    const currentEntry = entriesRef.current[id];
    if (!currentEntry || currentEntry.result) return;
    setSourceSaving(true); setAssignError("");
    try {
      const data = await json<{ lead: CallLead }>(await fetch(`/api/team/calls/${encodeURIComponent(id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadSource: value, expectedUpdatedAt: currentEntry.draft.expectedUpdatedAt }),
      }));
      setDetail(data.lead);
      setLeads(prev => prev.map(l => l.id === id ? data.lead : l));
      const latest = entriesRef.current[id];
      if (latest && !latest.result) commit({ ...entriesRef.current, [id]: { ...latest, draft: { ...latest.draft, expectedUpdatedAt: data.lead.updatedAt } } });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not change the lead source. Try again.";
      setAssignError(message);
      if ((e as { status?: number }).status === 409) { setConflict(true); setSaveError(message); }
    } finally { setSourceSaving(false); }
  };
  const saveLock = useRef(false);
  const listLock = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [revision, setRevision] = useState(0);
  const rebase = useRef(false);
  const commit = useCallback((next: Entries) => {
    entriesRef.current = next; setEntries(next);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); setStorageError(""); }
    catch { setStorageError("This browser cannot retain drafts across refreshes. Keep this tab open until your notes are saved."); }
  }, [storageKey]);
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
      const valid: Entries = {};
      for (const [id, entry] of Object.entries(stored)) {
        const e = entry as Entry;
        if (e?.draft?.leadId === id && typeof e.draft.callId === "string" && typeof e.draft.notes === "string") valid[id] = e;
      }
      entriesRef.current = valid;
      // Browser storage is external state and must hydrate after the server render.
      setEntries(valid);
    } catch { setStorageError("Saved browser drafts could not be restored. New notes will remain visible in this tab."); }
    setReady(true);
  }, [storageKey]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (Object.values(entriesRef.current).some(x => x.dirty) || saveLock.current || assignmentLock.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const loadList = useCallback(async (nextCursor?: string) => {
    if (listLock.current) return;
    listLock.current = true; setListLoading(true); setListError("");
    try {
      // ?backend=ghl|monday on the page URL previews the other system's roster without flipping LEADS_BACKEND.
      const preview = new URLSearchParams(window.location.search).get("backend");
      const q = new URLSearchParams(); if (nextCursor) q.set("cursor", nextCursor); if (preview === "ghl" || preview === "monday") q.set("backend", preview);
      const data: CallsPageData = demo ? demoPage : await json(await fetch(`/api/team/calls${q.toString() ? `?${q}` : ""}`, { cache: "no-store" }));
      setLeads(prev => mergeRoster(prev, data.leads, !!nextCursor));
      setTagsRead(prev => (nextCursor ? prev : true) && data.noCallTagsRead !== false);
      setCursor(data.cursor); setBoard(data.boardName); setSystem(data.system); setCrm(data.systemName); setOwners(data.owners); setLeadSources(data.leadSources);
    } catch (e) { setListError(e instanceof Error ? e.message : "Could not load the entrant list."); }
    finally { listLock.current = false; setListLoading(false); }
  }, [demo]);
  // The initial request synchronizes this view with the external lead system (Monday or GoHighLevel).
  useEffect(() => { void loadList(); }, [loadList]);
  // Calendar events link to /admin?lead=<id> (older ones to /leads?lead=<id>, which forwards): select that lead once, after the first load.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current || demo || !ready || !leads.length) return;
    const wanted = new URLSearchParams(window.location.search).get("lead");
    if (wanted && /^[A-Za-z0-9]{1,64}$/.test(wanted) && leads.some(l => l.id === wanted)) { deepLinked.current = true; setSelected(wanted); }
  }, [leads, ready, demo]);
  useEffect(() => {
    if (!selected || !ready) return;
    const controller = new AbortController(); let current = true;
    // Clear the previous remote record while the newly selected record is loading.
    setDetail(null); setHistory([]); setDetailError(""); setDetailLoading(true); setSaveError(""); setAssignError(""); setConflict(false);
    (async () => {
      try {
        const data = demo ? { lead: demoLeads.find(x => x.id === selected)!, history: [] as CallHistory[] } : await json<{ lead: CallLead; history: CallHistory[] }>(await fetch(`/api/team/calls/${encodeURIComponent(selected)}`, { cache: "no-store", signal: controller.signal }));
        if (!current) return;
        setDetail(data.lead); setHistory(data.history);
        setLeads(prev => prev.map(x => x.id === selected ? data.lead : x));
        const existing = entriesRef.current[selected];
        if (!existing) commit({ ...entriesRef.current, [selected]: fresh(data.lead, data.lead.ownerName || rep) });
        else if (rebase.current) commit({ ...entriesRef.current, [selected]: { ...existing, draft: { ...existing.draft, expectedUpdatedAt: data.lead.updatedAt } } });
        rebase.current = false;
      } catch (e) { if (current) setDetailError(e instanceof Error ? e.message : "Could not load this contact."); }
      finally { if (current) setDetailLoading(false); }
    })();
    return () => { current = false; controller.abort(); };
    // The representative is copied only when creating a new draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, revision, demo, ready, commit]);
  const entry = entries[selected]; const draft = entry?.draft;
  const patch = (change: Partial<CallDraft>) => {
    const e = entriesRef.current[selected];
    if (!e || e.result || saveLock.current) return;
    commit({ ...entriesRef.current, [selected]: { ...e, dirty: true, draft: { ...e.draft, ...change } } });
  };
  const choose = (id: string) => { if (!saveLock.current && !assignmentLock.current && id !== selected) { rebase.current = false; setDetail(null); setDetailLoading(true); setSelected(id); setStep(0); } };
  const save = async () => {
    if (saveLock.current || assignmentLock.current || !draft || entry?.result || !detail || conflict) return;
    if (!isCallOutcome(draft.outcome)) { setSaveError("Choose a call outcome before saving."); setStep(3); return; }
    if (detail.ownerName !== draft.rep) { setSaveError(`Choose the caller to confirm the ${crm} owner before saving.`); return; }
    if (![draft.notes, draft.nextStep, draft.goal, draft.challenge].some(value => value.trim())) {
      setSaveError("Add a conversation note, goal, challenge, or next step before saving."); return;
    }
    if (draft.quotedMonthly && (!/^\d{1,6}(?:\.\d{1,2})?$/.test(draft.quotedMonthly) || Number(draft.quotedMonthly) > 100000)) {
      setSaveError("Enter a monthly quote between 0 and 100,000, with no more than two decimal places."); return;
    }
    saveLock.current = true; setSaving(true); setSaveError(""); const id = selected;
    commit({ ...entriesRef.current, [id]: { ...entry, dirty: true } });
    try {
      const result: SaveCallResult = demo ? { saved: true, updateId: "demo-save", recordUrl: "", warning: "Demo only. This note is saved in this browser tab; nothing was sent anywhere." } : await json(await fetch(`/api/team/calls/${encodeURIComponent(id)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) }));
      commit({ ...entriesRef.current, [id]: { draft, dirty: false, result } });
      if (!demo) setRevision(x => x + 1);
      setLeads(prev => prev.map(x => x.id === id && !result.warning ? { ...x, lastContact: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()), outreach: system === "ghl" ? outreachStatus(draft.outcome as CallOutcome) : mondayOutcome(draft.outcome as CallOutcome), interest: draft.interest || x.interest, nextFollowup: draft.followupDate || x.nextFollowup, nextFollowupTime: draft.followupDate ? draft.followupTime : x.nextFollowupTime } : x));
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Save failed. Your draft is still here."); setConflict((e as { status?: number }).status === 409); }
    finally { saveLock.current = false; setSaving(false); }
  };
  // Off the call list (Not Interested, or a do-not-contact / fake-lead tag in GHL): out of every view except "Not interested / do not call".
  const offView = queue === OFF_LIST_VIEW;
  const filtered = filterRoster(leads, { view: queue, owner, status, source, search });
  const offCount = leads.filter(isOffCallList).length;
  // Status choices come from the leads this view can show, so the normal list never offers a status that only off-list leads have.
  const statusOptions = [...new Set(leads.filter(l => isOffCallList(l) === offView).map(x => x.outreach).filter(Boolean))].sort();
  // A search on the normal list never returns an off-list lead. It only says that some exist, so nobody is left wondering where a lead went.
  const hiddenMatches = !offView && search.trim() ? filterRoster(leads, { view: OFF_LIST_VIEW, owner, status: "", source, search }).length : 0;
  // The selected lead as the roster holds it (a save updates the row at once; the lead record follows a moment later).
  const current = detail ? leads.find(l => l.id === detail.id) || detail : null;
  const offReasons = current ? offListReasons(current) : [];
  const savedOff = !!entry?.result && !entry.result.warning && draft?.outcome === "Not interested" && offReasons.includes("not-interested");
  const sourceOptions = [...new Set([...leadSources, ...leads.map(l => l.leadSource).filter(Boolean)])];
  const lastConversation = history.find(h => h.isCallNote) || history[0];
  const field = (key: keyof Pick<CallDraft, "goal" | "currentMarketing" | "challenge" | "budget" | "timing" | "recommendation" | "notes" | "nextStep">, label: string, placeholder: string, wide = false) => <label className={wide ? "call-field call-wide" : "call-field"}>{label}<textarea rows={key === "notes" ? 4 : 3} value={draft?.[key] || ""} onChange={e => patch({ [key]: e.target.value })} placeholder={placeholder} maxLength={key === "notes" ? 8000 : key === "budget" || key === "timing" ? 500 : 2000} /></label>;
  const link = (value: string | undefined, label: string) => { const href = safeUrl(value); return href ? <a href={href} target="_blank" rel="noreferrer">{label} ↗</a> : null; };
  return <main className="call-desk">
    <header className="call-header"><Link className="call-brand" href="/"><Image src="/cowboys-logo-stacked-orange.png" alt="Creative Cowboys" width={150} height={64} priority /><span>TEAM FIELD GUIDE</span></Link><div className="call-header-title"><span className="call-eyebrow">CHRISTMAS IN SEPTEMBER</span><h1>Good conversations.<br className="call-mobile-break" /> Real next steps.</h1></div><div className="call-mode">{onOpenPackages && !demo ? <button type="button" className="call-header-button" onClick={() => onOpenPackages(detail)}>Package builder →</button> : (demo ? "FICTIONAL DEMO" : `${crm.toUpperCase()} CALL WORKSPACE`)}<span>{onOpenPackages && !demo ? "Build a plan, get a pay link." : "Ask. Listen. Find the right fit."}</span></div></header>
    {demo && <div className="call-demo-banner">Preview workspace · All businesses below are fictional. Demo saves stay in this browser tab.</div>}
    {storageError && <div role="alert" className="call-alert">{storageError}</div>}
    <div className="call-layout"><aside className="call-roster" aria-label="Giveaway entrants">
      <div className="call-roster-heading"><div><span className="call-eyebrow">YOUR STARTING POINT</span><h2>The people.</h2></div><button className={`call-icon-button ${spin || listLoading ? "is-spinning" : ""}`} onClick={() => { setSpin(true); window.setTimeout(() => setSpin(false), 900); void loadList(); }} disabled={listLoading || saving || assigning} aria-label={demo ? "Refresh sample entrant list" : `Refresh ${crm} lead list`}><RefreshIcon /></button></div>
      <p className="call-muted call-board-name">{board}</p>
      <label className="call-search"><span className="call-sr-only">Search loaded entrants</span><input placeholder="Search a name or business…" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="call-filters"><label><span className="call-sr-only">Filter by owner</span><select value={owner} onChange={e => setOwner(e.target.value)}><option value="">All owners</option>{owners.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}<option value="unassigned">Unassigned</option></select></label><label><span className="call-sr-only">Filter by outreach status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{statusOptions.map(x => <option key={x}>{x}</option>)}</select></label></div>
      {(system === "ghl" || sourceOptions.length > 0) && <label className="call-queue-filter">Lead source<select aria-label="Filter by lead source" value={source} onChange={e => setSource(e.target.value)}><option value="">All sources</option>{sourceOptions.map(x => <option key={x} value={x}>{x}</option>)}<option value="none">No source set</option></select></label>}
      <label className="call-queue-filter">Show leads<select aria-label="Filter by contact stage" value={queue} onChange={e => { setQueue(e.target.value); setStatus(""); }}><option value="all">All leads</option><option value="new">Not contacted yet</option><option value="active">Contacted / working on</option><option value="closed">Closed / bad number</option><option value={OFF_LIST_VIEW}>Not interested / do not call</option></select></label>
      <p className="call-order-hint">{offView ? `These leads are off the call list. ${system === "ghl" ? "They stay in GoHighLevel for email campaigns and newsletters" : "They stay on the Monday board"}. To put one back, save a call with a different outcome${system === "ghl" ? " or change its Outreach Status in GoHighLevel. A do-not-contact or fake-lead tag is removed in GoHighLevel, not here." : "."}` : "Not contacted first, then oldest contact. Choose an owner to see their leads."}</p>
      <div className="call-list-count">{filtered.length} shown · {leads.length} loaded{!offView && offCount > 0 ? ` · ${offCount} off the call list` : ""}{cursor ? " · more available" : ""}</div>
      {!tagsRead && <div className="call-alert" role="alert">GoHighLevel sent this list without contact tags, so a lead tagged do-not-contact or fake-lead may still be showing. Check the lead in GoHighLevel before you call.</div>}
      {hiddenMatches > 0 && <p className="call-off-hint">{hiddenMatches} {filtered.length ? "more " : ""}{hiddenMatches === 1 ? "match is" : "matches are"} off the call list. <button type="button" onClick={() => { setQueue(OFF_LIST_VIEW); setStatus(""); }}>Show not interested / do not call</button></p>}
      {listError && <div className="call-alert" role="alert">{listError}<button onClick={() => loadList(cursor || undefined)}>Try again</button></div>}
      <div className="call-person-list">{filtered.map(lead => <button key={lead.id} onClick={() => choose(lead.id)} disabled={saving || assigning} className={`call-person ${selected === lead.id ? "is-active" : ""}`} aria-pressed={selected === lead.id}><span className="call-person-top"><span>{lead.name}</span><span aria-hidden="true">↗</span></span><span className="call-person-contact">{lead.contact || "Contact not supplied"}{lead.city && ` · ${lead.city}`}</span><span className="call-person-bottom"><span className="call-status">{lead.outreach || "No status"}</span><span>{entries[lead.id]?.dirty ? "Draft saved here" : lead.owner || "Unassigned"}</span></span><OffBadges lead={lead} />{lead.leadSource && <span className="call-person-source">{lead.leadSource}</span>}</button>)}</div>
      {listLoading && <p role="status" className="call-roster-message">Loading entrants…</p>}
      {!listLoading && !filtered.length && <p className="call-roster-message">{!leads.length ? "No entrants are available yet." : offView ? (offCount ? "No off-list leads match these filters." : "Nobody is off the call list.") : "No leads match these filters. Try All leads or another owner."}</p>}
      {cursor && <button className="call-secondary call-load-more" disabled={listLoading} onClick={() => loadList(cursor)}>Load more entrants</button>}
      <CalendarFeed /><div className="call-roster-foot"><span>01 — PEOPLE FIRST</span><p>Start with their business. A useful conversation is a win, even when the answer is “not right now.”</p></div>
    </aside><section className="call-workspace" aria-label="Guided conversation">
      {!selected ? <div className="call-welcome"><span className="call-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2>Pick a person.<br />Find out what’s next.</h2><p>Select an entrant to bring their business, past notes, and your conversation guide into one place.</p><div className="call-welcome-steps">{steps.map((s, i) => <span key={s}><b>0{i + 1}</b>{s}</span>)}</div><p className="call-muted">Your notes stay in this tab until you choose to save them to {crm}.</p></div> : detailLoading ? <div className="call-empty" role="status">Loading this business and its {crm} history…</div> : detailError ? <div className="call-empty"><div role="alert">{detailError}</div><button className="call-secondary" onClick={() => setRevision(x => x + 1)}>Try again</button><a href="/team/login?next=/team/calls">Team sign in</a></div> : detail && draft ? <>
        <div className="call-contact"><div><span className="call-eyebrow">{detail.group || "GIVEAWAY ENTRY"}{detail.city && ` / ${detail.city}`}</span><h2>{detail.name}</h2><p>{detail.contact || "Contact name not supplied"}<span className="call-contact-owner">Assigned to <select className="call-assign" value={detail.ownerName || ownerNameFor(detail.ownerId)} disabled={assigning || saving || !!entry?.result || conflict} onChange={e => void assign(e.target.value as AssignName)} aria-label="Assign this lead"><option value="">Unassigned</option>{reps.map(r => <option key={r} value={r}>{r}</option>)}</select>{assigning && <em> saving…</em>}{assignError && <em className="call-assign-error" role="alert"> {assignError}</em>}</span></p></div><div className="call-contact-actions">{detail.phone && <a className="call-phone" href={`tel:${detail.phone.replace(/[^+\d]/g, "")}`}>{detail.phone}</a>}{!detail.phone && <span className="call-muted">No phone on file</span>}{detail.email && <span className="call-email">{detail.email}</span>}<div>{link(detail.website, "Website")}{link(detail.auditReport, "Audit")}{link(detail.recordUrl, system === "ghl" ? "Open in GoHighLevel" : "Monday")}</div>{onStartOnboarding && !demo && <button type="button" className="call-secondary call-handoff-button" disabled={saving || assigning} onClick={() => onStartOnboarding(detail)}>{detail.outreach === "Won" ? "View onboarding" : "Start onboarding →"}</button>}</div></div>
        {current && offReasons.length > 0 && <div className="call-offlist" role="status"><strong>Off the call list</strong><OffBadges lead={current} /><p>{offListHelp(offReasons, system === "ghl")}</p></div>}
        <div className={system === "ghl" ? "call-context call-context-source" : "call-context"}>{system === "ghl" && <div><span>LEAD SOURCE</span>{!demo ? <select className="call-assign" aria-label="Lead source" value={detail.leadSource && sourceOptions.includes(detail.leadSource) ? detail.leadSource : ""} disabled={sourceSaving || assigning || saving || !!entry?.result || conflict} onChange={e => void changeSource(e.target.value)}><option value="" disabled>{detail.leadSource ? detail.leadSource : "Not set"}</option>{sourceOptions.map(x => <option key={x} value={x}>{x}</option>)}</select> : <strong>{detail.leadSource || "Not set"}</strong>}{sourceSaving && <em> saving…</em>}</div>}<div><span>INTERESTED IN</span><strong>{detail.interestedIn || "Discover together"}</strong></div><div><span>LAST CONTACT</span><strong>{detail.lastContact || "Not recorded"}</strong></div><div><span>FOLLOW-UP</span><strong>{detail.nextFollowup ? `${detail.nextFollowup}${detail.nextFollowupTime ? ` · ${prettyTime(detail.nextFollowupTime)}` : ""}` : "Not scheduled"}</strong></div><div><span>PRIOR MONTHLY QUOTE</span><strong>{detail.quotedMonthly ? `$${detail.quotedMonthly}` : "None recorded"}</strong></div></div>
        <section className="call-last-conversation" aria-label="Last saved notes">
          <div className="call-last-heading"><h3>{lastConversation?.isCallNote ? "Last saved conversation" : "Latest saved notes"}</h3>{lastConversation && <span>{lastConversation.author} · {new Date(lastConversation.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>}</div>
          <p className="call-preserve">{lastConversation?.text || detail.notes || "No saved notes yet. Your next saved conversation will appear here."}</p>
          <small>Saved in {crm}. Add today’s notes in the guide below.</small>
        </section>
        <details className="call-prior"><summary>Before you call <span>Submission, audit & prior conversations</span></summary><div className="call-prior-content">{detail.auditScore && <p><b>Audit score:</b> {detail.auditScore} · Use the audit as a starting point, not a promise.</p>}<h3>Existing {crm} notes</h3><p className="call-preserve">{detail.notes || "No existing notes."}</p>{history.length > 0 && <h3>Recent {crm} updates</h3>}{history.map(h => <article key={h.id}><small>{h.author || "Team"} · {h.createdAt}</small><p className="call-preserve">{h.text}</p></article>)}{!history.length && <p className="call-muted">No recent updates returned.</p>}</div></details>
        <div className="call-guide-head"><div><span className="call-eyebrow">CONVERSATION GUIDE</span><p>Make it your own. Listen more than you pitch.</p></div><label className="call-rep">Calling as <select value={detail.ownerName === draft.rep ? draft.rep : ""} disabled={saving || assigning || !!entry.result || conflict} onChange={e => void assign(e.target.value as CallDraft["rep"])}><option value="" disabled>Choose caller…</option>{reps.map(r => <option key={r}>{r}</option>)}</select><small aria-live="polite">{assigning ? `Updating ${crm} owner…` : `Selecting a caller sets the ${crm} owner`}</small></label></div>
        <nav className="call-step-tabs" aria-label="Conversation steps">{steps.map((s, i) => <button key={s} onClick={() => setStep(i)} className={i === step ? "is-active" : ""} aria-current={i === step ? "step" : undefined}><span>0{i + 1}</span>{s}</button>)}</nav>
        {entry.result && <div className={entry.result.warning ? "call-alert call-saved" : "call-success call-saved"} role="status"><strong>{demo ? "Demo conversation saved." : `Conversation note saved to ${crm}.`}</strong>{entry.result.warning && <p>{entry.result.warning}</p>}{savedOff && <p>{system === "ghl" ? "Off the call list. Still in GoHighLevel for email." : "Off the call list. Still on the Monday board."}</p>}{link(savedUrl(entry.result), `Review saved note in ${crm}`)}<button className="call-secondary" onClick={() => { commit({ ...entriesRef.current, [selected]: fresh(detail, draft.rep) }); rebase.current = true; setRevision(x => x + 1); setStep(0); }}>Start another conversation</button></div>}
        <fieldset className="call-form" disabled={saving || assigning || !!entry.result}>
          {step === 0 && <><div className="call-script"><span>TRY OPENING WITH</span><p>“Hey {detail.contact.split(" ")[0] || "there"}, it’s {draft.rep} with Creative Cowboys. {openerFor(detail.leadSource)} I’d love to hear a little more about your business and see if there’s anything we can help with. Do you have a few minutes?”</p><small>Review their submission first. Ask only what you still need to know. Confirm any drawing result separately; if they are busy, offer a callback.</small></div><div className="call-fields">{field("goal", "What would make this a useful conversation?", "Their goals, in their own words…", true)}{field("notes", "Anything to know before you get going?", "Context, preferences, or something they mentioned…", true)}</div></>}
          {step === 1 && <><div className="call-script"><span>FOLLOW THEIR ANSWERS</span><p>“Think about the last few customers you worked with. How did they find you? What went well, and where did things get difficult?”</p><small>Start with a real example, then follow their answer. Ask one question at a time and leave room to listen.</small></div><details className="call-coaching"><summary>Helpful follow-up questions</summary><ul><li><strong>Get specific:</strong> “Can you walk me through the most recent time that happened?”</li><li><strong>Understand the impact:</strong> “What happened as a result? Did it affect your time, workload or customers?”</li><li><strong>Find what matters:</strong> “Of the things we’ve discussed, which would you most like to improve, and why?”</li></ul><p>Use the questions that fit. Don’t assume every business needs more leads or turn an estimate into a promised return.</p></details><div className="call-fields">{field("goal", "What would a better outcome look like?", "Their priority and how they would recognize progress.")}{field("currentMarketing", "What have they tried? What happened?", "Recent customer sources, current approach, past attempts and results.")}{field("challenge", "Recent obstacle & its impact", "A specific example; effects on time, missed work or follow-up. Keep estimates in their words.")}{field("budget", "Current spend & budget process", "Ask permission: what do they spend now, and how are new expenses approved? Unknown is okay.")}{field("timing", "Timing & decision makers", "Why now? Who else needs to be involved? Record their actual timing, not an assumed deadline.", true)}</div></>}
          {step === 2 && <><div className="call-script"><span>CONNECT THE NEED TO THE NEXT STEP</span><p>“You mentioned [specific problem], and you want [their goal]. Have I understood that? If so, I’d suggest [next step] because [how it helps]. What concerns would you have?”</p><small>Confirm the need before recommending a service. Explain the fit, scope and limits. If you need more information, agree on how to get it first.</small></div><div className="call-pricing"><div><strong>Local Growth</strong><b>$297 / month</b><p>First 12 months with a 12-month agreement; then $497/month. Website separate.</p></div><div><strong>Website</strong><b>$497 + $30 / month</b><p>One-time build plus monthly hosting. Confirm page count and scope.</p></div><div><strong>CRM + chat</strong><b>$97 / month</b><p>Chat included. Chat alone: $47/month.</p></div><div><strong>Strategy session</strong><b>$997 once</b><p>Confirm the session’s deliverables before committing.</p></div></div><div className="call-pricing-note">Needs a scope conversation: ads pricing and ad-spend inclusion are unresolved; AI SEO and Max Growth deliverables are not finalized. No ranking guarantees or free website bundles.</div><div className="call-fields">{field("recommendation", "Recommendation & why it fits", "Their stated need → suggested service or next step → why it fits. Include concerns and open questions.", true)}<label className="call-field">Monthly amount actually quoted<input type="number" min="0" max="100000" step="0.01" placeholder="Leave blank if not quoted" value={draft.quotedMonthly} onChange={e => patch({ quotedMonthly: e.target.value })} /><small>Record one-time fees and exact terms in the notes.</small></label>{field("notes", "Offer details / conversation notes", "Include only terms actually discussed.")}</div></>}
          {step === 3 && <><div className="call-script"><span>LEAVE WITH A CLEAR AGREEMENT</span><p>“Have I captured what matters most? Would [specific next step] be useful? Let’s agree who will do what and when.”</p><small>A useful next step has an action, an owner and a date. If they only want information or don’t want to continue, record that honestly.</small></div><div className="call-fields"><label className="call-field">Call outcome<select value={isCallOutcome(draft.outcome) || entry.result ? draft.outcome : ""} onChange={e => patch({ outcome: e.target.value as CallDraft["outcome"] })}><option value="" disabled>Choose outcome…</option>{entry.result && draft.outcome && !isCallOutcome(draft.outcome) && <option value={draft.outcome}>{draft.outcome}</option>}{outcomes.map(o => <option key={o}>{o}</option>)}</select><small>Choose what happened on this call. In progress means you talked and are still working the lead; it stays on your call list. Add a follow-up date below if you set one.{system === "monday" && !demo ? " On the Monday board, In progress is recorded as Contacted." : ""}</small></label><label className="call-field">Interest level<select value={draft.interest} onChange={e => patch({ interest: e.target.value as CallDraft["interest"] })}><option value="">Leave current level unchanged</option><option>Cold</option><option>Warm</option><option>Hot</option></select></label>{field("nextStep", "Agreed action, owner & date", "E.g. Josh sends the scoped proposal Thursday; client reviews it with their partner Friday. Or: no next step agreed.", true)}<label className="call-field">Next follow-up date<input type="date" value={draft.followupDate} onChange={e => patch({ followupDate: e.target.value })} /><small>Leave blank to keep the existing date.</small></label><label className="call-field">Around what time?<select value={draft.followupTime} onChange={e => patch({ followupTime: e.target.value })}><option value="">No set time (all-day)</option>{HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select><small>“Does around 9am work?” — it goes on your follow-up calendar as a 30-minute block.</small></label>{field("notes", "Final conversation notes", "Key examples, their words, concerns, and what they actually agreed to. Separate facts from your interpretation.")}<div className={`call-book-cta call-wide ${draft.followupDate ? "is-booked" : ""}`} role="status">{draft.followupDate ? <><span>✔</span> Follow-up booked for {new Date(`${draft.followupDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{draft.followupTime ? ` around ${prettyTime(draft.followupTime)}` : ""}</> : <><span>📞</span> Book the follow-up call!</>}</div><div className="call-review call-wide"><h3>Quick recap</h3><p><b>Goal:</b> {draft.goal || "Not captured"}</p><p><b>Problem & impact:</b> {draft.challenge || "Not captured"}</p><p><b>Recommendation:</b> {draft.recommendation || "Not captured"}</p><p><b>Next step:</b> {draft.nextStep || "Not captured"}</p></div></div></>}
        </fieldset>
        {saveError && <div className="call-alert" role="alert"><strong>Your draft is still here.</strong><p>{saveError}</p>{conflict && <><p>Someone changed this {crm} record. Load the latest details and review the prior notes before saving again.</p><button className="call-secondary" disabled={assigning} onClick={() => { rebase.current = true; setRevision(x => x + 1); }}>Load latest {crm} record</button></>}</div>}
        <footer className="call-form-footer"><span aria-live="polite">{saving ? `Saving to ${crm}… Keep this page open.` : entry.result ? "Saved conversation" : entry.dirty ? `Unsaved to ${crm} · draft kept in this tab` : "Ready when you are"}</span><div>{step > 0 && <button className="call-secondary" onClick={() => setStep(x => x - 1)}>Back</button>}{step < 3 ? <button className="call-primary" onClick={() => setStep(x => x + 1)}>Next: {steps[step + 1]} →</button> : <button className="call-primary" disabled={saving || assigning || !!entry.result || conflict} onClick={save}>{saving ? "Saving…" : demo ? "Save demo conversation" : `Save conversation to ${crm}`}</button>}</div></footer>
        <p className="call-save-explainer">Saving appends a conversation note and updates supported call fields. Existing notes stay intact. No emails, texts, or calls are sent automatically.</p>
      </> : null}
    </section></div>
  </main>;
}

/** "My follow-up calendar": the signed-in rep's private subscribe link, shown on demand. */
function CalendarFeed() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ me: { name: string; url: string; webcal: string } | null; all: { name: string; url: string; webcal: string }[] } | null>(null);
  const [copied, setCopied] = useState("");
  const load = async () => { setOpen(o => !o); if (data) return; try { setData(await json(await fetch("/api/team/followups", { cache: "no-store" }))); } catch { setData({ me: null, all: [] }); } };
  const copy = async (url: string) => { try { await navigator.clipboard.writeText(url); setCopied(url); window.setTimeout(() => setCopied(""), 1500); } catch { /* field stays selectable */ } };
  const row = (r: { name: string; url: string; webcal: string }) => <div key={r.name} className="call-feed-row"><b>Follow-ups · {r.name}</b><input readOnly value={r.url} onFocus={e => e.currentTarget.select()} /><div><button type="button" className="call-secondary" onClick={() => copy(r.url)}>{copied === r.url ? "Copied!" : "Copy link"}</button><a className="call-secondary" href={r.webcal}>Add to Apple Calendar</a></div></div>;
  return <div className="call-feed">
    <button type="button" className="call-secondary" onClick={load}>📅 My follow-up calendar</button>
    {open && <div className="call-feed-body">
      {!data && <p className="call-muted">Loading…</p>}
      {data && !data.me && !data.all.length && <p className="call-muted">No calendar for this sign-in. Dave, Josh and Keaton each have one.</p>}
      {data?.me && row(data.me)}
      {data && data.all.filter(r => r.name !== data.me?.name).map(row)}
      <p className="call-muted">Google Calendar: Other calendars → + → From URL → paste the link. It shows as its own calendar, separate from the Cowboys calendar. Every lead you own with a follow-up date appears; timed ones are 30-minute blocks. Google refreshes subscribed calendars every few hours; iPhone can refresh hourly. Keep the link private — it is the key.</p>
    </div>}
  </div>;
}

