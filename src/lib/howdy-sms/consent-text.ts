// The consent wording itself, with no server imports, so the form on /sms-optin shows the exact
// sentence that gets stored on the record. One source of truth: if this changes, bump the version.

export const CONSENT_VERSION = "howdy-updates-2026-10-04";

/** The exact sentence shown next to the (unchecked) box. Stored verbatim on every record. */
export const CONSENT_TEXT =
  "I agree to receive text messages from Creative Cowboys Media, LLC about my website update requests, " +
  "including support replies and completion confirmations from Howdy. Message frequency varies. " +
  "Message and data rates may apply. Consent is not a condition of purchasing any service. " +
  "Reply STOP to unsubscribe or HELP for help.";

export const CONSENT_PURPOSE =
  "Howdy website-update support replies and completion confirmations (Creative Cowboys clients)";
