/**
 * Append each playbook lead to the "Playbook Leads" Google Sheet so Josh can
 * see them in one list. GHL stays the system of record; this is a view.
 *
 * Auth is the lse-drive-uploader service account (it owns the sheet on the
 * Creative Cowboys shared drive), signed here with node:crypto so the route
 * needs no Google SDK.
 */

import { createSign } from "node:crypto";

const TIMEOUT_MS = 8_000;

function b64url(input: string | Buffer): string {
    return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function accessToken(email: string, key: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = b64url(
        JSON.stringify({
            iss: email,
            scope: "https://www.googleapis.com/auth/spreadsheets",
            aud: "https://oauth2.googleapis.com/token",
            iat: now,
            exp: now + 3600,
        }),
    );
    const sig = b64url(createSign("RSA-SHA256").update(`${head}.${claim}`).sign(key));
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: `${head}.${claim}.${sig}`,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`google token ${res.status}: ${await res.text()}`);
    return (await res.json()).access_token;
}

/** Resolves true when the row was appended. Never throws. */
export async function appendPlaybookLeadRow(row: (string | number)[]): Promise<boolean> {
    const email = process.env.GOOGLE_SA_EMAIL;
    const key = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const sheetId = process.env.PLAYBOOK_LEADS_SHEET_ID;
    if (!email || !key || !sheetId) {
        console.warn("playbook → sheet skipped: GOOGLE_SA_EMAIL / GOOGLE_SA_PRIVATE_KEY / PLAYBOOK_LEADS_SHEET_ID not set");
        return false;
    }
    try {
        const token = await accessToken(email, key);
        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Leads!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ values: [row] }),
                signal: AbortSignal.timeout(TIMEOUT_MS),
            },
        );
        if (!res.ok) {
            console.error("playbook → sheet failed:", res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error("playbook → sheet threw:", err);
        return false;
    }
}
