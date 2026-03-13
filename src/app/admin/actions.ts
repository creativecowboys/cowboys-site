"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
    createClient,
    updateClient,
    deleteClient,
    clientSlugExists,
    getClientBySlug,
} from "@/lib/clients";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function parseServices(formData: FormData): ("seo" | "ads")[] {
    const services: ("seo" | "ads")[] = [];
    if (formData.get("service_seo")) services.push("seo");
    if (formData.get("service_ads")) services.push("ads");
    return services;
}

// ─── Create Client ────────────────────────────────────────────────────────────

export async function createClientAction(formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    const businessName = (formData.get("businessName") as string)?.trim();
    const slugInput = (formData.get("slug") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    const brightLocalId = formData.get("brightLocalCampaignId") as string;
    const brightLocalLrtId = formData.get("brightLocalLrtId") as string;
    const seoUrl = (formData.get("seoUrl") as string)?.trim() || "";
    const adsUrl = (formData.get("adsUrl") as string)?.trim() || "";

    if (!name || !businessName || !slugInput || !password) {
        throw new Error("Name, business name, username, and password are required.");
    }

    const slug = slugify(slugInput);
    if (!slug) throw new Error("Invalid username — use letters, numbers, and hyphens only.");
    if (clientSlugExists(slug)) throw new Error(`Username "${slug}" is already taken.`);

    const passwordHash = await bcrypt.hash(password, 10);

    createClient({
        slug,
        name,
        businessName,
        services: parseServices(formData),
        passwordHash,
        reports: { seo: seoUrl, ads: adsUrl },
        brightLocalCampaignId: brightLocalId ? parseInt(brightLocalId, 10) : null,
        brightLocalLrtId: brightLocalLrtId ? parseInt(brightLocalLrtId, 10) : null,
    });

    revalidatePath("/admin");
    redirect("/admin");
}

// ─── Update Client ────────────────────────────────────────────────────────────

export async function updateClientAction(slug: string, formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    const businessName = (formData.get("businessName") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    const brightLocalId = formData.get("brightLocalCampaignId") as string;
    const brightLocalLrtId = formData.get("brightLocalLrtId") as string;
    const seoUrl = (formData.get("seoUrl") as string)?.trim() || "";
    const adsUrl = (formData.get("adsUrl") as string)?.trim() || "";

    if (!name || !businessName) {
        throw new Error("Name and business name are required.");
    }

    const existing = getClientBySlug(slug);
    if (!existing) throw new Error(`Client not found: ${slug}`);

    const updates: Parameters<typeof updateClient>[1] = {
        name,
        businessName,
        services: parseServices(formData),
        reports: { seo: seoUrl, ads: adsUrl },
        brightLocalCampaignId: brightLocalId ? parseInt(brightLocalId, 10) : null,
        brightLocalLrtId: brightLocalLrtId ? parseInt(brightLocalLrtId, 10) : null,
    };

    // Only re-hash password if a new one was provided
    if (password) {
        updates.passwordHash = await bcrypt.hash(password, 10);
    }

    updateClient(slug, updates);
    revalidatePath("/admin");
    redirect("/admin");
}

// ─── Delete Client ────────────────────────────────────────────────────────────

export async function deleteClientAction(slug: string) {
    deleteClient(slug);
    revalidatePath("/admin");
}
