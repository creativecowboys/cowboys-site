"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Desk from "./desk";
import Handoff from "./handoff";
import Onboarding from "./onboarding";
import Clients from "./clients";
import Packages from "./packages";
import type { CallLead, DeskLeave, SignedIn } from "./types";
import type { DeskSystem } from "./notes";
import { DESK_LOGIN_PATH, DESK_PATH } from "@/lib/desk-path";
import "./onboarding.css";

// The team desk, served at /admin (src/app/admin/page.tsx renders this; the files stay in this folder for now).
// Three tabs over one sign-in. The Sales desk keeps its own state (drafts live in sessionStorage),
// so switching tabs only hides it; nothing is unmounted while a save is running.
// `?desk=ghl|monday` previews the Onboarding / Clients desk on the other system and is kept while moving between
// tabs and clients. (`?backend=` is the Sales roster's own preview from Phase 1; the Sales tab reads it itself.)
// The bar also holds the way out: who is signed in (it comes back with the Sales roster) and Sign out, which ends the
// session (POST /api/admin/logout) and lands on the sign-in page. The old admin sidebar had the only sign-out; it went Oct 2 2026.
export default function Shell({ deskDefault = "monday" }: { deskDefault?: DeskSystem }) {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") === "onboarding" ? "onboarding" : params.get("tab") === "clients" ? "clients" : "sales";
  const client = params.get("client") || "";
  const desk = params.get("desk");
  const preview = desk === "ghl" || desk === "monday" ? desk : "";
  // Which system the Onboarding / Clients desk is on: what the last list response said, else the preview, else the build-time default.
  const [reported, setReported] = useState<DeskSystem | "">("");
  const deskSystem: DeskSystem = reported || preview || deskDefault;
  const [handoff, setHandoff] = useState<{ lead: CallLead | null } | null>(null);
  const [packages, setPackages] = useState<{ lead: CallLead | null } | null>(null);
  const [who, setWho] = useState<SignedIn | null>(null);
  // The Sales desk is always mounted and holds the unsaved call notes: it is asked before the session ends (see DeskLeave).
  const leaveRef = useRef<DeskLeave>({ unsaved: () => "", leaving: false });
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  // Why a sign-out did not happen is said under the bar for a few seconds, then cleared (it is about that one click).
  useEffect(() => {
    if (!leaveError) return;
    const timer = window.setTimeout(() => setLeaveError(""), 8000);
    return () => window.clearTimeout(timer);
  }, [leaveError]);
  const signOut = async () => {
    if (leaving) return;
    setLeaveError("");
    const unsaved = leaveRef.current.unsaved();
    if (unsaved === "saving") { setLeaveError("A save is still running. Try again in a moment."); return; }
    if (unsaved === "notes" && !window.confirm("You have call notes in this tab that are not saved yet. Sign out anyway?\n\nThey stay in this browser tab. After you sign in again, come back to this tab to save them.")) return;
    setLeaving(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error(`sign-out answered ${res.status}`);
    } catch { setLeaving(false); setLeaveError("Could not sign out. Check your connection and try again."); return; }
    leaveRef.current.leaving = true; // the person has already said yes to leaving unsaved notes: the browser does not ask again
    window.location.assign(DESK_LOGIN_PATH); // a full load, so nothing the desk had on screen stays in memory
  };
  const go = useCallback((next: "sales" | "onboarding" | "clients", clientId?: string) => {
    const q = new URLSearchParams();
    if (next !== "sales") q.set("tab", next);
    if (clientId) q.set("client", clientId);
    if (preview) q.set("desk", preview);
    router.replace(`${DESK_PATH}${q.toString() ? `?${q}` : ""}`);
  }, [router, preview]);
  return <div className="team-shell">
    <div className="team-bar">
      <nav className="team-tabs" aria-label="Team desk sections">
        <button type="button" className={tab === "sales" ? "is-active" : ""} aria-current={tab === "sales" ? "page" : undefined} onClick={() => go("sales")}>Sales</button>
        <button type="button" className={tab === "onboarding" ? "is-active" : ""} aria-current={tab === "onboarding" ? "page" : undefined} onClick={() => go("onboarding")}>Onboarding</button>
        <button type="button" className={tab === "clients" ? "is-active" : ""} aria-current={tab === "clients" ? "page" : undefined} onClick={() => go("clients")}>Clients</button>
      </nav>
      <div className="team-session">
        {who && <span className="team-who" title={`Signed in as ${who.email}`}><span className="call-sr-only">Signed in as </span>{who.name}</span>}
        <button type="button" className="team-signout" onClick={signOut} disabled={leaving}>{leaving ? "Signing out…" : "Sign out"}</button>
      </div>
    </div>
    {leaveError && <div className="team-bar-alert" role="alert">{leaveError}</div>}
    <div hidden={tab !== "sales"}><Desk onStartOnboarding={(lead) => setHandoff({ lead })} onOpenPackages={(lead) => setPackages({ lead })} onWho={setWho} leaveRef={leaveRef} /></div>
    {tab === "onboarding" && <Onboarding clientId={client} onOpenClient={(id) => go("onboarding", id)} onGraduated={(id) => go("clients", id)} onAddClient={() => setHandoff({ lead: null })} system={deskSystem} preview={preview} onSystem={setReported} />}
    {tab === "clients" && <Clients clientId={client} onOpenClient={(id) => go("clients", id)} system={deskSystem} preview={preview} onSystem={setReported} />}
    {packages && <Packages lead={packages.lead} onClose={() => setPackages(null)} />}
    {handoff && <Handoff lead={handoff.lead} system={deskSystem} preview={preview} onClose={() => setHandoff(null)} onDone={(itemId) => { setHandoff(null); go("onboarding", itemId); }} />}
  </div>;
}
