import { del, get, list, put } from "@vercel/blob";
import { CallDeskError } from "@/lib/calls/validation";
import type { HandoffRecord, IntakeRecord } from "./types";

// Durable, server-only state in the site's private Vercel Blob store (BLOB_READ_WRITE_TOKEN).
// Monday stays the operational record; this holds what must never live in a public Monday field:
// handoff step state, intake tokens (hashed) and the client's saved form + file index.
// Blob has no compare-and-set. Writers are single-purpose and small; the handoff flow adds a
// process-local lock plus a Monday-side lookup before creating anything.
const PREFIX = "onboarding";
export const HANDOFF_PATH = (leadId: string) => `${PREFIX}/handoffs/${leadId}.json`;
export const INTAKE_PATH = (itemId: string) => `${PREFIX}/intake/${itemId}.json`;
export const TOKEN_PATH = (tokenHash: string) => `${PREFIX}/tokens/${tokenHash}.json`;
export const FILE_PREFIX = (itemId: string) => `${PREFIX}/files/${itemId}/`;

function storeConfigured(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new CallDeskError("File storage is not connected yet. Ask your administrator to finish the secure connection.", 503);
}

async function readText(pathname: string): Promise<string | null> {
  storeConfigured();
  try {
    const res = await get(pathname, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    return await new Response(res.stream).text();
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 404) return null;
    throw new CallDeskError("Storage could not be read right now. Please try again.");
  }
}

export async function readJson<T>(pathname: string): Promise<T | null> {
  const text = await readText(pathname);
  if (text === null) return null;
  try { return JSON.parse(text) as T; } catch { throw new CallDeskError("A stored record is unreadable. Ask your administrator to check storage."); }
}

export async function writeJson(pathname: string, value: unknown): Promise<void> {
  storeConfigured();
  try {
    await put(pathname, JSON.stringify(value), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0 });
  } catch { throw new CallDeskError("Storage could not save right now. Nothing was lost; please try again."); }
}

export async function deletePath(pathname: string): Promise<void> {
  storeConfigured();
  try { await del(pathname); } catch { /* already gone or transient; callers treat delete as best effort */ }
}

export async function listFiles(prefix: string): Promise<{ pathname: string; size: number; uploadedAt: string }[]> {
  storeConfigured();
  const out: { pathname: string; size: number; uploadedAt: string }[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 20; page++) {
    const res = await list({ prefix, cursor, limit: 500 });
    for (const b of res.blobs) out.push({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt.toISOString() });
    if (!res.hasMore || !res.cursor) break;
    cursor = res.cursor;
  }
  return out;
}

export const readHandoff = (leadId: string) => readJson<HandoffRecord>(HANDOFF_PATH(leadId));
export const writeHandoff = (record: HandoffRecord) => writeJson(HANDOFF_PATH(record.leadId), record);
export const readIntake = (itemId: string) => readJson<IntakeRecord>(INTAKE_PATH(itemId));
export const writeIntake = (record: IntakeRecord) => writeJson(INTAKE_PATH(record.itemId), record);
export const readTokenIndex = (tokenHash: string) => readJson<{ itemId: string }>(TOKEN_PATH(tokenHash));
export const writeTokenIndex = (tokenHash: string, itemId: string) => writeJson(TOKEN_PATH(tokenHash), { itemId });
export const deleteTokenIndex = (tokenHash: string) => deletePath(TOKEN_PATH(tokenHash));
