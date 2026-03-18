import { getClientBySlug } from "@/lib/clients";
import ReportEmbed from "@/components/dashboard/ReportEmbed";

export default async function SEOReportPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const client = getClientBySlug(slug);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <ReportEmbed
                url={client?.reports.seo}
                title="SEO Dashboard"
            />
        </div>
    );
}
