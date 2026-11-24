import type { Metadata } from "next";
import Image from "next/image";
import { Check, PhoneIcon } from "@/components/night-ride/icons";
import { NAP } from "@/lib/seo";
import BookCall from "./BookCall";

const PHONE_DISPLAY = NAP.telephoneDisplay;
const PHONE_HREF = `tel:${NAP.telephone.replace(/[^+\d]/g, "")}`;

export const metadata: Metadata = {
    title: "Pick a Time for Your Call",
    description: "You're on the list for the Black Friday free website. Pick a time for a 15-minute call with Josh.",
    alternates: { canonical: "/black-friday/book" },
    robots: { index: false, follow: false },
};

/** Step 2 of the Black Friday claim: the visitor has sent the form and now books a call. */
export default function BlackFridayBookPage() {
    return (
        <div className="nr">
            <div className="bar wrap">
                <div className="bar-in">
                    <span className="bar-logo">
                        <Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={600} height={114} priority />
                    </span>
                    <a href={PHONE_HREF} className="btn btn-ghost">
                        <PhoneIcon /> {PHONE_DISPLAY}
                    </a>
                </div>
            </div>

            <main>
                <section className="hero">
                    <div className="wrap book-grid">
                        <div className="book-side">
                            <div className="pills">
                                <span className="pill hot">Step 2 of 2</span>
                                <span className="pill">Black Friday deal</span>
                            </div>
                            <h1 className="h-display h2">Got it. Now <span className="grad">pick a time</span>.</h1>
                            <p className="lede">We have your details. Choose a time for a 15-minute call with Josh and we&apos;ll get your free website started.</p>
                            <div className="crew">
                                <span className="faces">
                                    <Image src="/night-ride/team/josh-face.jpg" alt="Josh" width={160} height={160} />
                                </span>
                                <p>You&apos;ll talk to Josh, one of the two owners.</p>
                            </div>
                            <ul className="ticks" style={{ marginTop: 0 }}>
                                <li><Check /> He&apos;ll ask about your business and what you want the site to do</li>
                                <li><Check /> He&apos;ll help you choose the marketing package that fits</li>
                                <li><Check /> No pressure and no contract</li>
                            </ul>
                            <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                                Can&apos;t find a time that works? Call us at <a href={PHONE_HREF} style={{ color: "#f7f3f1", textDecoration: "underline" }}>{PHONE_DISPLAY}</a>.
                            </p>
                        </div>
                        <BookCall />
                    </div>
                </section>
            </main>

            <footer className="foot">
                <div className="wrap foot-in">
                    <Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={600} height={114} />
                    <span>© {new Date().getFullYear()} Creative Cowboys Media. Villa Rica, Georgia.</span>
                </div>
            </footer>
        </div>
    );
}
