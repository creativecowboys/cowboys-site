import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// The call desk rides on the existing admin sign-in (/admin/login → cc_admin_token).
// Same cookie, same secret, same 12-hour session. No second login to manage.
const secret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

export async function isTeam(): Promise<boolean> {
    const token = (await cookies()).get("cc_admin_token")?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, secret(), { issuer: "cc-admin" });
        return true;
    } catch {
        return false;
    }
}

/** The signed-in team member's email (magic-link sessions put it in `sub`); null when not signed in. */
export async function teamSession(): Promise<{ email: string } | null> {
    const token = (await cookies()).get("cc_admin_token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret(), { issuer: "cc-admin" });
        return { email: typeof payload.sub === "string" ? payload.sub.toLowerCase() : "" };
    } catch {
        return null;
    }
}

// Owners see money (Dave, Sep 25 2026: "keep that for only Josh and I to see"). Override with TEAM_OWNER_EMAILS.
const DEFAULT_OWNERS = ["dave@creativecowboys.co", "josh@creativecowboys.co"];
export function isOwnerEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const list = (process.env.TEAM_OWNER_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    return [...DEFAULT_OWNERS, ...list].includes(email.toLowerCase());
}

