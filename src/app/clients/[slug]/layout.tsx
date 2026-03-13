import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getClientBySlug } from "@/lib/clients";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AuthProvider from "@/components/dashboard/AuthProvider";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    // Verify logged-in user owns this slug
    // @ts-ignore
    const sessionSlug = session?.user?.slug;
    if (!session || sessionSlug !== slug) {
        redirect("/clients/login");
    }

    const client = getClientBySlug(slug);
    if (!client) {
        redirect("/clients/login");
    }

    return (
        <AuthProvider>
            <div style={{ display: "flex", minHeight: "100dvh", background: "#0D0D0F", fontFamily: "var(--font-geist-sans), Arial, sans-serif" }}>
                <DashboardSidebar slug={slug} />

                {/* Main area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Header bar */}
                    <header
                        style={{
                            padding: "16px 28px",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(255,255,255,0.02)",
                            flexShrink: 0,
                        }}
                    >
                        <div>
                            <h1 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>
                                {client.businessName}
                            </h1>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                                }}
                            />
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                                Live
                            </span>
                        </div>
                    </header>

                    {/* Page content */}
                    <main style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
