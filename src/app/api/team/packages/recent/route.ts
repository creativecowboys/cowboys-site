import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { ghl, ghlLocationId, INVOICE_HOST } from "@/lib/packages/ghl";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Inv = { _id: string; name?: string; invoiceNumber?: string; status: string; total?: number; liveMode?: boolean; issueDate?: string; contactDetails?: { name?: string; email?: string; companyName?: string }; scheduleId?: string };

/** The last 20 GHL invoices, so the rep can see who has paid and re-copy a link. */
export async function GET() {
  try {
    if (!(await isTeam())) return unauthorized();
    const r = await ghl<{ invoices?: Inv[] }>("GET", `/invoices/?altId=${ghlLocationId()}&altType=location&limit=20&offset=0`);
    const invoices = (r.invoices ?? []).map((i) => ({ id: i._id, number: i.invoiceNumber ?? "", customer: i.contactDetails?.companyName || i.contactDetails?.name || i.contactDetails?.email || "", status: i.status, total: i.total ?? 0, live: i.liveMode !== false, issued: i.issueDate ?? "", url: `${INVOICE_HOST}${i._id}`, recurring: Boolean(i.scheduleId) }));
    return NextResponse.json({ invoices }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
