// The Back Office Links tab (Oct 9 2026; Dave: "make a new tab for links… give us the ability to name and post links
// that we use often"): what a saved link may hold. Pure and import-free on purpose — the browser uses it for instant
// feedback on the add/edit form, and the server (src/lib/desk/links.ts) runs the same checks before anything is stored.
//
// A link is web only: http or https. Anything else (javascript:, data:, file:, mailto:, …) is refused. An address typed
// without a scheme ("searchatlas.com/dashboard") gets https:// in front. A link that carries a username or password
// (https://user:pass@host) is refused: logins belong in the password manager, never here.

export const LINK_LIMITS = { name: 120, url: 2048, note: 500, count: 500 } as const;

export type LinkFields = { name: string; url: string; note: string };
export type LinkCheck = { ok: true; value: LinkFields } | { ok: false; field: keyof LinkFields; error: string };

const isControl = (ch: string) => { const code = ch.charCodeAt(0); return code < 32 || code === 127; };
const hasControl = (value: string) => [...value].some(isControl);
/** One line of plain text: runs of spaces and line breaks become one space, other control characters are dropped. */
const oneLine = (value: string) => [...value.replace(/\s+/g, " ")].filter((ch) => !isControl(ch)).join("").trim();

/** The link as it will be stored and opened, or why it cannot be. */
export function normalizeLinkUrl(input: unknown): { ok: true; url: string } | { ok: false; error: string } {
  if (typeof input !== "string") return { ok: false, error: "Add the link." };
  let text = input.trim();
  if (!text) return { ok: false, error: "Add the link." };
  if (text.length > LINK_LIMITS.url) return { ok: false, error: `That link is too long (${LINK_LIMITS.url} characters at most).` };
  if (hasControl(text) || /\s/.test(text)) return { ok: false, error: "A link can't contain spaces or line breaks. Paste it again from the address bar." };
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(text);
  if (text.startsWith("//")) text = `https:${text}`;
  // "example.com:8080/x" has a dot before its colon: that is a host and port, not a scheme.
  else if (scheme && !scheme[1].includes(".")) {
    if (!/^https?$/i.test(scheme[1])) return { ok: false, error: "Only web links (http or https) can be saved here." };
  } else text = `https://${text}`;
  let url: URL;
  try { url = new URL(text); } catch { return { ok: false, error: "That doesn't look like a web address. Paste it again from the address bar." }; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "Only web links (http or https) can be saved here." };
  if (url.username || url.password) return { ok: false, error: "Links can't include a username or password. Save the plain link and keep the login in the password manager." };
  const host = url.hostname;
  if (!host.includes(".") || host.startsWith(".") || host.endsWith(".") || host.includes("..")) return { ok: false, error: "That doesn't look like a web address. Paste it again from the address bar." };
  if (url.href.length > LINK_LIMITS.url) return { ok: false, error: `That link is too long (${LINK_LIMITS.url} characters at most).` };
  return { ok: true, url: url.href };
}

/** Name, link and note together, trimmed and checked. The first problem found is the one reported. */
export function checkLinkFields(input: unknown): LinkCheck {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const name = typeof raw.name === "string" ? oneLine(raw.name) : "";
  if (!name) return { ok: false, field: "name", error: "Give the link a name." };
  if (name.length > LINK_LIMITS.name) return { ok: false, field: "name", error: `Keep the name under ${LINK_LIMITS.name} characters.` };
  const url = normalizeLinkUrl(raw.url);
  if (!url.ok) return { ok: false, field: "url", error: url.error };
  if (raw.note !== undefined && raw.note !== null && typeof raw.note !== "string") return { ok: false, field: "note", error: "The note must be text." };
  const note = typeof raw.note === "string" ? oneLine(raw.note) : "";
  if (note.length > LINK_LIMITS.note) return { ok: false, field: "note", error: `Keep the note under ${LINK_LIMITS.note} characters.` };
  return { ok: true, value: { name, url: url.url, note } };
}

/** Only ever hand the browser an http(s) address to open, whatever is in storage. */
export function safeLinkHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch { return null; }
}

/** The address as shown under the name: host and path, without https://, www. or a trailing slash. */
export function linkLabel(value: string): string {
  try {
    const url = new URL(value);
    const path = `${url.pathname}${url.search}${url.hash}`;
    return `${url.host.replace(/^www\./i, "")}${path === "/" ? "" : path}`;
  } catch { return value; }
}

/** A to Z by name, ignoring capitals; ties by address so the order never shuffles. */
export const byLinkName = (a: { name: string; url: string }, b: { name: string; url: string }): number =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base", numeric: true }) || a.url.localeCompare(b.url);

/** What the search box matches: name, address, note and who added it. */
export function linkMatches(link: { name: string; url: string; note: string; addedBy?: string }, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${link.name} ${link.url} ${link.note} ${link.addedBy || ""}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}
