/**
 * Send one SMS through Creative Cowboys' Twilio account, via the Messaging
 * Service that carries the approved A2P 10DLC campaign. Used for the playbook
 * delivery text; GHL handles email and everything after.
 *
 * Plain REST, no SDK. Never throws: a failed text must not fail the form.
 */

const TIMEOUT_MS = 8_000;

export async function sendSms(to: string, body: string): Promise<boolean> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
    if (!sid || !token || !service) {
        console.warn("twilio sms skipped: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_MESSAGING_SERVICE_SID not set");
        return false;
    }
    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: "POST",
            headers: {
                Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ To: to, MessagingServiceSid: service, Body: body }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) {
            console.error("twilio sms failed:", res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error("twilio sms threw:", err);
        return false;
    }
}
