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
