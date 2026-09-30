import { NextResponse } from "next/server";
import { isTeam } from "@/lib/team-auth";
import { assertSameOrigin, CallDeskError, readCallBody } from "@/lib/calls/validation";
import { buildLines, monthlyTotal, type Selection } from "@/lib/packages/catalog";
import { addNote, addTask, ghl, GHL_APP, ghlLocationId, ghlUserId, INVOICE_HOST } from "@/lib/packages/ghl";
import { failure, teamHeaders, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Ported from local-seo-engine's /api/team/package (Sep 25 2026). Builds a GHL recurring invoice
// (monthly, anchored to today, autopay on the first card), starts it, waits for the first invoice,
// marks it sent (optionally emailed by GHL), and returns the pay link.
//
// Sep 30 2026 fixes (Josh's Jeremy attempts): (1) the schedule's dayOfMonth was clamped to 28, so on
// the 29th–31st GHL put the first invoice a month out and the wait timed out with a bare 502 (two stray
// templates per attempt); GHL's own picker accepts 1st–31st, and with dayOfMonth = today's day it issues
// the first invoice today. (2) The send step passed userId "" when GHL_USER_ID was unset, so the invoice
// stayed in Draft — the sender is now resolved (env or the location's users) BEFORE anything is created.
// (3) Every failure now says which step broke, what already exists in GHL, and where to open it.
const BUSINESS = {
  name: "Creative Cowboys", logoUrl: "https://onboarding.creativecowboys.co/brand/creative-cowboys-logo.png", phoneNo: "+14708340242",
  address: { addressLine1: "222 West Montgomery St", city: "Villa Rica", state: "GA", countryCode: "US", postalCode: "30180" }, website: "https://www.creativecowboys.co",
};
type Schedule = { _id: string; status: string; invoices?: { _id: string; status: string; invoiceNumber?: string }[]; total?: number };
type SendResult = { invoice?: { _id: string; status?: string }; emailData?: unknown; smsData?: unknown };

function todayInET() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  return { iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, day: d.getDate() };
}

/** What the desk gets when GHL work was partly done: the step that failed plus links to what exists. */
function partial(step: string, message: string, ids: { scheduleId?: string; invoiceId?: string }, status = 502) {
  const loc = process.env.GHL_LOCATION_ID || "";
  const body: Record<string, unknown> = { error: message, step, ...ids };
  if (ids.scheduleId && loc) body.ghlUrl = `${GHL_APP}/${loc}/payments/recurring-templates/v2/${ids.scheduleId}`;
  if (ids.invoiceId) body.url = INVOICE_HOST + ids.invoiceId;
  console.error(`packages: step=${step} scheduleId=${ids.scheduleId ?? "-"} invoiceId=${ids.invoiceId ?? "-"} :: ${message}`);
  return NextResponse.json(body, { status, headers: teamHeaders });
}
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

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
    const sendEmail = b.sendEmail !== false;
    const termsExtra = typeof b.termsExtra === "string" ? b.termsExtra.trim().slice(0, 500) : "";

    // Everything GHL needs to *send* is resolved before anything is created, so a missing sender can't
    // leave a started schedule behind.
    const locationId = ghlLocationId();
    const userId = await ghlUserId();

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
    const name = `${business} — Monthly plan`.slice(0, 40);
    // dayOfMonth must equal the start date's day or GHL waits for the next matching day (on the 30th a
    // clamp to 28 meant "first invoice Oct 28"). GHL's own recurring-invoice picker offers 1st–31st.
    const created = await ghl<Schedule>("POST", "/invoices/schedule", {
      altId: locationId, altType: "location", name, title: "Monthly plan",
      contactDetails: { id: contact.id, name: personName, email: contact.email, phoneNo: contact.phone || undefined, companyName: contact.companyName || undefined },
      schedule: { rrule: { intervalType: "monthly", interval: 1, startDate: iso, startTime: "09:00:00", dayOfMonth: day } },
      liveMode, businessDetails: BUSINESS, currency: "USD",
      items: lines.map((l) => ({ name: l.name, description: l.description, currency: "USD", amount: l.amount, qty: 1, type: "recurring" })),
      discount: { value: 0, type: "percentage" }, termsNotes: terms, invoiceNumberPrefix: "CC-",
    });
    const scheduleId = created._id;

    let started: Schedule;
    try {
      started = await ghl<Schedule>("POST", `/invoices/schedule/${scheduleId}/schedule`, { altId: locationId, altType: "location", liveMode, autoPayment: { enable: true, type: "customer_card" } });
    } catch (e) {
      return partial("start", `The recurring template "${name}" was created in GHL but could not be started: ${msg(e)} Open it in GHL to start or delete it — do not create it again.`, { scheduleId });
    }
    let invoice = started.invoices?.[0];
    for (let i = 0; i < 12 && !invoice; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      try {
        const g = await ghl<Schedule>("GET", `/invoices/schedule/${scheduleId}?altId=${locationId}&altType=location`);
        invoice = g.invoices?.[0];
      } catch (e) { console.error(`packages: poll ${i} failed: ${msg(e)}`); }
    }
    if (!invoice) return partial("first-invoice", `The recurring template "${name}" was created and started in GHL, but GHL did not issue its first invoice within 30 seconds (it should bill on the ${day}${day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} starting ${iso}). Open it in GHL to check the schedule and send the invoice from there — do not create it again.`, { scheduleId });

    let sent: SendResult | undefined;
    try {
      sent = await ghl<SendResult>("POST", `/invoices/${invoice._id}/send`, { altId: locationId, altType: "location", userId, action: sendEmail ? "email" : "send_manually", liveMode });
    } catch (e) {
      return partial("send", `Invoice ${invoice.invoiceNumber ?? invoice._id} was created in GHL (recurring template "${name}") but marking it sent${sendEmail ? " / emailing it" : ""} failed: ${msg(e)} It is sitting in Draft — open it in GHL and press Send, or fix the error and try again on a fresh customer. Do not create the plan again for this customer.`, { scheduleId, invoiceId: invoice._id });
    }
    const emailed = sendEmail && sent?.emailData !== undefined;
    if (sendEmail && !emailed) console.warn(`packages: send returned no emailData for invoice ${invoice._id}: ${JSON.stringify(sent).slice(0, 300)}`);

    const url = INVOICE_HOST + invoice._id;
    const summary = lines.map((l) => `• ${l.name} — $${l.amount}/mo`).join("\n");
    await addNote(contact.id, `Package builder (call desk): monthly plan created${liveMode ? "" : " (TEST MODE)"}.\n${summary}\nTotal $${total}/mo. Invoice ${invoice.invoiceNumber ?? invoice._id}: ${url}`).catch((e) => console.error(`packages: note failed: ${msg(e)}`));
    if (promoNotes.length && liveMode) await addTask(contact.id, `${business}: Local Growth first-year rate ends`, "The $297/mo first-year rate ends after 12 payments. Update the recurring invoice to $497/mo before the 13th charge.", 335).catch((e) => console.error(`packages: task failed: ${msg(e)}`));
    console.log(`packages: ok scheduleId=${scheduleId} invoiceId=${invoice._id} number=${invoice.invoiceNumber ?? "-"} live=${liveMode} emailed=${emailed} to=${contact.email}`);
    return NextResponse.json({ ok: true, url, invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, scheduleId, ghlUrl: `${GHL_APP}/${locationId}/payments/recurring-templates/v2/${scheduleId}`, total, lines, liveMode, emailed, emailRequested: sendEmail, to: contact.email }, { headers: teamHeaders });
  } catch (error) {
    console.error(`packages: failed before anything was created: ${msg(error)}`);
    return failure(error);
  }
}
