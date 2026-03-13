/**
 * Client Store
 * ------------
 * Runtime reader/writer for src/data/clients.json.
 * SERVER-SIDE ONLY — uses Node.js `fs` module.
 *
 * Update clients via the Admin Panel at /admin
 * or by editing src/data/clients.json directly.
 */
import "server-only";
import fs from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientReport {
    seo?: string;
    ads?: string;
}

export interface Client {
    slug: string;
    name: string;
    businessName: string;
    services: ("seo" | "ads")[];
    passwordHash: string;
    reports: ClientReport;
    brightLocalCampaignId?: number | null;
    brightLocalLrtId?: number | null;
}

// ─── File Path ────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "src", "data", "clients.json");

// ─── Read / Write ─────────────────────────────────────────────────────────────

export function getAllClients(): Client[] {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(raw) as Client[];
    } catch {
        return [];
    }
}

export function saveAllClients(clients: Client[]): void {
    fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2), "utf-8");
}

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

export function getClientBySlug(slug: string): Client | undefined {
    return getAllClients().find((c) => c.slug === slug);
}

export function getClientByUsername(username: string): Client | undefined {
    // Username is the client slug
    return getAllClients().find((c) => c.slug === username);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function createClient(client: Client): void {
    const clients = getAllClients();
    clients.push(client);
    saveAllClients(clients);
}

export function updateClient(slug: string, updates: Partial<Client>): void {
    const clients = getAllClients();
    const idx = clients.findIndex((c) => c.slug === slug);
    if (idx === -1) throw new Error(`Client not found: ${slug}`);
    clients[idx] = { ...clients[idx], ...updates };
    saveAllClients(clients);
}

export function deleteClient(slug: string): void {
    const clients = getAllClients().filter((c) => c.slug !== slug);
    saveAllClients(clients);
}

export function clientSlugExists(slug: string): boolean {
    return getAllClients().some((c) => c.slug === slug);
}
