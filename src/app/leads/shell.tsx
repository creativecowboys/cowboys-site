"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Desk from "./desk";
import Handoff from "./handoff";
import Onboarding from "./onboarding";
import Clients from "./clients";
import type { CallLead } from "./types";
import "./onboarding.css";

// Two tabs over one sign-in. The Sales desk keeps its own state (drafts live in sessionStorage),
// so switching tabs only hides it; nothing is unmounted while a save is running.
export default function Shell() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") === "onboarding" ? "onboarding" : params.get("tab") === "clients" ? "clients" : "sales";
  const client = params.get("client") || "";
  const [handoff, setHandoff] = useState<{ lead: CallLead | null } | null>(null);
  const go = useCallback((next: "sales" | "onboarding" | "clients", clientId?: string) => {
    const q = new URLSearchParams();
    if (next !== "sales") q.set("tab", next);
    if (clientId) q.set("client", clientId);
    router.replace(`/leads${q.toString() ? `?${q}` : ""}`);
  }, [router]);
  return <div className="team-shell">
    <nav className="team-tabs" aria-label="Team desk sections">
      <button type="button" className={tab === "sales" ? "is-active" : ""} aria-current={tab === "sales" ? "page" : undefined} onClick={() => go("sales")}>Sales</button>
      <button type="button" className={tab === "onboarding" ? "is-active" : ""} aria-current={tab === "onboarding" ? "page" : undefined} onClick={() => go("onboarding")}>Onboarding</button>
      <button type="button" className={tab === "clients" ? "is-active" : ""} aria-current={tab === "clients" ? "page" : undefined} onClick={() => go("clients")}>Clients</button>
    </nav>
    <div hidden={tab !== "sales"}><Desk onStartOnboarding={(lead) => setHandoff({ lead })} /></div>
    {tab === "onboarding" && <Onboarding clientId={client} onOpenClient={(id) => go("onboarding", id)} onGraduated={(id) => go("clients", id)} onAddClient={() => setHandoff({ lead: null })} />}
    {tab === "clients" && <Clients clientId={client} onOpenClient={(id) => go("clients", id)} />}
    {handoff && <Handoff lead={handoff.lead} onClose={() => setHandoff(null)} onDone={(itemId) => { setHandoff(null); go("onboarding", itemId); }} />}
  </div>;
}
