"use client";

import { upload } from "@vercel/blob/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FILE_CATEGORIES, GBP_AGENCY_EMAIL, UPLOAD_MAX_BYTES } from "@/lib/onboarding/config";
import type { IntakeForm as Form } from "@/lib/onboarding/types";
import "./intake.css";

type View = { business: string; form: Form; files: { key: string; name: string; size: number; category: string; uploadedAt: string }[]; submittedAt: string | null; lastSavedAt: string | null; expiresAt: string | null };
const CATEGORY_HELP: Record<(typeof FILE_CATEGORIES)[number], string> = {
  Brand: "Logo files (SVG, AI, EPS or the largest PNG you have), brand guide, fonts.",
  Photos: "Your team, your work, your trucks, your storefront. Real photos beat stock.",
  Content: "Service descriptions, bios, testimonials, anything written you already use.",
  Reference: "Screenshots or PDFs of sites you like, price lists, old brochures.",
};

async function api<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Your answers are still on this page.");
  return data;
}

export default function IntakeForm({ token }: { token: string }) {
  const base = `/api/onboarding/${encodeURIComponent(token)}`;
  const [view, setView] = useState<View | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "submitting">("idle");
  const [dead, setDead] = useState(false);
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    (async () => {
      try { const v: View = await api(await fetch(base, { cache: "no-store" })); setView(v); setForm(v.form); }
      catch (e) { setDead(true); setError(e instanceof Error ? e.message : "This link is not valid."); }
    })();
  }, [base]);
  const save = useCallback(async (current: Form) => {
    setStatus("saving"); setError("");
    try { const v: View = await api(await fetch(base, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) })); setView(v); dirty.current = false; setStatus("saved"); }
    catch (e) { setStatus("idle"); setError(e instanceof Error ? e.message : "Could not save. Your answers are still on this page."); }
  }, [base]);
  const set = (change: Partial<Form>) => setForm((f) => {
    const next = { ...(f as Form), ...change };
    dirty.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void save(next), 1500); // autosave
    return next;
  });
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current || Object.keys(uploading).length) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);
  const submit = async () => {
    if (!form) return;
    if (timer.current) window.clearTimeout(timer.current);
    setStatus("submitting"); setError("");
    try { const v: View = await api(await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form }) })); setView(v); dirty.current = false; setStatus("saved"); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (e) { setStatus("idle"); setError(e instanceof Error ? e.message : "Could not submit. Your answers are saved on this page; try again in a moment."); }
  };
  const addFiles = async (category: (typeof FILE_CATEGORIES)[number], list: FileList | null) => {
    if (!list?.length) return;
    for (const file of Array.from(list)) {
      const id = `${category}/${file.name}/${Date.now()}`;
      if (file.size > UPLOAD_MAX_BYTES) { setError(`${file.name} is larger than ${Math.round(UPLOAD_MAX_BYTES / 1048576)} MB. Send it another way or compress it.`); continue; }
      setUploading((u) => ({ ...u, [id]: file.name }));
      try {
        const blob = await upload(file.name, file, { access: "private", handleUploadUrl: `${base}/upload`, clientPayload: JSON.stringify({ category, name: file.name }), contentType: file.type || "application/octet-stream" });
        const v: View = await api(await fetch(`${base}/files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathname: blob.pathname, category, name: file.name }) }));
        setView(v);
      } catch (e) { setError(e instanceof Error && e.message ? `${file.name}: ${e.message}` : `${file.name} did not upload. Please try again.`); }
      finally { setUploading((u) => { const n = { ...u }; delete n[id]; return n; }); }
    }
  };
  const remove = async (key: string) => {
    setError("");
    try { const v: View = await api(await fetch(`${base}/files?key=${encodeURIComponent(key)}`, { method: "DELETE" })); setView(v); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not remove that file."); }
  };
  if (dead) return <main className="intake"><div className="intake-card"><h1>This link isn&rsquo;t active</h1><p>{error}</p><p>Ask your Creative Cowboys contact for a fresh link. Nothing you sent before is lost.</p></div></main>;
  if (!view || !form) return <main className="intake"><div className="intake-card" role="status">Loading your onboarding…</div></main>;
  const field = (key: keyof Form, label: string, help?: string, rows?: number, type = "text") => (
    <label className="intake-field">{label}{help && <small>{help}</small>}
      {rows ? <textarea rows={rows} value={String(form[key])} onChange={(e) => set({ [key]: e.target.value } as Partial<Form>)} />
        : <input type={type} value={String(form[key])} onChange={(e) => set({ [key]: e.target.value } as Partial<Form>)} />}
    </label>
  );
  const busyUploads = Object.values(uploading);
  return <main className="intake">
    <header className="intake-head"><span className="intake-eyebrow">CREATIVE COWBOYS · ONBOARDING</span><h1>{view.business}</h1><p>Welcome aboard. This page saves as you go, so you can come back any time before the link expires{view.expiresAt && ` on ${view.expiresAt.slice(0, 10)}`}. Skip anything you don&rsquo;t have yet.</p></header>
    {view.submittedAt && <div className="intake-banner">Thank you — we received this on {view.submittedAt.slice(0, 10)}. You can still update answers or add files; we&rsquo;ll see the changes.</div>}
    {error && <div className="intake-error" role="alert">{error}</div>}

    <section className="intake-card"><h2>1. Your business</h2>
      <div className="intake-grid">{field("business", "Business name")}{field("contact", "Your name")}{field("email", "Best email", undefined, undefined, "email")}{field("phone", "Best phone")}{field("address", "Business address", "The address customers or Google should see, or the city if you work from home.")}{field("hours", "Hours")}{field("website", "Current website (if any)")}{field("social", "Social links", "Facebook, Instagram, Google, Yelp — one per line.", 2)}</div>
    </section>
    <section className="intake-card"><h2>2. What you do, and for whom</h2>
      {field("services", "Services you offer", "List them the way you'd say them to a customer. Note anything you do NOT want advertised.", 4)}
      {field("serviceAreas", "Service areas", "Cities, counties or a radius. Which matter most?", 2)}
      {field("goals", "What would make this a win for you?", "More calls? Bigger jobs? A certain kind of customer? Be specific — it shapes what we build.", 3)}
      {field("competitors", "Competitors you see most", "Names or websites. Who do you lose jobs to, and who do you beat?", 2)}
    </section>
    <section className="intake-card"><h2>3. Your brand</h2>
      <div className="intake-grid">{field("brandColors", "Brand colors", "Hex codes if you have them; otherwise describe them or upload something that shows them.")}{field("fonts", "Fonts", "If you know them. If not, leave blank.")}</div>
      {field("references", "Websites you like (and why)", "Anyone's — inspiration for look and feel.", 2)}
    </section>
    <section className="intake-card"><h2>4. Files</h2><p className="intake-help">Upload straight from your phone or computer. Up to {Math.round(UPLOAD_MAX_BYTES / 1048576)} MB per file. Nothing is public; only our team can open these.</p>
      {FILE_CATEGORIES.map((cat) => <div key={cat} className="intake-upload">
        <div><strong>{cat}</strong><small>{CATEGORY_HELP[cat]}</small></div>
        <label className="intake-upload-button">Add files<input type="file" multiple onChange={(e) => { void addFiles(cat, e.target.files); e.target.value = ""; }} /></label>
        <ul>{view.files.filter((f) => f.category === cat).map((f) => <li key={f.key}>{f.name} <small>{(f.size / 1024).toFixed(0)} KB</small><button type="button" onClick={() => remove(f.key)} aria-label={`Remove ${f.name}`}>Remove</button></li>)}{busyUploads.length > 0 && Object.entries(uploading).filter(([k]) => k.startsWith(`${cat}/`)).map(([k, name]) => <li key={k} className="is-uploading">{name} <small>uploading…</small></li>)}</ul>
      </div>)}
    </section>
    <section className="intake-card"><h2>5. Google Business Profile</h2>
      <p className="intake-help">Your Google listing (the map card with reviews). We manage it for you, but we never ask for your Google password. Instead, add <b>{GBP_AGENCY_EMAIL()}</b> as a <b>Manager</b>:</p>
      <ol className="intake-steps"><li>Sign in to Google and open your Business Profile (search your business name while signed in, or go to business.google.com).</li><li>Open the menu (three dots) → <b>Business Profile settings</b> → <b>People and access</b>.</li><li>Choose <b>Add</b>, enter <b>{GBP_AGENCY_EMAIL()}</b>, pick the <b>Manager</b> role, and send the invitation.</li></ol>
      <div className="intake-grid">{field("gbpUrl", "Link to your Google listing (optional)", "Search your business on Google Maps, tap Share, paste the link.")}</div>
      <label className="intake-check"><input type="checkbox" checked={form.gbpInviteSent} onChange={(e) => set({ gbpInviteSent: e.target.checked })} /> I&rsquo;ve sent the Manager invitation to {GBP_AGENCY_EMAIL()}</label>
      <label className="intake-check"><input type="checkbox" checked={form.gbpNoProfile} onChange={(e) => set({ gbpNoProfile: e.target.checked })} /> I don&rsquo;t have a Google Business Profile (or I&rsquo;m not sure)</label>
    </section>
    <section className="intake-card"><h2>6. Anything else</h2>{field("notes", "Notes for the team", "Questions, deadlines, things we should know.", 3)}</section>

    <footer className="intake-footer">
      <span role="status">{status === "saving" ? "Saving…" : status === "submitting" ? "Sending…" : dirty.current ? "Unsaved changes" : view.lastSavedAt ? `Saved ${new Date(view.lastSavedAt).toLocaleTimeString("en-US", { timeStyle: "short" })}` : "Saves automatically"}{busyUploads.length > 0 && ` · ${busyUploads.length} uploading`}</span>
      <button type="button" className="intake-submit" disabled={status === "saving" || status === "submitting" || busyUploads.length > 0} onClick={submit}>{view.submittedAt ? "Send updates" : "Send to Creative Cowboys"}</button>
    </footer>
    <p className="intake-fine">Questions? Reply to the message that brought you here, or call 404.395.9092.</p>
  </main>;
}
