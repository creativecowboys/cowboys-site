import { NextRequest, NextResponse } from "next/server";
import { get, put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The winner-draw entry list, saved so a CSV loaded on one device shows up on
 * another (desktop → phone).
 *
 * Only business name, type and city are stored — what the stage shows. Contact
 * details stay in the Sheet. The draw page has no login, so anyone with the URL
 * can read or replace this list; the panel shows when it was saved and how many
 * businesses it holds so a swap is visible before a take.
 */

const PATH = "giveaway/draw-list.json";
const MAX_ENTRIES = 5000;
const MAX_LEN = 200;

type Row = { business: string; type: string; city: string };

const clean = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX_LEN) : "");

export async function GET() {
    try {
        const res = await get(PATH, { access: "private", useCache: false });
        if (!res || res.statusCode !== 200) return NextResponse.json({ entries: null });
        return new NextResponse(res.stream, {
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
    } catch (err) {
        console.error("draw-list read failed:", err);
        return NextResponse.json({ entries: null });
    }
}

export async function PUT(request: NextRequest) {
    let body: { entries?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    if (!Array.isArray(body.entries) || body.entries.length > MAX_ENTRIES) {
        return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const entries: Row[] = body.entries
        .map((e: Record<string, unknown>) => ({ business: clean(e?.business), type: clean(e?.type), city: clean(e?.city) }))
        .filter((e) => e.business);
    const savedAt = new Date().toISOString();

    try {
        await put(PATH, JSON.stringify({ entries, savedAt }), {
            access: "private",
            contentType: "application/json",
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60,
        });
        return NextResponse.json({ ok: true, count: entries.length, savedAt });
    } catch (err) {
        console.error("draw-list save failed:", err);
        return NextResponse.json({ error: "save_failed" }, { status: 502 });
    }
}
