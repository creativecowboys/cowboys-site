import { BlobNotFoundError, BlobPreconditionFailedError, BlobServiceRateLimited, get, head, put } from "@vercel/blob";
import { CallDeskError } from "@/lib/calls/validation";
import { checkLinkFields, LINK_LIMITS, type LinkFields } from "./link-rules";

// The Back Office Links tab (Oct 9 2026): the team's shared list of links they use often, each with a name, the
// address, an optional short note, and who added it and when. Any signed-in team member can add, change, delete or
// reorder. The order is the team's own (Dave, Oct 9 2026: drag a grab handle to reorder, saved for everyone): the
// document's `links` array IS the order. A new link goes to the top; an edit keeps its place.
// A reorder is sent as one move ("put this link right after that one", or "at the top"), not as a whole list, and is
// applied to whatever the list is when it lands — so a move made from a screen that missed someone's add, edit or
// delete never undoes it. If the link it names as its neighbour has been deleted meanwhile, the move is refused (409)
// and the screen reloads.
//
// Where it lives: ONE private JSON document in the site's existing Vercel Blob store (BLOB_READ_WRITE_TOKEN, the same
// store that holds onboarding handoffs and client files), at `team/links.json`. No new service, no database.
//
// Two people saving at once cannot lose each other's change: every write is read → change → write-if-unchanged. The
// write carries the ETag that was read (`ifMatch`); if someone saved in between, Blob refuses it and the change is
// re-applied to the fresh list (a few times, then the person is asked to try again). The very first write creates the
// document only if it does not exist yet. A link's own `rev` guards an edit made from a stale screen.
// The ETag a write names comes from head() (the Blob API), never from the get() response: on production the ETag that
// get() hands back did not match what put({ ifMatch }) checks against, and every second write was refused (Oct 9 2026).
// So a read for a write is head → get (uncached, which Blob guarantees is the latest content) → head, and is only
// trusted when both heads agree.
export const LINKS_PATH = "team/links.json";
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ATTEMPTS = 6;

export type StoredLink = LinkFields & {
  id: string;
  addedBy: string; addedByEmail: string; addedAt: string;
  updatedBy?: string; updatedAt?: string;
  /** Goes up by one with every edit; an edit must name the rev it started from. */
  rev: number;
};
/** What the browser gets: no email addresses, just the names. */
export type TeamLink = LinkFields & { id: string; addedBy: string; addedAt: string; updatedBy?: string; updatedAt?: string; rev: number };
export type LinksData = { links: TeamLink[]; limits: typeof LINK_LIMITS };
type Doc = { version: 1; links: StoredLink[] };
type Who = { name: string; email: string };

/** Where the document is kept. Swappable so the tests can run against an in-memory copy with real ETag behaviour. */
export type LinkStorage = {
  /** `forWrite`: also return the ETag a conditional write must name (a plain list read does not need one). */
  read(forWrite?: boolean): Promise<{ text: string; etag: string } | null>;
  /** `etag` null = create, and fail if it already exists. A write that lost a race throws LinkStorageConflict. */
  write(text: string, etag: string | null): Promise<void>;
};
export class LinkStorageConflict extends Error {}

const isNotFound = (error: unknown): boolean =>
  (typeof BlobNotFoundError === "function" && error instanceof BlobNotFoundError) || (error as { statusCode?: number })?.statusCode === 404;
// Two shapes of "someone else wrote first", both seen on production Oct 9 2026: the ETag no longer matches (precondition
// failed), and two conditional writes landing at the same instant ("The conditional request cannot succeed due to a
// conflicting operation against this resource"). Neither wrote anything, so both are retried on a fresh read.
const isConflict = (error: unknown): boolean =>
  (typeof BlobPreconditionFailedError === "function" && error instanceof BlobPreconditionFailedError) ||
  /precondition|already exists|conflicting operation|conditional request/i.test(error instanceof Error ? error.message : "");
// Blob turns away bursts of writes to one file with "Too many requests" (seen on production Oct 9 2026 with five deletes
// at once). Nothing was written, so it is retried like a lost race.
const isBusy = (error: unknown): boolean =>
  (typeof BlobServiceRateLimited === "function" && error instanceof BlobServiceRateLimited) ||
  /too many requests/i.test(error instanceof Error ? error.message : "");

/** A short, safe note on what storage answered, for the error line (no URLs, no query strings, no tokens). */
const storageNote = (error: unknown): string => {
  const name = error instanceof Error ? error.constructor?.name || error.name : "Error";
  const message = (error instanceof Error ? error.message : String(error)).replace(/^Vercel Blob:\s*/i, "").replace(/https?:\/\/\S+/g, "").replace(/[=?&]/g, " ").slice(0, 90);
  return `${name}: ${message}`.trim();
};

export const blobLinkStorage: LinkStorage = {
  async read(forWrite = false) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new CallDeskError("Link storage is not connected yet. Ask your administrator to finish the storage connection.", 503);
    const text = async (): Promise<string | null> => {
      const res = await get(LINKS_PATH, { access: "private", useCache: false });
      return res && res.statusCode === 200 && res.stream ? await new Response(res.stream).text() : null;
    };
    const tag = async (): Promise<string | null> => {
      try { return (await head(LINKS_PATH)).etag || ""; } catch (error) { if (isNotFound(error)) return null; throw error; }
    };
    try {
      if (!forWrite) { const body = await text(); return body === null ? null : { text: body, etag: "" }; }
      const before = await tag();
      const body = await text();
      const after = await tag();
      if (before === null && after === null && body === null) return null; // not created yet
      if (before === null || after === null || body === null || before !== after) throw new LinkStorageConflict("changed while it was being read");
      return { text: body, etag: before };
    } catch (error) {
      if (error instanceof LinkStorageConflict) throw error;
      if (isBusy(error)) throw new LinkStorageConflict("storage busy");
      if (isNotFound(error)) return null;
      throw new CallDeskError("The links could not be read right now. Please try again.");
    }
  },
  async write(text, etag) {
    const base = { access: "private" as const, contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 0 };
    try {
      if (etag) await put(LINKS_PATH, text, { ...base, ifMatch: etag });
      else if (etag === "") await put(LINKS_PATH, text, { ...base, allowOverwrite: true }); // a read that came back without an ETag: plain overwrite
      else await put(LINKS_PATH, text, { ...base, allowOverwrite: false });
    } catch (error) {
      if (isConflict(error) || isBusy(error)) throw new LinkStorageConflict("changed since it was read, or storage busy");
      throw new CallDeskError(`The link could not be saved right now. Nothing was changed; please try again. (${storageNote(error)})`);
    }
  },
};

function parse(text: string): StoredLink[] {
  let doc: Doc;
  try { doc = JSON.parse(text) as Doc; } catch { throw new CallDeskError("The saved links are unreadable. Ask your administrator to check storage.", 500); }
  if (!doc || !Array.isArray(doc.links)) throw new CallDeskError("The saved links are unreadable. Ask your administrator to check storage.", 500);
  return doc.links;
}
const shown = ({ id, name, url, note, addedBy, addedAt, updatedBy, updatedAt, rev }: StoredLink): TeamLink =>
  ({ id, name, url, note, addedBy, addedAt, rev, ...(updatedBy ? { updatedBy } : {}), ...(updatedAt ? { updatedAt } : {}) });
const toData = (links: StoredLink[]): LinksData => ({ links: links.map(shown), limits: LINK_LIMITS });
const sameUrl = (links: StoredLink[], url: string, except = "") => links.find((l) => l.id !== except && l.url === url);

/** A short, growing, jittered wait between attempts, so two people retrying do not collide again in step. */
const backoff = (attempt: number) => new Promise<void>((resolve) => setTimeout(resolve, 150 * attempt + Math.floor(Math.random() * 250)));

/**
 * Read, change, write-if-unchanged. `change` returns the new list, or the same array to mean "nothing to write"
 * (an add that is a retry of one already saved, a delete of a link already gone). Throws CallDeskError for anything
 * the person should be told.
 */
async function mutate(storage: LinkStorage, change: (links: StoredLink[]) => StoredLink[], pause = backoff): Promise<LinksData> {
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt) await pause(attempt);
    try {
      const current = await storage.read(true);
      const links = current ? parse(current.text) : [];
      const next = change(links);
      if (next === links) return toData(links);
      const doc: Doc = { version: 1, links: next };
      await storage.write(JSON.stringify(doc), current ? current.etag : null);
      return toData(doc.links);
    } catch (error) {
      if (error instanceof LinkStorageConflict) continue; // someone saved in between: apply the change to the fresh list
      throw error;
    }
  }
  throw new CallDeskError("Someone else is saving links at the same moment. Please try again.", 409);
}

export async function listLinks(storage: LinkStorage = blobLinkStorage): Promise<LinksData> {
  const current = await storage.read();
  return toData(current ? parse(current.text) : []);
}

/** Add one. `id` is made by the browser per attempt, so a retry after a dropped connection cannot add it twice. */
export async function addLink(input: unknown, who: Who, now = new Date(), storage: LinkStorage = blobLinkStorage): Promise<LinksData> {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const id = typeof raw.id === "string" ? raw.id.toLowerCase() : "";
  if (!ID.test(id)) throw new CallDeskError("Reload the page and try again.", 400);
  const checked = checkLinkFields(raw);
  if (!checked.ok) throw new CallDeskError(checked.error, 400);
  const fields = checked.value;
  return mutate(storage, (links) => {
    if (links.some((l) => l.id === id)) return links; // already saved by an earlier attempt
    const twin = sameUrl(links, fields.url);
    if (twin) throw new CallDeskError(`That link is already saved, as “${twin.name}”.`, 409);
    if (links.length >= LINK_LIMITS.count) throw new CallDeskError(`The list is full (${LINK_LIMITS.count} links). Delete a few old ones first.`, 400);
    return [{ id, ...fields, addedBy: who.name, addedByEmail: who.email, addedAt: now.toISOString(), rev: 1 }, ...links]; // new links go on top
  });
}

/** Change one's name, address or note. `rev` is the version the person was looking at. */
export async function editLink(id: string, input: unknown, who: Who, now = new Date(), storage: LinkStorage = blobLinkStorage): Promise<LinksData> {
  if (!ID.test(id)) throw new CallDeskError("That link was not found.", 404);
  const raw = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const rev = raw.rev;
  if (typeof rev !== "number" || !Number.isInteger(rev) || rev < 1) throw new CallDeskError("Reload the page and try again.", 400);
  const checked = checkLinkFields(raw);
  if (!checked.ok) throw new CallDeskError(checked.error, 400);
  const fields = checked.value;
  const key = id.toLowerCase();
  return mutate(storage, (links) => {
    const link = links.find((l) => l.id === key);
    if (!link) throw new CallDeskError("That link was deleted by someone else. The list has been refreshed.", 404);
    const unchanged = link.name === fields.name && link.url === fields.url && link.note === fields.note;
    if (unchanged) return links;
    if (link.rev !== rev) throw new CallDeskError("Someone changed this link a moment ago. The list has been refreshed; check it and try again.", 409);
    const twin = sameUrl(links, fields.url, key);
    if (twin) throw new CallDeskError(`That link is already saved, as “${twin.name}”.`, 409);
    return links.map((l) => (l.id === key ? { ...l, ...fields, updatedBy: who.name, updatedAt: now.toISOString(), rev: l.rev + 1 } : l));
  });
}

/** Delete one, at once (one click on the tab, like notes). Deleting a link that is already gone is not an error. */
export async function deleteLink(id: string, storage: LinkStorage = blobLinkStorage): Promise<LinksData> {
  if (!ID.test(id)) throw new CallDeskError("That link was not found.", 404);
  const key = id.toLowerCase();
  return mutate(storage, (links) => (links.some((l) => l.id === key) ? links.filter((l) => l.id !== key) : links));
}

/**
 * Move one link: right after `after` (another link's id), or to the top when `after` is null. Applied to the list as it
 * is now, so it never undoes a change it did not see. A move to where the link already is writes nothing.
 */
export async function moveLink(id: string, input: unknown, storage: LinkStorage = blobLinkStorage): Promise<LinksData> {
  if (!ID.test(id)) throw new CallDeskError("That link was not found.", 404);
  const raw = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  if (!("after" in raw) || (raw.after !== null && (typeof raw.after !== "string" || !ID.test(raw.after)))) throw new CallDeskError("Reload the page and try again.", 400);
  const key = id.toLowerCase();
  const after = raw.after === null ? null : (raw.after as string).toLowerCase();
  if (after === key) throw new CallDeskError("Reload the page and try again.", 400);
  return mutate(storage, (links) => {
    const moving = links.find((l) => l.id === key);
    if (!moving) throw new CallDeskError("That link was deleted by someone else. The list has been refreshed.", 404);
    const rest = links.filter((l) => l.id !== key);
    let at = 0;
    if (after !== null) {
      const anchor = rest.findIndex((l) => l.id === after);
      if (anchor < 0) throw new CallDeskError("The list changed while you were moving that link. It has been refreshed; try again.", 409);
      at = anchor + 1;
    }
    const next = [...rest.slice(0, at), moving, ...rest.slice(at)];
    return next.every((l, i) => l === links[i]) ? links : next;
  });
}
