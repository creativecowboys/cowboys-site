import { createHash, randomBytes } from "node:crypto";
import { del, get, put } from "@vercel/blob";
import { SignJWT } from "jose";
import { Resend } from "resend";

// Email-only team sign-in (Dave, Sep 24 2026: "change the whole login process to be an email only login").
// A team member types their address; if it is on the allowlist they get a one-time link that signs them
// in for 30 days. Same cookie (`cc_admin_token`, issuer cc-admin) as before, so /leads, /admin and the
// team APIs need no changes. Tokens are hashed at rest, single-use, and expire after 15 minutes.
export const SESSION_DAYS = 30;
const LINK_MINUTES = 15;
const THROTTLE_SECONDS = 60;
// Dave, Sep 24 2026: "anyone that has a cowboys email account should be able to get in."
const TEAM_DOMAIN = "creativecowboys.co";

export function extraTeamEmails(): string[] {
  return (process.env.TEAM_LOGIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}
export const normalizeEmail = (value: unknown): string => (typeof value === "string" ? value.trim().toLowerCase().slice(0, 200) : "");
export function isTeamEmail(email: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return email.endsWith(`@${TEAM_DOMAIN}`) || extraTeamEmails().includes(email);
}

const hash = (v: string) => createHash("sha256").update(v).digest("hex");
const magicPath = (tokenHash: string) => `auth/magic/${tokenHash}.json`;
const throttlePath = (email: string) => `auth/throttle/${hash(email)}.json`;
const opts = { access: "private" as const, contentType: "application/json", addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0 };

async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    const res = await get(pathname, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    return JSON.parse(await new Response(res.stream).text()) as T;
  } catch { return null; }
}

/** Only ever paths under /leads or /admin come back; anything else lands on /admin. */
export function safeNext(value: string | null | undefined): string {
  if (!value || value.length > 200 || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value === "/leads" || value.startsWith("/leads?") || value.startsWith("/leads/") || value === "/admin" || value.startsWith("/admin/") ? value : "/admin";
}

/** Issue a link for a team address. Non-team addresses return quietly (the caller says the same thing either way). */
export async function issueMagicLink(email: string, origin: string, next: string): Promise<"sent" | "not-team" | "throttled" | "unconfigured"> {
  if (!isTeamEmail(email)) return "not-team";
  if (!process.env.RESEND_API_KEY || !process.env.BLOB_READ_WRITE_TOKEN || !process.env.NEXTAUTH_SECRET) return "unconfigured";
  const last = await readJson<{ at: number }>(throttlePath(email));
  if (last && Date.now() - last.at < THROTTLE_SECONDS * 1000) return "throttled";
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + LINK_MINUTES * 60_000;
  await put(magicPath(hash(token)), JSON.stringify({ email, expiresAt, next: safeNext(next) }), opts);
  await put(throttlePath(email), JSON.stringify({ at: Date.now() }), opts);
  const url = `${origin}/api/admin/verify?token=${token}`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Creative Cowboys <howdy@creativecowboys.co>",
    to: email,
    subject: "Your Creative Cowboys sign-in link",
    text: `Here's your sign-in link for the Creative Cowboys team desk:\n\n${url}\n\nIt works once and expires in ${LINK_MINUTES} minutes. If you didn't ask for it, ignore this email.\n\n— Howdy`,
    html: `<p style="font:15px/1.5 Arial,sans-serif;color:#1f1a17">Here's your sign-in link for the Creative Cowboys team desk:</p><p style="margin:20px 0"><a href="${url}" style="display:inline-block;background:#F15F2A;color:#fff;text-decoration:none;font:700 15px Arial,sans-serif;padding:12px 22px;border-radius:6px">Sign in</a></p><p style="font:13px/1.5 Arial,sans-serif;color:#71665a">It works once and expires in ${LINK_MINUTES} minutes. If you didn't ask for it, ignore this email.<br>— Howdy</p>`,
  });
  if (error) throw new Error("send failed");
  return "sent";
}

/** Redeem a link. Deletes it first so a second click (or a link-scanner) cannot reuse it. */
export async function redeemMagicLink(token: string): Promise<{ email: string; next: string } | null> {
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return null;
  const path = magicPath(hash(token));
  const record = await readJson<{ email: string; expiresAt: number; next: string }>(path);
  if (!record) return null;
  try { await del(path); } catch { /* best effort; expiry still bounds it */ }
  if (record.expiresAt < Date.now() || !isTeamEmail(record.email)) return null;
  return { email: record.email, next: safeNext(record.next) };
}

export async function mintSession(email: string): Promise<string> {
  return new SignJWT({ role: "admin", sub: email }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setIssuer("cc-admin").setExpirationTime(`${SESSION_DAYS}d`).sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? ""));
}
