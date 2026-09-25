import { NextRequest, NextResponse } from "next/server";
import { mintSession, redeemMagicLink, SESSION_DAYS } from "@/lib/team-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The link from the sign-in email lands here: redeem the one-time token, set the team cookie, continue.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const session = await redeemMagicLink(token);
  if (!session) {
    const back = new URL("/admin/login", req.nextUrl.origin);
    back.searchParams.set("expired", "1");
    return NextResponse.redirect(back);
  }
  const response = NextResponse.redirect(new URL(session.next, req.nextUrl.origin));
  response.cookies.set("cc_admin_token", await mintSession(session.email), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * SESSION_DAYS, path: "/",
  });
  return response;
}
