import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Where all form leads get emailed
const TO_EMAIL = "howdy@creativecowboys.co";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      company, 
      business, 
      message, 
      service, 
      industry, 
      source,
      website_url // Honeypot
    } = body;

    // 1. Honeypot check (Spam prevention)
    if (website_url && website_url.trim() !== "") {
      console.log("Spam submission blocked via honeypot field:", website_url);
      // Silently return success so the spam bot thinks it worked
      return NextResponse.json({ success: true });
    }

    // 2. Server-side validation
    if (!name || !name.trim() || !email || !email.trim()) {
      return NextResponse.json(
        { error: "Required fields missing: Name and Email are required." },
        { status: 400 }
      );
    }

    // If it's a proposal modal form, also require service
    const isProposal = source && source.includes("Homepage Popup");
    if (isProposal && (!service || service.trim() === "" || service === "Select a service...")) {
      return NextResponse.json(
        { error: "Required fields missing: Service selection is required." },
        { status: 400 }
      );
    }

    // 3. Subject line formatting
    let subject = `New Contact Form Submission — ${name}`;
    if (isProposal) {
      subject = `New proposal request — ${name} (${service})`;
    } else if (industry) {
      subject = `🔥 New ${industry} AI Lead — ${name}`;
    }

    // 4. Build HTML table
    const htmlLines: string[] = [
      `<h2 style="margin:0 0 16px;color:#F15F2A;">${subject}</h2>`,
      `<table style="border-collapse:collapse;width:100%;max-width:560px;">`,
    ];

    const addRow = (label: string, value: string | undefined) => {
      if (!value) return;
      htmlLines.push(
        `<tr>
          <td style="padding:8px 12px;border:1px solid #eee;font-weight:600;width:140px;color:#333;">${label}</td>
          <td style="padding:8px 12px;border:1px solid #eee;color:#555;">${value}</td>
        </tr>`
      );
    };

    addRow("Name", name);
    addRow("Email", email);
    addRow("Phone", phone);
    addRow("Company/Business", company || business);
    addRow("Service Requested", service);
    addRow("Industry context", industry);
    addRow("Traffic Source", source);
    addRow("Message details", message);

    htmlLines.push("</table>");
    htmlLines.push(
      `<p style="margin:24px 0 0;font-size:12px;color:#999;">Sent from creativecowboys.co at ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}</p>`
    );

    const { error } = await resend.emails.send({
      from: "Creative Cowboys <onboarding@resend.dev>",
      to: [TO_EMAIL],
      replyTo: email || undefined,
      subject,
      html: htmlLines.join("\n"),
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
