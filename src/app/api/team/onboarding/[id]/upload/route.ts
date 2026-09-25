import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isTeam } from "@/lib/team-auth";
import { CallDeskError } from "@/lib/calls/validation";
import { UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@/lib/onboarding/config";
import { ensureIntake, filePathFor, indexFile } from "@/lib/onboarding/intake";
import { FILE_PREFIX } from "@/lib/onboarding/store";
import { validateFileCategory, validateItemId } from "@/lib/onboarding/validation";
import { teamHeaders } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Staff upload into a client's file store (same prefix and limits as the client's own intake page).
// Token requests need the team cookie; the upload-completed callback comes from Vercel without one and
// is authenticated by handleUpload's own signature instead.
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const id = validateItemId((await context.params).id);
    const body = (await req.json()) as HandleUploadBody;
    if (body.type === "blob.generate-client-token") {
      if (!(await isTeam())) return NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers: teamHeaders });
      const origin = req.headers.get("origin");
      if (origin && origin !== new URL(req.url).origin) throw new CallDeskError("Uploads must come from the team desk.", 403);
    }
    const result = await handleUpload({
      request: req, body, token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const record = await ensureIntake(id);
        let payload: { category?: unknown; name?: unknown } = {};
        try { payload = JSON.parse(clientPayload || "{}"); } catch { throw new CallDeskError("Choose where this file belongs.", 400); }
        const category = validateFileCategory(payload.category);
        const name = typeof payload.name === "string" ? payload.name : "";
        if (pathname !== filePathFor(id, category, name || pathname) || !pathname.startsWith(`${FILE_PREFIX(id)}${category}/`)) throw new CallDeskError("That file path is not allowed.", 400);
        if (record.files.length >= 200) throw new CallDeskError("This client already holds 200 files.", 400);
        return { allowedContentTypes: UPLOAD_TYPES, maximumSizeInBytes: UPLOAD_MAX_BYTES, addRandomSuffix: true, allowOverwrite: false, validUntil: Date.now() + 10 * 60_000, tokenPayload: JSON.stringify({ itemId: id, category, name: name || pathname.split("/").pop() }) };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try { const p = JSON.parse(tokenPayload || "{}") as { itemId?: string; category?: unknown; name?: string }; if (p.itemId === id) await indexFile(id, blob.pathname, validateFileCategory(p.category), p.name || ""); } catch { /* the desk re-indexes on completion */ }
      },
    });
    return NextResponse.json(result, { headers: teamHeaders });
  } catch (error) {
    const known = error instanceof CallDeskError;
    return NextResponse.json({ error: known ? error.message : "The upload could not start. Please try again." }, { status: known ? error.status : 400, headers: teamHeaders });
  }
}
