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
            {/* Hide the global TopBar on client dashboard pages */}
            <style>{`.topbar-hide-mobile { display: none !important; }`}</style>
            <div style={{ display: "flex", minHeight: "100dvh", background: "#0D0D0F", fontFamily: "var(--font-geist-sans), Arial, sans-serif" }}>
                <DashboardSidebar slug={slug} />

                {/* Main area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                    {/* Page content */}
                    <main style={{ flex: 1, overflow: "hidden", padding: 0 }}>
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
