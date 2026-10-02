// TEST ONLY. An in-memory stand-in for "@vercel/blob" — scripts/test-desk.cjs points that import here, so
// src/lib/onboarding/store.ts and intake.ts run unchanged under test. Never imported by application code.
type Entry = { body: string; contentType: string; uploadedAt: Date };
const store = new Map<string, Entry>();

export const blobReset = (): void => { store.clear(); };
export const blobKeys = (): string[] => [...store.keys()].sort();
export const blobText = (pathname: string): string | null => store.get(pathname)?.body ?? null;
export const blobJson = <T>(pathname: string): T | null => { const t = blobText(pathname); return t === null ? null : (JSON.parse(t) as T); };
export const blobSeed = (pathname: string, value: unknown, contentType = "application/json"): void => { store.set(pathname, { body: typeof value === "string" ? value : JSON.stringify(value), contentType, uploadedAt: new Date("2026-09-25T12:00:00.000Z") }); };

export async function put(pathname: string, body: string | Buffer, options?: { contentType?: string }): Promise<{ pathname: string; url: string }> {
  store.set(pathname, { body: String(body), contentType: options?.contentType || "application/octet-stream", uploadedAt: new Date() });
  return { pathname, url: `blob://${pathname}` };
}
export async function get(pathname: string): Promise<{ statusCode: number; stream: ReadableStream<Uint8Array> | null } | null> {
  const hit = store.get(pathname);
  if (!hit) throw Object.assign(new Error("not found"), { statusCode: 404 });
  return { statusCode: 200, stream: new Response(hit.body).body };
}
export async function head(pathname: string): Promise<{ size: number; contentType: string; uploadedAt: Date }> {
  const hit = store.get(pathname);
  if (!hit) throw Object.assign(new Error("not found"), { statusCode: 404 });
  return { size: Buffer.byteLength(hit.body), contentType: hit.contentType, uploadedAt: hit.uploadedAt };
}
export async function del(pathname: string | string[]): Promise<void> {
  for (const p of Array.isArray(pathname) ? pathname : [pathname]) store.delete(p);
}
export async function list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{ blobs: { pathname: string; size: number; uploadedAt: Date }[]; hasMore: boolean; cursor?: string }> {
  const blobs = [...store.entries()].filter(([k]) => !options?.prefix || k.startsWith(options.prefix)).map(([pathname, e]) => ({ pathname, size: Buffer.byteLength(e.body), uploadedAt: e.uploadedAt }));
  return { blobs, hasMore: false };
}
