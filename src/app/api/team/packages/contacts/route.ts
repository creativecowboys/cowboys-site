import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { ghl, ghlLocationId, slimContact, type GhlContact } from "@/lib/packages/ghl";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?q= — search GHL contacts by name / email / phone / company (ported from local-seo-engine). */
export async function GET(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 120);
    if (q.length < 2) return NextResponse.json({ contacts: [] }, { headers: teamHeaders });
    const r = await ghl<{ contacts?: GhlContact[] }>("GET", `/contacts/?locationId=${ghlLocationId()}&query=${encodeURIComponent(q)}&limit=8`);
    return NextResponse.json({ contacts: (r.contacts ?? []).map(slimContact) }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}

/** POST — create the contact in GHL when the customer isn't there yet. Duplicate → returns the existing one. */
export async function POST(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const b = (await readCallBody(req)) as { firstName?: unknown; lastName?: unknown; email?: unknown; phone?: unknown; company?: unknown };
    const s = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
    const firstName = s(b.firstName, 80), lastName = s(b.lastName, 80), email = s(b.email, 200), phone = s(b.phone, 40), company = s(b.company, 200);
    if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CallDeskError("First name and a valid email are required.", 400);
    try {
      const r = await ghl<{ contact: GhlContact }>("POST", "/contacts/", { locationId: ghlLocationId(), firstName, lastName: lastName || undefined, email, phone: phone || undefined, companyName: company || undefined, source: "Package builder (call desk)" });
      return NextResponse.json({ contact: slimContact(r.contact) }, { headers: teamHeaders });
    } catch (e) {
      const m = /"contactId":"([A-Za-z0-9]+)"/.exec(e instanceof Error ? e.message : "");
      if (!m) throw e;
      const existing = await ghl<{ contact: GhlContact }>("GET", `/contacts/${m[1]}`);
      return NextResponse.json({ contact: slimContact(existing.contact), existed: true }, { headers: teamHeaders });
    }
  } catch (error) { return failure(error); }
}
