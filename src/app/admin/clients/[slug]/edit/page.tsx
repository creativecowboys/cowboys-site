import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientBySlug } from "@/lib/clients";
import { updateClientAction } from "@/app/admin/actions";
import ClientForm from "@/components/dashboard/ClientForm";

export default async function EditClientPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const client = getClientBySlug(slug);
    if (!client) notFound();

    const action = updateClientAction.bind(null, slug);

    return (
        <div>
            <div style={{ marginBottom: "28px" }}>
                <Link
                    href="/admin"
                    style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}
                >
                    ← Back to Clients
                </Link>
                <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(42,156,241,0.7)", marginBottom: "4px" }}>
                    Admin
                </span>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                    Edit: {client.businessName}
                </h1>
            </div>

            <ClientForm
                action={action}
                submitLabel="Save Changes"
                defaultValues={{
                    name: client.name,
                    businessName: client.businessName,
                    slug: client.slug,
                    services: client.services,
                    brightLocalCampaignId: client.brightLocalCampaignId ?? undefined,
                    brightLocalLrtId: client.brightLocalLrtId ?? undefined,
                    seoUrl: client.reports.seo ?? "",
                    adsUrl: client.reports.ads ?? "",
                }}
                isEdit
            />
        </div>
    );
}
