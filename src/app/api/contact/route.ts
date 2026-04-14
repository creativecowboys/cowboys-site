import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Where all form leads get emailed
const TO_EMAIL = "howdy@creativecowboys.co";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, business, message, service, industry, source } = body;

    // Build the email body based on which form it came from
    const isLanding = !!industry;
    const subject = isLanding
      ? `🔥 New ${industry} AI Lead — ${name}`
      : `New Contact Form Submission — ${name}`;

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
    addRow("Company", company || business);
    addRow("Service", service);
    addRow("Industry", industry);
    addRow("Source", source);
    addRow("Message", message);

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
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
