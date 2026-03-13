import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getClientBySlug } from "@/lib/clients";
import ServiceCard from "@/components/dashboard/ServiceCard";

const serviceCardDefs = [
    {
        key: "seo",
        label: "SEO Performance",
        emoji: "🔍",
        description: "Keyword rankings, organic traffic, and search visibility trends.",
        color: "#2A9CF1",
        hrefFn: (slug: string) => `/clients/${slug}/seo`,
    },
    {
        key: "ads",
        label: "Social Advertising",
        emoji: "📣",
        description: "Ad spend, impressions, click-through rates, and conversion data.",
        color: "#EA51FF",
        hrefFn: (slug: string) => `/clients/${slug}/ads`,
    },
];

export default async function DashboardOverviewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const client = getClientBySlug(slug);

    if (!client) return null;

    const activeCards = serviceCardDefs.filter((c) =>
        client.services.includes(c.key as "seo" | "ads")
    );

    return (
        <div>
            {/* Welcome */}
            <div style={{ marginBottom: "32px" }}>
                <h2
                    style={{
                        fontSize: "clamp(22px, 3vw, 30px)",
                        fontWeight: 800,
                        color: "#fff",
                        margin: "0 0 6px",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Welcome back,{" "}
                    <span
                        style={{
                            background: "linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {session?.user?.name}
                    </span>
                </h2>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                    Here&apos;s your marketing performance at a glance. Select a report below.
                </p>
            </div>

            {/* Service Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                    marginBottom: "40px",
                }}
            >
                {activeCards.map((card) => (
                    <ServiceCard
                        key={card.key}
                        label={card.label}
                        emoji={card.emoji}
                        description={card.description}
                        color={card.color}
                        href={card.hrefFn(slug)}
                    />
                ))}
            </div>

            {/* Partnership note */}
            <div
                style={{
                    background: "rgba(241,95,42,0.06)",
                    border: "1px solid rgba(241,95,42,0.15)",
                    borderRadius: "12px",
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                }}
            >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>🤠</span>
                <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: "0 0 2px" }}>
                        Questions about your results?
                    </p>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                        Reach out any time at{" "}
                        <a href="mailto:howdy@creativecowboys.co" style={{ color: "#F15F2A", textDecoration: "none" }}>
                            howdy@creativecowboys.co
                        </a>
                        . We review your campaigns weekly.
                    </p>
                </div>
            </div>
        </div>
    );
}
