/**
 * Every lead form on the site requires a phone number. These keep the browser check and the
 * /api/contact check in agreement: at least 10 digits, any formatting allowed.
 */

/** For an <input pattern>. Browsers anchor it to the whole value. */
export const PHONE_PATTERN = "(?:\\D*\\d){10,}\\D*";

/** Shown by the browser when the pattern fails. */
export const PHONE_TITLE = "Please enter a phone number with area code, like (555) 555-5555";

export function isValidPhone(value: unknown): value is string {
  return typeof value === "string" && value.replace(/\D/g, "").length >= 10;
}
