/**
 * Free trade playbooks: the registry, the eight-field form contract, and the
 * tier rule. One entry per trade; the landing page at /playbooks/[slug] and
 * the API at /api/playbook both read from here so copy and rules never drift.
 *
 * Funnel spec: Free Playbooks / "Playbook concepts (2026-09-22).md", section 6.
 */

export const CREW_SIZES = ["Just me", "2 to 5", "6 to 15", "More than 15"] as const;
export const JOB_VALUES = ["Under $500", "$500 to $2,000", "$2,000 to $10,000", "Over $10,000"] as const;

export type CrewSize = (typeof CREW_SIZES)[number];
export type JobValue = (typeof JOB_VALUES)[number];
export type Tier = "a" | "b" | "c";

export type Playbook = {
    slug: string;
    /** GHL tag applied on submit, e.g. `playbook-roofer-gbp`. */
    tag: string;
    /** Written to the GHL contact's Playbook Trade field. */
    trade: string;
    /** "roofer" / "plumber" — used in copy. */
    noun: string;
    nounPlural: string;
    title: string;
    eyebrow: string;
    headline: [string, string];
    sub: string;
    /** Three lines on what's inside. */
    inside: [string, string, string];
    /** What the searcher types; used in the review card caption. */
    searchExample: string;
    /** Cover art under /public, rendered as the CSS paperback mockup. Omit until the PDF exists. */
    cover?: string;
    /** A finished photographic mockup (e.g. from Higgsfield). When set, it replaces the CSS book in the hero. */
    mockup?: string;
    /** Public URL of the PDF. The delivery text links here; the delivery email uses the GHL custom value. */
    pdfUrl?: string;
};

export const PLAYBOOKS: Record<string, Playbook> = {
    "roofer-google-profile-fix": {
        slug: "roofer-google-profile-fix",
        tag: "playbook-roofer-gbp",
        trade: "Roofing",
        noun: "roofer",
        nounPlural: "roofers",
        title: "The 7-Day Google Business Profile Fix for Roofers",
        eyebrow: "For roofers only",
        headline: ["The 7-Day Google Business Profile Fix", "for Roofers. Free."],
        sub: "Show up on the map when your county searches “roofer near me.” Ten minutes a day for seven days, from your phone, nothing to buy. It's what we do on day one for every roofer we sign.",
        inside: [
            "Day by day: claim it, fix the name, categories, service towns, services with prices, twenty photos in the right order.",
            "The review request text and the reply script, ready to copy. The first new review usually lands within a couple of days.",
            "The one-page checklist and the ten-minute weekly routine that keeps the profile ranking after day seven.",
        ],
        searchExample: "roofer near me",
        cover: "/playbooks/covers/roofer.jpg",
        mockup: "/playbooks/covers/roofer-mockup.jpg",
        pdfUrl: "https://www.creativecowboys.co/playbooks/pdf/roofer-google-profile-fix.pdf",
    },
    "plumber-google-profile-fix": {
        slug: "plumber-google-profile-fix",
        tag: "playbook-plumber-gbp",
        trade: "Plumbing",
        noun: "plumber",
        nounPlural: "plumbers",
        title: "The 7-Day Google Business Profile Fix for Plumbers",
        eyebrow: "For plumbers only",
        headline: ["The 7-Day Google Business Profile Fix", "for Plumbers. Free."],
        sub: "Show up on the map when your county searches “plumber near me.” Ten minutes a day for seven days, from your phone, nothing to buy. It's what we do on day one for every plumber we sign.",
        inside: [
            "Day by day: claim it, fix the name, categories, service towns, services with prices, twenty photos in the right order.",
            "The review request text and the reply script, ready to copy. The first new review usually lands within a couple of days.",
            "The one-page checklist and the ten-minute weekly routine that keeps the profile ranking after day seven.",
        ],
        searchExample: "emergency plumber near me",
        cover: "/playbooks/covers/plumber.jpg",
        mockup: "/playbooks/covers/plumber-mockup.jpg",
        pdfUrl: "https://www.creativecowboys.co/playbooks/pdf/plumber-google-profile-fix.pdf",
    },
    "hvac-google-profile-fix": {
        slug: "hvac-google-profile-fix",
        tag: "playbook-hvac-gbp",
        trade: "HVAC",
        noun: "HVAC company",
        nounPlural: "HVAC contractors",
        title: "The 7-Day Google Business Profile Fix for HVAC Contractors",
        eyebrow: "For HVAC contractors only",
        headline: ["The 7-Day Google Business Profile Fix", "for HVAC Contractors. Free."],
        sub: "Get the profile right before the first 90-degree week. Ten minutes a day for seven days, from your phone, nothing to buy. It's what we do on day one for every HVAC company we sign.",
        inside: [
            "Day by day: claim it, fix the name, categories, service towns, services with prices, twenty photos in the right order.",
            "The review request text and the reply script, ready to copy. The first new review usually lands within a couple of days.",
            "The one-page checklist and the ten-minute weekly routine that keeps the profile ranking after day seven.",
        ],
        searchExample: "AC repair near me",
    },
};

export type Submission = {
    first_name: string;
    phone: string;
    email: string;
    city: string;
    crew_size: string;
    typical_job: string;
    has_website: string; // "yes" | "no"
    website_url: string;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Digits only; a US 10-digit number becomes E.164 for GHL. */
export function normalizePhone(raw: string): string {
    const d = raw.replace(/\D/g, "");
    if (d.length === 10) return `+1${d}`;
    if (d.length === 11 && d.startsWith("1")) return `+${d}`;
    return d.length >= 10 ? `+${d}` : "";
}

export function validateSubmission(v: Partial<Submission>): Record<string, boolean> {
    const bad: Record<string, boolean> = {};
    if (!v.first_name?.trim()) bad.first_name = true;
    if (!normalizePhone(v.phone ?? "")) bad.phone = true;
    if (!EMAIL_RE.test((v.email ?? "").trim())) bad.email = true;
    if (!v.city?.trim()) bad.city = true;
    if (!CREW_SIZES.includes(v.crew_size as CrewSize)) bad.crew_size = true;
    if (!JOB_VALUES.includes(v.typical_job as JobValue)) bad.typical_job = true;
    if (v.has_website !== "yes" && v.has_website !== "no") bad.has_website = true;
    return bad;
}

/**
 * The tier sort at intake (funnel spec, step 5). "Weak site" can't be judged
 * from a form, so a business with a site lands in B and a rep bumps it after
 * the audit.
 *
 *   A: crew 2 to 15, typical job $2,000 or more, no website
 *   B: crew of 2 or more, or typical job $500 or more, not A
 *   C: everyone else (solo and under $500)
 */
export function tierFor(v: Pick<Submission, "crew_size" | "typical_job" | "has_website">): Tier {
    const crewIdx = CREW_SIZES.indexOf(v.crew_size as CrewSize); // 0 solo, 1 2-5, 2 6-15, 3 15+
    const jobIdx = JOB_VALUES.indexOf(v.typical_job as JobValue); // 0 <500, 1 500-2k, 2 2k-10k, 3 10k+
    const midCrew = crewIdx === 1 || crewIdx === 2;
    if (midCrew && jobIdx >= 2 && v.has_website === "no") return "a";
    if (crewIdx >= 1 || jobIdx >= 1) return "b";
    return "c";
}
