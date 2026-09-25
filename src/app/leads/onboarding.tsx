"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AGREEMENT, CHECK_STATUS, DNS_PATHS, GBP_ACCESS, GBP_AGENCY_EMAIL, HEALTH, PAYMENT, STAGES } from "@/lib/onboarding/config";
import { readinessProblems } from "@/lib/onboarding/checklist";
import type { OnboardingDetail, OnboardingListData, OnboardingRow, StartResult } from "@/lib/onboarding/types";
import { CloseIcon, RefreshIcon } from "./icons";

// Madison's view: every client in onboarding, what is missing, and one-click updates that write to
// Monday. Every change sends the record version it was based on; a 409 means reload and look first.
async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again." : "Monday could not complete that request. Please try again.")), { status: response.status });
  return data;
}
const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label || "Unknown";
const fmtDate = (v: string) => v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

export default function Onboarding({ clientId, onOpenClient }: { clientId: string; onOpenClient: (id: string) => void }) {
  const [rows, setRows] = useState<OnboardingRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [board, setBoard] = useState("Onboarding Pipeline");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [stage, setStage] = useState("");
  const [only, setOnly] = useState<"" | "overdue" | "missing" | "stalled">("");
  const [spin, setSpin] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async (next?: string) => {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError("");
    try {
      const data: OnboardingListData = await json(await fetch(`/api/team/onboarding${next ? `?cursor=${encodeURIComponent(next)}` : ""}`, { cache: "no-store" }));
      setRows((prev) => next ? [...new Map([...prev, ...data.rows].map((r) => [r.id, r])).values()] : data.rows);
      setCursor(data.cursor); setBoard(data.boardName);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load onboarding clients."); }
    finally { lock.current = false; setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const owners = useMemo(() => [...new Map(rows.flatMap((r) => r.onboardingOwnerIds.map((id, i) => [id, r.onboardingOwner.split(", ")[i] || id] as const))).entries()], [rows]);
  const filtered = rows.filter((r) =>
    (!owner || (owner === "unassigned" ? r.onboardingOwnerIds.length === 0 : r.onboardingOwnerIds.includes(owner))) &&
    (!stage || r.stage === stage) &&
    (only !== "overdue" || r.overdue) && (only !== "missing" || r.missing.length > 0) && (only !== "stalled" || r.stage === "hold" || r.health === "Blocked" || r.health === "Waiting on Client") &&
    `${r.name} ${r.contact} ${r.email} ${r.city} ${r.packages}`.toLowerCase().includes(search.toLowerCase()),
  ).sort((a, b) => Number(b.overdue) - Number(a.overdue) || (a.stage === "launched" ? 1 : 0) - (b.stage === "launched" ? 1 : 0) || b.missing.length - a.missing.length || a.name.localeCompare(b.name));
  const update = (row: OnboardingRow) => setRows((prev) => prev.map((r) => r.id === row.id ? row : r));
  return <main className="ob-desk">
    <header className="ob-head"><div><span className="call-eyebrow">ONBOARDING</span><h1>New clients, what&rsquo;s missing, who&rsquo;s next.</h1><p className="call-muted">{board} · overdue and incomplete first</p></div><button className={`call-icon-button ${spin || loading ? "is-spinning" : ""}`} onClick={() => { setSpin(true); window.setTimeout(() => setSpin(false), 900); void load(); }} disabled={loading} aria-label="Refresh from Monday"><RefreshIcon /></button></header>
    <div className="ob-toolbar">
      <input placeholder="Search business, contact, package…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search clients" />
      <select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Filter by onboarding owner"><option value="">All owners</option>{owners.map(([id, name]) => <option key={id} value={id}>{name}</option>)}<option value="unassigned">Unassigned</option></select>
      <select value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Filter by stage"><option value="">All stages</option>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
      <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)} aria-label="Show only"><option value="">Everything</option><option value="overdue">Overdue next action</option><option value="missing">Missing requirements</option><option value="stalled">Stalled / waiting</option></select>
    </div>
    {error && <div className="call-alert" role="alert">{error}<button onClick={() => load()}>Try again</button></div>}
    <div className="ob-count">{filtered.length} shown · {rows.length} loaded{cursor ? " · more available" : ""}</div>
    <div className="ob-table" role="table" aria-label="Onboarding clients">
      <div className="ob-row ob-row-head" role="row"><span>Business</span><span>Package</span><span>Owner</span><span>Stage</span><span>Missing</span><span>Next action</span></div>
      {filtered.map((r) => <button key={r.id} type="button" role="row" className={`ob-row ${clientId === r.id ? "is-active" : ""} ${r.overdue ? "is-overdue" : ""}`} onClick={() => onOpenClient(r.id)}>
        <span><b>{r.name}</b><small>{r.contact || "no contact"}{r.city && ` · ${r.city}`}</small></span>
        <span>{r.packages || "—"}<small>{r.monthly && r.monthly !== "0" ? `$${r.monthly}/mo list` : ""}</small></span>
        <span>{r.onboardingOwner || <em>Unassigned</em>}<small>Sales: {r.salesOwner || "—"}</small></span>
        <span><i className={`ob-stage ob-stage-${r.stage}`}>{stageLabel(r.stage)}</i><small>{r.health}</small></span>
        <span>{r.missing.length ? <b className="ob-missing">{r.missing.length} open</b> : <b className="ob-ok">Complete</b>}<small>Intake: {r.intake || "Not sent"}</small></span>
        <span>{r.nextAction || <em>None set</em>}<small className={r.overdue ? "ob-overdue" : ""}>{r.overdue ? "Overdue" : ""}{r.lastTouch && ` · touched ${fmtDate(r.lastTouch)}`}</small></span>
      </button>)}
      {loading && <p role="status" className="call-roster-message">Loading from Monday…</p>}
      {!loading && !filtered.length && <p className="call-roster-message">{rows.length ? "No clients match these filters." : "No clients in onboarding yet. Hand one off from the Sales tab."}</p>}
    </div>
    {cursor && <button className="call-secondary call-load-more" disabled={loading} onClick={() => load(cursor)}>Load more clients</button>}
    {clientId && <ClientPanel key={clientId} id={clientId} onClose={() => onOpenClient("")} onRow={update} />}
  </main>;
}

function ClientPanel({ id, onClose, onRow }: { id: string; onClose: () => void; onRow: (row: OnboardingRow) => void }) {
  const [detail, setDetail] = useState<OnboardingDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [next, setNext] = useState({ action: "", due: "" });
  const [link, setLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [gbpUrl, setGbpUrl] = useState("");
  const load = useCallback(async () => {
    setError("");
    try { const d: OnboardingDetail = await json(await fetch(`/api/team/onboarding/${id}`, { cache: "no-store" })); setDetail(d); onRow(d.row); setNext({ action: d.row.nextAction, due: "" }); setGbpUrl(d.row.gbpUrl); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load this client."); }
  }, [id, onRow]);
  useEffect(() => { void load(); }, [load]);
  const patch = async (body: Record<string, unknown>, label: string) => {
    if (!detail || busy) return;
    setBusy(label); setError("");
    try {
      const data: { row: OnboardingRow } = await json(await fetch(`/api/team/onboarding/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, expectedUpdatedAt: detail.row.updatedAt }) }));
      setDetail({ ...detail, row: data.row }); onRow(data.row);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save."); if ((e as { status?: number }).status === 409) void load(); }
    finally { setBusy(""); }
  };
  const post = async (path: string, label: string, method = "POST") => {
    if (busy) return null;
    setBusy(label); setError("");
    try { return await json<Record<string, unknown>>(await fetch(`/api/team/onboarding/${id}/${path}`, { method, headers: { "Content-Type": "application/json" } })); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not complete that."); return null; }
    finally { setBusy(""); }
  };
  if (!detail) return <aside className="ob-panel"><div className="ob-panel-head"><h2>Loading…</h2><button className="call-icon-button" aria-label="Close" onClick={onClose}><CloseIcon /></button></div>{error && <div className="call-alert" role="alert">{error}<button onClick={load}>Try again</button></div>}</aside>;
  const { row, record, intake, owners, history } = detail;
  const pending = record ? (Object.entries(record.steps).filter(([, s]) => s.state !== "done").map(([k]) => k)) : [];
  const problems = readinessProblems(row);
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); } catch { /* the field below stays selectable */ } };
  return <aside className="ob-panel" aria-label={`${row.name} onboarding`}>
    <div className="ob-panel-head"><div><span className="call-eyebrow">{stageLabel(row.stage)} · {row.health || "No health"}</span><h2>{row.name}</h2><p className="call-muted">{[row.contact, row.email, row.phone].filter(Boolean).join(" · ") || "No contact details"}{row.city && ` · ${row.city}`}</p></div><div className="ob-panel-actions"><a href={row.url} target="_blank" rel="noreferrer">Monday ↗</a><button className="call-icon-button" aria-label="Close" onClick={onClose}><CloseIcon /></button></div></div>
    {error && <div className="call-alert" role="alert">{error}</div>}
    {pending.length > 0 && <div className="call-alert" role="alert"><strong>Handoff steps still pending:</strong> {pending.join(", ")}.<button className="call-secondary" disabled={!!busy} onClick={async () => { const r = await post("retry", "retry") as StartResult | null; if (r) { if (r.pending.length) setError(`Still pending: ${r.pending.join(", ")}. Try again in a moment.`); await load(); } }}>{busy === "retry" ? "Retrying…" : "Retry pending steps"}</button></div>}

    <section className="ob-section"><h3>Sold</h3>
      <div className="ob-grid">
        <div><span>Packages</span><b>{row.packages || "—"}</b></div>
        <div><span>Agreed monthly</span><b>{record?.handoff.monthlyAgreed ? `$${record.handoff.monthlyAgreed}` : "not recorded"}</b><small>List: {row.monthly && row.monthly !== "0" ? `$${row.monthly}` : "—"}</small></div>
        <div><span>Setup</span><b>{row.setup ? `$${row.setup}` : "—"}</b></div>
        <div><span>Sales owner</span><b>{row.salesOwner || "—"}</b></div>
        <div><span>Signed / start</span><b>{row.signed || "—"} / {row.targetLaunch || "—"}</b></div>
      </div>
      {record && <details className="ob-details"><summary>Handoff summary from {record.handoff.salesOwner}</summary><dl><dt>Scope</dt><dd className="call-preserve">{record.handoff.scope}</dd>{record.handoff.exclusions && <><dt>Exclusions</dt><dd className="call-preserve">{record.handoff.exclusions}</dd></>}{record.handoff.goals && <><dt>Goals</dt><dd className="call-preserve">{record.handoff.goals}</dd></>}{record.handoff.context && <><dt>Promises / context</dt><dd className="call-preserve">{record.handoff.context}</dd></>}</dl></details>}
      {!record && row.notes && <p className="call-preserve ob-notes">{row.notes}</p>}
    </section>

    <section className="ob-section"><h3>Assignment & stage</h3>
      <div className="ob-controls">
        <label>Onboarding owner<select value={row.onboardingOwnerIds[0] || ""} disabled={!!busy} onChange={(e) => patch({ action: "owner", ownerId: e.target.value }, "owner")}><option value="">Unassigned</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <label>Stage<select value={row.stage} disabled={!!busy} onChange={(e) => patch({ action: "stage", stage: e.target.value }, "stage")}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}{row.stage === "unknown" && <option value="unknown">Unknown</option>}</select></label>
        <label>Health<select value={row.health} disabled={!!busy} onChange={(e) => patch({ action: "health", value: e.target.value }, "health")}>{!HEALTH.includes(row.health as (typeof HEALTH)[number]) && <option value={row.health}>{row.health || "Not set"}</option>}{HEALTH.map((h) => <option key={h}>{h}</option>)}</select></label>
        <label>Agreement<select value={row.agreement || "Unknown"} disabled={!!busy} onChange={(e) => patch({ action: "agreement", value: e.target.value }, "agreement")}>{AGREEMENT.map((a) => <option key={a}>{a}</option>)}</select></label>
        <label>Payment<select value={row.payment || "Unknown"} disabled={!!busy} onChange={(e) => patch({ action: "payment", value: e.target.value }, "payment")}>{PAYMENT.map((a) => <option key={a}>{a}</option>)}</select></label>
      </div>
      <p className="call-muted ob-hint">Madison is not on Monday yet, so she cannot be assigned until Josh invites her (then add her id to ONBOARDING_EXTRA_OWNERS). Sales owner is never changed here.</p>
    </section>

    <section className="ob-section"><h3>Next action</h3>
      <div className="ob-next"><input value={next.action} placeholder="What happens next, and who does it" disabled={!!busy} onChange={(e) => setNext({ ...next, action: e.target.value })} /><input type="date" value={next.due} disabled={!!busy} onChange={(e) => setNext({ ...next, due: e.target.value })} aria-label="Due date" /><button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "next", nextAction: next.action, due: next.due }, "next")}>Save</button></div>
      {row.overdue && <p className="ob-overdue">Overdue.</p>}
    </section>

    <section className="ob-section"><h3>Client intake</h3>
      <div className="ob-grid"><div><span>Status</span><b>{row.intake || "Not sent"}</b></div><div><span>Link</span><b>{intake?.linkActive ? `Active until ${intake.tokenExpiresAt?.slice(0, 10)}` : "None active"}</b></div><div><span>Submitted</span><b>{intake?.submittedAt ? intake.submittedAt.slice(0, 10) : "—"}</b></div><div><span>Files</span><b>{intake?.files.length || 0}</b></div></div>
      <div className="ob-buttons">
        <button className="call-primary" disabled={!!busy} onClick={async () => { const r = await post("intake-link", "link") as { url: string; expiresAt: string } | null; if (r) { setLink(r); await load(); } }}>{busy === "link" ? "Issuing…" : intake?.linkActive ? "Issue a new link (replaces the old one)" : "Issue intake link"}</button>
        {intake?.linkActive && <button className="call-secondary" disabled={!!busy} onClick={async () => { if (await post("intake-link", "revoke", "DELETE")) { setLink(null); await load(); } }}>Revoke link</button>}
        {intake?.submittedAt && row.intake !== "Reviewed" && <button className="call-secondary" disabled={!!busy} onClick={() => patch({ action: "intakeReviewed" }, "reviewed")}>Mark intake reviewed</button>}
      </div>
      {link && <div className="call-success"><strong>Copy this link now — it is shown once.</strong><p><input readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} /></p><button className="call-secondary" onClick={() => copy(link.url)}>Copy link</button><p>Expires {link.expiresAt.slice(0, 10)}. Send it yourself; nothing is emailed automatically.</p></div>}
      {intake && <details className="ob-details"><summary>What the client has filled in{intake.lastSavedAt ? ` (saved ${intake.lastSavedAt.slice(0, 10)})` : ""}</summary>
        <dl>{Object.entries(intake.form).map(([k, v]) => <FormRow key={k} k={k} v={v} />)}</dl>
        {intake.files.length > 0 && <ul className="ob-files">{intake.files.map((f) => <li key={f.key}><a href={`/api/team/onboarding/${id}/file?key=${encodeURIComponent(f.key)}`}>{f.name}</a> <small>{f.category} · {(f.size / 1024).toFixed(0)} KB</small></li>)}</ul>}
      </details>}
    </section>

    <section className="ob-section"><h3>Access</h3>
      <div className="ob-controls">
        <label>Google Business Profile<select value={row.gbpAccess || "Not Requested"} disabled={!!busy} onChange={(e) => patch({ action: "gbp", value: e.target.value, gbpUrl }, "gbp")}>{GBP_ACCESS.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label>GBP / Maps URL<input value={gbpUrl} disabled={!!busy} onChange={(e) => setGbpUrl(e.target.value)} onBlur={() => gbpUrl !== row.gbpUrl && patch({ action: "gbp", value: row.gbpAccess || "Not Requested", gbpUrl }, "gbp")} placeholder="https://maps.google.com/…" /></label>
        <label>DNS path<select value={row.dnsPath} disabled={!!busy} onChange={(e) => patch({ action: "dns", value: e.target.value }, "dns")}><option value="">Not decided</option>{DNS_PATHS.map((d) => <option key={d}>{d}</option>)}</select></label>
      </div>
      <p className="call-muted ob-hint">Client reports invitation: {intake?.form.gbpInviteSent ? `yes (to ${GBP_AGENCY_EMAIL()})` : "not yet"}{intake?.form.gbpNoProfile ? " · client says they have no profile" : ""}. Only <b>Verified</b>, set by staff after checking, counts as access.</p>
    </section>

    <section className="ob-section"><h3>Checklist <small>{row.missing.length ? `${row.missing.length} required open` : "all required done"}</small></h3>
      <ul className="ob-checklist">{row.checklist.map((c) => <li key={c.id} className={c.status === "Done" ? "is-done" : c.required ? "is-required" : ""}><label><input type="checkbox" checked={c.status === "Done"} disabled={!!busy} onChange={(e) => patch({ action: "checklist", subitemId: c.id, status: e.target.checked ? "Done" : "Working on it" }, "check")} /> {c.name}</label><span>{c.required ? "required" : c.phase}{c.status === "Stuck" && " · stuck"}</span><select aria-label="Status" value={c.status || "Working on it"} disabled={!!busy} onChange={(e) => patch({ action: "checklist", subitemId: c.id, status: e.target.value }, "check")}>{CHECK_STATUS.map((s) => <option key={s}>{s}</option>)}</select></li>)}</ul>
      {!row.checklist.length && <p className="call-muted">No checklist rows on this record.</p>}
    </section>

    <section className="ob-section"><h3>Ready for production?</h3>
      {problems.length ? <ul className="ob-problems">{problems.map((p) => <li key={p}>{p}</li>)}</ul> : <p className="ob-ok">All required items are complete.</p>}
      <button className="call-primary" disabled={!!busy || problems.length > 0 || row.stage === "ready" || row.stage === "building" || row.stage === "launched"} onClick={() => patch({ action: "ready" }, "ready")}>Mark ready for production</button>
      <p className="call-muted ob-hint">This is a staff decision. Sending a link or a client saying they invited us never counts by itself.</p>
    </section>

    <section className="ob-section"><h3>Notes</h3>
      <div className="ob-next"><textarea rows={2} value={note} disabled={!!busy} placeholder="Append a note to the Monday record" onChange={(e) => setNote(e.target.value)} /><button className="call-secondary" disabled={!!busy || !note.trim()} onClick={async () => { await patch({ action: "note", text: note }, "note"); setNote(""); await load(); }}>Add note</button></div>
      {history.map((h) => <article key={h.id} className="ob-history"><small>{h.author} · {new Date(h.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</small><p className="call-preserve">{h.text}</p></article>)}
    </section>
  </aside>;
}

function FormRow({ k, v }: { k: string; v: string | boolean }) {
  const labels: Record<string, string> = { business: "Business", contact: "Contact", email: "Email", phone: "Phone", address: "Address", serviceAreas: "Service areas", services: "Services", goals: "Goals", brandColors: "Brand colors", fonts: "Fonts", website: "Website", references: "Reference sites", competitors: "Competitors", social: "Social links", hours: "Hours", gbpUrl: "GBP link", gbpInviteSent: "Says GBP invite sent", gbpNoProfile: "Says no GBP", notes: "Notes" };
  const text = typeof v === "boolean" ? (v ? "Yes" : "No") : v;
  if (!text) return null;
  return <><dt>{labels[k] || k}</dt><dd className="call-preserve">{text}</dd></>;
}
