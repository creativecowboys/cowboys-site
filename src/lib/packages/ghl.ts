// Package-builder import path kept for the three /api/team/packages routes. The implementation moved to
// src/lib/ghl/client.ts (Oct 1 2026) — one GHL client for the whole site. Add new GHL code there, not here.
export { ghl, ghlLocationId, ghlUserId, GhlError, GHL_APP, INVOICE_HOST, addNote, addTask, slimContact, listContacts } from "@/lib/ghl/client";
export type { GhlContact } from "@/lib/ghl/client";
