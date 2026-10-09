// How phone numbers are SHOWN in the Back Office (Oct 9 2026). Dave: "can you make all these phone numbers easier to
// read". GoHighLevel keeps a number the way it dials it ("+14176239318") and Monday kept bare digits ("14176239318");
// people read "(417) 623-9318".
//
// Display only. Nothing in this file changes what is stored, what is sent to GoHighLevel or Monday, or a tel:/sms:
// link: those keep the dialable form. A US or Canadian number is shown as (NPA) NXX-XXXX; anything else (a number from
// another country, a short code, a typo, a note typed into the field) is shown exactly as it is stored, trimmed.
//
// Pure and import-free, so the browser (src/app/leads/*.tsx), the list filters and the unit tests all read it. No
// lookbehind in any pattern here: an older iPhone refuses to load a script that has one.

/** Only what people punctuate a phone number with: digits, spaces, ( ) . - / and the dash family, with an optional leading "+". */
const PHONE_SHAPED = /^\+?[\d\s().\-/‐-―]+$/;
/** A trailing extension: "x123", "ext 123", "ext. 123", "extension 123", "#123". */
const EXTENSION = /^(.*?)\s*(?:ext\.?|extension|x|#)\s*(\d{1,6})$/i;
/** A real North American number: area code and exchange both start 2–9 ("123-456-7890" is not a phone number). */
const NANP = /^[2-9]\d{2}[2-9]\d{6}$/;

/**
 * The ten digits of a US or Canadian number ("4176239318"), or "" when the text is not one. Accepts "+1" and ten
 * digits, ten digits, or eleven digits starting with 1, punctuated any way. A "+" followed by anything other than 1
 * and ten digits is another country's number and is not one of ours.
 */
export function usPhoneDigits(raw: string | null | undefined): string {
  const text = String(raw ?? "").trim();
  if (!PHONE_SHAPED.test(text)) return "";
  const digits = text.replace(/\D/g, "");
  const national = digits.length === 11 && digits[0] === "1" ? digits.slice(1) : !text.startsWith("+") && digits.length === 10 ? digits : "";
  return NANP.test(national) ? national : "";
}

/** The number split from a trailing extension, when the part before it is a US number: { national: "4176239318", ext: "123" }. */
function parse(raw: string | null | undefined): { national: string; ext: string } | null {
  const text = String(raw ?? "").trim();
  const whole = usPhoneDigits(text);
  if (whole) return { national: whole, ext: "" };
  const ext = EXTENSION.exec(text);
  const national = ext ? usPhoneDigits(ext[1]) : "";
  return national && ext ? { national, ext: ext[2] } : null;
}

/**
 * A phone number as the Back Office shows it: "+14176239318" → "(417) 623-9318", "417.623.9318 x12" →
 * "(417) 623-9318 ext. 12". Anything that is not a US or Canadian number comes back as stored, trimmed; a blank is "".
 * Formatting an already formatted number gives the same text back.
 */
export function formatPhone(raw: string | null | undefined): string {
  const parsed = parse(raw);
  if (!parsed) return String(raw ?? "").trim();
  const { national, ext } = parsed;
  const shown = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  return ext ? `${shown} ext. ${ext}` : shown;
}

/**
 * Does a typed search look for this phone number? Only a search made of phone characters with at least three digits
 * counts ("4176239318", "417-623-9318", "(417) 623", "+1 417"); its digits are looked for in the stored number, with
 * and without the leading 1. A search with letters in it ("Unit 5", "tracy") never matches on a phone, so the name,
 * business and email searches find exactly what they always found.
 */
export function phoneMatches(phone: string | null | undefined, search: string | null | undefined): boolean {
  const query = String(search ?? "").trim();
  if (!PHONE_SHAPED.test(query)) return false;
  const wanted = query.replace(/\D/g, "");
  if (wanted.length < 3) return false;
  const all = String(phone ?? "").replace(/\D/g, "");
  if (!all) return false;
  const national = parse(phone)?.national || "";
  return [all, national, national && `1${national}`].some((digits) => !!digits && digits.includes(wanted));
}

/**
 * What an editable phone box sends when it is saved. The box shows the number formatted; if it still holds exactly
 * that, nobody changed it, and the number goes back byte-for-byte as it was stored (so leaving the box never rewrites
 * "+14176239318" as "(417) 623-9318"). Anything typed is sent as typed, the way it always was.
 */
export function phoneToSave(typed: string, stored: string | null | undefined): string {
  const before = String(stored ?? "");
  return typed === formatPhone(before) ? before : typed;
}
