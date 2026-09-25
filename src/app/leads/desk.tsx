"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CallDraft, CallHistory, CallLead, CallsPageData, SaveCallResult } from "./types";
import { CALL_OUTCOMES, isCallOutcome, mondayOutcome } from "@/lib/calls/outcomes";
import { CALL_OWNERS, compareLeads, contactStage, matchesOwner } from "@/lib/calls/roster";
import { RefreshIcon } from "./icons";
import "./calls.css";

type Entry = { draft: CallDraft; dirty: boolean; result?: SaveCallResult };
type Entries = Record<string, Entry>;
const steps = ["Connect", "Discover", "Recommend", "Wrap up"];
const reps = ["Dave", "Josh", "Keaton"] as const;
type AssignName = (typeof reps)[number] | "";
// Monday user ids for the desk team — must match TEAM in src/lib/calls/monday.ts.
const repIds: Record<string, AssignName> = { "39848115": "Dave", "39848217": "Josh", "116679004": "Keaton" };
const ownerNameFor = (id: string): AssignName => repIds[id] || "";
const outcomes = CALL_OUTCOMES;
const demoLeads: CallLead[] = [
  { id: "demo-1", name: "Juniper & Co. Garden Care", contact: "Alex Example", email: "alex@example.com", phone: "", website: "https://example.com", city: "Sample City", owner: "Josh", ownerId: "39848217", outreach: "Not Contacted", interest: "Warm", notes: "Fictional submission: looking for a steadier stream of local customers. Asked about a website refresh.", lastContact: "", nextFollowup: "", quotedMonthly: "", interestedIn: "Website, local search", auditScore: "62", auditReport: "", group: "Giveaway entries", updatedAt: "demo-version-1", mondayUrl: "" },
  { id: "demo-2", name: "North Star Home Services", contact: "Taylor Example", email: "taylor@example.com", phone: "", website: "", city: "Sample Town", owner: "Dave", ownerId: "39848115", outreach: "Call Booked", interest: "Hot", notes: "Fictional submission: referrals are strong; wants help following up with inquiries.", lastContact: "", nextFollowup: "", quotedMonthly: "97", interestedIn: "CRM", auditScore: "", auditReport: "", group: "Giveaway entries", updatedAt: "demo-version-2", mondayUrl: "" },
];
function fresh(lead: CallLead, rep: CallDraft["rep"]): Entry {
  return { dirty: false, draft: { callId: crypto.randomUUID(), leadId: lead.id, expectedUpdatedAt: lead.updatedAt, rep, goal: "", currentMarketing: "", challenge: "", budget: "", timing: "", recommendation: "", notes: "", nextStep: "", outcome: "", interest: "", followupDate: "", quotedMonthly: "" } };
}
function safeUrl(value: string) {
  if (!value.trim()) return null;
  try { const u = new URL(value.includes(":") ? value : `https://${value}`); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; }
}
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again; your draft stays in this tab." : "Monday could not complete that request. Please try again.")), { status: response.status });
  return data;
}
export default function Desk({ demo = false, onStartOnboarding }: { demo?: boolean; onStartOnboarding?: (lead: CallLead) => void }) {
  const storageKey = demo ? "cc-call-desk-demo-v1" : "cc-call-desk-v1";
  const [leads, setLeads] = useState<CallLead[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [board, setBoard] = useState("Giveaway leads");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [spin, setSpin] = useState(false); // one visible turn per click, even when Monday answers fast
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
        ? { lead: { ...detail, owner, ownerId: Object.entries(repIds).find(([, name]) => name === owner)?.[0] || "" } }
        : await json<{ lead: CallLead }>(await fetch(`/api/team/calls/${encodeURIComponent(id)}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, expectedUpdatedAt: currentEntry.draft.expectedUpdatedAt }),
        }));
      setDetail(data.lead);
      setLeads(prev => prev.map(l => l.id === id ? data.lead : l));
      // Assignment changes Monday's version. Keep the notes and carry forward
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
      const data: CallsPageData = demo ? { leads: demoLeads, cursor: null, boardName: "Christmas in September" } : await json(await fetch(`/api/team/calls${nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : ""}`, { cache: "no-store" }));
      setLeads(prev => nextCursor ? [...new Map([...prev, ...data.leads].map(x => [x.id, x])).values()] : data.leads);
      setCursor(data.cursor); setBoard(data.boardName);
    } catch (e) { setListError(e instanceof Error ? e.message : "Could not load the entrant list."); }
    finally { listLock.current = false; setListLoading(false); }
  }, [demo]);
  // The initial request synchronizes this view with the external Monday service.
  useEffect(() => { void loadList(); }, [loadList]);
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
        if (!existing) commit({ ...entriesRef.current, [selected]: fresh(data.lead, ownerNameFor(data.lead.ownerId) || rep) });
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
    if (ownerNameFor(detail.ownerId) !== draft.rep) { setSaveError("Choose the caller to confirm the Monday owner before saving."); return; }
    if (![draft.notes, draft.nextStep, draft.goal, draft.challenge].some(value => value.trim())) {
      setSaveError("Add a conversation note, goal, challenge, or next step before saving."); return;
    }
    if (draft.quotedMonthly && (!/^\d{1,6}(?:\.\d{1,2})?$/.test(draft.quotedMonthly) || Number(draft.quotedMonthly) > 100000)) {
      setSaveError("Enter a monthly quote between 0 and 100,000, with no more than two decimal places."); return;
    }
    saveLock.current = true; setSaving(true); setSaveError(""); const id = selected;
    commit({ ...entriesRef.current, [id]: { ...entry, dirty: true } });
    try {
      const result: SaveCallResult = demo ? { saved: true, updateId: "demo-save", mondayUrl: "", warning: "Demo only. This note is saved in this browser tab; nothing was sent to Monday." } : await json(await fetch(`/api/team/calls/${encodeURIComponent(id)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) }));
      commit({ ...entriesRef.current, [id]: { draft, dirty: false, result } });
      if (!demo) setRevision(x => x + 1);
      setLeads(prev => prev.map(x => x.id === id && !result.warning ? { ...x, lastContact: new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date()), outreach: mondayOutcome(draft.outcome as (typeof CALL_OUTCOMES)[number]), interest: draft.interest || x.interest, nextFollowup: draft.followupDate || x.nextFollowup } : x));
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Save failed. Your draft is still here."); setConflict((e as { status?: number }).status === 409); }
    finally { saveLock.current = false; setSaving(false); }
  };
  const filtered = leads.filter(l => matchesOwner(l, owner) && (queue === "all" || contactStage(l) === queue) && (!status || l.outreach === status) && `${l.name} ${l.contact} ${l.email} ${l.city}`.toLowerCase().includes(search.toLowerCase())).sort(compareLeads);
  const lastConversation = history.find(h => h.isCallNote) || history[0];
  const field = (key: keyof Pick<CallDraft, "goal" | "currentMarketing" | "challenge" | "budget" | "timing" | "recommendation" | "notes" | "nextStep">, label: string, placeholder: string, wide = false) => <label className={wide ? "call-field call-wide" : "call-field"}>{label}<textarea rows={key === "notes" ? 4 : 3} value={draft?.[key] || ""} onChange={e => patch({ [key]: e.target.value })} placeholder={placeholder} maxLength={key === "notes" ? 8000 : key === "budget" || key === "timing" ? 500 : 2000} /></label>;
  const link = (value: string, label: string) => { const href = safeUrl(value); return href ? <a href={href} target="_blank" rel="noreferrer">{label} ↗</a> : null; };
  return <main className="call-desk">
    <header className="call-header"><Link className="call-brand" href="/"><Image src="/cowboys-logo-stacked-orange.png" alt="Creative Cowboys" width={150} height={64} priority /><span>TEAM FIELD GUIDE</span></Link><div className="call-header-title"><span className="call-eyebrow">CHRISTMAS IN SEPTEMBER</span><h1>Good conversations.<br className="call-mobile-break" /> Real next steps.</h1></div><div className="call-mode">{demo ? "FICTIONAL DEMO" : "MONDAY CALL WORKSPACE"}<span>Ask. Listen. Find the right fit.</span></div></header>
    {demo && <div className="call-demo-banner">Preview workspace · All businesses below are fictional. Demo saves stay in this browser tab.</div>}
    {storageError && <div role="alert" className="call-alert">{storageError}</div>}
    <div className="call-layout"><aside className="call-roster" aria-label="Giveaway entrants">
      <div className="call-roster-heading"><div><span className="call-eyebrow">YOUR STARTING POINT</span><h2>The people.</h2></div><button className={`call-icon-button ${spin || listLoading ? "is-spinning" : ""}`} onClick={() => { setSpin(true); window.setTimeout(() => setSpin(false), 900); void loadList(); }} disabled={listLoading || saving || assigning} aria-label={demo ? "Refresh sample entrant list" : "Refresh Monday entrant list"}><RefreshIcon /></button></div>
      <p className="call-muted call-board-name">{board}</p>
      <label className="call-search"><span className="call-sr-only">Search loaded entrants</span><input placeholder="Search a name or business…" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="call-filters"><label><span className="call-sr-only">Filter by owner</span><select value={owner} onChange={e => setOwner(e.target.value)}><option value="">All owners</option>{CALL_OWNERS.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}<option value="unassigned">Unassigned</option></select></label><label><span className="call-sr-only">Filter by outreach status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{[...new Set(leads.map(x => x.outreach).filter(Boolean))].sort().map(x => <option key={x}>{x}</option>)}</select></label></div>
      <label className="call-queue-filter">Show leads<select aria-label="Filter by contact stage" value={queue} onChange={e => { setQueue(e.target.value); setStatus(""); }}><option value="all">All leads</option><option value="new">Not contacted yet</option><option value="active">Contacted / working on</option><option value="closed">Closed / bad number</option></select></label>
      <p className="call-order-hint">Not contacted first, then oldest contact. Choose an owner to see their leads.</p>
      <div className="call-list-count">{filtered.length} shown · {leads.length} loaded{cursor ? " · more available" : ""}</div>
      {listError && <div className="call-alert" role="alert">{listError}<button onClick={() => loadList(cursor || undefined)}>Try again</button></div>}
      <div className="call-person-list">{filtered.map(lead => <button key={lead.id} onClick={() => choose(lead.id)} disabled={saving || assigning} className={`call-person ${selected === lead.id ? "is-active" : ""}`} aria-pressed={selected === lead.id}><span className="call-person-top"><span>{lead.name}</span><span aria-hidden="true">↗</span></span><span className="call-person-contact">{lead.contact || "Contact not supplied"}{lead.city && ` · ${lead.city}`}</span><span className="call-person-bottom"><span className="call-status">{lead.outreach || "No status"}</span><span>{entries[lead.id]?.dirty ? "Draft saved here" : lead.owner || "Unassigned"}</span></span></button>)}</div>
      {listLoading && <p role="status" className="call-roster-message">Loading entrants…</p>}
      {!listLoading && !filtered.length && <p className="call-roster-message">{leads.length ? "No leads match these filters. Try All leads or another owner." : "No entrants are available yet."}</p>}
      {cursor && <button className="call-secondary call-load-more" disabled={listLoading} onClick={() => loadList(cursor)}>Load more entrants</button>}
      <div className="call-roster-foot"><span>01 — PEOPLE FIRST</span><p>Start with their business. A useful conversation is a win, even when the answer is “not right now.”</p></div>
    </aside><section className="call-workspace" aria-label="Guided conversation">
      {!selected ? <div className="call-welcome"><span className="call-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2>Pick a person.<br />Find out what’s next.</h2><p>Select an entrant to bring their business, past notes, and your conversation guide into one place.</p><div className="call-welcome-steps">{steps.map((s, i) => <span key={s}><b>0{i + 1}</b>{s}</span>)}</div><p className="call-muted">Your notes stay in this tab until you choose to save them to Monday.</p></div> : detailLoading ? <div className="call-empty" role="status">Loading this business and its Monday history…</div> : detailError ? <div className="call-empty"><div role="alert">{detailError}</div><button className="call-secondary" onClick={() => setRevision(x => x + 1)}>Try again</button><a href="/team/login?next=/team/calls">Team sign in</a></div> : detail && draft ? <>
        <div className="call-contact"><div><span className="call-eyebrow">{detail.group || "GIVEAWAY ENTRY"}{detail.city && ` / ${detail.city}`}</span><h2>{detail.name}</h2><p>{detail.contact || "Contact name not supplied"}<span className="call-contact-owner">Assigned to <select className="call-assign" value={ownerNameFor(detail.ownerId)} disabled={assigning || saving || !!entry?.result || conflict} onChange={e => void assign(e.target.value as AssignName)} aria-label="Assign this lead"><option value="">Unassigned</option>{reps.map(r => <option key={r} value={r}>{r}</option>)}</select>{assigning && <em> saving…</em>}{assignError && <em className="call-assign-error" role="alert"> {assignError}</em>}</span></p></div><div className="call-contact-actions">{detail.phone && <a className="call-phone" href={`tel:${detail.phone.replace(/[^+\d]/g, "")}`}>{detail.phone}</a>}{!detail.phone && <span className="call-muted">No phone on file</span>}{detail.email && <span className="call-email">{detail.email}</span>}<div>{link(detail.website, "Website")}{link(detail.auditReport, "Audit")}{link(detail.mondayUrl, "Monday")}</div>{onStartOnboarding && !demo && <button type="button" className="call-secondary call-handoff-button" disabled={saving || assigning} onClick={() => onStartOnboarding(detail)}>{detail.outreach === "Won" ? "View onboarding" : "Start onboarding →"}</button>}</div></div>
        <div className="call-context"><div><span>INTERESTED IN</span><strong>{detail.interestedIn || "Discover together"}</strong></div><div><span>LAST CONTACT</span><strong>{detail.lastContact || "Not recorded"}</strong></div><div><span>FOLLOW-UP</span><strong>{detail.nextFollowup || "Not scheduled"}</strong></div><div><span>PRIOR MONTHLY QUOTE</span><strong>{detail.quotedMonthly ? `$${detail.quotedMonthly}` : "None recorded"}</strong></div></div>
        <section className="call-last-conversation" aria-label="Last saved notes">
          <div className="call-last-heading"><h3>{lastConversation?.isCallNote ? "Last saved conversation" : "Latest saved notes"}</h3>{lastConversation && <span>{lastConversation.author} · {new Date(lastConversation.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>}</div>
          <p className="call-preserve">{lastConversation?.text || detail.notes || "No saved notes yet. Your next saved conversation will appear here."}</p>
          <small>Saved in Monday. Add today’s notes in the guide below.</small>
        </section>
        <details className="call-prior"><summary>Before you call <span>Submission, audit & prior conversations</span></summary><div className="call-prior-content">{detail.auditScore && <p><b>Audit score:</b> {detail.auditScore} · Use the audit as a starting point, not a promise.</p>}<h3>Existing Monday notes</h3><p className="call-preserve">{detail.notes || "No existing notes."}</p>{history.length > 0 && <h3>Recent Monday updates</h3>}{history.map(h => <article key={h.id}><small>{h.author || "Team"} · {h.createdAt}</small><p className="call-preserve">{h.text}</p></article>)}{!history.length && <p className="call-muted">No recent updates returned.</p>}</div></details>
        <div className="call-guide-head"><div><span className="call-eyebrow">CONVERSATION GUIDE</span><p>Make it your own. Listen more than you pitch.</p></div><label className="call-rep">Calling as <select value={ownerNameFor(detail.ownerId) === draft.rep ? draft.rep : ""} disabled={saving || assigning || !!entry.result || conflict} onChange={e => void assign(e.target.value as CallDraft["rep"])}><option value="" disabled>Choose caller…</option>{reps.map(r => <option key={r}>{r}</option>)}</select><small aria-live="polite">{assigning ? "Updating Monday owner…" : "Selecting a caller sets the Monday owner"}</small></label></div>
        <nav className="call-step-tabs" aria-label="Conversation steps">{steps.map((s, i) => <button key={s} onClick={() => setStep(i)} className={i === step ? "is-active" : ""} aria-current={i === step ? "step" : undefined}><span>0{i + 1}</span>{s}</button>)}</nav>
        {entry.result && <div className={entry.result.warning ? "call-alert call-saved" : "call-success call-saved"} role="status"><strong>{demo ? "Demo conversation saved." : "Conversation note saved to Monday."}</strong>{entry.result.warning && <p>{entry.result.warning}</p>}{link(entry.result.mondayUrl, "Review saved note in Monday")}<button className="call-secondary" onClick={() => { commit({ ...entriesRef.current, [selected]: fresh(detail, draft.rep) }); rebase.current = true; setRevision(x => x + 1); setStep(0); }}>Start another conversation</button></div>}
        <fieldset className="call-form" disabled={saving || assigning || !!entry.result}>
          {step === 0 && <><div className="call-script"><span>TRY OPENING WITH</span><p>“Hey {detail.contact.split(" ")[0] || "there"}, it’s {draft.rep} with Creative Cowboys. Thanks for entering Christmas in September. I’d love to hear a little more about your business and see if there’s anything we can help with. Do you have a few minutes?”</p><small>Review their submission first. Ask only what you still need to know. Confirm any drawing result separately; if they are busy, offer a callback.</small></div><div className="call-fields">{field("goal", "What would make this a useful conversation?", "Their goals, in their own words…", true)}{field("notes", "Anything to know before you get going?", "Context, preferences, or something they mentioned…", true)}</div></>}
          {step === 1 && <><div className="call-script"><span>FOLLOW THEIR ANSWERS</span><p>“Think about the last few customers you worked with. How did they find you? What went well, and where did things get difficult?”</p><small>Start with a real example, then follow their answer. Ask one question at a time and leave room to listen.</small></div><details className="call-coaching"><summary>Helpful follow-up questions</summary><ul><li><strong>Get specific:</strong> “Can you walk me through the most recent time that happened?”</li><li><strong>Understand the impact:</strong> “What happened as a result? Did it affect your time, workload or customers?”</li><li><strong>Find what matters:</strong> “Of the things we’ve discussed, which would you most like to improve, and why?”</li></ul><p>Use the questions that fit. Don’t assume every business needs more leads or turn an estimate into a promised return.</p></details><div className="call-fields">{field("goal", "What would a better outcome look like?", "Their priority and how they would recognize progress.")}{field("currentMarketing", "What have they tried? What happened?", "Recent customer sources, current approach, past attempts and results.")}{field("challenge", "Recent obstacle & its impact", "A specific example; effects on time, missed work or follow-up. Keep estimates in their words.")}{field("budget", "Current spend & budget process", "Ask permission: what do they spend now, and how are new expenses approved? Unknown is okay.")}{field("timing", "Timing & decision makers", "Why now? Who else needs to be involved? Record their actual timing, not an assumed deadline.", true)}</div></>}
          {step === 2 && <><div className="call-script"><span>CONNECT THE NEED TO THE NEXT STEP</span><p>“You mentioned [specific problem], and you want [their goal]. Have I understood that? If so, I’d suggest [next step] because [how it helps]. What concerns would you have?”</p><small>Confirm the need before recommending a service. Explain the fit, scope and limits. If you need more information, agree on how to get it first.</small></div><div className="call-pricing"><div><strong>Local Growth</strong><b>$297 / month</b><p>First 12 months with a 12-month agreement; then $497/month. Website separate.</p></div><div><strong>Website</strong><b>$497 + $30 / month</b><p>One-time build plus monthly hosting. Confirm page count and scope.</p></div><div><strong>CRM + chat</strong><b>$97 / month</b><p>Chat included. Chat alone: $47/month.</p></div><div><strong>Strategy session</strong><b>$997 once</b><p>Confirm the session’s deliverables before committing.</p></div></div><div className="call-pricing-note">Needs a scope conversation: ads pricing and ad-spend inclusion are unresolved; AI SEO and Max Growth deliverables are not finalized. No ranking guarantees or free website bundles.</div><div className="call-fields">{field("recommendation", "Recommendation & why it fits", "Their stated need → suggested service or next step → why it fits. Include concerns and open questions.", true)}<label className="call-field">Monthly amount actually quoted<input type="number" min="0" max="100000" step="0.01" placeholder="Leave blank if not quoted" value={draft.quotedMonthly} onChange={e => patch({ quotedMonthly: e.target.value })} /><small>Record one-time fees and exact terms in the notes.</small></label>{field("notes", "Offer details / conversation notes", "Include only terms actually discussed.")}</div></>}
          {step === 3 && <><div className="call-script"><span>LEAVE WITH A CLEAR AGREEMENT</span><p>“Have I captured what matters most? Would [specific next step] be useful? Let’s agree who will do what and when.”</p><small>A useful next step has an action, an owner and a date. If they only want information or don’t want to continue, record that honestly.</small></div><div className="call-fields"><label className="call-field">Call outcome<select value={isCallOutcome(draft.outcome) || entry.result ? draft.outcome : ""} onChange={e => patch({ outcome: e.target.value as CallDraft["outcome"] })}><option value="" disabled>Choose outcome…</option>{entry.result && draft.outcome && !isCallOutcome(draft.outcome) && <option value={draft.outcome}>{draft.outcome}</option>}{outcomes.map(o => <option key={o}>{o}</option>)}</select><small>Choose what happened on this call. For a booked followup, add the agreed date below.</small></label><label className="call-field">Interest level<select value={draft.interest} onChange={e => patch({ interest: e.target.value as CallDraft["interest"] })}><option value="">Leave current level unchanged</option><option>Cold</option><option>Warm</option><option>Hot</option></select></label>{field("nextStep", "Agreed action, owner & date", "E.g. Josh sends the scoped proposal Thursday; client reviews it with their partner Friday. Or: no next step agreed.", true)}<label className="call-field">Next follow-up date<input type="date" value={draft.followupDate} onChange={e => patch({ followupDate: e.target.value })} /><small>Leave blank to keep the existing date.</small></label>{field("notes", "Final conversation notes", "Key examples, their words, concerns, and what they actually agreed to. Separate facts from your interpretation.")}<div className="call-review call-wide"><h3>Quick recap</h3><p><b>Goal:</b> {draft.goal || "Not captured"}</p><p><b>Problem & impact:</b> {draft.challenge || "Not captured"}</p><p><b>Recommendation:</b> {draft.recommendation || "Not captured"}</p><p><b>Next step:</b> {draft.nextStep || "Not captured"}</p></div></div></>}
        </fieldset>
        {saveError && <div className="call-alert" role="alert"><strong>Your draft is still here.</strong><p>{saveError}</p>{conflict && <><p>Someone changed this Monday record. Load the latest details and review the prior notes before saving again.</p><button className="call-secondary" disabled={assigning} onClick={() => { rebase.current = true; setRevision(x => x + 1); }}>Load latest Monday record</button></>}</div>}
        <footer className="call-form-footer"><span aria-live="polite">{saving ? "Saving to Monday… Keep this page open." : entry.result ? "Saved conversation" : entry.dirty ? "Unsaved to Monday · draft kept in this tab" : "Ready when you are"}</span><div>{step > 0 && <button className="call-secondary" onClick={() => setStep(x => x - 1)}>Back</button>}{step < 3 ? <button className="call-primary" onClick={() => setStep(x => x + 1)}>Next: {steps[step + 1]} →</button> : <button className="call-primary" disabled={saving || assigning || !!entry.result || conflict} onClick={save}>{saving ? "Saving…" : demo ? "Save demo conversation" : "Save conversation to Monday"}</button>}</div></footer>
        <p className="call-save-explainer">Saving appends a conversation note and updates supported call fields. Existing notes stay intact. No emails, texts, or calls are sent automatically.</p>
      </> : null}
    </section></div>
  </main>;
}
