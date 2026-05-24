import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

const secret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");

// ─── Admin session helpers ─────────────────────────────────────────────────────

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

    // ── Admin routes ──────────────────────────────────────────────────────────
    if (pathname.startsWith("/admin")) {
        const isLoginPage = pathname === "/admin/login";
        const authenticated = await isAdminAuthenticated(request);

        if (!authenticated && !isLoginPage) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        if (authenticated && isLoginPage) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.next();
    }

    // ── Client portal routes ───────────────────────────────────────────────────
    if (pathname.startsWith("/clients")) {
        const isLoginPage = pathname === "/clients/login";

        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token && !isLoginPage) {
            const loginUrl = new URL("/clients/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (token && isLoginPage) {
            // @ts-ignore
            const slug = token.slug as string;
            return NextResponse.redirect(new URL(`/clients/${slug}`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
