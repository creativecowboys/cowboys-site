import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { isTeam } from "@/lib/team-auth";
import { CallDeskError } from "@/lib/calls/validation";
import { FILE_PREFIX, readIntake } from "@/lib/onboarding/store";
import { validateItemId } from "@/lib/onboarding/validation";
import { failure, unauthorized } from "@/lib/onboarding/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stream one client file to a signed-in staff member. The key must be in this client's file index. */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isTeam())) return unauthorized();
    const id = validateItemId((await context.params).id);
    const key = new URL(req.url).searchParams.get("key") || "";
    if (!key.startsWith(FILE_PREFIX(id)) || key.includes("..")) throw new CallDeskError("File not found.", 404);
    const record = await readIntake(id);
    const file = record?.files.find((f) => f.key === key);
    if (!file) throw new CallDeskError("File not found.", 404);
    const res = await get(key, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) throw new CallDeskError("File not found.", 404);
    return new NextResponse(res.stream, { headers: { "Content-Type": file.type || "application/octet-stream", "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return failure(error); }
}
