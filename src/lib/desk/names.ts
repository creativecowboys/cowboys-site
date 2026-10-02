// How names are SHOWN on the desk's three lists and in its panel headers (Oct 2 2026). Display only: nothing in this
// file is ever sent anywhere or written back. The record keeps the name exactly as GoHighLevel (or Monday) holds it.
//
// Two things the rows got wrong:
//   1. GoHighLevel's contact search hands a contact's name back lower-cased ("samuel johnson"), while the same contact
//      read by its id carries the name as it was typed ("Samuel Johnson"). The lists are built from the search and the
//      open panel from the read, so a row said one thing and its panel another.
//   2. A contact named after its business printed the business twice: the 17 legacy clients were imported with the
//      business name as the contact's name, so a row read "Whiten Pools, Inc." with "whiten pools, inc." underneath.
//
// Pure and import-free, so the browser (src/app/leads/*.tsx) and the unit tests both read it. No lookbehind in any
// pattern here: an older iPhone refuses to load a script that has one.

/** The key two spellings of one name share: letters and digits only, lower-cased, "&" read as "and". */
export function nameKey(value: string | null | undefined): string {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^\p{L}\p{N}]+/gu, "");
}

/**
 * Is this the same name written twice? Capitals, punctuation and spacing are ignored ("Whiten Pools, Inc." is
 * "whiten  pools inc"), and "&" is "and". A blank is never the same as anything, another blank included.
 */
export function sameName(a: string | null | undefined, b: string | null | undefined): boolean {
  const key = nameKey(a);
  return key !== "" && key === nameKey(b);
}

const HAS_CAPITAL = /\p{Lu}/u;
const LETTER = /\p{L}/u;
const DIGIT = /\p{N}/u;
const isLetter = (ch: string | undefined): boolean => !!ch && LETTER.test(ch);
const lettersFrom = (text: string, at: number): number => { let n = 0; while (isLetter(text[at + n])) n++; return n; };
const upperAt = (text: string, at: number): string => text.slice(0, at) + text[at].toUpperCase() + text.slice(at + 1);
/** "John Smith III": the only words shown in capitals throughout. ("i", "v" and "vi" are too often something else.) */
const NUMERALS = new Set(["ii", "iii", "iv"]);
/** "Peggy and George Guy": the one joining word that keeps its small letter (after the first word). */
const JOINING = new Set(["and"]);

/** One piece of a lower-case name (no spaces, hyphens, full stops or slashes): "o'brien" → "O'Brien", "mckay" → "McKay", "joe's" → "Joe's". */
function capitalisePiece(piece: string): string {
  let first = 0;
  while (first < piece.length && !isLetter(piece[first]) && !DIGIT.test(piece[first])) first++; // an opening quote or bracket stays where it is
  if (!isLetter(piece[first])) return piece; // nothing to capitalise, or it starts with a digit ("3rd" stays "3rd")
  let out = upperAt(piece, first);
  // O'Brien, D'Angelo: one letter, an apostrophe, then a name. Not "joe's" or "i'm" (too little after the apostrophe).
  if ((out[first + 1] === "'" || out[first + 1] === "’") && lettersFrom(out, first + 2) >= 3) out = upperAt(out, first + 2);
  // McKay, McDonald. Never "mac": Macy, Mack and Machado are names too.
  else if (out[first] === "M" && out[first + 1] === "c" && lettersFrom(out, first + 2) >= 3) out = upperAt(out, first + 2);
  return out;
}

/**
 * A person's name as the desk shows it. A name that carries a capital anywhere is shown exactly as it is: that is how
 * someone typed it ("DeShawn McKnight", "JOHN SMITH"). A name with no capital at all is how GoHighLevel's search returns
 * every name, so each word gets its first letter back: "samuel johnson" → "Samuel Johnson", "mary-jane o'brien" →
 * "Mary-Jane O'Brien", "j.r. smith iii" → "J.R. Smith III", "peggy and george guy" → "Peggy and George Guy". An email
 * address standing in for a name is left alone.
 *
 * It is a best guess for the row. Once the record is opened the row carries the name as it is stored, which this
 * function then leaves untouched; so a row and its panel can only differ before the first open, and only for a name
 * with capitals in unusual places.
 */
export function displayName(name: string | null | undefined): string {
  const text = String(name ?? "");
  if (!text || HAS_CAPITAL.test(text) || text.includes("@")) return text;
  let words = 0;
  return text.split(/(\s+)/).map((word) => {
    if (!word.trim()) return word; // the spacing between words is kept as it is
    const later = words++ > 0;
    if (later && NUMERALS.has(word)) return word.toUpperCase();
    if (later && JOINING.has(word)) return word;
    return word.split(/([-./])/).map(capitalisePiece).join("");
  }).join("");
}

/**
 * The contact person to print beside a business name, or "" when there is nobody to print: no contact on the record,
 * or a "contact" that only repeats the business name.
 */
export function personShown(business: string | null | undefined, contact: string | null | undefined): string {
  const person = String(contact ?? "").trim();
  return !person || sameName(business, person) ? "" : displayName(person);
}

/**
 * The small line under the business name in a list row: the contact person, then whatever else the row adds (a city,
 * "since 2026-09-24"), joined with " · ". With no contact on the record it says so (`none`); a contact that only repeats
 * the business name is left out without a word. May be "" (nothing to print).
 */
export function contactLine(business: string | null | undefined, contact: string | null | undefined, extras: readonly (string | false | null | undefined)[] = [], none = "no contact"): string {
  const person = String(contact ?? "").trim() ? personShown(business, contact) : none;
  return [person, ...extras].filter(Boolean).join(" · ");
}

/**
 * The name at the top of a row or panel. A business name is shown exactly as it is stored. The one exception is a
 * record with no business name: the server then puts the contact's own name there (the two are the same text), and a
 * contact's name is shown the way contact names are.
 */
export function businessShown(business: string | null | undefined, contact: string | null | undefined): string {
  const name = String(business ?? "");
  return name && name === String(contact ?? "") ? displayName(name) : name;
}
