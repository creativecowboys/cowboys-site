"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATALOG, buildLines, monthlyTotal, type CatalogItem, type Selection } from "@/lib/packages/catalog";
import { CloseIcon } from "./icons";
import type { CallLead } from "./types";

// Package builder slide-out (Dave, Sep 25 2026): the onboarding.creativecowboys.co/team/packages builder,
// reachable from the Sales tab. Same catalog, same GHL recurring-invoice flow; opens prefilled with the
// selected lead's details so the customer search is one keystroke away.
type Contact = { id: string; name: string; email: string; phone: string; company: string };
type Result = { url: string; invoiceNumber?: string; total: number; lines: { name: string; amount: number }[]; liveMode: boolean; emailed: boolean; to: string };
type Recent = { id: string; number: string; customer: string; status: string; total: number; live: boolean; issued: string; url: string; recurring: boolean };
const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0 })}`;
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again." : `Error ${response.status}`));
  return data;
}

export default function Packages({ lead, onClose }: { lead: CallLead | null; onClose: () => void }) {
  const [q, setQ] = useState(lead?.email || lead?.name || "");
  const [hits, setHits] = useState<Contact[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nc, setNc] = useState({ firstName: lead?.contact.split(" ")[0] || "", lastName: lead?.contact.split(" ").slice(1).join(" ") || "", email: lead?.email || "", phone: lead?.phone || "", company: lead?.name || "" });
  const [searching, setSearching] = useState(false);
  const debounce = useRef<number | null>(null);
  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    if (q.trim().length < 2 || contact) { setHits([]); return; }
    debounce.current = window.setTimeout(async () => {
      setSearching(true);
      try { setHits((await json<{ contacts: Contact[] }>(await fetch(`/api/team/packages/contacts?q=${encodeURIComponent(q.trim())}`))).contacts); }
      catch (e) { setErr(e instanceof Error ? e.message : "Search failed."); }
      finally { setSearching(false); }
    }, 250);
  }, [q, contact]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  const [sel, setSel] = useState<Record<string, Selection>>({ "local-growth": { key: "local-growth", promo: true } });
  const [custom, setCustom] = useState({ name: "", amount: "" });
  const [sendEmail, setSendEmail] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [termsExtra, setTermsExtra] = useState("");
  const selections = useMemo<Selection[]>(() => { const list = Object.values(sel); if (custom.name.trim() && custom.amount) list.push({ key: "custom", name: custom.name, amount: Number(custom.amount) }); return list; }, [sel, custom]);
  const preview = useMemo(() => { try { const lines = buildLines(selections); return { lines, total: monthlyTotal(lines), error: "" }; } catch (e) { return { lines: [], total: 0, error: (e as Error).message }; } }, [selections]);
  function toggle(key: string, on: boolean) {
    setSel((s) => { const n = { ...s }; if (!on) { delete n[key]; return n; } const item = CATALOG.find((c) => c.key === key)!; if (item.group === "plan") for (const c of CATALOG) if (c.group === "plan") delete n[c.key]; n[key] = { key, promo: Boolean(item.promo), tier: item.tiers?.[0].key }; return n; });
  }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<Recent[] | null>(null);
  const [recentErr, setRecentErr] = useState("");
  async function loadRecent() { try { setRecent((await json<{ invoices: Recent[] }>(await fetch("/api/team/packages/recent", { cache: "no-store" }))).invoices); setRecentErr(""); } catch (e) { setRecentErr(e instanceof Error ? e.message : "Could not load invoices."); } }
  useEffect(() => { void loadRecent(); }, []);
  async function create() {
    if (!contact || busy) return;
    setBusy(true); setErr(""); setResult(null);
    try { setResult(await json<Result>(await fetch("/api/team/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactId: contact.id, selections, sendEmail, testMode, termsExtra }) }))); void loadRecent(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not create the plan."); }
    finally { setBusy(false); }
  }
  async function createContact() {
    setErr("");
    try { const d = await json<{ contact: Contact; existed?: boolean }>(await fetch("/api/team/packages/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nc) })); setContact(d.contact); setShowNew(false); setQ(""); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not add the contact."); }
  }
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* field stays selectable */ } };
  const plans = CATALOG.filter((c) => c.group === "plan"), ads = CATALOG.filter((c) => c.group === "ads"), addons = CATALOG.filter((c) => c.group === "addon");
  const missingRequirement = (a: CatalogItem) => Boolean(a.requires) && !a.requires!.some((r) => Boolean(sel[r]));
  const hasConflict = (a: CatalogItem) => Boolean(a.conflictsWith?.some((c) => Boolean(sel[c])));

  return <aside className="ob-panel pk-panel" aria-label="Package builder">
    <div className="ob-panel-head"><div><span className="call-eyebrow">PACKAGE BUILDER</span><h2>One link that bills it all.</h2><p className="call-muted">Pick the customer, pick the monthly services, get a pay link. Same builder as onboarding.creativecowboys.co.</p></div><div className="ob-panel-actions"><button className="call-icon-button" aria-label="Close" onClick={onClose} disabled={busy}><CloseIcon /></button></div></div>
    {err && <div className="call-alert" role="alert">{err}</div>}

    <section className="ob-section"><h3>1. Customer <small>from GoHighLevel</small></h3>
      {contact ? <div className="pk-contact"><div><b>{contact.company || contact.name}</b><small>{contact.company ? `${contact.name} · ` : ""}{contact.email}{contact.phone ? ` · ${contact.phone}` : ""}</small></div><button type="button" className="call-secondary" onClick={() => { setContact(null); setResult(null); }}>Change</button></div>
      : showNew ? <div className="ob-controls">
          <label>First name *<input value={nc.firstName} onChange={(e) => setNc({ ...nc, firstName: e.target.value })} /></label>
          <label>Last name<input value={nc.lastName} onChange={(e) => setNc({ ...nc, lastName: e.target.value })} /></label>
          <label>Email *<input type="email" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} /></label>
          <label>Phone<input value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} /></label>
          <label className="ob-wide">Business name<input value={nc.company} onChange={(e) => setNc({ ...nc, company: e.target.value })} /></label>
          <div className="ob-buttons ob-wide"><button type="button" className="call-primary" disabled={!nc.firstName || !nc.email} onClick={createContact}>Add to GHL</button><button type="button" className="call-secondary" onClick={() => setShowNew(false)}>Cancel</button></div>
        </div>
      : <div className="pk-search">
          <input autoFocus placeholder="Search GHL by name, business, email or phone…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search GoHighLevel contacts" />
          {searching && <small className="call-muted">Searching…</small>}
          {hits.length > 0 && <ul className="pk-hits">{hits.map((h) => <li key={h.id}><button type="button" onClick={() => { setContact(h); setHits([]); }}><b>{h.company || h.name}</b><small>{h.company ? `${h.name} · ` : ""}{h.email}{h.phone ? ` · ${h.phone}` : ""}</small></button></li>)}</ul>}
          {!searching && q.trim().length >= 2 && !hits.length && <small className="call-muted">No match in GHL.</small>}
          <button type="button" className="pk-link" onClick={() => setShowNew(true)}>Not in GHL yet? Add them{lead ? " (prefilled from this lead)" : ""}</button>
        </div>}
    </section>

    <section className="ob-section"><h3>2. Plan</h3>
      <div className="pk-cards">{plans.map((p) => { const on = Boolean(sel[p.key]); return <label key={p.key} className={`pk-card ${on ? "is-on" : ""}`}><div className="pk-card-top"><div><b>{p.name}</b><small>{p.blurb}</small></div><input type="radio" name="pk-plan" checked={on} onChange={() => toggle(p.key, true)} /></div><div className="pk-price">{money(p.amount!)}<span>/mo</span></div>{p.promo && on && <label className="pk-promo"><input type="checkbox" checked={Boolean(sel[p.key]?.promo)} onChange={(e) => setSel((s) => ({ ...s, [p.key]: { ...s[p.key], promo: e.target.checked } }))} /> {p.promo.label}: <b>{money(p.promo.amount)}/mo</b></label>}</label>; })}</div>
      <button type="button" className="pk-link" onClick={() => { for (const p of plans) toggle(p.key, false); }}>No plan, add-ons only</button>
    </section>

    <section className="ob-section"><h3>3. Ads</h3>
      <div className="pk-cards">{ads.map((a) => { const on = Boolean(sel[a.key]); return <div key={a.key} className={`pk-card ${on ? "is-on" : ""}`}><label className="pk-card-top"><div><b>{a.name}</b><small>{a.blurb}</small></div><input type="checkbox" checked={on} onChange={(e) => toggle(a.key, e.target.checked)} /></label>{on && <div className="pk-tiers">{a.tiers!.map((t) => <button type="button" key={t.key} className={sel[a.key]?.tier === t.key ? "is-on" : ""} onClick={() => setSel((s) => ({ ...s, [a.key]: { ...s[a.key], tier: t.key } }))}>{t.label}</button>)}</div>}</div>; })}</div>
    </section>

    <section className="ob-section"><h3>4. Add-ons</h3>
      <div className="pk-cards">{addons.map((a) => { const on = Boolean(sel[a.key]); const locked = missingRequirement(a) || hasConflict(a); return <div key={a.key} className={`pk-card ${on ? "is-on" : ""} ${locked ? "is-locked" : ""}`}><label className="pk-card-top"><div><b>{a.name} <span className="pk-tag">{a.custom ? "custom" : `${money(a.amount!)}/mo`}</span></b><small>{a.blurb}</small></div><input type="checkbox" disabled={locked} checked={on} onChange={(e) => toggle(a.key, e.target.checked)} /></label>{on && a.custom && <input type="number" min={1} step={1} placeholder="Monthly amount" value={sel[a.key]?.amount ?? ""} onChange={(e) => setSel((s) => ({ ...s, [a.key]: { ...s[a.key], amount: Number(e.target.value) } }))} />}</div>; })}
        <div className="pk-card pk-custom"><b>Custom monthly line <span className="pk-tag">optional</span></b><div className="pk-custom-fields"><input placeholder="What it is" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} /><input type="number" min={1} placeholder="$ per month" value={custom.amount} onChange={(e) => setCustom({ ...custom, amount: e.target.value })} /></div></div>
      </div>
    </section>

    <section className="ob-section"><h3>5. Send</h3>
      <label className="ob-toggle"><input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} /> Also email the invoice to the customer from GHL</label>
      <label className="ob-toggle"><input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} /> Test mode (no real charge)</label>
      <div className="ob-next"><textarea rows={2} placeholder="Anything extra for the terms line (optional)" value={termsExtra} onChange={(e) => setTermsExtra(e.target.value)} /></div>
    </section>

    <section className="ob-section pk-total">
      <div className="pk-total-box"><span className="call-eyebrow">MONTHLY TOTAL</span><div className="pk-total-amount">{money(preview.total)}<span>/mo</span></div>
        <ul>{preview.lines.map((l) => <li key={l.name}><span>{l.name}</span><span>{money(l.amount)}</span></li>)}{!preview.lines.length && <li className="pk-muted">Nothing selected yet.</li>}</ul>
        <p>Card used on the first payment is charged monthly after that.{testMode ? " TEST MODE." : ""}</p>
        {preview.error && <p className="pk-err">{preview.error}</p>}
        <button type="button" className="call-primary" disabled={busy || !contact || Boolean(preview.error)} onClick={create}>{busy ? "Creating plan…" : contact ? "Create plan & get link" : "Pick a customer first"}</button>
      </div>
      {result && <div className="call-success"><strong>Link is ready{result.liveMode ? "" : " (test mode)"}.</strong><p>Invoice {result.invoiceNumber}. {result.emailed ? `Emailed to ${result.to}.` : "Not emailed — send the link yourself."}</p><p><input readOnly value={result.url} onFocus={(e) => e.currentTarget.select()} /></p><div className="ob-buttons"><button type="button" className="call-secondary" onClick={() => copy(result.url)}>{copied ? "Copied!" : "Copy link"}</button><a className="call-secondary" href={result.url} target="_blank" rel="noreferrer">Open ↗</a></div></div>}
    </section>

    <section className="ob-section"><h3>Recent invoices <small><button type="button" className="pk-link" onClick={loadRecent}>refresh</button></small></h3>
      {recentErr && <p className="call-muted">{recentErr}</p>}
      {recent && <ul className="pk-recent">{recent.map((r) => <li key={r.id}><span><b>{r.customer}</b>{!r.live && <i className="pk-tag">test</i>}<small>{r.number}{r.recurring ? " · monthly" : ""}{r.issued && ` · ${new Date(r.issued).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</small></span><span className={`ob-stage ${r.status === "paid" ? "ob-stage-launched" : r.status === "sent" ? "ob-stage-hold" : ""}`}>{r.status.replace("_", " ")}</span><span>{money(r.total)}</span><button type="button" className="pk-link" onClick={() => copy(r.url)}>Copy link</button></li>)}{!recent.length && <li className="pk-muted">No invoices yet.</li>}</ul>}
      {!recent && !recentErr && <p className="call-muted">Loading…</p>}
    </section>
  </aside>;
}
