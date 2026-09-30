import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PLAYBOOKS, normalizePhone, readUrl, tierFor, validateSubmission, type Submission } from "@/lib/playbooks";
import { pushPlaybookLeadToGHL } from "@/lib/ghl-playbook";
import { sendSms } from "@/lib/twilio-sms";
import { appendPlaybookLeadRow } from "@/lib/sheets-playbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEAD_EMAIL_TO = ["josh@creativecowboys.co"];

// Same in-memory speed bump as /api/giveaway: not a security control.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
    return recent.length > RATE_LIMIT_MAX;
}

function clientIp(req: NextRequest): string {
    const fwd = req.headers.get("x-forwarded-for");
    return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") ?? "").trim() || "unknown";
}

const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Every lead is mailed to Josh. When GHL couldn't take it, the email becomes
 * the only record, so it says so and asks for the contact to be added by hand.
 */
async function emailLead(slug: string, s: Submission, tier: string, ghlOk: boolean, texted: boolean, utm: Record<string, string>) {
    if (!process.env.RESEND_API_KEY) {
        if (!ghlOk) console.error("PLAYBOOK LEAD LOST — no RESEND_API_KEY:", slug, JSON.stringify(s));
        return;
    }
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const rows = Object.entries({
            playbook: slug,
            tier,
            ...s,
            "text sent": texted ? "yes" : "NO, text them the playbook by hand",
            source: [utm.source, utm.medium, utm.campaign].filter(Boolean).join(" / "),
        })
            .map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #eee;font-weight:600">${esc(k)}</td><td style="padding:6px 10px;border:1px solid #eee">${esc(v)}</td></tr>`)
            .join("");
        const heading = ghlOk
            ? `<h2 style="margin:0 0 8px">New playbook lead: ${esc(s.first_name)}</h2>` +
              `<p style="margin:0 0 16px;color:#555">They're in GHL and the playbook email is on its way.</p>`
            : `<h2 style="color:#B5330E;margin:0 0 8px">A playbook lead did not reach GHL</h2>` +
              `<p style="margin:0 0 16px;color:#555">Add the contact by hand and text them the playbook. Tag: <b>${PLAYBOOKS[slug]?.tag}</b>, <b>pb-tier-${tier}</b>.</p>`;
        await resend.emails.send({
            from: "Creative Cowboys <howdy@creativecowboys.co>",
            to: LEAD_EMAIL_TO,
            replyTo: s.email,
            subject: ghlOk
                ? `New playbook lead: ${s.first_name} (${PLAYBOOKS[slug]?.trade ?? slug}, tier ${tier.toUpperCase()})`
                : `PLAYBOOK LEAD — GHL WRITE FAILED (${slug})`,
            html: heading + `<table style="border-collapse:collapse;max-width:620px">${rows}</table>`,
        });
    } catch (err) {
        console.error(ghlOk ? "playbook lead email failed:" : "PLAYBOOK LEAD LOST — fallback email also failed:", err, JSON.stringify(s));
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

    // Honeypot: fake success, store nothing.
    if (str("company_fax")) return NextResponse.json({ ok: true });

    const pb = PLAYBOOKS[str("playbook")];
    if (!pb) return NextResponse.json({ error: "unknown_playbook" }, { status: 400 });

    if (rateLimited(clientIp(request))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

    const s: Submission = {
        first_name: str("first_name"),
        phone: str("phone"),
        email: str("email").toLowerCase(),
        city: str("city"),
        crew_size: str("crew_size"),
        typical_job: str("typical_job"),
        has_website: str("has_website"),
        website_url: str("website_url"),
    };
    const invalid = validateSubmission(s);
    if (Object.keys(invalid).length > 0) {
        return NextResponse.json({ error: "invalid", fields: Object.keys(invalid) }, { status: 400 });
    }

    const utm = { source: str("utm_source"), medium: str("utm_medium"), campaign: str("utm_campaign") };

    // GHL is the system of record (tags start the email delivery and follow-ups).
    // The delivery text goes out through Twilio's approved campaign in parallel.
    const [ok, texted] = await Promise.all([
        pushPlaybookLeadToGHL(pb, s, utm),
        pb.pdfUrl
            ? sendSms(
                  normalizePhone(s.phone),
                  `Hey ${s.first_name.trim()}, Joshua at Creative Cowboys. Here's the 7-Day Fix: ${readUrl(pb)} Day one takes ten minutes. Reply STOP to opt out.`,
              )
            : Promise.resolve(false),
    ]);
    const tier = tierFor(s);
    const when = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    await Promise.all([
        emailLead(pb.slug, s, tier, ok, texted, utm),
        appendPlaybookLeadRow([
            // Formatted so Sheets keeps it as text instead of parsing +1... into a number.
            when, s.first_name, normalizePhone(s.phone).replace(/^\+1(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3"), s.email, pb.trade, tier.toUpperCase(), s.city,
            s.crew_size, s.typical_job, s.has_website === "yes" ? "Yes" : "No", s.website_url,
            texted ? "Yes" : "No", ok ? "Yes" : "NO, add by hand",
            [utm.source, utm.medium, utm.campaign].filter(Boolean).join(" / "),
        ]),
    ]);

    return NextResponse.json({ ok: true, tier, texted });
}
