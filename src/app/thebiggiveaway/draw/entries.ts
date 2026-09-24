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

export type Sheet = { header: string[]; rows: string[][] };
export type Field = "business" | "type" | "city" | "contact" | "email" | "phone";
export type Columns = Record<Field, number>;

/** Header patterns per field, best first. */
const WANT: Record<Field, RegExp[]> = {
    business: [/^business[ _-]?name$/, /^company[ _-]?name$/, /^(business|company)$/, /business.?name/, /company/],
    type: [/^business[ _-]?type$/, /business.?type/, /industry|category/],
    city: [/^city[ _-]?(state)?$/, /city/],
    contact: [/^(full[ _-]?)?name$/, /contact/],
    email: [/^e-?mail$/, /e-?mail/],
    phone: [/^phone$/, /phone/],
};
// Columns that mention the right words but hold notes, not the value itself.
const NOT_A_VALUE = /note|research|desc|summary|audit|comment|review|site|url|link|score|status/;

/** Split a CSV export into its header row and data rows. */
export function toSheet(text: string): Sheet {
    const [header = [], ...rows] = parseCsv(text.replace(/^\uFEFF/, ""));
    return { header: header.map((h) => h.trim()), rows };
}

/**
 * Guess which column holds each field. Exact header names win over loose
 * matches, and a "name" column whose values run long is treated as notes.
 * The panel shows the guess and lets it be changed before the draw.
 */
export function detectColumns({ header, rows }: Sheet): Columns {
    const lower = header.map((h) => h.toLowerCase());
    const avgLen = (i: number) => {
        const vals = rows.slice(0, 50).map((r) => (r[i] ?? "").trim()).filter(Boolean);
        return vals.length ? vals.reduce((n, v) => n + v.length, 0) / vals.length : 0;
    };
    const find = (f: Field) => {
        for (const re of WANT[f]) {
            const i = lower.findIndex((h, i) =>
                re.test(h) && !(NOT_A_VALUE.test(h) && !WANT[f][0].test(h)) && !(f === "business" && avgLen(i) > 60));
            if (i !== -1) return i;
        }
        return -1;
    };
    return {
        business: find("business"), type: find("type"), city: find("city"),
        contact: find("contact"), email: find("email"), phone: find("phone"),
    };
}

/**
 * Turn a Sheet export into entries using the chosen columns. With no business
 * column (a plain pasted list), every line, header included, is a business name.
 */
export function toEntries({ header, rows }: Sheet, cols: Columns): Entry[] {
    if (cols.business === -1) {
        return [header, ...rows]
            .map((r) => r.join(", ").trim())
            .filter(Boolean)
            .map((business) => ({ business, type: "", city: "", contact: "", email: "", phone: "" }));
    }
    const at = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
    return rows
        .map((r) => ({
            business: at(r, cols.business),
            type: at(r, cols.type),
            city: at(r, cols.city),
            contact: at(r, cols.contact),
            email: at(r, cols.email).toLowerCase(),
            phone: at(r, cols.phone),
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
