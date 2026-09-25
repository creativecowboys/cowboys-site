"use client";

import { useEffect, useMemo, useState } from "react";
import { AGREEMENT, BUSINESS_TYPES, PACKAGES, PAYMENT } from "@/lib/onboarding/config";
import type { HandoffForm, StartResult } from "@/lib/onboarding/types";
import type { CallLead } from "./types";
import { CloseIcon } from "./icons";

// Sales → onboarding handoff. Opens over the call desk for the selected lead, keeps a draft per
// lead in sessionStorage (with a fixed handoffId so a retry can never create a second record),
// shows a review step, then POSTs once. Prices are typed by the rep — nothing is inferred.
const STORAGE = "cc-handoff-v1";
type Drafts = Record<string, HandoffForm>;
const ownerFor = (id: string): HandoffForm["salesOwner"] => (({ "39848115": "Dave", "39848217": "Josh", "116679004": "Keaton" } as Record<string, HandoffForm["salesOwner"]>)[id] || "Dave");

function blank(lead: CallLead): HandoffForm {
  return {
    handoffId: crypto.randomUUID(), leadId: lead.id, expectedUpdatedAt: lead.updatedAt,
    business: lead.name, contact: lead.contact, email: lead.email, phone: lead.phone, website: lead.website, city: lead.city,
    businessType: "", salesOwner: ownerFor(lead.ownerId), packages: [], monthlyAgreed: lead.quotedMonthly || "", setupAgreed: "",
    scope: "", exclusions: "", goals: "", context: "", startDate: "", agreement: "Unknown", payment: "Unknown", nextAction: "", nextOwner: "Madison", nextDue: "",
  };
}
function readDrafts(): Drafts { try { return JSON.parse(sessionStorage.getItem(STORAGE) || "{}"); } catch { return {}; } }
function writeDrafts(d: Drafts) { try { sessionStorage.setItem(STORAGE, JSON.stringify(d)); } catch { /* keep in memory only */ } }

export default function Handoff({ lead, onClose, onDone }: { lead: CallLead; onClose: () => void; onDone: (itemId: string) => void }) {
  const [form, setForm] = useState<HandoffForm>(() => readDrafts()[lead.id] || blank(lead));
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StartResult | null>(null);
  useEffect(() => { writeDrafts({ ...readDrafts(), [lead.id]: form }); }, [form, lead.id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);
  const set = (change: Partial<HandoffForm>) => setForm((f) => ({ ...f, ...change }));
  const togglePackage = (p: HandoffForm["packages"][number]) => set({ packages: form.packages.includes(p) ? form.packages.filter((x) => x !== p) : [...form.packages, p] });
  const problems = useMemo(() => {
    const list: string[] = [];
    if (!form.business.trim()) list.push("Business name");
    if (!form.packages.length) list.push("At least one package");
    if (!form.scope.trim()) list.push("Agreed scope");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) list.push("A valid email (or blank)");
    for (const k of ["monthlyAgreed", "setupAgreed"] as const) if (form[k] && !/^\d{1,6}(?:\.\d{1,2})?$/.test(form[k])) list.push(k === "monthlyAgreed" ? "Monthly amount (numbers only)" : "Setup amount (numbers only)");
    return list;
  }, [form]);
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      // The version was captured when the panel opened; the server refuses if the lead changed since.
      const res = await fetch("/api/team/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, expectedUpdatedAt: form.expectedUpdatedAt || lead.updatedAt }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || (res.status === 401 ? "Your team session expired. Sign in again; this handoff draft stays in this tab." : "The handoff could not be saved. Your draft is still here."));
      setResult(data as StartResult);
      if (!(data as StartResult).pending?.length) { const d = readDrafts(); delete d[lead.id]; writeDrafts(d); }
    } catch (e) { setError(e instanceof Error ? e.message : "The handoff could not be saved."); }
    finally { setBusy(false); }
  };
  const text = (key: keyof HandoffForm, label: string, opts: { wide?: boolean; rows?: number; placeholder?: string; type?: string } = {}) => (
    <label className={`ob-field ${opts.wide ? "ob-wide" : ""}`}>{label}
      {opts.rows ? <textarea rows={opts.rows} value={String(form[key])} placeholder={opts.placeholder} onChange={(e) => set({ [key]: e.target.value } as Partial<HandoffForm>)} />
        : <input type={opts.type || "text"} value={String(form[key])} placeholder={opts.placeholder} onChange={(e) => set({ [key]: e.target.value } as Partial<HandoffForm>)} />}
    </label>
  );
  return <div className="ob-modal" role="dialog" aria-modal="true" aria-labelledby="ob-handoff-title">
    <div className="ob-modal-card">
      <header className="ob-modal-head"><div><span className="call-eyebrow">SALES → ONBOARDING</span><h2 id="ob-handoff-title">{lead.name}</h2><p className="call-muted">Everything Madison needs to start. Use the amounts and scope that were actually agreed on the call.</p></div><button type="button" className="call-icon-button" aria-label="Close" onClick={onClose} disabled={busy}><CloseIcon /></button></header>
      {result ? <div className={result.pending.length ? "call-alert" : "call-success"} role="status">
        <strong>{result.adopted ? "This lead already has an onboarding record." : result.pending.length ? "Onboarding record created, with steps still pending." : "Handed off to onboarding."}</strong>
        {result.pending.length > 0 && <p>Still pending: {result.pending.join(", ")}. Open the client on the Onboarding tab and press <b>Retry pending steps</b>; nothing will be duplicated.</p>}
        <p><a href={result.itemUrl} target="_blank" rel="noreferrer">Open in Monday ↗</a></p>
        <div><button type="button" className="call-primary" onClick={() => onDone(result.itemId)}>Open on the Onboarding tab</button></div>
      </div> : review ? <>
        <section className="ob-review">
          <h3>Review before handing off</h3>
          {problems.length > 0 && <div className="call-alert" role="alert"><strong>Still needed:</strong> {problems.join(" · ")}</div>}
          <dl>
            <dt>Business</dt><dd>{form.business} · {[form.contact, form.email, form.phone].filter(Boolean).join(" · ") || "no contact details"}{form.city && ` · ${form.city}`}{form.businessType && ` · ${form.businessType}`}</dd>
            <dt>Sales owner</dt><dd>{form.salesOwner}</dd>
            <dt>Packages</dt><dd>{form.packages.join(", ") || "none"}</dd>
            <dt>Agreed amounts</dt><dd>Monthly {form.monthlyAgreed ? `$${form.monthlyAgreed}` : "not recorded"} · Setup {form.setupAgreed ? `$${form.setupAgreed}` : "not recorded"}</dd>
            <dt>Scope</dt><dd className="call-preserve">{form.scope || "—"}</dd>
            {form.exclusions && <><dt>Exclusions</dt><dd className="call-preserve">{form.exclusions}</dd></>}
            {form.goals && <><dt>Goals</dt><dd className="call-preserve">{form.goals}</dd></>}
            {form.context && <><dt>Promises / context</dt><dd className="call-preserve">{form.context}</dd></>}
            <dt>Start</dt><dd>{form.startDate || "not set"}</dd>
            <dt>Agreement · Payment</dt><dd>{form.agreement} · {form.payment}</dd>
            <dt>Next action</dt><dd>{[form.nextOwner, form.nextAction, form.nextDue && `due ${form.nextDue}`].filter(Boolean).join(" — ") || "Madison sends the intake link"}</dd>
          </dl>
          <p className="call-save-explainer">Handing off creates one record on the Onboarding Pipeline board, posts this summary as a note, builds the checklist for these packages, marks the giveaway lead Won (its call history stays put) and prepares the client intake. Nothing is emailed to the client.</p>
        </section>
        {error && <div className="call-alert" role="alert"><strong>Your draft is still here.</strong><p>{error}</p></div>}
        <footer className="call-form-footer"><span>{busy ? "Handing off… keep this page open." : "Nothing is sent to the client."}</span><div><button type="button" className="call-secondary" disabled={busy} onClick={() => setReview(false)}>Back</button><button type="button" className="call-primary" disabled={busy || problems.length > 0} onClick={submit}>{busy ? "Handing off…" : "Confirm handoff"}</button></div></footer>
      </> : <>
        <fieldset className="call-form" disabled={busy}>
          <div className="call-fields">
            {text("business", "Business")}{text("contact", "Main contact")}{text("email", "Email", { type: "email" })}{text("phone", "Phone")}{text("website", "Website")}{text("city", "Location(s)")}
            <label className="ob-field">Business type<select value={form.businessType} onChange={(e) => set({ businessType: e.target.value })}><option value="">Not set</option>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="ob-field">Sales owner<select value={form.salesOwner} onChange={(e) => set({ salesOwner: e.target.value as HandoffForm["salesOwner"] })}>{(["Dave", "Josh", "Keaton"] as const).map((r) => <option key={r}>{r}</option>)}</select><small>Stays the relationship owner after Madison takes onboarding.</small></label>
            <div className="ob-field ob-wide"><span>Packages / services sold</span><div className="ob-packages">{PACKAGES.map((p) => <label key={p}><input type="checkbox" checked={form.packages.includes(p)} onChange={() => togglePackage(p)} /> {p}</label>)}</div><small>These names match the Onboarding Pipeline board. Pick what was sold, not what was discussed.</small></div>
            {text("monthlyAgreed", "Monthly amount agreed ($)", { placeholder: "Leave blank if not agreed", type: "text" })}{text("setupAgreed", "Setup / one-time amount agreed ($)", { placeholder: "Leave blank if none", type: "text" })}
            {text("scope", "Agreed scope", { wide: true, rows: 3, placeholder: "What we are delivering, in the words used on the call." })}
            {text("exclusions", "Exclusions / not included", { wide: true, rows: 2, placeholder: "Anything the client asked about that is not part of this deal." })}
            {text("goals", "Client goals", { rows: 2 })}{text("context", "Promises & important call context", { rows: 2, placeholder: "Anything Madison must know or must not contradict." })}
            {text("startDate", "Expected start date", { type: "date" })}
            <label className="ob-field">Agreement status<select value={form.agreement} onChange={(e) => set({ agreement: e.target.value as HandoffForm["agreement"] })}>{AGREEMENT.map((a) => <option key={a}>{a}</option>)}</select><small>Unknown is honest. Never mark Signed unless you saw it.</small></label>
            <label className="ob-field">Payment status<select value={form.payment} onChange={(e) => set({ payment: e.target.value as HandoffForm["payment"] })}>{PAYMENT.map((a) => <option key={a}>{a}</option>)}</select></label>
            {text("nextAction", "Next action", { placeholder: "Default: Madison sends the intake link" })}
            <label className="ob-field">Next action owner<select value={form.nextOwner} onChange={(e) => set({ nextOwner: e.target.value as HandoffForm["nextOwner"] })}><option value="">Unassigned</option>{(["Madison", "Dave", "Josh", "Keaton"] as const).map((r) => <option key={r}>{r}</option>)}</select></label>
            {text("nextDue", "Next action due", { type: "date" })}
          </div>
        </fieldset>
        {error && <div className="call-alert" role="alert">{error}</div>}
        <footer className="call-form-footer"><span>Draft kept in this tab until you confirm.</span><div><button type="button" className="call-secondary" onClick={onClose}>Cancel</button><button type="button" className="call-primary" onClick={() => setReview(true)}>Review handoff →</button></div></footer>
      </>}
    </div>
  </div>;
}
