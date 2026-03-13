import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100dvh",
                background: "#0D0D0F",
                fontFamily: "var(--font-geist-sans), Arial, sans-serif",
            }}
        >
            <AdminSidebar />
            <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
                {children}
            </main>
        </div>
    );
}
