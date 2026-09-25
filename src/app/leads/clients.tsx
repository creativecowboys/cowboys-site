"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CLIENT_GBP, CLIENT_GROUPS, CLIENT_HEALTH, PAY_METHOD, PAY_STATUS } from "@/lib/clients/config";
import type { ClientDetail, ClientFlag, ClientRow, ClientsListData } from "@/lib/clients/types";
import { CloseIcon, RefreshIcon } from "./icons";

// Clients tab: the Team-desk rows of Josh's Active Clients board, problems first.
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again." : "Monday could not complete that request. Please try again.")), { status: response.status });
  return data;
}
const FLAG: Record<ClientFlag, string> = { payment: "Payment issue", gbp: "GBP not verified", "gbp-recheck": "GBP recheck due", report: "No report 35+ days", term: "Term ends soon", "no-stripe": "No Stripe link" };
const groupLabel = (id: string) => CLIENT_GROUPS.find((g) => g.id === id)?.label || "Unknown";
const fmtMoney = (v: string) => (v && v !== "0" ? `$${Number(v).toLocaleString()}` : "—");

export default function Clients({ clientId, onOpenClient }: { clientId: string; onOpenClient: (id: string) => void }) {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [board, setBoard] = useState("Active Clients");
  const [stripeOn, setStripeOn] = useState(false);
  const [money, setMoney] = useState(false); // owners only
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [manager, setManager] = useState("");
  const [group, setGroup] = useState("");
  const [only, setOnly] = useState<"" | "problems" | "payment" | "gbp">("");
  const [spin, setSpin] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async (next?: string) => {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError("");
    try {
      const data: ClientsListData = await json(await fetch(`/api/team/clients${next ? `?cursor=${encodeURIComponent(next)}` : ""}`, { cache: "no-store" }));
      setRows((prev) => next ? [...new Map([...prev, ...data.rows].map((r) => [r.id, r])).values()] : data.rows);
      setCursor(data.cursor); setBoard(data.boardName); setStripeOn(data.stripeConnected); setMoney(data.canSeeMoney);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load clients."); }
    finally { lock.current = false; setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const managers = [...new Map(rows.flatMap((r) => r.accountManagerIds.map((id, i) => [id, r.accountManager.split(", ")[i] || id] as const))).entries()];
  const filtered = rows.filter((r) =>
    (!manager || (manager === "unassigned" ? r.accountManagerIds.length === 0 : r.accountManagerIds.includes(manager))) &&
    (!group || r.group === group) &&
    (only !== "problems" || r.flags.length > 0) && (only !== "payment" || r.flags.includes("payment")) && (only !== "gbp" || r.flags.includes("gbp") || r.flags.includes("gbp-recheck")) &&
    `${r.name} ${r.contact} ${r.email} ${r.packages}`.toLowerCase().includes(search.toLowerCase()),
  ).sort((a, b) => Number(b.flags.includes("payment")) - Number(a.flags.includes("payment")) || b.flags.length - a.flags.length || a.name.localeCompare(b.name));
  const update = (row: ClientRow) => setRows((prev) => prev.map((r) => r.id === row.id ? row : r));
  const mrr = rows.filter((r) => r.group !== "churned" && r.group !== "paused").reduce((sum, r) => sum + (Number(r.mrr) || 0), 0);
  return <main className="ob-desk">
    <header className="ob-head"><div><span className="call-eyebrow">CLIENTS</span><h1>Who&rsquo;s paying, who&rsquo;s linked, who needs a look.</h1><p className="call-muted">{board} · {rows.length} on the desk{money ? ` · $${mrr.toLocaleString()}/mo list` : ""} · Stripe {stripeOn ? "connected" : "not connected yet"}</p></div><button className={`call-icon-button ${spin || loading ? "is-spinning" : ""}`} onClick={() => { setSpin(true); window.setTimeout(() => setSpin(false), 900); void load(); }} disabled={loading} aria-label="Refresh from Monday"><RefreshIcon /></button></header>
    <div className="ob-toolbar">
      <input placeholder="Search client, contact, package…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search clients" />
      <select value={manager} onChange={(e) => setManager(e.target.value)} aria-label="Filter by account manager"><option value="">All managers</option>{managers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}<option value="unassigned">Unassigned</option></select>
      <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Filter by group"><option value="">All groups</option>{CLIENT_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}</select>
      <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)} aria-label="Show only"><option value="">Everything</option><option value="problems">Anything flagged</option><option value="payment">Payment issues</option><option value="gbp">GBP not verified / recheck</option></select>
    </div>
    {error && <div className="call-alert" role="alert">{error}<button onClick={() => load()}>Try again</button></div>}
    <div className="ob-count">{filtered.length} shown · {rows.length} loaded{cursor ? " · more available" : ""}</div>
    <div className="ob-table" role="table" aria-label="Clients">
      <div className="ob-row ob-row-head" role="row"><span>Client</span><span>Package</span><span>Manager</span><span>Payment</span><span>GBP</span><span>Flags</span></div>
      {filtered.map((r) => <button key={r.id} type="button" role="row" className={`ob-row ${clientId === r.id ? "is-active" : ""} ${r.flags.includes("payment") ? "is-overdue" : ""}`} onClick={() => onOpenClient(r.id)}>
        <span><b>{r.name}</b><small>{r.contact || "no contact"}{r.clientSince && ` · since ${r.clientSince}`}</small></span>
        <span>{r.packages || "—"}<small>{money ? `${fmtMoney(r.mrr)}/mo` : ""}</small></span>
        <span>{r.accountManager || <em>Unassigned</em>}<small>{groupLabel(r.group)} · {r.health || "—"}</small></span>
        <span><i className={`ob-stage ${r.flags.includes("payment") ? "ob-stage-hold" : r.payStatus === "Paid / Current" ? "ob-stage-launched" : ""}`}>{r.payStatus || "—"}</i><small>{r.payMethod || ""}{r.nextBill && ` · next ${r.nextBill}`}</small></span>
        <span><i className={`ob-stage ${r.gbpAccess === "Verified" ? "ob-stage-launched" : r.gbpAccess === "No GBP Exists" ? "" : "ob-stage-hold"}`}>{r.gbpAccess || "Not Requested"}</i><small>{r.gbpChecked && `checked ${r.gbpChecked}`}</small></span>
        <span>{r.flags.length ? r.flags.map((f) => <small key={f} className={f === "payment" ? "ob-overdue" : ""}>{FLAG[f]}</small>) : <b className="ob-ok">All good</b>}</span>
      </button>)}
      {loading && <p role="status" className="call-roster-message">Loading from Monday…</p>}
      {!loading && !filtered.length && <p className="call-roster-message">{rows.length ? "No clients match these filters." : "No clients on the desk yet. Graduate one from the Onboarding tab."}</p>}
    </div>
    {cursor && <button className="call-secondary call-load-more" disabled={loading} onClick={() => load(cursor)}>Load more</button>}
    {clientId && <ClientPanel key={clientId} id={clientId} onClose={() => onOpenClient("")} onRow={update} />}
  </main>;
}

function ClientPanel({ id, onClose, onRow }: { id: string; onClose: () => void; onRow: (row: ClientRow) => void }) {
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [contact, setContact] = useState({ contact: "", email: "", phone: "", website: "" });
  const [dates, setDates] = useState({ nextBill: "", termEnds: "", billingDay: "" });
  const [gbpUrl, setGbpUrl] = useState("");
  const [synced, setSynced] = useState<string[] | null>(null);
  const load = useCallback(async () => {
    setError("");
    try {
      const d: ClientDetail = await json(await fetch(`/api/team/clients/${id}`, { cache: "no-store" }));
      setDetail(d); onRow(d.row); setCustomerId(d.row.stripeCustomer); setGbpUrl(d.row.gbpUrl);
      setContact({ contact: d.row.contact, email: d.row.email, phone: d.row.phone, website: d.row.website });
      setDates({ nextBill: d.row.nextBill, termEnds: d.row.termEnds, billingDay: d.row.billingDay });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this client."); }
  }, [id, onRow]);
  useEffect(() => { void load(); }, [load]);
  const patch = async (body: Record<string, unknown>, label: string) => {
    if (!detail || busy) return;
    setBusy(label); setError("");
    try { const data: { row: ClientRow } = await json(await fetch(`/api/team/clients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, expectedUpdatedAt: detail.row.updatedAt }) })); setDetail({ ...detail, row: data.row }); onRow(data.row); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save."); if ((e as { status?: number }).status === 409) void load(); }
    finally { setBusy(""); }
  };
  const sync = async () => {
    if (busy) return;
    setBusy("sync"); setError(""); setSynced(null);
    try { const r: { changed: string[] } = await json(await fetch(`/api/team/clients/${id}/sync`, { method: "POST" })); setSynced(r.changed); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Sync failed."); }
    finally { setBusy(""); }
  };
  if (!detail) return <aside className="ob-panel"><div className="ob-panel-head"><h2>Loading…</h2><button className="call-icon-button" aria-label="Close" onClick={onClose}><CloseIcon /></button></div>{error && <div className="call-alert" role="alert">{error}<button onClick={load}>Try again</button></div>}</aside>;
  const { row, stripe, stripeConnected, owners, history, canSeeMoney } = detail;
  return <aside className="ob-panel" aria-label={`${row.name} client`}>
    <div className="ob-panel-head"><div><span className="call-eyebrow">{groupLabel(row.group)} · {row.health || "No health"}</span><h2>{row.name}</h2><p className="call-muted">{[row.contact, row.email, row.phone].filter(Boolean).join(" · ") || "No contact details"}</p></div><div className="ob-panel-actions"><a href={row.url} target="_blank" rel="noreferrer">Monday ↗</a><button className="call-icon-button" aria-label="Close" onClick={onClose}><CloseIcon /></button></div></div>
    {error && <div className="call-alert" role="alert">{error}</div>}
    {row.flags.length > 0 && <div className="call-alert" role="status"><strong>Needs a look:</strong> {row.flags.map((f) => FLAG[f]).join(" · ")}</div>}

    <section className="ob-section"><h3>Billing {stripeConnected ? <small>Stripe connected</small> : <small>Stripe not connected — add the restricted key in Vercel</small>}</h3>
      <div className="ob-grid">
        <div><span>Status</span><b>{row.payStatus || "—"}</b><small>{row.payMethod}</small></div>
        <div><span>Package</span><b>{row.packages || "—"}</b>{canSeeMoney && <small>{fmtMoney(row.mrr)}/mo list</small>}</div>
        <div><span>Last payment</span><b>{row.lastPayment || "—"}</b></div>
        <div><span>Next bill</span><b>{row.nextBill || "—"}</b><small>{row.billingDay && `day ${row.billingDay}`}</small></div>
        {stripe && <><div><span>Stripe subscription</span><b>{stripe.subscription ? `${stripe.subscription.status}${canSeeMoney ? ` · $${stripe.subscription.amount}/${stripe.subscription.interval}` : ""}` : "none"}</b><small>{stripe.subscription?.currentPeriodEnd && `renews ${stripe.subscription.currentPeriodEnd}`}{stripe.subscription?.cancelAt && ` · cancels ${stripe.subscription.cancelAt}`}</small></div><div><span>Latest invoice</span><b>{stripe.latestInvoice ? `${stripe.latestInvoice.status}${canSeeMoney ? ` · $${stripe.latestInvoice.amountDue}` : ""}` : "none"}</b><small>{stripe.latestInvoice?.paidAt && `paid ${stripe.latestInvoice.paidAt}`}{stripe.latestInvoice?.hostedUrl && <> · <a href={stripe.latestInvoice.hostedUrl} target="_blank" rel="noreferrer">open</a></>}</small></div></>}
      </div>
      <div className="ob-buttons">
        <button className="call-primary" disabled={!!busy || !stripeConnected} onClick={sync}>{busy === "sync" ? "Syncing…" : "Sync from Stripe"}</button>
        {row.stripeCustomer && <a className="call-secondary" href={`https://dashboard.stripe.com/customers/${row.stripeCustomer}`} target="_blank" rel="noreferrer">Open in Stripe ↗</a>}
      </div>
      {synced && <p className="ob-ok">Synced. {synced.length ? `Changed: ${synced.join(", ")}.` : "Nothing changed."}</p>}
      <div className="ob-controls">
        <label>Stripe customer id<input value={customerId} placeholder="cus_…" disabled={!!busy} onChange={(e) => setCustomerId(e.target.value.trim())} onBlur={() => customerId !== row.stripeCustomer && patch({ action: "stripeCustomer", customerId }, "stripe")} /></label>
        <label>Payment status (manual)<select value={row.payStatus || "No Billing Set Up"} disabled={!!busy} onChange={(e) => patch({ action: "payStatus", value: e.target.value }, "pay")}>{PAY_STATUS.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Payment method<select value={row.payMethod} disabled={!!busy} onChange={(e) => patch({ action: "payMethod", value: e.target.value }, "method")}>{!PAY_METHOD.includes(row.payMethod as (typeof PAY_METHOD)[number]) && <option value={row.payMethod}>{row.payMethod || "Not set"}</option>}{PAY_METHOD.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Billing day<input value={dates.billingDay} disabled={!!busy} inputMode="numeric" onChange={(e) => setDates({ ...dates, billingDay: e.target.value })} onBlur={() => patch({ action: "dates", ...dates }, "dates")} /></label>
        <label>Next bill<input type="date" value={dates.nextBill} disabled={!!busy} onChange={(e) => setDates({ ...dates, nextBill: e.target.value })} onBlur={() => patch({ action: "dates", ...dates }, "dates")} /></label>
        <label>Term ends<input type="date" value={dates.termEnds} disabled={!!busy} onChange={(e) => setDates({ ...dates, termEnds: e.target.value })} onBlur={() => patch({ action: "dates", ...dates }, "dates")} /></label>
      </div>
    </section>

    <section className="ob-section"><h3>Google Business Profile</h3>
      <div className="ob-controls">
        <label>Access<select value={row.gbpAccess || "Not Requested"} disabled={!!busy} onChange={(e) => patch({ action: "gbp", value: e.target.value, gbpUrl }, "gbp")}>{CLIENT_GBP.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label>GBP / Maps URL<input value={gbpUrl} disabled={!!busy} onChange={(e) => setGbpUrl(e.target.value)} onBlur={() => gbpUrl !== row.gbpUrl && patch({ action: "gbp", value: row.gbpAccess || "Not Requested", gbpUrl }, "gbp")} placeholder="https://maps.google.com/…" /></label>
      </div>
      <div className="ob-buttons"><button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "gbpChecked" }, "gbpchk")}>I just confirmed we still have access</button>{row.gbpUrl && <a className="call-secondary" href={row.gbpUrl} target="_blank" rel="noreferrer">Open listing ↗</a>}</div>
      <p className="call-muted ob-hint">Last confirmed: {row.gbpChecked || "never"}. The tab asks for a recheck every 90 days. Only a staff check counts.</p>
    </section>

    <section className="ob-section"><h3>Account</h3>
      <div className="ob-controls">
        <label>Account manager<select value={row.accountManagerIds[0] || ""} disabled={!!busy} onChange={(e) => patch({ action: "manager", ownerId: e.target.value }, "manager")}><option value="">Unassigned</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <label>Group<select value={row.group} disabled={!!busy} onChange={(e) => patch({ action: "group", group: e.target.value }, "group")}>{CLIENT_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}{row.group === "unknown" && <option value="unknown">Unknown</option>}</select></label>
        <label>Health<select value={row.health || "Too New"} disabled={!!busy} onChange={(e) => patch({ action: "health", value: e.target.value }, "health")}>{CLIENT_HEALTH.map((h) => <option key={h}>{h}</option>)}</select></label>
        <label>Contact<input value={contact.contact} disabled={!!busy} onChange={(e) => setContact({ ...contact, contact: e.target.value })} onBlur={() => patch({ action: "contact", ...contact }, "contact")} /></label>
        <label>Email<input type="email" value={contact.email} disabled={!!busy} onChange={(e) => setContact({ ...contact, email: e.target.value })} onBlur={() => patch({ action: "contact", ...contact }, "contact")} /></label>
        <label>Phone<input value={contact.phone} disabled={!!busy} onChange={(e) => setContact({ ...contact, phone: e.target.value })} onBlur={() => patch({ action: "contact", ...contact }, "contact")} /></label>
        <label>Website<input value={contact.website} disabled={!!busy} onChange={(e) => setContact({ ...contact, website: e.target.value })} onBlur={() => patch({ action: "contact", ...contact }, "contact")} /></label>
      </div>
      <div className="ob-buttons"><button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "reportSent" }, "report")}>Report sent today</button>{row.website && <a className="call-secondary" href={row.website} target="_blank" rel="noreferrer">Site ↗</a>}{row.ghlContact && <a className="call-secondary" href={row.ghlContact} target="_blank" rel="noreferrer">GHL ↗</a>}{row.driveFolder && <a className="call-secondary" href={row.driveFolder} target="_blank" rel="noreferrer">Files ↗</a>}</div>
      <p className="call-muted ob-hint">Last report: {row.lastReport || "never"}.{row.onboardingItem && <> Onboarding record: <a href={`/leads?tab=onboarding&client=${row.onboardingItem}`}>open</a>.</>}</p>
      {row.notes && <p className="call-preserve ob-notes">{row.notes}</p>}
    </section>

    <section className="ob-section"><h3>Notes</h3>
      <div className="ob-next"><textarea rows={2} value={note} disabled={!!busy} placeholder="Append a note to the Monday record" onChange={(e) => setNote(e.target.value)} /><button className="call-secondary" disabled={!!busy || !note.trim()} onClick={async () => { await patch({ action: "note", text: note }, "note"); setNote(""); await load(); }}>Add note</button></div>
      {history.map((h) => <article key={h.id} className="ob-history"><small>{h.author} · {new Date(h.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</small><p className="call-preserve">{h.text}</p></article>)}
    </section>
  </aside>;
}
