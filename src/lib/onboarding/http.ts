import { NextResponse } from "next/server";
import { CallDeskError } from "@/lib/calls/validation";

// Shared response helpers for the team onboarding routes (route files may only export handlers).
export const teamHeaders = { "Cache-Control": "private, no-store" };

export function failure(error: unknown) {
  const known = error instanceof CallDeskError;
  return NextResponse.json({ error: known ? error.message : "This request could not be completed. Nothing was lost; please try again." }, { status: known ? error.status : 500, headers: teamHeaders });
}
export const unauthorized = () => NextResponse.json({ error: "Please sign in to the team area." }, { status: 401, headers: teamHeaders });
