import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/night-ride/Reveal";
import { ArrowRight, Check, Corners, GoogleG, PhoneIcon, Plus, Stars } from "@/components/night-ride/icons";
import { NAP } from "@/lib/seo";
import ClaimForm from "./ClaimForm";
import StickyCta from "./StickyCta";
import { FAQS, GOOGLE_RATING, INCLUDED, PACKAGES, REVIEWS, STEPS, WORK } from "./content";

const PHONE_DISPLAY = NAP.telephoneDisplay;
const PHONE_HREF = `tel:${NAP.telephone.replace(/[^+\d]/g, "")}`;

export const metadata: Metadata = {
    title: "Black Friday: A Free Website With Any Marketing Package",
    description:
        "This Black Friday, sign up for any Creative Cowboys marketing package and we design, write and build your website for free. Month to month. Limited spots.",
    alternates: { canonical: "/black-friday" },
    robots: { index: false, follow: true },
    openGraph: {
        title: "A Free Website With Any Marketing Package | Creative Cowboys",
        description: "Black Friday deal: we build your website free when you sign up for any marketing package. Month to month. Limited spots.",
        url: "/black-friday",
    },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function BlackFridayPage() {
    return (
        <div className="nr has-sticky">
            <noscript>
                <style>{`.nr .rv{opacity:1;transform:none;filter:none}`}</style>
            </noscript>
            <Reveal />

            {/* Top bar + hero share one backdrop: the Christmas loft set from the ads, kept faint. */}
            <div className="hero-zone">
            <div className="hero-bg" aria-hidden="true">
                <Image src="/night-ride/loft-christmas.jpg" alt="" fill priority sizes="100vw" />
            </div>

            {/* Top bar. No site navigation on purpose: this page has one job. */}
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

            {/* HERO */}
                <section className="hero">
                    <div className="wrap hero-grid">
                        <div>
                            <div className="pills">
                                <span className="pill hot">Black Friday deal</span>
                                <span className="pill">Limited spots</span>
                            </div>
                            <h1 className="h-display h1">
                                <span className="grad">A free website</span> with any marketing package.
                            </h1>
                            <p className="lede">
                                Sign up for any Creative Cowboys marketing package this Black Friday and we design, write and build your website for free.
                            </p>
                            <ul className="ticks">
                                <li><Check /> A custom website, built for your business</li>
                                <li><Check /> Month to month. No contract.</li>
                                <li><Check /> You deal with Josh and Dave directly</li>
                            </ul>
                            <div className="trust">
                                <GoogleG />
                                <Stars />
                                <span><b>{GOOGLE_RATING.stars}</b> on Google</span>
                                <span className="dotsep" />
                                <span>{GOOGLE_RATING.count} reviews</span>
                                <span className="dotsep" />
                                <span>Villa Rica, Georgia</span>
                            </div>
                        </div>
                        <ClaimForm phoneDisplay={PHONE_DISPLAY} phoneHref={PHONE_HREF} />
                    </div>
                </section>
            </div>

            <main>
                {/* WHAT'S INCLUDED */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">What you get</span>
                                <h2 className="h-display h2">The website is <span className="grad">on us</span>.</h2>
                            </div>
                            <p className="lede">A real website, built by the same two people who build our paid ones.</p>
                        </div>
                        <div className="grid-3">
                            {INCLUDED.map((item, i) => (
                                <div key={item.title} className="card feat rv" style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
                                    <span className="n">{pad(i + 1)}</span>
                                    <h3 className="h3">{item.title}</h3>
                                    <p>{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PACKAGES */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">Pick a package</span>
                                <h2 className="h-display h2">Any package gets the <span className="grad">free website</span>.</h2>
                            </div>
                            <p className="lede">Every package is month to month. Choose the one that fits how you want to bring in customers.</p>
                        </div>
                        <div className="grid-4">
                            {PACKAGES.map((p, i) => (
                                <div key={p.name} className="card pkg rv" style={{ ["--d" as string]: `${i * 70}ms` }}>
                                    <h3 className="h3">{p.name}</h3>
                                    <div className="price">{p.price} <small>{p.unit}</small></div>
                                    <p>{p.tagline}</p>
                                    <ul>
                                        {p.bullets.map((b) => <li key={b}>{b}</li>)}
                                    </ul>
                                    <div className="free">+ Free website</div>
                                </div>
                            ))}
                        </div>
                        <p className="note rv">Not sure which one fits? Pick &quot;Not sure yet&quot; on the form and we&apos;ll go through it with you on the call.</p>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">How it works</span>
                                <h2 className="h-display h2">Three steps to a <span className="grad">new site</span>.</h2>
                            </div>
                            <p className="lede">You fill in a form and take one 15-minute call. We do the building.</p>
                        </div>
                        <div className="grid-3">
                            {STEPS.map((s, i) => (
                                <div key={s.title} className="card step rv" style={{ ["--d" as string]: `${i * 90}ms` }}>
                                    <span className="big" aria-hidden="true">{pad(i + 1)}</span>
                                    <h3 className="h3">{s.title}</h3>
                                    <p>{s.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* WORK */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">Our work</span>
                                <h2 className="h-display h2">Sites we&apos;ve <span className="grad">built</span>.</h2>
                            </div>
                            <p className="lede">A few of the websites we&apos;ve designed and launched for small businesses.</p>
                        </div>
                        <div className="work">
                            {WORK.map((w, i) => (
                                <figure key={w.img} className="shot rv" style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
                                    <div className="chrome"><i /><i /><i /><span>{w.name}</span></div>
                                    <Image src={`/night-ride/work/${w.img}.jpg`} alt={w.alt} width={1200} height={750} sizes="(max-width: 760px) 100vw, (max-width: 1020px) 50vw, 400px" />
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                {/* REVIEWS */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">Google reviews</span>
                                <h2 className="h-display h2">What clients <span className="grad">say</span>.</h2>
                            </div>
                            <p className="lede">{GOOGLE_RATING.stars} stars across {GOOGLE_RATING.count} Google reviews.</p>
                        </div>
                        <div className="grid-3">
                            {REVIEWS.map((r, i) => (
                                <blockquote key={r.who} className="card quote rv" style={{ margin: 0, ["--d" as string]: `${i * 80}ms` }}>
                                    <div className="quote-top"><Stars /><GoogleG size={22} /></div>
                                    <p>&quot;{r.quote}&quot;</p>
                                    <footer><b>{r.who}</b>Google review</footer>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <div className="wrap faq">
                        <div className="faq-side rv">
                            <span className="eyebrow">Questions</span>
                            <h2 className="h-display h2">Fair <span className="grad">questions</span>.</h2>
                            <p className="lede">If yours isn&apos;t here, call us at <a href={PHONE_HREF} style={{ textDecoration: "underline" }}>{PHONE_DISPLAY}</a>.</p>
                        </div>
                        <div className="faq-list">
                            {FAQS.map((f, i) => (
                                <details key={f.q} className="rv" open={i === 0}>
                                    <summary>
                                        <span className="n">{pad(i + 1)}</span>
                                        <span className="q">{f.q}</span>
                                        <span className="pm"><Plus /></span>
                                    </summary>
                                    <div className="a"><p>{f.a}</p></div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section>
                    <div className="wrap">
                        <div className="card vf final rv">
                            <Corners />
                            <span className="pill hot">Limited spots</span>
                            <h2 className="h-display h2">Claim your <span className="grad">free website</span>.</h2>
                            <p className="lede">Fill in the form, pick a time to talk, and we&apos;ll take it from there.</p>
                            <div className="row">
                                <a href="#claim" className="btn btn-primary">Claim my free website <ArrowRight /></a>
                                <a href={PHONE_HREF} className="btn btn-ghost"><PhoneIcon /> Call {PHONE_DISPLAY}</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="foot">
                <div className="wrap foot-in">
                    <Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={600} height={114} />
                    <span>© {new Date().getFullYear()} Creative Cowboys Media. Villa Rica, Georgia.</span>
                    <nav aria-label="Legal">
                        <Link href="/privacy-policy">Privacy</Link>
                        <Link href="/legal/terms-of-service">Terms</Link>
                        <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
                    </nav>
                </div>
            </footer>

            <StickyCta />
        </div>
    );
}
