import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    // Exact secrets, but forgiving about stray whitespace and username case (autofill, mobile keyboards).
    const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const validUser = !!process.env.ADMIN_USERNAME && clean(username).toLowerCase() === process.env.ADMIN_USERNAME.trim().toLowerCase();
    const validPass = !!process.env.ADMIN_PASSWORD && clean(password) === process.env.ADMIN_PASSWORD.trim();

    if (!validUser || !validPass) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign a short-lived JWT as the admin session token
    const token = await new SignJWT({ role: "admin", sub: username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("cc-admin")
        .setExpirationTime("12h")
        .sign(secret());

    const response = NextResponse.json({ ok: true });
    response.cookies.set("cc_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 12, // 12 hours
        path: "/",
    });
    return response;
}
