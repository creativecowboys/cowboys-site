import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { buildLines, monthlyTotal, type Selection } from "@/lib/packages/catalog";
import { addNote, addTask, ghl, ghlLocationId, INVOICE_HOST } from "@/lib/packages/ghl";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Ported from local-seo-engine's /api/team/package (Sep 25 2026). Builds a GHL recurring invoice
// (monthly, anchored to today, autopay on the first card), starts it, waits for the first invoice,
// marks it sent (optionally emailed by GHL), and returns the pay link.
const BUSINESS = {
  name: "Creative Cowboys", logoUrl: "https://onboarding.creativecowboys.co/brand/creative-cowboys-logo.png", phoneNo: "+14708340242",
  address: { addressLine1: "222 West Montgomery St", city: "Villa Rica", state: "GA", countryCode: "US", postalCode: "30180" }, website: "https://www.creativecowboys.co",
};
type Schedule = { _id: string; status: string; invoices?: { _id: string; status: string; invoiceNumber?: string }[]; total?: number };

function todayInET() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  return { iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, day: d.getDate() };
}

export async function POST(req: Request) {
  try {
    if (!(await isTeam())) return unauthorized();
    assertSameOrigin(req);
    const b = (await readCallBody(req)) as { contactId?: unknown; selections?: unknown; sendEmail?: unknown; testMode?: unknown; termsExtra?: unknown };
    const contactId = typeof b.contactId === "string" && /^[A-Za-z0-9]{6,64}$/.test(b.contactId) ? b.contactId : "";
    if (!contactId) throw new CallDeskError("Pick a customer first.", 400);
    if (!Array.isArray(b.selections) || b.selections.length > 20) throw new CallDeskError("Pick at least one item.", 400);
    const selections = (b.selections as Selection[]).map((s) => ({ key: String(s.key || "").slice(0, 40), tier: s.tier ? String(s.tier).slice(0, 20) : undefined, amount: s.amount === undefined ? undefined : Number(s.amount), promo: s.promo === true, name: s.name ? String(s.name).slice(0, 120) : undefined }));
    let lines;
    try { lines = buildLines(selections); } catch (e) { throw new CallDeskError((e as Error).message, 400); }
    const total = monthlyTotal(lines);
    const liveMode = b.testMode !== true;
    const termsExtra = typeof b.termsExtra === "string" ? b.termsExtra.trim().slice(0, 500) : "";

    const c = await ghl<{ contact: { id: string; firstName?: string; lastName?: string; email?: string; phone?: string; companyName?: string } }>("GET", `/contacts/${contactId}`);
    const contact = c.contact;
    if (!contact?.email) throw new CallDeskError("This contact has no email address. Add one in GHL first.", 400);
    const personName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email;
    const business = contact.companyName || personName;
    const promoNotes = lines.map((l) => l.promoNote).filter(Boolean) as string[];
    const terms = [
      `Monthly plan for ${business}. Billed on the same day each month; the card used for this first payment is charged automatically for future months.`,
      ...promoNotes,
      "Ad packages are one flat price that includes ad spend.",
      termsExtra, liveMode ? "" : "TEST MODE — this invoice will not charge a card.",
    ].filter(Boolean).join(" ");

    const { iso, day } = todayInET();
    const locationId = ghlLocationId();
    const created = await ghl<Schedule>("POST", "/invoices/schedule", {
      altId: locationId, altType: "location", name: `${business} — Monthly plan`.slice(0, 40), title: "Monthly plan",
      contactDetails: { id: contact.id, name: personName, email: contact.email, phoneNo: contact.phone || undefined, companyName: contact.companyName || undefined },
      schedule: { rrule: { intervalType: "monthly", interval: 1, startDate: iso, startTime: "09:00:00", dayOfMonth: Math.min(day, 28) } },
      liveMode, businessDetails: BUSINESS, currency: "USD",
      items: lines.map((l) => ({ name: l.name, description: l.description, currency: "USD", amount: l.amount, qty: 1, type: "recurring" })),
      discount: { value: 0, type: "percentage" }, termsNotes: terms, invoiceNumberPrefix: "CC-",
    });
    const started = await ghl<Schedule>("POST", `/invoices/schedule/${created._id}/schedule`, { altId: locationId, altType: "location", liveMode, autoPayment: { enable: true, type: "customer_card" } });
    let invoice = started.invoices?.[0];
    for (let i = 0; i < 12 && !invoice; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const g = await ghl<Schedule>("GET", `/invoices/schedule/${created._id}?altId=${locationId}&altType=location`);
      invoice = g.invoices?.[0];
    }
    if (!invoice) return NextResponse.json({ error: "The plan was created but GHL hasn't issued the first invoice yet. Check Payments → Recurring Invoices in a minute.", scheduleId: created._id }, { status: 502, headers: teamHeaders });
    await ghl("POST", `/invoices/${invoice._id}/send`, { altId: locationId, altType: "location", userId: process.env.GHL_USER_ID || "", action: b.sendEmail === false ? "send_manually" : "email", liveMode });
    const url = INVOICE_HOST + invoice._id;
    const summary = lines.map((l) => `• ${l.name} — $${l.amount}/mo`).join("\n");
    await addNote(contact.id, `Package builder (call desk): monthly plan created${liveMode ? "" : " (TEST MODE)"}.\n${summary}\nTotal $${total}/mo. Invoice ${invoice.invoiceNumber ?? invoice._id}: ${url}`).catch(() => {});
    if (promoNotes.length && liveMode) await addTask(contact.id, `${business}: Local Growth first-year rate ends`, "The $297/mo first-year rate ends after 12 payments. Update the recurring invoice to $497/mo before the 13th charge.", 335).catch(() => {});
    return NextResponse.json({ ok: true, url, invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, scheduleId: created._id, total, lines, liveMode, emailed: b.sendEmail !== false, to: contact.email }, { headers: teamHeaders });
  } catch (error) { return failure(error); }
}
