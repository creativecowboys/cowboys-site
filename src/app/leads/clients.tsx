"use client";

import { upload } from "@vercel/blob/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotesTimeline, type DeskSystem } from "./notes";
import { CLIENT_GBP, CLIENT_GROUPS, CLIENT_HEALTH, PAY_METHOD, PAY_STATUS } from "@/lib/clients/config";
import { FILE_CATEGORIES, UPLOAD_MAX_BYTES, isGiveawayWinner } from "@/lib/onboarding/config";
import { uploadPath } from "@/lib/onboarding/validation";
import type { ClientDetail, ClientFlag, ClientRow, ClientsListData } from "@/lib/clients/types";
import { billedOutside, gbpTracked, isLegacyRow, stripeFollowed, type ClientKind } from "@/lib/desk/legacy";
import { appliedKind, CHURNED, churnedMatches, clientCountLabel, clientCounts, filterClients, monthlyTotal } from "@/lib/desk/clients-view";
import { deskHref } from "@/lib/desk-path";
import { CloseIcon, RefreshIcon } from "./icons";
import { GbpLink } from "./gbp-card";
import { RowLine } from "./row-line";
import { contactLine, personShown, sameName } from "@/lib/desk/names";

// Clients tab, problems first: the Team-desk rows of Josh's Active Clients board on Monday, or the desk's
// client contacts in GoHighLevel once DESK_BACKEND=ghl (the server says which with every list).
// On GoHighLevel a client can be a LEGACY client (Oct 2 2026): a long-standing client that was never onboarded through
// the desk and is billed outside GoHighLevel. It gets a badge, a filter and a count of its own, and the tab stays quiet
// about what its record does not track (src/lib/desk/legacy.ts). With no legacy client on the list nothing here changes.
// A client that has left (the Churned group) is off the default view and out of the counts; the group filter lists them
// (src/lib/desk/clients-view.ts). With nobody churned nothing here changes either.
const crmName = (system: DeskSystem) => (system === "ghl" ? "GoHighLevel" : "Monday");
async function json<T>(response: Response, crm = "Monday"): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again." : `${crm} could not complete that request. Please try again.`)), { status: response.status });
  return data;
}
const FLAG: Record<ClientFlag, string> = { payment: "Payment issue", gbp: "GBP not verified", "gbp-recheck": "GBP recheck due", report: "No report 35+ days", term: "Term ends soon", "no-stripe": "No Stripe link" };
const groupLabel = (id: string) => CLIENT_GROUPS.find((g) => g.id === id)?.label || "Unknown";
const fmtMoney = (v: string) => (v && v !== "0" ? `$${Number(v).toLocaleString()}` : "—");

export default function Clients({ clientId, onOpenClient, system = "monday", preview = "", onSystem }: { clientId: string; onOpenClient: (id: string) => void; system?: DeskSystem; preview?: string; onSystem?: (system: DeskSystem) => void }) {
  const crm = crmName(system);
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
  const [kind, setKind] = useState<ClientKind>(""); // all clients / run on the desk / legacy
  const [spin, setSpin] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async (next?: string) => {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError("");
    try {
      // `?desk=ghl|monday` on the page URL previews the other system's desk without flipping DESK_BACKEND.
      const q = new URLSearchParams(); if (next) q.set("cursor", next); if (preview) q.set("desk", preview);
      const data: ClientsListData = await json(await fetch(`/api/team/clients${q.toString() ? `?${q}` : ""}`, { cache: "no-store" }), crm);
      setRows((prev) => next ? [...new Map([...prev, ...data.rows].map((r) => [r.id, r])).values()] : data.rows);
      setCursor(data.cursor); setBoard(data.boardName); setStripeOn(data.stripeConnected); setMoney(data.canSeeMoney); onSystem?.(data.system === "ghl" ? "ghl" : "monday");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load clients."); }
    finally { lock.current = false; setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- crm only words an error message; onSystem is a stable setter
  }, [preview]);
  useEffect(() => { void load(); }, [load]);
  const managers = [...new Map(rows.flatMap((r) => r.accountManagerIds.map((id, i) => [id, r.accountManager.split(", ")[i] || id] as const))).entries()];
  const filters = { kind, manager, group, only, search };
  const counts = clientCounts(rows); // current clients (desk / legacy), with the churned ones counted apart
  const shownKind = appliedKind(kind, rows); // the kind filter only exists while there is a legacy client to tell apart
  // Problems first, as before; then desk clients ahead of legacy ones, by name. No group chosen = every current client, never a churned one.
  const filtered = filterClients(rows, filters);
  const hiddenChurned = churnedMatches(rows, filters); // a search on the default view only says that churned matches exist
  // A client opened by id that the list does not have yet (just graduated — GoHighLevel's search runs a few seconds behind) joins the list.
  const update = useCallback((row: ClientRow) => setRows((prev) => prev.some((r) => r.id === row.id) ? prev.map((r) => r.id === row.id ? row : r) : [row, ...prev]), []);
  const mrr = monthlyTotal(rows);
  return <main className="ob-desk">
    <header className="ob-head"><div><span className="call-eyebrow">CLIENTS</span><h1>Who&rsquo;s paying, who&rsquo;s linked, who needs a look.</h1><p className="call-muted">{board} · {clientCountLabel(rows)}{money ? ` · $${mrr.toLocaleString()}/mo list` : ""} · Stripe {stripeOn ? "connected" : "not connected yet"}</p></div><button className={`call-icon-button ${spin || loading ? "is-spinning" : ""}`} onClick={() => { setSpin(true); window.setTimeout(() => setSpin(false), 900); void load(); }} disabled={loading} aria-label={`Refresh from ${crm}`}><RefreshIcon /></button></header>
    <div className={`ob-toolbar ${counts.legacy ? "ob-toolbar-kind" : ""}`}>
      <input placeholder="Search client, contact, package…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search clients" />
      {counts.legacy > 0 && <select value={shownKind} onChange={(e) => setKind(e.target.value as ClientKind)} aria-label="Show desk or legacy clients"><option value="">All clients ({counts.total})</option><option value="desk">Desk clients ({counts.desk})</option><option value="legacy">Legacy clients ({counts.legacy})</option></select>}
      <select value={manager} onChange={(e) => setManager(e.target.value)} aria-label="Filter by account manager"><option value="">All managers</option>{managers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}<option value="unassigned">Unassigned</option></select>
      <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Filter by group"><option value="">All groups</option>{CLIENT_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}{g.id === CHURNED && counts.churned > 0 ? ` (${counts.churned})` : ""}</option>)}</select>
      <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)} aria-label="Show only"><option value="">Everything</option><option value="problems">Anything flagged</option><option value="payment">Payment issues</option><option value="gbp">GBP not verified / recheck</option></select>
    </div>
    {error && <div className="call-alert" role="alert">{error}<button onClick={() => load()}>Try again</button></div>}
    <div className="ob-count">{filtered.length} shown · {rows.length} loaded{!group && counts.churned > 0 ? ` · ${counts.churned} churned` : ""}{cursor ? " · more available" : ""}</div>
    {hiddenChurned > 0 && <p className="ob-churned-hint">{hiddenChurned} {filtered.length ? "more " : ""}{hiddenChurned === 1 ? "match is a churned client" : "matches are churned clients"}. <button type="button" className="ob-kind-link" onClick={() => setGroup(CHURNED)}>Show churned</button></p>}
    <div className="ob-table" role="table" aria-label="Clients">
      <div className="ob-row ob-row-head" role="row"><span>Client</span><span>Package</span><span>Manager</span><span>Payment</span><span>GBP</span><span>Flags</span></div>
      {filtered.map((r) => <button key={r.id} type="button" role="row" className={`ob-row ${clientId === r.id ? "is-active" : ""} ${r.flags.includes("payment") ? "is-overdue" : ""}`} onClick={() => onOpenClient(r.id)}>
        <span><b>{r.name}</b>{isLegacyRow(r) && <i className="ob-legacy">Legacy</i>}<RowLine text={contactLine(r.name, r.contact, [r.clientSince && `since ${r.clientSince}`])} /></span>
        <span>{r.packages || "—"}<small>{isGiveawayWinner(r.packages) ? "Giveaway winner · no charge" : money && !(isLegacyRow(r) && !Number(r.mrr)) ? `${fmtMoney(r.mrr)}/mo` : ""}</small></span>
        <span>{r.accountManager || <em>Unassigned</em>}<small>{groupLabel(r.group)} · {r.health || "—"}</small></span>
        <span>{billedOutside(r) && !r.flags.includes("payment")
          ? <><i className="ob-stage">{r.payMethod || "Outside the desk"}</i><small>billed outside the desk{r.nextBill && ` · next ${r.nextBill}`}</small></>
          : <><i className={`ob-stage ${r.flags.includes("payment") ? "ob-stage-hold" : r.payStatus === "Paid / Current" ? "ob-stage-launched" : ""}`}>{r.payStatus || "—"}</i><small>{r.payMethod || ""}{r.nextBill && ` · next ${r.nextBill}`}</small></>}</span>
        <span>{!gbpTracked(r)
          ? <><em>Not tracked</em><small>legacy client</small></>
          : r.gbpLive?.ok
          ? <><i className={`ob-stage ${r.gbpLive.verified ? "ob-stage-launched" : "ob-stage-hold"}`}>{r.gbpLive.verified ? "Verified (live)" : "Not verified (live)"}</i><small>{r.gbpLive.reviewCount ? `${r.gbpLive.rating.toFixed(1)} ★ · ${r.gbpLive.reviewCount} reviews` : "no reviews"}{r.gbpLive.unanswered ? ` · ${r.gbpLive.unanswered} unanswered` : ""}</small></>
          : <><i className={`ob-stage ${r.gbpAccess === "Verified" ? "ob-stage-launched" : r.gbpAccess === "No GBP Exists" ? "" : "ob-stage-hold"}`}>{r.gbpAccess || "Not Requested"}</i><small>{r.gbpLive ? "Search Atlas read failed" : r.gbpChecked ? `checked ${r.gbpChecked}` : "not linked to Search Atlas"}</small></>}</span>
        <span>{r.flags.length ? r.flags.map((f) => <small key={f} className={f === "payment" ? "ob-overdue" : ""}>{FLAG[f]}</small>) : isLegacyRow(r) ? <small>No flags</small> : <b className="ob-ok">All good</b>}</span>
      </button>)}
      {loading && <p role="status" className="call-roster-message">Loading from {crm}…</p>}
      {!loading && !filtered.length && <p className="call-roster-message">{!rows.length ? "No clients on the desk yet. Graduate one from the Onboarding tab." : !counts.total && !group ? "No current clients. Choose Churned in the group filter to see the ones that have left." : "No clients match these filters."}</p>}
    </div>
    {cursor && <button className="call-secondary call-load-more" disabled={loading} onClick={() => load(cursor)}>Load more</button>}
    {clientId && <ClientPanel key={clientId} id={clientId} listSystem={system} preview={preview} onClose={() => onOpenClient("")} onRow={update} />}
  </main>;
}

function ClientPanel({ id, listSystem, preview, onClose, onRow }: { id: string; listSystem: DeskSystem; preview: string; onClose: () => void; onRow: (row: ClientRow) => void }) {
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  // The record says which system holds it (a GoHighLevel contact id always opens in GoHighLevel, whatever the list showed).
  const system: DeskSystem = detail ? (detail.system === "ghl" ? "ghl" : "monday") : listSystem;
  const crm = crmName(system);
  const [customerId, setCustomerId] = useState("");
  const [contact, setContact] = useState({ contact: "", email: "", phone: "", website: "" });
  const [dates, setDates] = useState({ nextBill: "", termEnds: "", billingDay: "" });
  const [gbpUrl, setGbpUrl] = useState("");
  const [synced, setSynced] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState<string[]>([]);
  const load = useCallback(async () => {
    setError("");
    try {
      const d: ClientDetail = await json(await fetch(`/api/team/clients/${id}`, { cache: "no-store" }), crm);
      setDetail(d); onRow(d.row); setCustomerId(d.row.stripeCustomer); setGbpUrl(d.row.gbpUrl);
      // A contact that only repeats the business name (a legacy client was imported that way) is shown as an empty field.
      setContact({ contact: sameName(d.row.name, d.row.contact) ? "" : d.row.contact, email: d.row.email, phone: d.row.phone, website: d.row.website });
      setDates({ nextBill: d.row.nextBill, termEnds: d.row.termEnds, billingDay: d.row.billingDay });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this client."); }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- crm only words an error message
  }, [id, onRow]);
  useEffect(() => { void load(); }, [load]);
  const patch = async (body: Record<string, unknown>, label: string): Promise<boolean> => {
    if (!detail || busy) return false;
    setBusy(label); setError("");
    try { const data: { row: ClientRow } = await json(await fetch(`/api/team/clients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, expectedUpdatedAt: detail.row.updatedAt }) }), crm); setDetail({ ...detail, row: data.row }); onRow(data.row); if (body.action === "searchAtlasListing") await load(); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save."); if ((e as { status?: number }).status === 409) void load(); return false; }
    finally { setBusy(""); }
  };
  const sync = async () => {
    if (busy) return;
    setBusy("sync"); setError(""); setSynced(null);
    try { const r: { changed: string[] } = await json(await fetch(`/api/team/clients/${id}/sync`, { method: "POST" }), crm); setSynced(r.changed); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Sync failed."); }
    finally { setBusy(""); }
  };
  const addFiles = async (category: (typeof FILE_CATEGORIES)[number], list: FileList | null) => {
    const scope = detail?.fileScope;
    if (!list?.length || !scope) return;
    for (const file of Array.from(list)) {
      if (file.size > UPLOAD_MAX_BYTES) { setError(`${file.name} is larger than ${Math.round(UPLOAD_MAX_BYTES / 1048576)} MB.`); continue; }
      setUploading((u) => [...u, file.name]);
      try {
        const blob = await upload(uploadPath(scope, category, file.name), file, { access: "private", handleUploadUrl: `/api/team/onboarding/${scope}/upload`, clientPayload: JSON.stringify({ category, name: file.name }), contentType: file.type || "application/octet-stream" });
        await json(await fetch(`/api/team/onboarding/${scope}/files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathname: blob.pathname, category, name: file.name }) }), crm);
      } catch (e) { setError(e instanceof Error && e.message ? `${file.name}: ${e.message}` : `${file.name} did not upload.`); }
      finally { setUploading((u) => u.filter((n) => n !== file.name)); }
    }
    await load();
  };
  const removeFile = async (key: string) => {
    if (!detail) return;
    setError("");
    try { await json(await fetch(`/api/team/onboarding/${detail.fileScope}/files?key=${encodeURIComponent(key)}`, { method: "DELETE" }), crm); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not remove that file."); }
  };
  if (!detail) return <aside className="ob-panel"><div className="ob-panel-head"><h2>Loading…</h2><button className="call-icon-button" aria-label="Close" onClick={onClose}><CloseIcon /></button></div>{error && <div className="call-alert" role="alert">{error}<button onClick={load}>Try again</button></div>}</aside>;
  const { row, stripe, stripeConnected, owners, history, canSeeMoney, files, fileScope } = detail;
  const legacy = isLegacyRow(row);
  const outsideStripe = legacy && !stripeFollowed(row); // a legacy client billed outside GoHighLevel: the Stripe prompts do not apply
  const isOwner = canSeeMoney; // the server says yes for owners only; marking a legacy client is theirs (and is checked again on the server)
  // Display only. The Contact box is empty while the record's "contact" is just the business name again. Left empty, a blur
  // sends the stored name back unchanged, exactly what it sent before, so nothing is written; a name typed in saves as ever.
  const contactRepeats = sameName(row.name, row.contact);
  const saveContact = () => patch({ action: "contact", ...contact, contact: contact.contact || (contactRepeats ? row.contact : "") }, "contact");
  return <aside className="ob-panel" aria-label={`${row.name} client`}>
    <div className="ob-panel-head"><div><span className="call-eyebrow">{groupLabel(row.group)} · {row.health || "No health"}{legacy && " · Legacy client"}</span><h2>{row.name}</h2><p className="call-muted">{[personShown(row.name, row.contact), row.email, row.phone].filter(Boolean).join(" · ") || "No contact details"}</p></div><div className="ob-panel-actions"><a href={row.url} target="_blank" rel="noreferrer">{system === "ghl" ? "Open in GoHighLevel ↗" : "Monday ↗"}</a><button className="call-icon-button" aria-label="Close" onClick={onClose}><CloseIcon /></button></div></div>
    {error && <div className="call-alert" role="alert">{error}</div>}
    {row.flags.length > 0 && <div className="call-alert" role="status"><strong>Needs a look:</strong> {row.flags.map((f) => FLAG[f]).join(" · ")}</div>}

    <section className="ob-section"><h3>Billing {outsideStripe ? <small>Billed outside the desk{row.payMethod && ` · ${row.payMethod}`}</small> : stripeConnected ? <small>Stripe connected</small> : <small>Stripe not connected — add the restricted key in Vercel</small>}</h3>
      <div className="ob-grid">
        <div><span>Status</span>{billedOutside(row) && !row.flags.includes("payment") ? <><b>Billed outside the desk</b><small>{row.payMethod || "no method on file"}</small></> : <><b>{row.payStatus || "—"}</b><small>{row.payMethod}</small></>}</div>
        <div><span>Package</span><b>{row.packages || "—"}</b>{isGiveawayWinner(row.packages) ? <small>Giveaway winner — no charge. Do not invoice.</small> : canSeeMoney && !(legacy && !Number(row.mrr)) && <small>{fmtMoney(row.mrr)}/mo list</small>}</div>
        <div><span>Last payment</span><b>{row.lastPayment || "—"}</b></div>
        <div><span>Next bill</span><b>{row.nextBill || "—"}</b><small>{row.billingDay && `day ${row.billingDay}`}</small></div>
        {stripe && <><div><span>Stripe subscription</span><b>{stripe.subscription ? `${stripe.subscription.status}${canSeeMoney ? ` · $${stripe.subscription.amount}/${stripe.subscription.interval}` : ""}` : "none"}</b><small>{stripe.subscription?.currentPeriodEnd && `renews ${stripe.subscription.currentPeriodEnd}`}{stripe.subscription?.cancelAt && ` · cancels ${stripe.subscription.cancelAt}`}</small></div><div><span>Latest invoice</span><b>{stripe.latestInvoice ? `${stripe.latestInvoice.status}${canSeeMoney ? ` · $${stripe.latestInvoice.amountDue}` : ""}` : "none"}</b><small>{stripe.latestInvoice?.paidAt && `paid ${stripe.latestInvoice.paidAt}`}{stripe.latestInvoice?.hostedUrl && <> · <a href={stripe.latestInvoice.hostedUrl} target="_blank" rel="noreferrer">open</a></>}</small></div></>}
      </div>
      <div className="ob-buttons">
        {!outsideStripe && <button className="call-primary" disabled={!!busy || !stripeConnected} onClick={sync}>{busy === "sync" ? "Syncing…" : "Sync from Stripe"}</button>}
        {row.stripeCustomer && <a className="call-secondary" href={`https://dashboard.stripe.com/customers/${row.stripeCustomer}`} target="_blank" rel="noreferrer">Open in Stripe ↗</a>}
      </div>
      {synced && <p className="ob-ok">Synced. {synced.length ? `Changed: ${synced.join(", ")}.` : "Nothing changed."}</p>}
      {outsideStripe && <p className="call-muted ob-hint">A legacy client billed outside GoHighLevel, so the desk does not look for it in Stripe. To follow it there, set the payment method to Stripe via GHL or paste its Stripe customer id.</p>}
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
      <GbpLink listing={row.searchAtlasListing} locations={detail.gbpLocations} connected={detail.searchAtlasConnected} card={row.gbpLive} busy={!!busy} onLink={(listingId) => patch({ action: "searchAtlasListing", listingId }, "gbp-link")} onRefreshed={load} />
      <div className="ob-controls">
        <label>Access<select value={row.gbpAccess || "Not Requested"} disabled={!!busy} onChange={(e) => patch({ action: "gbp", value: e.target.value, gbpUrl }, "gbp")}>{CLIENT_GBP.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label>GBP / Maps URL<input value={gbpUrl} disabled={!!busy} onChange={(e) => setGbpUrl(e.target.value)} onBlur={() => gbpUrl !== row.gbpUrl && patch({ action: "gbp", value: row.gbpAccess || "Not Requested", gbpUrl }, "gbp")} placeholder="https://maps.google.com/…" /></label>
      </div>
      <div className="ob-buttons"><button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "gbpChecked" }, "gbpchk")}>I just confirmed we still have access</button>{row.gbpUrl && <a className="call-secondary" href={row.gbpUrl} target="_blank" rel="noreferrer">Open listing ↗</a>}</div>
      <p className="call-muted ob-hint">Last confirmed: {row.gbpChecked || "never"}. {row.gbpLive?.ok ? "A live Search Atlas read counts as a check, so the 90-day recheck does not apply while the listing is linked." : legacy ? "For a legacy client the tab only asks about GBP once it is tracked here: link the Search Atlas listing, set access to Requested or Lost / recheck, or confirm a check." : "The tab asks for a recheck every 90 days. Only a staff check (or a live Search Atlas read) counts."}</p>
    </section>

    <section className="ob-section"><h3>Account</h3>
      <div className="ob-controls">
        <label>Account manager<select value={row.accountManagerIds[0] || ""} disabled={!!busy} onChange={(e) => patch({ action: "manager", ownerId: e.target.value }, "manager")}><option value="">Unassigned</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <label>Group<select value={row.group} disabled={!!busy} onChange={(e) => patch({ action: "group", group: e.target.value }, "group")}>{CLIENT_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}{row.group === "unknown" && <option value="unknown">Unknown</option>}</select></label>
        <label>Health<select value={row.health || "Too New"} disabled={!!busy} onChange={(e) => patch({ action: "health", value: e.target.value }, "health")}>{CLIENT_HEALTH.map((h) => <option key={h}>{h}</option>)}</select></label>
        <label>Contact<input value={contact.contact} placeholder={!row.contact || contactRepeats ? "No contact person yet" : undefined} disabled={!!busy} onChange={(e) => setContact({ ...contact, contact: e.target.value })} onBlur={saveContact} /></label>
        <label>Email<input type="email" value={contact.email} disabled={!!busy} onChange={(e) => setContact({ ...contact, email: e.target.value })} onBlur={saveContact} /></label>
        <label>Phone<input value={contact.phone} disabled={!!busy} onChange={(e) => setContact({ ...contact, phone: e.target.value })} onBlur={saveContact} /></label>
        <label>Website<input value={contact.website} disabled={!!busy} onChange={(e) => setContact({ ...contact, website: e.target.value })} onBlur={saveContact} /></label>
      </div>
      <div className="ob-buttons"><button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "reportSent" }, "report")}>Report sent today</button>{row.website && <a className="call-secondary" href={row.website} target="_blank" rel="noreferrer">Site ↗</a>}{row.ghlContact && system !== "ghl" && <a className="call-secondary" href={row.ghlContact} target="_blank" rel="noreferrer">GHL ↗</a>}{row.driveFolder && <a className="call-secondary" href={row.driveFolder} target="_blank" rel="noreferrer">Files ↗</a>}</div>
      <p className="call-muted ob-hint">Last report: {row.lastReport || "never"}.{legacy && !row.lastReport && " (Not flagged for a legacy client until a report is logged here.)"}{row.onboardingItem && <> Onboarding record: <a href={deskHref({ tab: "onboarding", client: row.onboardingItem, desk: preview })}>open</a>.</>}</p>
      {/* Legacy marker (GoHighLevel desk). A legacy client says so, and an owner can make it a desk client; on a desk client the only
          addition is one quiet line for owners — the way to mark a long-standing client legacy. Checked again on the server. */}
      {system === "ghl" && legacy && <div className="ob-kind">
        <p className="call-muted ob-hint">Legacy client: a long-standing client that was not onboarded through the desk and is billed outside GoHighLevel. The tab only flags what this record tracks.{!isOwner && " An owner can change this."}</p>
        {isOwner && <button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "legacy", value: false }, "legacy")}>{busy === "legacy" ? "Saving…" : "Make this a desk client"}</button>}
      </div>}
      {system === "ghl" && !legacy && isOwner && <p className="call-muted ob-hint">A long-standing client that is billed outside GoHighLevel? <button type="button" className="ob-kind-link" disabled={!!busy} onClick={() => patch({ action: "legacy", value: true }, "legacy")}>{busy === "legacy" ? "Saving…" : "Mark as legacy client"}</button></p>}
      {row.notes && <p className="call-preserve ob-notes">{row.notes}</p>}
    </section>

    <section className="ob-section"><h3>Files <small>{files.length} on file{row.onboardingItem ? " · from onboarding" : ""}</small></h3>
      <div className="ob-files-box">
        <div className="ob-files-head"><strong>Logo, photos, content, references</strong><small>Everything the client uploaded during onboarding, plus anything the team adds here. Up to {Math.round(UPLOAD_MAX_BYTES / 1048576)} MB each, private to the team.</small></div>
        {FILE_CATEGORIES.map((cat) => <div key={cat} className="ob-files-cat">
          <div className="ob-files-cat-head"><span>{cat}</span><label className="call-secondary ob-upload"><input type="file" multiple disabled={!!busy} onChange={(e) => { void addFiles(cat, e.target.files); e.target.value = ""; }} />Add files</label></div>
          <ul className="ob-files">{files.filter((f) => f.category === cat).map((f) => <li key={f.key}><a href={`/api/team/onboarding/${fileScope}/file?key=${encodeURIComponent(f.key)}`}>{f.name}</a> <small>{(f.size / 1024).toFixed(0)} KB · {f.uploadedAt.slice(0, 10)}</small><button type="button" className="ob-file-remove" disabled={!!busy} onClick={() => removeFile(f.key)} aria-label={`Remove ${f.name}`}>Remove</button></li>)}{uploading.map((n) => <li key={`up-${n}`} className="is-uploading">{n} <small>uploading…</small></li>)}</ul>
        </div>)}
      </div>
    </section>

    <NotesTimeline history={history} busy={!!busy} system={system} onAdd={async (text, noteId) => { const ok = await patch(system === "ghl" ? { action: "note", text, noteId } : { action: "note", text }, "note"); if (ok) await load(); return ok; }} />
  </aside>;
}
