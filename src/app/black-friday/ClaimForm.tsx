"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackLead } from "@/lib/analytics";
import { ArrowRight, Corners } from "@/components/night-ride/icons";
import { BOOK_PATH, FORM_NAME, LEAD_KEY, PACKAGES } from "./content";

const NOT_SURE = "Not sure yet";

/**
 * The claim form. Posts to /api/contact, the same route the rest of the site's forms use, so the
 * lead is emailed to the team and mirrored into GoHighLevel. On success it fires the lead events
 * (GA4 generate_lead + Meta Lead) and moves the visitor on to the booking calendar.
 *
 * The honeypot field is named `website_url` because that is what /api/contact checks; the real
 * "current website" answer travels in the message instead.
 */
export default function ClaimForm({ phoneDisplay, phoneHref }: { phoneDisplay: string; phoneHref: string }) {
    const router = useRouter();
    const loadedAt = useRef<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadedAt.current = Date.now();
        router.prefetch(BOOK_PATH);
    }, [router]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (busy) return;
        const f = new FormData(e.currentTarget);
        const val = (k: string) => String(f.get(k) || "").trim();
        const name = val("name");
        const business = val("business");
        const phone = val("phone");
        const email = val("email");

        if (phone.replace(/\D/g, "").length < 10) {
            setError("Please enter a phone number with the area code so we can reach you.");
            return;
        }
        setError("");
        setBusy(true);

        const message = [
            "Black Friday deal: free website with any marketing package.",
            val("trade") && `Type of business: ${val("trade")}`,
            val("current_site") && `Current website: ${val("current_site")}`,
        ].filter(Boolean).join("\n");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    company: business,
                    service: val("package") || NOT_SURE,
                    message,
                    source: FORM_NAME,
                    website_url: val("website_url"),
                    elapsed_ms: loadedAt.current ? Date.now() - loadedAt.current : undefined,
                }),
            });
            if (!res.ok) throw new Error(`contact ${res.status}`);
            trackLead(FORM_NAME);
            try {
                sessionStorage.setItem(LEAD_KEY, JSON.stringify({ name, email }));
            } catch {
                // Private mode: the calendar still works, it just isn't pre-filled.
            }
            router.push(BOOK_PATH);
        } catch {
            setBusy(false);
            setError(`That didn't send. Please try again, or call us at ${phoneDisplay}.`);
        }
    }

    return (
        <form id="claim" className="card vf claim" onSubmit={onSubmit} noValidate={false}>
            <Corners />
            <div className="claim-top mono">
                <span className="rec"><i />LIMITED SPOTS</span>
                <span>STEP 1 OF 2</span>
            </div>
            <h2 className="h3">Claim your free website</h2>
            <p className="sub">Tell us where to reach you. Next, you pick a time for a 15-minute call.</p>

            <div className="fields">
                <div className="field">
                    <label htmlFor="bf-name">Your name</label>
                    <input id="bf-name" name="name" type="text" autoComplete="name" required maxLength={100} />
                </div>
                <div className="field">
                    <label htmlFor="bf-business">Business name</label>
                    <input id="bf-business" name="business" type="text" autoComplete="organization" required maxLength={150} />
                </div>
                <div className="field">
                    <label htmlFor="bf-phone">Phone</label>
                    <input id="bf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} />
                </div>
                <div className="field">
                    <label htmlFor="bf-email">Email</label>
                    <input id="bf-email" name="email" type="email" autoComplete="email" required maxLength={150} />
                </div>
                <div className="field">
                    <label htmlFor="bf-trade">Type of business <span>(optional)</span></label>
                    <input id="bf-trade" name="trade" type="text" placeholder="Roofing, salon, law firm..." maxLength={100} />
                </div>
                <div className="field">
                    <label htmlFor="bf-site">Current website <span>(optional)</span></label>
                    <input id="bf-site" name="current_site" type="text" inputMode="url" placeholder="yourbusiness.com" maxLength={200} />
                </div>
                <div className="field full">
                    <label htmlFor="bf-package">Package you&apos;re interested in</label>
                    <select id="bf-package" name="package" defaultValue={NOT_SURE}>
                        <option>{NOT_SURE}</option>
                        {PACKAGES.map((p) => (
                            <option key={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>
                {/* Honeypot: hidden from people, filled by bots. */}
                <div className="hp" aria-hidden="true">
                    <label htmlFor="bf-hp">Leave this empty</label>
                    <input id="bf-hp" name="website_url" type="text" tabIndex={-1} autoComplete="off" />
                </div>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                {busy ? "Sending..." : "Claim my free website"} {!busy && <ArrowRight />}
            </button>
            <p className="fine">
                Month to month. No contract. Prefer to talk now? <a href={phoneHref} style={{ color: "#cfc7c3", textDecoration: "underline" }}>{phoneDisplay}</a>
            </p>
            <div className="next">
                <span className="mono">WHAT HAPPENS AFTER YOU CLICK</span>
                <ol>
                    <li>You pick a time for a 15-minute call with Josh.</li>
                    <li>We design and write your website.</li>
                    <li>You review it, then we put it live.</li>
                </ol>
            </div>
        </form>
    );
}
