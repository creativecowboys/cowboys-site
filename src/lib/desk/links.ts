import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { CallDeskError } from "@/lib/calls/validation";
import { byLinkName, checkLinkFields, LINK_LIMITS, type LinkFields } from "./link-rules";

// The Back Office Links tab (Oct 9 2026): the team's shared list of links they use often, each with a name, the
// address, an optional short note, and who added it and when. Any signed-in team member can add, change or delete.
//
// Where it lives: ONE private JSON document in the site's existing Vercel Blob store (BLOB_READ_WRITE_TOKEN, the same
// store that holds onboarding handoffs and client files), at `team/links.json`. No new service, no database.
//
// Two people saving at once cannot lose each other's change: every write is read → change → write-if-unchanged. The
// write carries the ETag that was read (`ifMatch`); if someone saved in between, Blob refuses it and the change is
// re-applied to the fresh list (a few times, then the person is asked to try again). The very first write creates the
// document only if it does not exist yet. A link's own `rev` guards an edit made from a stale screen.
export const LINKS_PATH = "team/links.json";
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ATTEMPTS = 5;

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
  read(): Promise<{ text: string; etag: string } | null>;
  /** `etag` null = create, and fail if it already exists. A write that lost a race throws LinkStorageConflict. */
  write(text: string, etag: string | null): Promise<void>;
};
export class LinkStorageConflict extends Error {}

const isConflict = (error: unknown): boolean =>
  (typeof BlobPreconditionFailedError === "function" && error instanceof BlobPreconditionFailedError) ||
  /precondition|already exists/i.test(error instanceof Error ? error.message : "");

export const blobLinkStorage: LinkStorage = {
  async read() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new CallDeskError("Link storage is not connected yet. Ask your administrator to finish the storage connection.", 503);
    try {
      const res = await get(LINKS_PATH, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200 || !res.stream) return null;
      return { text: await new Response(res.stream).text(), etag: res.blob.etag || "" };
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode === 404) return null;
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
      if (isConflict(error)) throw new LinkStorageConflict("changed since it was read");
      throw new CallDeskError("The link could not be saved right now. Nothing was changed; please try again.");
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
const toData = (links: StoredLink[]): LinksData => ({ links: [...links].sort(byLinkName).map(shown), limits: LINK_LIMITS });
const sameUrl = (links: StoredLink[], url: string, except = "") => links.find((l) => l.id !== except && l.url === url);

/**
 * Read, change, write-if-unchanged. `change` returns the new list, or the same array to mean "nothing to write"
 * (an add that is a retry of one already saved, a delete of a link already gone). Throws CallDeskError for anything
 * the person should be told.
 */
async function mutate(storage: LinkStorage, change: (links: StoredLink[]) => StoredLink[]): Promise<LinksData> {
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const current = await storage.read();
    const links = current ? parse(current.text) : [];
    const next = change(links);
    if (next === links) return toData(links);
    const doc: Doc = { version: 1, links: [...next].sort(byLinkName) };
    try {
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
    return [...links, { id, ...fields, addedBy: who.name, addedByEmail: who.email, addedAt: now.toISOString(), rev: 1 }];
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
