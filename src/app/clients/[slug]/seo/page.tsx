import { getClientBySlug } from "@/lib/clients";
import SEODashboard from "@/components/dashboard/SEODashboard";
import RankTrackerDashboard from "@/components/dashboard/RankTrackerDashboard";
import ReportEmbed from "@/components/dashboard/ReportEmbed";

export default async function SEOReportPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const client = getClientBySlug(slug);

    const hasLrt = !!client?.brightLocalLrtId;
    const hasGpw = !!client?.brightLocalCampaignId;

    return (
        <div>
            {/* ── Page Header ── */}
            <div style={{ marginBottom: "32px" }}>
                <span style={{
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#2A9CF1", display: "block", marginBottom: "4px",
                }}>
                    Report
                </span>
                <h2 style={{
                    fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 800,
                    color: "#fff", margin: 0, letterSpacing: "-0.02em",
                }}>
                    SEO Performance
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
                    Keyword rankings, organic traffic &amp; search visibility
                </p>
            </div>

            {/* ── Rank Tracker (Organic Keywords) ── */}
            {hasLrt ? (
                <section style={{ marginBottom: "48px" }}>
                    <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        <span style={{
                            fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
                            textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                            whiteSpace: "nowrap",
                        }}>
                            Organic Rank Tracker
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <RankTrackerDashboard
                        lrtReportId={client!.brightLocalLrtId!}
                        businessName={client!.businessName}
                    />
                </section>
            ) : null}

            {/* ── Local Pack Dashboard (GPW) ── */}
            {hasGpw ? (
                <section style={{ marginBottom: "32px" }}>
                    <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        <span style={{
                            fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
                            textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                            whiteSpace: "nowrap",
                        }}>
                            Google Local Pack
                        </span>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <SEODashboard
                        campaignId={client!.brightLocalCampaignId!}
                        businessName={client!.businessName}
                    />
                </section>
            ) : null}

            {/* ── Fallback: Looker Studio embed ── */}
            {!hasLrt && !hasGpw && (
                <ReportEmbed
                    url={client?.reports.seo}
                    title="SEO Performance Report"
                />
            )}
        </div>
    );
}
