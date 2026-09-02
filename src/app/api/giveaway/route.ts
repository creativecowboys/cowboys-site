import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { ENTRY_DEADLINE, SOURCE, resolvePhase, validateEntry, BUSINESS_TYPES } from "@/lib/giveaway";

export const runtime = "nodejs";
// Never cache an entry submission.
export const dynamic = "force-dynamic";

const FALLBACK_TO = ["howdy@creativecowboys.co"];
const WEBHOOK_TIMEOUT_MS = 10_000;

/**
 * Rate limit: ~5 submissions per 10 minutes per IP.
 *
 * An in-memory Map is deliberate (spec §6.2). It resets on cold start and isn't
 * shared between lambdas, so it is a spam speed-bump, not a security control —
 * the honeypot, the server-side validation and the Sheet's email dedupe are
 * what actually protect the list. At giveaway scale that trade is fine.
 */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);

    // Opportunistic sweep so the Map can't grow without bound on a warm lambda.
    if (hits.size > 5000) {
        for (const [k, v] of hits) {
            if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
        }
    }
    return recent.length > RATE_LIMIT_MAX;
}

function clientIp(req: NextRequest): string {
    const fwd = req.headers.get("x-forwarded-for");
    return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") ?? "").trim() || "unknown";
}

/**
 * Last line of defence: if the Sheet can't be written, mail the raw entry to
 * the team so the lead still exists somewhere. Guardrail §10.1 — this is not
 * optional.
 */
async function emailFallback(entry: Record<string, unknown>, reason: string) {
    if (!process.env.RESEND_API_KEY) {
        console.error("GIVEAWAY ENTRY LOST — no RESEND_API_KEY to fall back to:", JSON.stringify(entry));
        return;
    }
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const rows = Object.entries(entry)
            .map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #eee;font-weight:600">${k}</td><td style="padding:6px 10px;border:1px solid #eee">${String(v ?? "")}</td></tr>`)
            .join("");
        await resend.emails.send({
            from: "Creative Cowboys <howdy@creativecowboys.co>",
            to: FALLBACK_TO,
            replyTo: typeof entry.email === "string" ? entry.email : undefined,
            subject: "GIVEAWAY ENTRY — SHEET WRITE FAILED",
            html:
                `<h2 style="color:#B5330E;margin:0 0 8px">Giveaway entry could not be written to the Sheet</h2>` +
                `<p style="margin:0 0 16px;color:#555">Reason: <b>${reason}</b>. Add this entry to the Sheet by hand.</p>` +
                `<table style="border-collapse:collapse;max-width:620px">${rows}</table>`,
        });
    } catch (err) {
        console.error("GIVEAWAY ENTRY LOST — fallback email also failed:", err, JSON.stringify(entry));
    }
}

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const str = (k: string) => String(body[k] ?? "").trim();

    // 1. Honeypot — fake success, store nothing. Bots that get a 400 adapt.
    if (str("company_fax")) {
        console.log("Giveaway honeypot triggered, entry discarded");
        return NextResponse.json({ ok: true });
    }

    // 2. Phase gate, evaluated server-side so a wound-back client clock can't
    //    slip an entry in after the published deadline.
    if (resolvePhase() !== "open" || new Date() > ENTRY_DEADLINE) {
        return NextResponse.json({ error: "closed" }, { status: 410 });
    }

    // 3. Rate limit.
    const ip = clientIp(request);
    if (rateLimited(ip)) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    // 4. Re-validate everything server-side — the client checks are UX, not trust.
    const fields = {
        name: str("name"),
        email: str("email").toLowerCase(),
        phone: str("phone"),
        city_state: str("city_state"),
        business_name: str("business_name"),
        business_type: str("business_type"),
        website: str("website") || "none yet",
        consent: body.consent === true,
    };

    const invalid = validateEntry(fields);
    if (Object.keys(invalid).length > 0) {
        return NextResponse.json({ error: "invalid", fields: Object.keys(invalid) }, { status: 400 });
    }
    // Business type must be one we actually offered, not arbitrary POSTed text.
    if (!(BUSINESS_TYPES as readonly string[]).includes(fields.business_type)) {
        return NextResponse.json({ error: "invalid", fields: ["business_type"] }, { status: 400 });
    }

    const entry = {
        ...fields,
        source: SOURCE,
        utm_source: str("utm_source"),
        utm_medium: str("utm_medium"),
        utm_campaign: str("utm_campaign"),
        referrer: str("referrer"),
        user_agent: request.headers.get("user-agent") ?? str("user_agent"),
        ip_hint: createHash("sha256").update(ip).digest("hex").slice(0, 12),
    };

    // 5. Forward to the Sheet. The webhook URL and secret stay server-side —
    //    guardrail §10.2, they are never shipped to the browser.
    const webhookUrl = process.env.GIVEAWAY_WEBHOOK_URL;
    const webhookSecret = process.env.GIVEAWAY_WEBHOOK_SECRET;

    if (!webhookUrl || !webhookSecret) {
        await emailFallback(entry, "GIVEAWAY_WEBHOOK_URL / GIVEAWAY_WEBHOOK_SECRET not configured");
        return NextResponse.json({ error: "store_failed" }, { status: 502 });
    }

    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            redirect: "follow", // Apps Script 302s to script.googleusercontent.com
            // text/plain dodges the CORS preflight Apps Script won't answer.
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ ...entry, secret: webhookSecret }),
            signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
        });

        const text = await res.text();
        let parsed: { ok?: boolean; duplicate?: boolean; error?: string } = {};
        try {
            parsed = JSON.parse(text);
        } catch {
            await emailFallback(entry, `webhook returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
            return NextResponse.json({ error: "store_failed" }, { status: 502 });
        }

        if (!parsed.ok) {
            await emailFallback(entry, `webhook returned ok:false (${parsed.error ?? "unknown"})`);
            return NextResponse.json({ error: "store_failed" }, { status: 502 });
        }

        // { ok:true } and { ok:true, duplicate:true } are both success — a second
        // submission from the same email is already in the Sheet, so the entrant
        // is entered either way and should see the thank-you state.
        return NextResponse.json({ ok: true, duplicate: parsed.duplicate === true });
    } catch (err) {
        const reason = err instanceof Error && err.name === "TimeoutError" ? "webhook timed out" : `webhook threw: ${String(err)}`;
        await emailFallback(entry, reason);
        return NextResponse.json({ error: "store_failed" }, { status: 502 });
    }
}
