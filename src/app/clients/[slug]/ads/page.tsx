import { getClientBySlug } from "@/lib/clients";
import ReportEmbed from "@/components/dashboard/ReportEmbed";

export default async function AdsReportPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const client = getClientBySlug(slug);

    return (
        <div>
            <div style={{ marginBottom: "20px" }}>
                <span
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#EA51FF",
                        display: "block",
                        marginBottom: "4px",
                    }}
                >
                    Report
                </span>
                <h2
                    style={{
                        fontSize: "clamp(20px, 2.5vw, 26px)",
                        fontWeight: 800,
                        color: "#fff",
                        margin: 0,
                        letterSpacing: "-0.02em",
                    }}
                >
                    Social Advertising
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
                    Ad spend, impressions, click-through rates & conversions
                </p>
            </div>

            <ReportEmbed
                url={client?.reports.ads}
                title="Social Advertising Report"
            />
        </div>
    );
}
