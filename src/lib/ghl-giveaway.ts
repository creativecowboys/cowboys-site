/**
 * Push a giveaway entry into GoHighLevel (Creative Cowboys sub-account).
 *
 * Called from /api/giveaway AFTER the Sheet write succeeds. The Sheet stays the
 * source of truth; this never throws and never changes the entrant's response.
 * In GHL the contact lands with tag `giveaway-entrant`, which is what starts
 * the "Giveaway — Welcome" workflow (Josh's personal note).
 */

const GHL_API = "https://services.leadconnectorhq.com";
const FIELD_BUSINESS_TYPE = "AeSdXgSyDcUHh4NtPxfE"; // contact.giveaway_business_type
const FIELD_SOURCE = "wQFw6yjQ4c4bRq705N6O";        // contact.giveaway_source
const TIMEOUT_MS = 8_000;

export type GiveawayEntry = {
    name: string;
    email: string;
    phone: string;
    city_state: string;
    business_name: string;
    business_type: string;
    website: string;
    utm_source?: string;
    utm_content?: string;
};

const NO_SITE = /^(none|none yet|not yet|n\/?a|no|nothing|-)?$/i;

export function giveawayContactPayload(entry: GiveawayEntry, locationId: string) {
    const parts = entry.name.trim().split(/\s+/);
    const site = entry.website.trim();
    const noSite = NO_SITE.test(site.replace(/[^a-z\/ -]/gi, ""));
    const [city = "", ...rest] = entry.city_state.split(",").map((s) => s.trim());
    const tags = ["giveaway-entrant", noSite ? "giveaway-no-site" : "giveaway-has-site"];
    if (/^(Home Services|Real Estate)/i.test(entry.business_type)) tags.push("giveaway-trade");

    return {
        locationId,
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        email: entry.email.toLowerCase(),
        phone: entry.phone,
        companyName: entry.business_name,
        website: noSite ? "" : /^https?:\/\//i.test(site) ? site : `https://${site}`,
        city,
        state: rest.join(", "),
        source: "Big Giveaway",
        tags,
        customFields: [
            { id: FIELD_BUSINESS_TYPE, field_value: entry.business_type },
            { id: FIELD_SOURCE, field_value: entry.utm_content || entry.utm_source || "organic" },
        ],
    };
}

export async function pushGiveawayEntryToGHL(entry: GiveawayEntry): Promise<void> {
    const token = process.env.GHL_API_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;
    if (!token || !locationId) {
        console.warn("giveaway → GHL skipped: GHL_API_TOKEN / GHL_LOCATION_ID not set");
        return;
    }
    try {
        const res = await fetch(`${GHL_API}/contacts/upsert`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Version: "2021-07-28",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(giveawayContactPayload(entry, locationId)),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) console.error("giveaway → GHL upsert failed:", res.status, await res.text());
    } catch (err) {
        console.error("giveaway → GHL upsert threw:", err);
    }
}
