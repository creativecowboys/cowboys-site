import { CallDeskError } from "@/lib/calls/validation";

// Generic Monday GraphQL call for the onboarding module. Kept separate from src/lib/calls/monday.ts so
// the sales desk stays untouched. Same token, same rules: server only, no automatic retries.
const API_VERSION = "2026-07";

export function mondayToken(): string {
  const value = process.env.MONDAY_API_TOKEN;
  if (!value) throw new CallDeskError("Monday is not connected yet. Ask your administrator to finish the secure connection.", 503);
  return value;
}

export class MondayError extends CallDeskError {
  constructor(message: string, public readonly detail?: string) { super(message, 502); }
}

export async function monday<T>(query: string, variables: Record<string, unknown> = {}, timeoutMs = 15000): Promise<T> {
  const auth = mondayToken();
  let detail = "";
  try {
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST", headers: { Authorization: auth, "Content-Type": "application/json", "API-Version": API_VERSION },
      body: JSON.stringify({ query, variables }), cache: "no-store", signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) { detail = `http ${response.status}`; throw new Error(detail); }
    const result = await response.json() as { data?: T; errors?: { message?: string }[] };
    if (!result.data || result.errors?.length) { detail = result.errors?.map((e) => e.message).join("; ") || "empty"; throw new Error(detail); }
    return result.data;
  } catch (error) {
    // Never log the token or the variables (they can carry client details).
    throw new MondayError("Monday could not complete this request. Nothing was lost; please try again.", detail || (error instanceof Error ? error.name : "error"));
  }
}

export const todayEastern = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\n/g, "<br>");
