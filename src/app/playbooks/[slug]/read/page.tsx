import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";
import { PLAYBOOKS } from "@/lib/playbooks";

/**
 * The read page: where the delivery text and email send people. The PDF sits
 * in the browser under a slim bar with a Download button, so nobody has to
 * hunt for a save option inside a PDF viewer.
 *
 * Phones do not render PDFs inside an iframe (iOS shows page one only,
 * Android downloads it), so under md the page shows the cover with two big
 * buttons instead: open the PDF in the phone's own viewer, or download it.
 */

export function generateStaticParams() {
    return Object.keys(PLAYBOOKS)
        .filter((slug) => PLAYBOOKS[slug].pdfUrl)
        .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const pb = PLAYBOOKS[slug];
    if (!pb) return {};
    return {
        title: pb.title,
        description: pb.sub,
        robots: { index: false, follow: false },
    };
}

const BTN =
    "inline-flex items-center justify-center gap-2 font-anton tracking-[1.5px] uppercase border-[2.5px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all";

export default async function PlaybookReadPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pb = PLAYBOOKS[slug];
    if (!pb || !pb.pdfUrl) notFound();

    const pdfPath = new URL(pb.pdfUrl).pathname;
    const fileName = `${pb.title.replace(/[^A-Za-z0-9 ]/g, "")}.pdf`;

    return (
        <div className="font-inter bg-[#F2EBDA] text-[#0a0a0a] h-[100dvh] flex flex-col">
            <header className="bg-[#0a0a0a] border-b-4 border-[#B5330E] px-4 md:px-8 py-3 shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="shrink-0 select-none" prefetch={false}>
                            <Image
                                src="/Cowboys logo script 2026 v2.png"
                                alt="Creative Cowboys"
                                width={380}
                                height={110}
                                priority
                                className="w-28 sm:w-36 h-auto object-contain"
                                style={{ filter: "brightness(0) invert(1)" }}
                            />
                        </Link>
                        <span className="hidden md:inline text-[#F2EBDA]/80 text-sm truncate">{pb.title}</span>
                    </div>
                    <a
                        href={pdfPath}
                        download={fileName}
                        className={`${BTN} bg-[#B5330E] text-white border-[#F2EBDA] shadow-[4px_4px_0px_#F2EBDA] hover:shadow-[6px_6px_0px_#F2EBDA] px-4 md:px-6 py-2.5 text-xs md:text-sm whitespace-nowrap`}
                    >
                        <Download size={16} />
                        Download PDF
                    </a>
                </div>
            </header>

            {/* Desktop and tablet: the PDF fills the rest of the screen. */}
            <div className="hidden md:block flex-1 min-h-0 bg-[#3a3a3a]">
                <iframe
                    src={`${pdfPath}#view=FitH`}
                    title={pb.title}
                    className="w-full h-full border-0 block"
                />
            </div>

            {/* Phones: cover plus the two buttons. */}
            <main className="md:hidden flex-1 overflow-y-auto px-5 py-8">
                <div className="max-w-sm mx-auto flex flex-col items-center text-center gap-6">
                    {pb.mockup ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pb.mockup} alt={pb.title} className="w-56 h-auto" loading="eager" />
                    ) : null}
                    <div>
                        <p className="font-anton text-[12px] tracking-[3px] uppercase text-[#B5330E]">{pb.eyebrow}</p>
                        <h1 className="font-anton text-3xl leading-tight mt-2">{pb.title}</h1>
                        <p className="mt-3 text-[15px] text-[#0a0a0a]/75">
                            Open it here on your phone, or download it so it&apos;s in your files when you&apos;re out of signal.
                        </p>
                    </div>
                    <div className="w-full flex flex-col gap-4">
                        <a href={pdfPath} target="_blank" rel="noopener" className={`${BTN} bg-[#B5330E] text-white px-6 py-4 text-base`}>
                            <ExternalLink size={18} />
                            Open the playbook
                        </a>
                        <a href={pdfPath} download={fileName} className={`${BTN} bg-[#F5C842] text-[#0a0a0a] px-6 py-4 text-base`}>
                            <Download size={18} />
                            Download the PDF
                        </a>
                    </div>
                    <p className="text-xs text-[#0a0a0a]/55">
                        Questions? Call <a href="tel:4702437517" className="underline">(470) 243-7517</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}
