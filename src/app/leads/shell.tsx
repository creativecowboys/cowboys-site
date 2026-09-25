"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Desk from "./desk";
import Handoff from "./handoff";
import Onboarding from "./onboarding";
import type { CallLead } from "./types";
import "./onboarding.css";

// Two tabs over one sign-in. The Sales desk keeps its own state (drafts live in sessionStorage),
// so switching tabs only hides it; nothing is unmounted while a save is running.
export default function Shell() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") === "onboarding" ? "onboarding" : "sales";
  const client = params.get("client") || "";
  const [handoffLead, setHandoffLead] = useState<CallLead | null>(null);
  const go = useCallback((next: "sales" | "onboarding", clientId?: string) => {
    const q = new URLSearchParams();
    if (next === "onboarding") q.set("tab", "onboarding");
    if (clientId) q.set("client", clientId);
    router.replace(`/leads${q.toString() ? `?${q}` : ""}`);
  }, [router]);
  return <div className="team-shell">
    <nav className="team-tabs" aria-label="Team desk sections">
      <button type="button" className={tab === "sales" ? "is-active" : ""} aria-current={tab === "sales" ? "page" : undefined} onClick={() => go("sales")}>Sales</button>
      <button type="button" className={tab === "onboarding" ? "is-active" : ""} aria-current={tab === "onboarding" ? "page" : undefined} onClick={() => go("onboarding")}>Onboarding</button>
    </nav>
    <div hidden={tab !== "sales"}><Desk onStartOnboarding={(lead) => setHandoffLead(lead)} /></div>
    {tab === "onboarding" && <Onboarding clientId={client} onOpenClient={(id) => go("onboarding", id)} />}
    {handoffLead && <Handoff lead={handoffLead} onClose={() => setHandoffLead(null)} onDone={(itemId) => { setHandoffLead(null); go("onboarding", itemId); }} />}
  </div>;
}
