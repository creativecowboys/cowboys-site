"use client";

import { useRef, useState } from "react";

/**
 * Lead form for city landing pages. Posts to /api/contact (same endpoint as
 * the homepage proposal modal). `preview` turns submit off so layout previews
 * never send a real lead.
 */
export type CityLeadFormTheme = {
  form?: string;
  label?: string;
  input?: string;
  button?: string;
  note?: string;
  success?: string;
};

const NEEDS = ["A new website", "Local SEO / Google Maps", "Google or Facebook ads", "All of it: the $297 package"];

export default function CityLeadForm({
  city,
  theme,
  preview = false,
  buttonLabel,
  idPrefix = "city-lead",
}: {
  city: string;
  theme: CityLeadFormTheme;
  preview?: boolean;
  buttonLabel?: string;
  idPrefix?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const openedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    const email = String(f.get("email") || "").trim();
    if (!name || !phone || !email) {
      setStatus("error");
      setError("Add your name, phone, and email so we can reach you.");
      return;
    }
    if (preview) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          company: String(f.get("business") || ""),
          service: String(f.get("need") || "Local Marketing Package"),
          message: `City page lead: ${city}`,
          website_url: String(f.get("website_url") || ""),
          elapsed_ms: Date.now() - openedAt.current,
          source: `City page (${city})`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setStatus("sent");
      else {
        setStatus("error");
        setError("That didn't go through. Call (470) 243-7517 and we'll pick up.");
      }
    } catch {
      setStatus("error");
      setError("That didn't go through. Call (470) 243-7517 and we'll pick up.");
    }
  }

  if (status === "sent") {
    return (
      <div className={theme.success} role="status">
        Got it. We&rsquo;ll call you within one business day with a plan for your {city} business.
        {preview && " (Preview: nothing was sent.)"}
      </div>
    );
  }

  const field = (id: string, label: string, type: string, autoComplete: string, required = true) => (
    <div>
      <label htmlFor={`${idPrefix}-${id}`} className={theme.label}>
        {label}
      </label>
      <input
        id={`${idPrefix}-${id}`}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={theme.input}
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className={theme.form} noValidate>
      {field("name", "Your name", "text", "name")}
      {field("phone", "Phone", "tel", "tel")}
      {field("email", "Email", "email", "email")}
      {field("business", "Business name", "text", "organization", false)}
      <div>
        <label htmlFor={`${idPrefix}-need`} className={theme.label}>
          What do you need?
        </label>
        <select id={`${idPrefix}-need`} name="need" className={theme.input} defaultValue={NEEDS[3]}>
          {NEEDS.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      {/* Honeypot: real people never see or fill this. */}
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {status === "error" && (
        <p className={theme.note} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={theme.button} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : buttonLabel ?? `Get my free ${city} plan`}
      </button>
    </form>
  );
}
