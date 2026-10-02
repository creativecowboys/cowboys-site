import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { DESK_PATH, deskGate } from "@/lib/desk-path";

const secret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

// ─── Team session helpers (the desk's sign-in cookie, set by /api/admin/verify) ──

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get("cc_admin_token")?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, secret(), { issuer: "cc-admin" });
        return true;
    } catch {
        return false;
    }
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
    const PASCAL_REDIRECTS: Record<string, string> = {
        '/Home':      '/',
        '/About':     '/about',
        '/Contact':   '/contact',
        '/Services':  '/services',
        '/Blog':      '/blog',
        '/SEO':       '/seo',
        '/PPC':       '/ppc',
        '/WebDesign': '/web-design',
    };

    if (PASCAL_REDIRECTS[request.nextUrl.pathname]) {
        const url = request.nextUrl.clone();
        url.pathname = PASCAL_REDIRECTS[request.nextUrl.pathname];
        return NextResponse.redirect(url, 308);
    }

    const { pathname } = request.nextUrl;

    // ── Client onboarding intake (the token in the URL is the credential; never indexed) ──
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Referrer-Policy", "no-referrer");
        return res;
    }
    // ── Giveaway winner draw (unlisted, never indexed) ───────────────────────
    if (pathname === "/thebiggiveaway/draw") {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        return res;
    }
    // ── Team desk and its sign-in: /admin and everything under it (team only, never indexed) ──
    // The desk's old address, /leads, never reaches this file: next.config.ts forwards it to /admin first.
    // Signed out, a desk page goes to the sign-in page carrying the path and query, so the emailed link lands
    // back where the person was going. The rule itself is deskGate in src/lib/desk-path.ts (unit-tested).
    if (pathname === DESK_PATH || pathname.startsWith(`${DESK_PATH}/`)) {
        const to = deskGate(pathname, request.nextUrl.search, await isAdminAuthenticated(request));
        if (to) return NextResponse.redirect(new URL(to, request.url));
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        return res;
    }

    // The old client portal (/clients) was retired Oct 2 2026; next.config.ts sends its old addresses home.

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
