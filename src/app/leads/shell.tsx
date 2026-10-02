"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Desk from "./desk";
import Handoff from "./handoff";
import Onboarding from "./onboarding";
import Clients from "./clients";
import Packages from "./packages";
import type { CallLead } from "./types";
import type { DeskSystem } from "./notes";
import "./onboarding.css";

// Three tabs over one sign-in. The Sales desk keeps its own state (drafts live in sessionStorage),
// so switching tabs only hides it; nothing is unmounted while a save is running.
// `?desk=ghl|monday` previews the Onboarding / Clients desk on the other system and is kept while moving between
// tabs and clients. (`?backend=` is the Sales roster's own preview from Phase 1; the Sales tab reads it itself.)
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
  const go = useCallback((next: "sales" | "onboarding" | "clients", clientId?: string) => {
    const q = new URLSearchParams();
    if (next !== "sales") q.set("tab", next);
    if (clientId) q.set("client", clientId);
    if (preview) q.set("desk", preview);
    router.replace(`/leads${q.toString() ? `?${q}` : ""}`);
  }, [router, preview]);
  return <div className="team-shell">
    <nav className="team-tabs" aria-label="Team desk sections">
      <button type="button" className={tab === "sales" ? "is-active" : ""} aria-current={tab === "sales" ? "page" : undefined} onClick={() => go("sales")}>Sales</button>
      <button type="button" className={tab === "onboarding" ? "is-active" : ""} aria-current={tab === "onboarding" ? "page" : undefined} onClick={() => go("onboarding")}>Onboarding</button>
      <button type="button" className={tab === "clients" ? "is-active" : ""} aria-current={tab === "clients" ? "page" : undefined} onClick={() => go("clients")}>Clients</button>
    </nav>
    <div hidden={tab !== "sales"}><Desk onStartOnboarding={(lead) => setHandoff({ lead })} onOpenPackages={(lead) => setPackages({ lead })} /></div>
    {tab === "onboarding" && <Onboarding clientId={client} onOpenClient={(id) => go("onboarding", id)} onGraduated={(id) => go("clients", id)} onAddClient={() => setHandoff({ lead: null })} system={deskSystem} preview={preview} onSystem={setReported} />}
    {tab === "clients" && <Clients clientId={client} onOpenClient={(id) => go("clients", id)} system={deskSystem} preview={preview} onSystem={setReported} />}
    {packages && <Packages lead={packages.lead} onClose={() => setPackages(null)} />}
    {handoff && <Handoff lead={handoff.lead} system={deskSystem} preview={preview} onClose={() => setHandoff(null)} onDone={(itemId) => { setHandoff(null); go("onboarding", itemId); }} />}
  </div>;
}
