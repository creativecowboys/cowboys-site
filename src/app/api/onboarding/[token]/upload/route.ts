import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { CallDeskError } from "@/lib/calls/validation";
import { UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@/lib/onboarding/config";
import { filePathFor, indexFile, resolveToken } from "@/lib/onboarding/intake";
import { FILE_PREFIX } from "@/lib/onboarding/store";
import { validateFileCategory, validateToken } from "@/lib/onboarding/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

// Browser → Blob direct upload. This route only mints a short-lived, client-scoped upload token:
// the pathname must sit under this client's own prefix and category, with size/type limits.
// onUploadCompleted indexes the file; the page also calls /files afterwards in case that webhook
// cannot reach a preview or local environment.
export async function POST(req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) throw new CallDeskError("Uploads must come from the intake page.", 403);
    const token = validateToken((await context.params).token);
    const body = (await req.json()) as HandleUploadBody;
    const result = await handleUpload({
      request: req, body, token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const record = await resolveToken(token);
        let payload: { category?: unknown; name?: unknown } = {};
        try { payload = JSON.parse(clientPayload || "{}"); } catch { throw new CallDeskError("Choose where this file belongs.", 400); }
        const category = validateFileCategory(payload.category);
        const name = typeof payload.name === "string" ? payload.name : "";
        const expected = filePathFor(record.itemId, category, name || pathname);
        if (pathname !== expected || !pathname.startsWith(`${FILE_PREFIX(record.itemId)}${category}/`)) throw new CallDeskError("That file path is not allowed.", 400);
        if (record.files.length >= 200) throw new CallDeskError("This intake already holds 200 files. Ask your contact to clear space.", 400);
        return { allowedContentTypes: UPLOAD_TYPES, maximumSizeInBytes: UPLOAD_MAX_BYTES, addRandomSuffix: true, allowOverwrite: false, validUntil: Date.now() + 10 * 60_000, tokenPayload: JSON.stringify({ itemId: record.itemId, category, name: name || pathname.split("/").pop() }) };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const p = JSON.parse(tokenPayload || "{}") as { itemId?: string; category?: unknown; name?: string };
          if (p.itemId) await indexFile(p.itemId, blob.pathname, validateFileCategory(p.category), p.name || "");
        } catch { /* the page re-indexes on completion; nothing to do here */ }
      },
    });
    return NextResponse.json(result, { headers });
  } catch (error) {
    const known = error instanceof CallDeskError;
    return NextResponse.json({ error: known ? error.message : "The upload could not start. Please try again." }, { status: known ? error.status : 400, headers });
  }
}
