/**
 * Entry loading and the random pick for the winner draw.
 *
 * Kept free of React so the parsing rules are easy to read in one place.
 */

export type Entry = {
    business: string;
    type: string;
    city: string;
    contact: string;
    email: string;
    phone: string;
};

/**
 * Service-based business types from the entry form. Only these are eligible,
 * because the prize is built around SEO and a business has to be able to use
 * it. Restaurant, retail, nonprofit/church and "Something Else" start switched
 * off; "Something Else" entries can be reviewed and switched on in the panel.
 */
const SERVICE_TYPE = /^(home services|health|professional services|automotive|beauty|real estate)/i;

export const isServiceType = (type: string) => SERVICE_TYPE.test(type.trim());

/** RFC 4180-ish CSV: quoted fields, doubled quotes, commas/newlines in quotes. */
export function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') quoted = false;
            else field += c;
        } else if (c === '"') quoted = true;
        else if (c === ",") { row.push(field); field = ""; }
        else if (c === "\n" || c === "\r") {
            if (c === "\r" && text[i + 1] === "\n") i++;
            row.push(field); rows.push(row); row = []; field = "";
        } else field += c;
    }
    row.push(field);
    rows.push(row);
    return rows.filter((r) => r.some((f) => f.trim()));
}

const col = (header: string[], re: RegExp) => header.findIndex((h) => re.test(h.trim()));

/**
 * Turn a Sheet export (or a plain one-name-per-line list) into entries.
 *
 * Headers are matched loosely so a renamed column in the Sheet doesn't break
 * the draw on camera. With no recognisable header, every line is a business name.
 */
export function toEntries(text: string): Entry[] {
    const rows = parseCsv(text.replace(/^﻿/, ""));
    if (rows.length === 0) return [];

    const header = rows[0].map((h) => h.toLowerCase());
    const iBiz = col(header, /business.?name|company/);

    if (iBiz === -1) {
        return rows
            .map((r) => r.join(", ").trim())
            .filter(Boolean)
            .map((business) => ({ business, type: "", city: "", contact: "", email: "", phone: "" }));
    }

    const iType = col(header, /business.?type|industry|category/);
    const iCity = col(header, /city/);
    const iName = col(header, /^(full.?)?name$|contact/);
    const iEmail = col(header, /e-?mail/);
    const iPhone = col(header, /phone/);
    const at = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");

    return rows
        .slice(1)
        .map((r) => ({
            business: at(r, iBiz),
            type: at(r, iType),
            city: at(r, iCity),
            contact: at(r, iName),
            email: at(r, iEmail).toLowerCase(),
            phone: at(r, iPhone),
        }))
        .filter((e) => e.business);
}

/**
 * One entry per business (Official Rules §"Limit one entry per business").
 * A repeat email or the same business name, ignoring case and punctuation, is
 * a duplicate; the first entry received wins.
 */
export function dedupe(entries: Entry[]): { kept: Entry[]; removed: number } {
    const seen = new Set<string>();
    const kept: Entry[] = [];
    for (const e of entries) {
        const name = "n:" + e.business.toLowerCase().replace(/[^a-z0-9]/g, "");
        const mail = e.email ? "e:" + e.email : "";
        if (seen.has(name) || (mail && seen.has(mail))) continue;
        seen.add(name);
        if (mail) seen.add(mail);
        kept.push(e);
    }
    return { kept, removed: entries.length - kept.length };
}

/** Uniform index in [0, n) from the browser's CSPRNG, without modulo bias. */
export function fairIndex(n: number): number {
    const limit = Math.floor(0x1_0000_0000 / n) * n;
    const buf = new Uint32Array(1);
    do crypto.getRandomValues(buf); while (buf[0] >= limit);
    return buf[0] % n;
}
