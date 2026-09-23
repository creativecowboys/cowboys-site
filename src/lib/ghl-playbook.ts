/**
 * Push a playbook download into GoHighLevel (Creative Cowboys sub-account).
 *
 * GHL is the system of record for playbook leads: the `playbook-*` tag starts
 * the delivery workflow (text + email inside 60 seconds) and the `pb-tier-*`
 * tag decides who gets a rep call. Custom field ids were created 2026-09-22
 * on the CC sub-account (location puV58eAAseerZcp5nxVM).
 */

import { normalizePhone, tierFor, type Playbook, type Submission } from "./playbooks";

const GHL_API = "https://services.leadconnectorhq.com";
const TIMEOUT_MS = 8_000;

const FIELD = {
    trade: "CLggfeMAWqJITd4YUJSs",       // contact.playbook_trade
    crew: "3VuQP7UyslHLH5IewGy6",        // contact.playbook_crew_size
    job: "LZRikCOiuh1NOj5hFblT",         // contact.playbook_typical_job
    hasWebsite: "8dpi2jofs3I0Rtyb1MYx",  // contact.playbook_has_website
    tier: "zxbKU3HfsF5b22oINTj1",        // contact.playbook_tier
    city: "f3oywU16jj7e6gv2vu72",        // contact.playbook_city
} as const;

export function playbookContactPayload(
    pb: Playbook,
    s: Submission,
    locationId: string,
    utm: { source?: string; medium?: string; campaign?: string },
) {
    const tier = tierFor(s);
    const url = s.has_website === "yes" ? s.website_url.trim() : "";
    return {
        locationId,
        firstName: s.first_name.trim(),
        email: s.email.trim().toLowerCase(),
        phone: normalizePhone(s.phone),
        city: s.city.trim(),
        website: url ? (/^https?:\/\//i.test(url) ? url : `https://${url}`) : "",
        source: `Playbook: ${pb.trade} GBP Fix (${utm.source || "direct"}${utm.campaign ? ` / ${utm.campaign}` : ""})`,
        tags: ["playbook-lead", pb.tag, `pb-tier-${tier}`],
        customFields: [
            { id: FIELD.trade, field_value: pb.trade },
            { id: FIELD.crew, field_value: s.crew_size },
            { id: FIELD.job, field_value: s.typical_job },
            { id: FIELD.hasWebsite, field_value: s.has_website === "yes" ? "Yes" : "No" },
            { id: FIELD.tier, field_value: tier.toUpperCase() },
            { id: FIELD.city, field_value: s.city.trim() },
        ],
    };
}

/** Resolves true when GHL accepted the upsert. Never throws. */
export async function pushPlaybookLeadToGHL(
    pb: Playbook,
    s: Submission,
    utm: { source?: string; medium?: string; campaign?: string },
): Promise<boolean> {
    const token = process.env.GHL_API_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;
    if (!token || !locationId) {
        console.warn("playbook → GHL skipped: GHL_API_TOKEN / GHL_LOCATION_ID not set");
        return false;
    }
    try {
        const res = await fetch(`${GHL_API}/contacts/upsert`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Version: "2021-07-28",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(playbookContactPayload(pb, s, locationId, utm)),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) {
            console.error("playbook → GHL upsert failed:", res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error("playbook → GHL upsert threw:", err);
        return false;
    }
}
