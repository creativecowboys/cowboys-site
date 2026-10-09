"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { byLinkName, checkLinkFields, LINK_LIMITS, linkLabel, linkMatches, safeLinkHref, type LinkFields } from "@/lib/desk/link-rules";
import type { LinksData, TeamLink } from "@/lib/desk/links";
import { RefreshIcon } from "./icons";
import "./links.css";

// The Back Office Links tab (Oct 9 2026; Dave: "make a new tab for links… give us the ability to name and post links
// that we use often"). One shared list for the whole team, A to Z by name, kept in the site's private Blob store
// (src/lib/desk/links.ts). Add a link (name + address + optional note); the name opens it in a new tab; Copy puts the
// address on the clipboard. Edit and Delete work like the notes on the client panels (Dave, Oct 4 2026): Edit turns the
// row into boxes with Save and Cancel, Delete is immediate with no question and sits apart at the far right.
// Links only: never passwords, keys or logins (said under the form; a link carrying user:password@ is refused).

type Edit = LinkFields & { id: string; rev: number };
const EMPTY: LinkFields = { name: "", url: "", note: "" };

async function json<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || (response.status === 401 ? "Your team session expired. Sign in again." : "That did not go through. Please try again.")), { status: response.status });
  return data as T;
}
const send = (path: string, method: string, body: unknown) =>
  fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
const when = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
};

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* older browser or no permission: fall back below */ }
  try {
    const box = document.createElement("textarea");
    box.value = text; box.setAttribute("readonly", ""); box.style.position = "fixed"; box.style.opacity = "0";
    document.body.appendChild(box); box.select();
    const ok = document.execCommand("copy");
    box.remove();
    return ok;
  } catch { return false; }
}

export default function Links() {
  const [links, setLinks] = useState<TeamLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [spin, setSpin] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<LinkFields>(EMPTY);
  const [formError, setFormError] = useState<{ field: keyof LinkFields | ""; text: string }>({ field: "", text: "" });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Edit | null>(null);
  const [editError, setEditError] = useState("");
  const [working, setWorking] = useState(""); // the link being saved or deleted
  const [copied, setCopied] = useState("");
  const [fresh, setFresh] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  // The same text gets the same id, so a retry after a dropped connection cannot add the link twice.
  const pending = useRef({ key: "", id: "" });

  const take = (data: LinksData) => setLinks([...data.links].sort(byLinkName));
  // `keepError`: reload under a message that explains why (an edit that lost to someone else's change).
  const load = useCallback(async (keepError = false) => {
    setLoading(true); if (!keepError) setError("");
    try { take(await json<LinksData>(await fetch("/api/team/links", { cache: "no-store" }))); setLoaded(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load the links."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  // Short-lived things clear themselves: the "Added" line, the highlight on a new link, the Copied mark.
  useEffect(() => { if (!status) return; const t = window.setTimeout(() => setStatus(""), 5000); return () => window.clearTimeout(t); }, [status]);
  useEffect(() => { if (!fresh) return; const t = window.setTimeout(() => setFresh(""), 2500); return () => window.clearTimeout(t); }, [fresh]);
  useEffect(() => { if (!copied) return; const t = window.setTimeout(() => setCopied(""), 1600); return () => window.clearTimeout(t); }, [copied]);

  // Typing again clears the last complaint about the form.
  const change = (patch: Partial<LinkFields>) => { setForm((f) => ({ ...f, ...patch })); if (formError.text) setFormError({ field: "", text: "" }); };
  const shown = useMemo(() => links.filter((l) => linkMatches(l, search)), [links, search]);
  const locked = adding || !!working;

  const add = async (event: FormEvent) => {
    event.preventDefault();
    if (locked) return;
    const checked = checkLinkFields(form);
    if (!checked.ok) { setFormError({ field: checked.field, text: checked.error }); return; }
    const key = JSON.stringify(checked.value);
    if (pending.current.key !== key) pending.current = { key, id: crypto.randomUUID() };
    setAdding(true); setFormError({ field: "", text: "" }); setError("");
    try {
      take(await json<LinksData>(await send("/api/team/links", "POST", { id: pending.current.id, ...checked.value })));
      setFresh(pending.current.id); setStatus(`Added “${checked.value.name}”.`);
      setForm(EMPTY); pending.current = { key: "", id: "" };
      nameRef.current?.focus();
    } catch (e) {
      const text = e instanceof Error ? e.message : "Could not add the link.";
      setFormError({ field: /already saved/.test(text) ? "url" : "", text });
    } finally { setAdding(false); }
  };

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!editing || locked) return;
    const checked = checkLinkFields(editing);
    if (!checked.ok) { setEditError(checked.error); return; }
    setWorking(editing.id); setEditError("");
    try {
      take(await json<LinksData>(await send(`/api/team/links/${editing.id}`, "PATCH", { ...checked.value, rev: editing.rev })));
      setEditing(null);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Could not save the link.";
      const code = (e as { status?: number }).status;
      // Deleted or changed by someone else meanwhile: close the boxes, say why, and show the list as it is now.
      // (A 409 for an address that is already saved under another name is about this edit: keep the boxes open.)
      if (code === 404 || (code === 409 && !/already saved/.test(text))) { setEditing(null); setError(text); void load(true); }
      else setEditError(text);
    } finally { setWorking(""); }
  };

  const remove = async (link: TeamLink) => {
    if (locked) return;
    setWorking(link.id); setError("");
    try { take(await json<LinksData>(await send(`/api/team/links/${link.id}`, "DELETE", {}))); setStatus(`Deleted “${link.name}”.`); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete the link."); }
    finally { setWorking(""); }
  };

  const copy = async (link: TeamLink) => {
    if (await copyText(link.url)) setCopied(link.id);
    else setError("Could not copy. Open the link and copy it from the address bar.");
  };

  return <main className="ob-desk lk-desk">
    <header className="ob-head">
      <div><span className="call-eyebrow">LINKS</span><h1>The links we use most.</h1><p className="call-muted">One list for the whole team · A to Z</p></div>
      <div className="ob-head-actions"><button type="button" className={`call-icon-button ${spin || loading ? "is-spinning" : ""}`} onClick={() => { setSpin(true); window.setTimeout(() => setSpin(false), 900); void load(); }} disabled={loading} aria-label="Refresh the links"><RefreshIcon /></button></div>
    </header>

    <form className="lk-add" onSubmit={add} noValidate aria-label="Add a link">
      <label className="ob-field"><span>Name</span>
        <input ref={nameRef} value={form.name} maxLength={LINK_LIMITS.name} disabled={adding} placeholder="Search Atlas dashboard" autoComplete="off" aria-invalid={formError.field === "name" || undefined} onChange={(e) => change({ name: e.target.value })} />
      </label>
      <label className="ob-field"><span>Link</span>
        <input value={form.url} maxLength={LINK_LIMITS.url} disabled={adding} placeholder="https://…" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={formError.field === "url" || undefined} onChange={(e) => change({ url: e.target.value })} />
      </label>
      <label className="ob-field"><span>Note <small>optional</small></span>
        <input value={form.note} maxLength={LINK_LIMITS.note} disabled={adding} placeholder="What it’s for" autoComplete="off" aria-invalid={formError.field === "note" || undefined} onChange={(e) => change({ note: e.target.value })} />
      </label>
      <button type="submit" className="call-primary" disabled={adding || !form.name.trim() || !form.url.trim()}>{adding ? "Adding…" : "Add link"}</button>
    </form>
    {formError.text && <p className="lk-form-error" role="alert">{formError.text}</p>}
    <p className="call-muted ob-hint lk-hint">Links only. Never put passwords, API keys or logins here; those stay in the password manager. Everyone signed in to the Back Office sees this list and can change or delete any link.</p>
    <p className="call-sr-only" role="status" aria-live="polite">{status}</p>

    {error && <div className="call-alert" role="alert">{error}<button type="button" className="call-secondary" onClick={() => load()}>Reload the list</button></div>}

    {links.length > 0 && <div className="lk-toolbar">
      <input type="search" placeholder="Search names, links and notes…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search the links" />
    </div>}
    {loaded && <div className="ob-count">{search.trim() ? `${shown.length} of ${links.length} shown` : `${links.length} ${links.length === 1 ? "link" : "links"}`}{status ? ` · ${status}` : ""}</div>}

    <ul className="lk-list" aria-label="Saved links" aria-busy={loading || undefined}>
      {shown.map((link) => {
        const href = safeLinkHref(link.url);
        const isEditing = editing?.id === link.id;
        return <li key={link.id} className={`lk-item${fresh === link.id ? " is-new" : ""}${isEditing ? " is-editing" : ""}`}>
          {isEditing && editing
            ? <form className="lk-edit" onSubmit={save} noValidate onKeyDown={(e) => { if (e.key === "Escape" && !working) { setEditing(null); setEditError(""); } }}>
                <label className="ob-field"><span>Name</span><input value={editing.name} maxLength={LINK_LIMITS.name} disabled={!!working} autoFocus onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
                <label className="ob-field"><span>Link</span><input value={editing.url} maxLength={LINK_LIMITS.url} disabled={!!working} inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false} onChange={(e) => setEditing({ ...editing, url: e.target.value })} /></label>
                <label className="ob-field lk-edit-note"><span>Note <small>optional</small></span><input value={editing.note} maxLength={LINK_LIMITS.note} disabled={!!working} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></label>
                {editError && <p className="lk-form-error" role="alert">{editError}</p>}
                <div className="ob-buttons lk-edit-buttons">
                  <button type="submit" className="call-secondary" disabled={!!working || !editing.name.trim() || !editing.url.trim()}>{working === link.id ? "Saving…" : "Save"}</button>
                  <button type="button" className="ob-note-action" disabled={!!working} onClick={() => { setEditing(null); setEditError(""); }}>Cancel</button>
                </div>
              </form>
            : <>
                <div className="lk-main">
                  {href
                    ? <a className="lk-name" href={href} target="_blank" rel="noopener noreferrer">{link.name}<ArrowUpRight size={14} strokeWidth={2.25} aria-hidden="true" /><span className="call-sr-only"> (opens in a new tab)</span></a>
                    : <b className="lk-name">{link.name}</b>}
                  <span className="lk-url" title={link.url}>{linkLabel(link.url)}</span>
                  {link.note && <p className="lk-note">{link.note}</p>}
                  <small className="lk-meta">Added by {link.addedBy}{when(link.addedAt) && ` · ${when(link.addedAt)}`}{link.updatedAt && <span title={`Edited ${when(link.updatedAt)}${link.updatedBy ? ` by ${link.updatedBy}` : ""}`}> · edited{link.updatedBy ? ` by ${link.updatedBy}` : ""}</span>}</small>
                </div>
                <div className="lk-actions">
                  <button type="button" className={`lk-copy${copied === link.id ? " is-copied" : ""}`} onClick={() => copy(link)} aria-label={`Copy the link for ${link.name}`}>
                    {copied === link.id ? <><Check size={13} strokeWidth={2.5} aria-hidden="true" />Copied</> : <><Copy size={13} strokeWidth={2.25} aria-hidden="true" />Copy link</>}
                  </button>
                  <span className="ob-note-actions">
                    <button type="button" className="ob-note-action" disabled={locked} onClick={() => { setEditing({ id: link.id, rev: link.rev, name: link.name, url: link.url, note: link.note }); setEditError(""); }} aria-label={`Edit ${link.name}`}>Edit</button>
                    <button type="button" className="ob-note-action ob-note-delete" disabled={locked} onClick={() => remove(link)} aria-label={`Delete ${link.name}`}>{working === link.id ? "Deleting…" : "Delete"}</button>
                  </span>
                </div>
              </>}
        </li>;
      })}
      {loading && !loaded && <li className="lk-empty" role="status">Loading the links…</li>}
      {loaded && !shown.length && <li className="lk-empty">{links.length ? `No links match “${search.trim()}”.` : "No links yet. Add the first one above."}</li>}
    </ul>
  </main>;
}
