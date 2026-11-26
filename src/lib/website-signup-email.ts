import { createHash } from "node:crypto";
import type { CreateEmailOptions, Resend } from "resend";
import { CALENDLY_URL, FORM_NAME } from "@/app/black-friday/content";

const FROM = "Creative Cowboys <howdy@creativecowboys.co>";
const REPLY_TO = "howdy@creativecowboys.co";
const LOGO = "https://creativecowboys.github.io/brand-assets/cc-logo-stacked-signature.png";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

/** This confirmation is for the free-website offer, not every unrelated contact form. */
export function signupConfirmation(name: unknown, email: unknown, source: unknown): {
  email: CreateEmailOptions;
  idempotencyKey: string;
} | null {
  if (source !== FORM_NAME || typeof email !== "string") return null;
  const recipient = email.trim().toLowerCase();
  // One mailbox only: never let user input become a recipient list or mail header.
  if (recipient.length > 254 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient)) return null;
  const firstName = typeof name === "string" ? name.trim().split(/\s+/)[0].slice(0, 80) : "";
  const greeting = firstName ? `Howdy ${escapeHtml(firstName)},` : "Howdy,";
  const plainGreeting = firstName ? `Howdy ${firstName},` : "Howdy,";
  const subject = "Thanks for signing up — let's talk about your website";
  const text = `${plainGreeting}\n\nThanks for reaching out about a website for your business. We'd love to learn more about what you are building and how we can help.\n\nPick a time that works for you:\n${CALENDLY_URL}\n\nPrefer not to book right now? No problem — we will reach out to follow up. If you have already booked, you are all set.\n\nDave & Josh\nCreative Cowboys\nhttps://www.creativecowboys.co\n`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#eee9df;color:#25251f;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">Thanks for signing up. Pick a time to talk about your website.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eee9df"><tr><td align="center" style="padding:32px 14px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fffdf8;border:1px solid #ddd5c7"><tr><td style="padding:32px 36px 25px;border-bottom:3px solid #d55c32"><a href="https://www.creativecowboys.co"><img src="${LOGO}" width="150" alt="Creative Cowboys" style="display:block;width:150px;height:auto;border:0"></a></td></tr><tr><td style="padding:35px 36px 18px"><p style="font-size:12px;letter-spacing:2px;font-weight:bold;color:#a24928;margin:0 0 14px">A NOTE FROM THE COWBOYS</p><h1 style="font-size:32px;line-height:1.15;margin:0 0 26px;color:#27271f">Let's talk about your website.</h1><p style="font-size:17px;line-height:1.65;margin:0 0 18px">${greeting}</p><p style="font-size:17px;line-height:1.65;margin:0 0 18px">Thanks for reaching out about a website for your business. We'd love to learn more about what you are building and how we can help.</p><p style="font-size:17px;line-height:1.65;margin:0 0 24px">Pick a time that works for you using the button below.</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background:#d55c32;border-radius:4px"><a href="${CALENDLY_URL}" style="display:inline-block;padding:16px 24px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none">Book a time with us &rarr;</a></td></tr></table><p style="font-size:17px;line-height:1.65;margin:25px 0 18px">Prefer not to book right now? No problem&mdash;we will reach out to follow up.</p><p style="font-size:15px;line-height:1.65;margin:0 0 26px;color:#6f6c62">If you have already booked, you are all set.</p><p style="font-size:17px;line-height:1.6;margin:0"><strong>Dave &amp; Josh</strong><br>Creative Cowboys</p></td></tr><tr><td style="padding:24px 36px 30px"><p style="border-top:1px solid #ddd5c7;padding-top:20px;font-size:13px;line-height:1.7;margin:0;color:#6f6c62"><strong style="color:#303027">Less Bull. More Results.</strong><br><a href="https://www.creativecowboys.co" style="color:#6f6c62">creativecowboys.co</a> &nbsp;&middot;&nbsp; <a href="mailto:${REPLY_TO}" style="color:#6f6c62">Reply to Howdy</a></p></td></tr></table></td></tr></table></body></html>`;
  return {
    email: { from: FROM, to: recipient, replyTo: REPLY_TO, subject, html, text },
    // Resend retains these keys for 24 hours. Retrying a signup cannot send the same
    // confirmation twice during that window; no address is exposed in the key.
    idempotencyKey: `website-signup-v1-${createHash("sha256").update(`${FORM_NAME}:${recipient}`).digest("hex")}`,
  };
}

/** Never turn a customer-email failure into a failed form/duplicate internal lead. */
export async function sendSignupConfirmation(
  resend: Pick<Resend, "emails">,
  lead: { name: unknown; email: unknown; source: unknown },
): Promise<void> {
  const confirmation = signupConfirmation(lead.name, lead.email, lead.source);
  if (!confirmation) return;
  try {
    const { error } = await resend.emails.send(confirmation.email, { idempotencyKey: confirmation.idempotencyKey });
    if (error) console.error("Website signup confirmation failed:", error.name);
  } catch {
    // No raw provider error, address or form message is logged here.
    console.error("Website signup confirmation failed: provider request did not complete");
  }
}
