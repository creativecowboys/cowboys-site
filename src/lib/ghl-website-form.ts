/**
 * Mirror a creativecowboys.co form submission (contact page, proposal popup, industry offer pages) into
 * GoHighLevel so it shows on the sales desk (Dave, Oct 1 2026: "swap the leads coming in to GHL").
 *
 * Called from /api/contact AFTER the Resend email went out; the email is unchanged and stays the
 * record of truth for the team inbox. This never throws and never changes the visitor's response.
 * Contact lands with tag `website-form`, GHL source = the form name, Lead Source = "Website form",
 * and a note carrying the message so a rep sees what they asked for.
 */

import { addNote, ghlConfigured, normalizePhone, splitName, upsertContact } from "./ghl/client";
import { LEAD_SOURCE, salesFields } from "./ghl/fields";

const TIMEOUT_MS = 8_000;

export type WebsiteFormLead = {
    name: string; email: string; phone?: string; company?: string;
    message?: string; service?: string; industry?: string; source?: string; // source = which form ("Homepage Popup", "Contact page", …)
};

export function websiteFormPayload(lead: WebsiteFormLead, locationId: string, leadSourceFieldId?: string) {
    const { firstName, lastName } = splitName(lead.name);
    const form = (lead.source || "").trim() || "Contact form";
    return {
        locationId,
        firstName, lastName,
        email: lead.email.trim().toLowerCase(),
        ...(lead.phone?.trim() ? { phone: normalizePhone(lead.phone) } : {}),
        ...(lead.company?.trim() ? { companyName: lead.company.trim().slice(0, 200) } : {}),
        source: `Website form: ${form}`.slice(0, 120),
        tags: ["website-form"],
        customFields: leadSourceFieldId ? [{ id: leadSourceFieldId, field_value: LEAD_SOURCE.website }] : [],
    };
}

export function websiteFormNote(lead: WebsiteFormLead): string {
    const lines = [
        `Website form: ${(lead.source || "").trim() || "Contact form"}`,
        lead.service && !/^select/i.test(lead.service.trim()) && `Service requested: ${lead.service}`,
        lead.industry && `Industry: ${lead.industry}`,
        lead.message && `Message: ${lead.message.trim().slice(0, 4000)}`,
    ].filter(Boolean);
    return lines.join("\n");
}

/** Resolves the contact id when GHL took it, "" otherwise. Never throws. */
export async function pushWebsiteFormToGHL(lead: WebsiteFormLead): Promise<string> {
    if (!ghlConfigured()) { console.warn("website form → GHL skipped: GHL_API_TOKEN / GHL_LOCATION_ID not set"); return ""; }
    try {
        const leadSourceId = await salesFields().then((f) => f.leadSource?.id).catch(() => undefined);
        if (!leadSourceId) console.warn("website form → GHL: Lead Source field not resolved; lead pushed without it");
        const { contact } = await upsertContact(websiteFormPayload(lead, process.env.GHL_LOCATION_ID!, leadSourceId), { timeoutMs: TIMEOUT_MS, retries: 0 });
        if (lead.message?.trim() || lead.service || lead.industry) {
            await addNote(contact.id, websiteFormNote(lead)).catch((e) => console.error("website form → GHL note failed:", e instanceof Error ? e.message : e));
        }
        return contact.id;
    } catch (err) {
        console.error("website form → GHL upsert failed:", err instanceof Error ? err.message : err);
        return "";
    }
}
