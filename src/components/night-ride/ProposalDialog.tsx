"use client";

import { useEffect, useRef, useState } from "react";
import { trackLead } from "@/lib/analytics";
import { nightRideFonts } from "./fonts";
import { ArrowRight, Check, Corners } from "./icons";
import "./dialog.css";

const SERVICES = ["Website", "Local SEO", "Google Ads", "Social media ads", "Full package", "Not sure yet"];

/**
 * The proposal form in the Night Ride look. Same behaviour and payload as the older
 * ProposalModal (posts to /api/contact as a "Homepage Popup" proposal, honeypot, time trap,
 * lead tracking), so email subjects and the GoHighLevel mirror are unchanged.
 *
 * `hidePhone` leaves the phone field out. Set it on the homepage, where the GoHighLevel chat
 * widget has to be the only place a phone number is collected (A2P 10DLC registration).
 */
export default function ProposalDialog({ isOpen, onClose, source, hidePhone = false }: { isOpen: boolean; onClose: () => void; source: string; hidePhone?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const openedAt = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    openedAt.current = Date.now();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Hides the chat bubble while the form is open, so it can't sit on top of the send button.
    document.body.classList.add("nr-dialog-open");
    const t = window.setTimeout(() => first.current?.focus(), 60);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !box.current) return;
      const els = Array.from(box.current.querySelectorAll<HTMLElement>('input:not([tabindex="-1"]), select, textarea, button, a[href]'));
      if (!els.length) return;
      const a = els[0], z = els[els.length - 1];
      if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.body.classList.remove("nr-dialog-open");
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) || "").trim();
    const service = val("service");
    if (!val("name") || !val("email") || !service) {
      setStatus("error");
      setError("Please add your name, your email and what you need.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: val("name"),
          email: val("email"),
          company: val("company"),
          phone: hidePhone ? "" : val("phone"),
          service,
          message: val("message"),
          website_url: val("website_url"),
          elapsed_ms: openedAt.current ? Date.now() - openedAt.current : undefined,
          source: `Homepage Popup (${source})`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "send failed");
      setStatus("sent");
      trackLead(`Proposal Popup (${source})`);
    } catch {
      setStatus("error");
      setError("That didn't send. Please try again, or call us at (470) 243-7517.");
    }
  }

  return (
    <div className={`nr-dialog ${nightRideFonts}`} role="dialog" aria-modal="true" aria-labelledby="nr-dialog-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="nr-dialog-box" ref={box}>
        <Corners />
        <button type="button" className="nr-dialog-x" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>

        {status === "sent" ? (
          <div className="nr-dialog-done">
            <span className="nr-dialog-eyebrow"><Check /> Got it</span>
            <h2 id="nr-dialog-title">We&apos;re on it.</h2>
            <p>We&apos;ll review your website, your Google profile and your top competitors, then send you a plan with clear prices.</p>
            <button type="button" className="nr-dialog-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="nr-dialog-grid">
            <div className="nr-dialog-side">
              <span className="nr-dialog-eyebrow">Free proposal</span>
              <h2 id="nr-dialog-title">Tell us about your business.</h2>
              <p>No pressure and no contract.</p>
              <div className="nr-dialog-next">
                <span>What happens after you send this</span>
                <ol>
                  <li>We review your website, your Google profile and your top competitors.</li>
                  <li>We send you a plan with clear prices.</li>
                  <li>You decide. Every package is month to month.</li>
                </ol>
              </div>
            </div>

            <form onSubmit={onSubmit} noValidate>
              <div className="nr-dialog-fields">
                <label>Your name<input ref={first} name="name" type="text" autoComplete="name" required maxLength={100} /></label>
                <label>Email<input name="email" type="email" autoComplete="email" required maxLength={150} /></label>
                <label className="full">Business name <em>(optional)</em><input name="company" type="text" autoComplete="organization" maxLength={150} /></label>
                {!hidePhone && (
                  <label className="full">Phone <em>(optional)</em><input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} /></label>
                )}
                <label className="full">What do you need?
                  <select name="service" defaultValue="" required>
                    <option value="" disabled>Choose one</option>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="full">Anything we should know? <em>(optional)</em><textarea name="message" rows={3} maxLength={4000} /></label>
                {/* Honeypot: hidden from people, filled by bots. */}
                <label className="nr-dialog-hp" aria-hidden="true">Leave this empty<input name="website_url" type="text" tabIndex={-1} autoComplete="off" /></label>
              </div>
              {status === "error" && <p className="nr-dialog-error" role="alert">{error}</p>}
              <button type="submit" className="nr-dialog-btn" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : <>Get my free proposal <ArrowRight /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
