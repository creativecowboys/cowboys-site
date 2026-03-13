import Link from "next/link";
import { getAllClients } from "@/lib/clients";
import AdminDeleteButton from "@/components/dashboard/AdminDeleteButton";

export const dynamic = "force-dynamic";

function ServiceBadge({ label, color }: { label: string; color: string }) {
    return (
        <span
            style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: "6px",
                background: `${color}18`,
                color,
                border: `1px solid ${color}30`,
            }}
        >
            {label}
        </span>
    );
}

export default function AdminDashboardPage() {
    const clients = getAllClients();

    return (
        <div>
            {/* Page header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "28px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(42,156,241,0.7)", display: "block", marginBottom: "4px" }}>
                        Admin
                    </span>
                    <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                        Clients
                    </h1>
                </div>

                <Link
                    href="/admin/clients/new"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #2A9CF1 0%, #92A6DB 100%)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "13px",
                        textDecoration: "none",
                        boxShadow: "0 4px 20px rgba(42,156,241,0.25)",
                    }}
                >
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>＋</span> Add Client
                </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                {[
                    { label: "Total Clients", value: clients.length, color: "#2A9CF1" },
                    { label: "SEO Clients", value: clients.filter((c) => c.services.includes("seo")).length, color: "#22c55e" },
                    { label: "Ads Clients", value: clients.filter((c) => c.services.includes("ads")).length, color: "#f59e0b" },
                    { label: "BrightLocal Connected", value: clients.filter((c) => c.brightLocalCampaignId).length, color: "#92A6DB" },
                ].map((s) => (
                    <div
                        key={s.label}
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "12px",
                            padding: "16px 20px",
                            flex: "1 1 140px",
                        }}
                    >
                        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 6px" }}>
                            {s.label}
                        </p>
                        <p style={{ fontSize: "26px", fontWeight: 800, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Client table */}
            {clients.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 24px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                    }}
                >
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                        No clients yet. <Link href="/admin/clients/new" style={{ color: "#2A9CF1" }}>Add your first client →</Link>
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "16px",
                        overflow: "hidden",
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                {["Client", "Username", "Services", "BrightLocal ID", "Actions"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "12px 16px",
                                            textAlign: "left",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: "rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr
                                    key={client.slug}
                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                >
                                    {/* Client info */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>
                                            {client.businessName}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                                            {client.name}
                                        </p>
                                    </td>

                                    {/* Slug */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <code style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "3px 7px", borderRadius: "6px" }}>
                                            {client.slug}
                                        </code>
                                    </td>

                                    {/* Services */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                            {client.services.includes("seo") && <ServiceBadge label="SEO" color="#22c55e" />}
                                            {client.services.includes("ads") && <ServiceBadge label="Ads" color="#f59e0b" />}
                                            {client.services.length === 0 && (
                                                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>—</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* BrightLocal ID */}
                                    <td style={{ padding: "14px 16px" }}>
                                        {client.brightLocalCampaignId ? (
                                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#92A6DB" }}>
                                                #{client.brightLocalCampaignId}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>Not set</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <Link
                                                href={`/admin/clients/${client.slug}/edit`}
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: "#2A9CF1",
                                                    textDecoration: "none",
                                                    padding: "5px 12px",
                                                    borderRadius: "7px",
                                                    border: "1px solid rgba(42,156,241,0.3)",
                                                    background: "rgba(42,156,241,0.08)",
                                                    display: "inline-block",
                                                }}
                                            >
                                                Edit
                                            </Link>
                                            <AdminDeleteButton slug={client.slug} name={client.businessName} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
