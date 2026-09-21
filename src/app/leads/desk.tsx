"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CallDraft, CallHistory, CallLead, CallsPageData, SaveCallResult } from "./types";
import "./calls.css";

type Entry = { draft: CallDraft; dirty: boolean; result?: SaveCallResult };
type Entries = Record<string, Entry>;
const steps = ["Connect", "Discover", "Recommend", "Wrap up"];
const reps = ["Dave", "Josh", "Keaton"] as const;
const outcomes: CallDraft["outcome"][] = ["Call Held", "Contacted", "Call Booked", "Not Interested"];
const demoLeads: CallLead[] = [
  { id: "demo-1", name: "Juniper & Co. Garden Care", contact: "Alex Example", email: "alex@example.com", phone: "", website: "https://example.com", city: "Sample City", owner: "Josh", outreach: "Not Contacted", interest: "Warm", notes: "Fictional submission: looking for a steadier stream of local customers. Asked about a website refresh.", lastContact: "", nextFollowup: "", quotedMonthly: "", interestedIn: "Website, local search", auditScore: "62", auditReport: "", group: "Giveaway entries", updatedAt: "demo-version-1", mondayUrl: "" },
  { id: "demo-2", name: "North Star Home Services", contact: "Taylor Example", email: "taylor@example.com", phone: "", website: "", city: "Sample Town", owner: "Dave", outreach: "Call Booked", interest: "Hot", notes: "Fictional submission: referrals are strong; wants help following up with inquiries.", lastContact: "", nextFollowup: "", quotedMonthly: "97", interestedIn: "CRM", auditScore: "", auditReport: "", group: "Giveaway entries", updatedAt: "demo-version-2", mondayUrl: "" },
];
function fresh(lead: CallLead, rep: CallDraft["rep"]): Entry {
  return { dirty: false, draft: { callId: crypto.randomUUID(), leadId: lead.id, expectedUpdatedAt: lead.updatedAt, rep, goal: "", currentMarketing: "", challenge: "", budget: "", timing: "", recommendation: "", notes: "", nextStep: "", outcome: "Call Held", interest: "", followupDate: "", quotedMonthly: "" } };
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
export default function Desk({ demo = false }: { demo?: boolean }) {
  const storageKey = demo ? "cc-call-desk-demo-v1" : "cc-call-desk-v1";
  const [leads, setLeads] = useState<CallLead[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [board, setBoard] = useState("Giveaway leads");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
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
  const [step, setStep] = useState(0);
  const [rep, setRep] = useState<CallDraft["rep"]>("Dave");
  const [saving, setSaving] = useState(false);
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
    const warn = (e: BeforeUnloadEvent) => { if (Object.values(entriesRef.current).some(x => x.dirty) || saveLock.current) { e.preventDefault(); e.returnValue = ""; } };
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
    setDetail(null); setHistory([]); setDetailError(""); setDetailLoading(true); setSaveError(""); setConflict(false);
    (async () => {
      try {
        const data = demo ? { lead: demoLeads.find(x => x.id === selected)!, history: [] as CallHistory[] } : await json<{ lead: CallLead; history: CallHistory[] }>(await fetch(`/api/team/calls/${encodeURIComponent(selected)}`, { cache: "no-store", signal: controller.signal }));
        if (!current) return;
        setDetail(data.lead); setHistory(data.history);
        setLeads(prev => prev.map(x => x.id === selected ? data.lead : x));
        const existing = entriesRef.current[selected];
        if (!existing) commit({ ...entriesRef.current, [selected]: fresh(data.lead, rep) });
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
  const choose = (id: string) => { if (!saveLock.current && id !== selected) { rebase.current = false; setDetail(null); setDetailLoading(true); setSelected(id); setStep(0); } };
  const save = async () => {
    if (saveLock.current || !draft || entry?.result || !detail || conflict) return;
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
      setLeads(prev => prev.map(x => x.id === id && !result.warning ? { ...x, outreach: draft.outcome, interest: draft.interest || x.interest, nextFollowup: draft.followupDate || x.nextFollowup } : x));
    } catch (e) { setSaveError(e instanceof Error ? e.message : "Save failed. Your draft is still here."); setConflict((e as { status?: number }).status === 409); }
    finally { saveLock.current = false; setSaving(false); }
  };
  const filtered = leads.filter(l => (!owner || l.owner === owner) && (!status || l.outreach === status) && `${l.name} ${l.contact} ${l.email} ${l.city}`.toLowerCase().includes(search.toLowerCase()));
  const field = (key: keyof Pick<CallDraft, "goal" | "currentMarketing" | "challenge" | "budget" | "timing" | "recommendation" | "notes" | "nextStep">, label: string, placeholder: string, wide = false) => <label className={wide ? "call-field call-wide" : "call-field"}>{label}<textarea rows={key === "notes" ? 4 : 3} value={draft?.[key] || ""} onChange={e => patch({ [key]: e.target.value })} placeholder={placeholder} maxLength={key === "notes" ? 8000 : key === "budget" || key === "timing" ? 500 : 2000} /></label>;
  const link = (value: string, label: string) => { const href = safeUrl(value); return href ? <a href={href} target="_blank" rel="noreferrer">{label} ↗</a> : null; };
  return <main className="call-desk">
    <header className="call-header"><Link className="call-brand" href="/">CREATIVE<br />COWBOYS<span>TEAM FIELD GUIDE</span></Link><div className="call-header-title"><span className="call-eyebrow">CHRISTMAS IN SEPTEMBER</span><h1>Good conversations.<br className="call-mobile-break" /> Real next steps.</h1></div><div className="call-mode">{demo ? "FICTIONAL DEMO" : "MONDAY CALL WORKSPACE"}<span>Ask. Listen. Find the right fit.</span></div></header>
    {demo && <div className="call-demo-banner">Preview workspace · All businesses below are fictional. Demo saves stay in this browser tab.</div>}
    {storageError && <div role="alert" className="call-alert">{storageError}</div>}
    <div className="call-layout"><aside className="call-roster" aria-label="Giveaway entrants">
      <div className="call-roster-heading"><div><span className="call-eyebrow">YOUR STARTING POINT</span><h2>The people.</h2></div><button className="call-icon-button" onClick={() => loadList()} disabled={listLoading || saving} aria-label={demo ? "Refresh sample entrant list" : "Refresh Monday entrant list"}>↻</button></div>
      <p className="call-muted call-board-name">{board}</p>
      <label className="call-search"><span className="call-sr-only">Search loaded entrants</span><input placeholder="Search a name or business…" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="call-filters"><label><span className="call-sr-only">Filter by owner</span><select value={owner} onChange={e => setOwner(e.target.value)}><option value="">All owners</option>{[...new Set(leads.map(x => x.owner).filter(Boolean))].sort().map(x => <option key={x}>{x}</option>)}</select></label><label><span className="call-sr-only">Filter by outreach status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{[...new Set(leads.map(x => x.outreach).filter(Boolean))].sort().map(x => <option key={x}>{x}</option>)}</select></label></div>
      <div className="call-list-count">{filtered.length} shown · {leads.length} loaded{cursor ? " · more available" : ""}</div>
      {listError && <div className="call-alert" role="alert">{listError}<button onClick={() => loadList(cursor || undefined)}>Try again</button></div>}
      <div className="call-person-list">{filtered.map(lead => <button key={lead.id} onClick={() => choose(lead.id)} disabled={saving} className={`call-person ${selected === lead.id ? "is-active" : ""}`} aria-pressed={selected === lead.id}><span className="call-person-top"><span>{lead.name}</span><span aria-hidden="true">↗</span></span><span className="call-person-contact">{lead.contact || "Contact not supplied"}{lead.city && ` · ${lead.city}`}</span><span className="call-person-bottom"><span className="call-status">{lead.outreach || "No status"}</span><span>{entries[lead.id]?.dirty ? "Draft saved here" : lead.owner || "Unassigned"}</span></span></button>)}</div>
      {listLoading && <p role="status" className="call-roster-message">Loading entrants…</p>}
      {!listLoading && !filtered.length && <p className="call-roster-message">{leads.length ? "No matching people in the loaded entries. Adjust your filters or load more." : "No entrants are available yet."}</p>}
      {cursor && <button className="call-secondary call-load-more" disabled={listLoading} onClick={() => loadList(cursor)}>Load more entrants</button>}
      <div className="call-roster-foot"><span>01 — PEOPLE FIRST</span><p>Start with their business. A useful conversation is a win, even when the answer is “not right now.”</p></div>
    </aside><section className="call-workspace" aria-label="Guided conversation">
      {!selected ? <div className="call-welcome"><span className="call-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2>Pick a person.<br />Find out what’s next.</h2><p>Select an entrant to bring their business, past notes, and your conversation guide into one place.</p><div className="call-welcome-steps">{steps.map((s, i) => <span key={s}><b>0{i + 1}</b>{s}</span>)}</div><p className="call-muted">Your notes stay in this tab until you choose to save them to Monday.</p></div> : detailLoading ? <div className="call-empty" role="status">Loading this business and its Monday history…</div> : detailError ? <div className="call-empty"><div role="alert">{detailError}</div><button className="call-secondary" onClick={() => setRevision(x => x + 1)}>Try again</button><a href="/team/login?next=/team/calls">Team sign in</a></div> : detail && draft ? <>
        <div className="call-contact"><div><span className="call-eyebrow">{detail.group || "GIVEAWAY ENTRY"}{detail.city && ` / ${detail.city}`}</span><h2>{detail.name}</h2><p>{detail.contact || "Contact name not supplied"}<span className="call-contact-owner">Monday owner: {detail.owner || "Unassigned"}</span></p></div><div className="call-contact-actions">{detail.phone && <a className="call-phone" href={`tel:${detail.phone.replace(/[^+\d]/g, "")}`}>{detail.phone}</a>}{!detail.phone && <span className="call-muted">No phone on file</span>}{detail.email && <span className="call-email">{detail.email}</span>}<div>{link(detail.website, "Website")}{link(detail.auditReport, "Audit")}{link(detail.mondayUrl, "Monday")}</div></div></div>
        <div className="call-context"><div><span>INTERESTED IN</span><strong>{detail.interestedIn || "Discover together"}</strong></div><div><span>LAST CONTACT</span><strong>{detail.lastContact || "Not recorded"}</strong></div><div><span>FOLLOW-UP</span><strong>{detail.nextFollowup || "Not scheduled"}</strong></div><div><span>PRIOR MONTHLY QUOTE</span><strong>{detail.quotedMonthly ? `$${detail.quotedMonthly}` : "None recorded"}</strong></div></div>
        <details className="call-prior"><summary>Before you call <span>Submission, audit & prior conversations</span></summary><div className="call-prior-content">{detail.auditScore && <p><b>Audit score:</b> {detail.auditScore} · Use the audit as a starting point, not a promise.</p>}<h3>Existing Monday notes</h3><p className="call-preserve">{detail.notes || "No existing notes."}</p>{history.length > 0 && <h3>Recent Monday updates</h3>}{history.map(h => <article key={h.id}><small>{h.author || "Team"} · {h.createdAt}</small><p className="call-preserve">{h.text}</p></article>)}{!history.length && <p className="call-muted">No recent updates returned.</p>}</div></details>
        <div className="call-guide-head"><div><span className="call-eyebrow">CONVERSATION GUIDE</span><p>Make it your own. Listen more than you pitch.</p></div><label className="call-rep">Calling as <select value={draft.rep} disabled={saving || !!entry.result} onChange={e => { const r = e.target.value as CallDraft["rep"]; setRep(r); patch({ rep: r }); }}>{reps.map(r => <option key={r}>{r}</option>)}</select><small>Team-selected name</small></label></div>
        <nav className="call-step-tabs" aria-label="Conversation steps">{steps.map((s, i) => <button key={s} onClick={() => setStep(i)} className={i === step ? "is-active" : ""} aria-current={i === step ? "step" : undefined}><span>0{i + 1}</span>{s}</button>)}</nav>
        {entry.result && <div className={entry.result.warning ? "call-alert call-saved" : "call-success call-saved"} role="status"><strong>{demo ? "Demo conversation saved." : "Conversation note saved to Monday."}</strong>{entry.result.warning && <p>{entry.result.warning}</p>}{link(entry.result.mondayUrl, "Review saved note in Monday")}<button className="call-secondary" onClick={() => { commit({ ...entriesRef.current, [selected]: fresh(detail, draft.rep) }); rebase.current = true; setRevision(x => x + 1); setStep(0); }}>Start another conversation</button></div>}
        <fieldset className="call-form" disabled={saving || !!entry.result}>
          {step === 0 && <><div className="call-script"><span>TRY OPENING WITH</span><p>“Hey {detail.contact.split(" ")[0] || "there"}, it’s {draft.rep} with Creative Cowboys. Thanks for entering Christmas in September. I’d love to hear a little more about your business and see if there’s anything we can help with. Do you have a few minutes?”</p><small>Confirm any drawing result separately before discussing it. If now’s not a good time, arrange a callback.</small></div><div className="call-fields">{field("goal", "What would make this a useful conversation?", "Their goals, in their own words…", true)}{field("notes", "Anything to know before you get going?", "Context, preferences, or something they mentioned…", true)}</div></>}
          {step === 1 && <><div className="call-script"><span>FOLLOW THEIR ANSWERS</span><p>“What kind of work would you like more of? How are people finding you today? Where does it get frustrating?”</p><small>Ask about capacity, lead quality, follow-up, and seasonality when relevant. Don’t assume more leads are the only goal.</small></div><div className="call-fields">{field("goal", "Business goal", "More of which customers or jobs?")}{field("currentMarketing", "What’s working today?", "Referrals, website, Google, social, current provider…")}{field("challenge", "Biggest obstacle", "What gets in the way?")}{field("budget", "Comfortable investment", "Ask permission; capture a range or unknown.")}{field("timing", "Timing & decision makers", "When would they like to start? Who else is involved?", true)}</div></>}
          {step === 2 && <><div className="call-script"><span>CONNECT THE NEED TO THE NEXT STEP</span><p>“Based on what you’ve told me, I think the best place to start is… Does that feel useful, or is there something more pressing?”</p><small>Recommend only what fits. It’s fine to gather details and follow up with a scoped recommendation.</small></div><div className="call-pricing"><div><strong>Local Growth</strong><b>$297 / month</b><p>First 12 months with a 12-month agreement; then $497/month. Website separate.</p></div><div><strong>Website</strong><b>$497 + $30 / month</b><p>One-time build plus monthly hosting. Confirm page count and scope.</p></div><div><strong>CRM + chat</strong><b>$97 / month</b><p>Chat included. Chat alone: $47/month.</p></div><div><strong>Strategy session</strong><b>$997 once</b><p>Confirm the session’s deliverables before committing.</p></div></div><div className="call-pricing-note">Needs a scope conversation: ads pricing and ad-spend inclusion are unresolved; AI SEO and Max Growth deliverables are not finalized. No ranking guarantees or free website bundles.</div><div className="call-fields">{field("recommendation", "Recommendation & why it fits", "Connect their stated need to a service or next step.", true)}<label className="call-field">Monthly amount actually quoted<input type="number" min="0" max="100000" step="0.01" placeholder="Leave blank if not quoted" value={draft.quotedMonthly} onChange={e => patch({ quotedMonthly: e.target.value })} /><small>Record one-time fees and exact terms in the notes.</small></label>{field("notes", "Offer details / conversation notes", "Include only terms actually discussed.")}</div></>}
          {step === 3 && <><div className="call-script"><span>LEAVE WITH A CLEAR AGREEMENT</span><p>“Here’s what I heard, and here’s what we’ll do next. Have I got that right? When would be a good time to reconnect?”</p></div><div className="call-fields"><label className="call-field">Call outcome<select value={draft.outcome} onChange={e => patch({ outcome: e.target.value as CallDraft["outcome"] })}>{outcomes.map(o => <option key={o}>{o}</option>)}</select><small>Use Contacted for an attempt or voicemail; Call Held for a conversation.</small></label><label className="call-field">Interest level<select value={draft.interest} onChange={e => patch({ interest: e.target.value as CallDraft["interest"] })}><option value="">Leave current level unchanged</option><option>Cold</option><option>Warm</option><option>Hot</option></select></label>{field("nextStep", "Agreed next step", "Who will do what, and by when?", true)}<label className="call-field">Next follow-up date<input type="date" value={draft.followupDate} onChange={e => patch({ followupDate: e.target.value })} /><small>Leave blank to keep the existing date.</small></label>{field("notes", "Final conversation notes", "Useful context for the next teammate.")}<div className="call-review call-wide"><h3>Quick recap</h3><p><b>Goal:</b> {draft.goal || "Not captured"}</p><p><b>Recommendation:</b> {draft.recommendation || "Not captured"}</p><p><b>Next step:</b> {draft.nextStep || "Not captured"}</p></div></div></>}
        </fieldset>
        {saveError && <div className="call-alert" role="alert"><strong>Your draft is still here.</strong><p>{saveError}</p>{conflict && <><p>Someone changed this Monday record. Load the latest details and review the prior notes before saving again.</p><button className="call-secondary" onClick={() => { rebase.current = true; setRevision(x => x + 1); }}>Load latest Monday record</button></>}</div>}
        <footer className="call-form-footer"><span aria-live="polite">{saving ? "Saving to Monday… Keep this page open." : entry.result ? "Saved conversation" : entry.dirty ? "Unsaved to Monday · draft kept in this tab" : "Ready when you are"}</span><div>{step > 0 && <button className="call-secondary" onClick={() => setStep(x => x - 1)}>Back</button>}{step < 3 ? <button className="call-primary" onClick={() => setStep(x => x + 1)}>Next: {steps[step + 1]} →</button> : <button className="call-primary" disabled={saving || !!entry.result || conflict} onClick={save}>{saving ? "Saving…" : demo ? "Save demo conversation" : "Save conversation to Monday"}</button>}</div></footer>
        <p className="call-save-explainer">Saving appends a conversation note and updates supported call fields. Existing notes stay intact. No emails, texts, or calls are sent automatically.</p>
      </> : null}
    </section></div>
  </main>;
}
