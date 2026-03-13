import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    const validUser = username === process.env.ADMIN_USERNAME;
    const validPass = password === process.env.ADMIN_PASSWORD;

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
