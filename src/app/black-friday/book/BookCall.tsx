"use client";

import { useEffect, useRef, useState } from "react";
import { gaEvent, trackFb } from "@/lib/analytics";
import { Check } from "@/components/night-ride/icons";
import { CALENDLY_URL, FORM_NAME, LEAD_KEY } from "../content";

/**
 * Calendly's inline calendar, loaded as a plain iframe (no third-party script on the page).
 * The name and email from the claim form are passed to Calendly so the visitor doesn't type
 * them twice. Calendly posts a `calendly.event_scheduled` message to the parent window when a
 * booking is made; that fires GA4 `book_call` and Meta `Schedule`, once.
 */
export default function BookCall() {
    const frame = useRef<HTMLIFrameElement>(null);
    const [booked, setBooked] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams({
            embed_domain: window.location.hostname,
            embed_type: "Inline",
            hide_gdpr_banner: "1",
            // The page already says what the call is; hiding the event blurb brings the calendar up.
            hide_event_type_details: "1",
        });
        try {
            const lead = JSON.parse(sessionStorage.getItem(LEAD_KEY) || "null") as { name?: string; email?: string } | null;
            if (lead?.name) params.set("name", lead.name);
            if (lead?.email) params.set("email", lead.email);
        } catch {
            // No stored lead (direct visit, private mode): the calendar still works.
        }
        // Set after mount: the address depends on the browser (hostname, stored lead).
        if (frame.current) frame.current.src = `${CALENDLY_URL}?${params.toString()}`;
    }, []);

    useEffect(() => {
        let fired = false;
        function onMessage(e: MessageEvent) {
            if (e.origin !== "https://calendly.com") return;
            const data = e.data as { event?: string } | null;
            if (data?.event !== "calendly.event_scheduled" || fired) return;
            fired = true;
            setBooked(true);
            gaEvent("book_call", { form_name: FORM_NAME, page_path: window.location.pathname });
            trackFb("Schedule", { content_name: FORM_NAME });
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    return (
        <div style={{ display: "grid", gap: 16 }}>
            {booked && (
                <div className="card done" role="status">
                    <span className="eyebrow"><Check /> You&apos;re booked</span>
                    <h2 className="h3" style={{ fontSize: 26 }}>Talk soon.</h2>
                    <p className="muted" style={{ margin: 0 }}>Calendly has emailed you the details. If anything changes, use the link in that email to reschedule.</p>
                </div>
            )}
            <div className="card cal">
                <iframe ref={frame} title="Pick a time for your call with Creative Cowboys" />
            </div>
        </div>
    );
}
