import Link from "next/link";
import { createClientAction } from "@/app/admin/actions";
import ClientForm from "@/components/dashboard/ClientForm";

export default function NewClientPage() {
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
                    Add New Client
                </h1>
            </div>

            <ClientForm action={createClientAction} submitLabel="Create Client" />
        </div>
    );
}
