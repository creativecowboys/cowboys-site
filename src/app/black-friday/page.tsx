import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PromoVideo from "@/components/night-ride/PromoVideo";
import Reveal from "@/components/night-ride/Reveal";
import { ArrowRight, Check, Corners, GoogleG, PhoneIcon, Plus, Stars } from "@/components/night-ride/icons";
import { NAP } from "@/lib/seo";
import ClaimForm from "./ClaimForm";
import StickyCta from "./StickyCta";
import { CREW, CREW_FACTS, FAQS, GOOGLE_RATING, INCLUDED, PACKAGES, PROOF, TIMELINE, VIDEO, VIDEO_POINTS, WORK, WHY } from "./content";

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
                            <h1 className="h-display h1 h1-long">
                                <span>A website that makes you money.</span> <span className="grad">Free with any marketing package.</span>
                            </h1>
                            <p className="lede">
                                This Black Friday, sign up for any Creative Cowboys marketing package and we design, write and build your custom website free. Our websites normally start at $997.
                            </p>
                            <ul className="ticks">
                                <li><Check /> Built to turn visitors into calls and customers</li>
                                <li><Check /> One 15-minute call. We design, write and launch it.</li>
                                <li><Check /> Month to month. No contract.</li>
                            </ul>
                            <div className="trust">
                                <GoogleG />
                                <Stars />
                                <span><b>{GOOGLE_RATING.stars}</b> on Google</span>
                                <span className="dotsep" />
                                <span>{GOOGLE_RATING.count} reviews</span>
                                <span className="dotsep" />
                                <span><b>99%</b> of clients stay</span>
                            </div>
                        </div>
                        <ClaimForm phoneDisplay={PHONE_DISPLAY} phoneHref={PHONE_HREF} />
                    </div>

                    {/* Proof straight after the promise: outcome quotes from Google reviews. */}
                    <div className="wrap proof-strip">
                        {PROOF.map((r) => (
                            <blockquote key={r.who} className="card pq">
                                <div className="pq-top"><Stars /><GoogleG size={18} /></div>
                                <p>&ldquo;{r.quote}&rdquo;</p>
                                <footer><b>{r.who}</b> · Google review</footer>
                            </blockquote>
                        ))}
                    </div>
                </section>
            </div>

            <main>
                {/* WHO YOU WORK WITH */}
                <section>
                    <div className="wrap why">
                        <div className="why-head rv">
                            <span className="eyebrow">Who you&apos;ll work with</span>
                            <h2 className="h-display h2">Meet <span className="grad">Josh and Dave</span>.</h2>
                            <p className="lede">
                                We run Creative Cowboys out of Villa Rica, Georgia. The people you meet on the first call are the people who build your site and run your marketing.
                            </p>
                        </div>
                        <div className="why-cards">
                            {CREW.map((c, i) => (
                                <figure key={c.img} className="card person rv" style={{ ["--d" as string]: `${i * 120}ms` }}>
                                    <div className="photo vf">
                                        <Corners />
                                        <Image src={`/night-ride/team/${c.img}.jpg`} alt={c.alt} width={800} height={1000} sizes="(max-width: 1020px) 50vw, 300px" />
                                        <span className="stamp mono">NO. {pad(i + 1)} · VILLA RICA</span>
                                    </div>
                                    <figcaption>
                                        <h3 className="h3">{c.name}</h3>
                                        <p>{c.role}</p>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                        <div className="why-points">
                            <div className="why-list">
                                {WHY.map((w, i) => (
                                    <div key={w.title} className="why-item rv" style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}>
                                        <span className="n mono">{pad(i + 1)}</span>
                                        <h3 className="h3">{w.title}</h3>
                                        <p>{w.body}</p>
                                        <blockquote>
                                            &ldquo;{w.quote}&rdquo;
                                            <cite>{w.who}, Google review</cite>
                                        </blockquote>
                                    </div>
                                ))}
                            </div>
                            <div className="facts rv">
                                {CREW_FACTS.map((f) => (
                                    <div key={f.label}>
                                        <span>{f.label}</span>
                                        <b>{f.value}</b>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* WHAT'S INCLUDED */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">What you get</span>
                                <h2 className="h-display h2">The website is <span className="grad">on us</span>.</h2>
                            </div>
                            <p className="lede">The same custom website we sell from $997. With any marketing package this Black Friday, it costs you $0.</p>
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

                {/* WORK */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">Our work</span>
                                <h2 className="h-display h2">Sites we&apos;ve <span className="grad">built</span>.</h2>
                            </div>
                            <p className="lede">A few of the websites we&apos;ve designed for small businesses.</p>
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

                {/* WHAT HAPPENS, AND WHEN: how long it takes and how little the client has to do */}
                <section>
                    <div className="wrap">
                        <div className="head rv">
                            <div>
                                <span className="eyebrow">What happens, and when</span>
                                <h2 className="h-display h2">From this form to a <span className="grad">live website</span>.</h2>
                            </div>
                            <p className="lede">Your part is about a minute now and one 15-minute call. We do the building.</p>
                        </div>
                        <div className="grid-4">
                            {TIMELINE.map((t, i) => (
                                <div key={t.title} className="card tline rv" style={{ ["--d" as string]: `${i * 80}ms` }}>
                                    <span className="when mono">{pad(i + 1)} · {t.when.toUpperCase()}</span>
                                    <h3 className="h3">{t.title}</h3>
                                    <p>{t.body}</p>
                                    <div className="yours"><span>Your part</span>{t.yours}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* WHY IT MATTERS: the video sells the marketing package right before the prices.
                    It ends on "sign up from the link below", so the claim button sits under it. */}
                <section>
                    <div className="wrap vid">
                        <div className="vid-head rv">
                            <span className="eyebrow">Why it matters</span>
                            <h2 className="h-display h2">Why the <span className="grad">marketing package</span> matters.</h2>
                            <p className="lede">Dave explains it in 48 seconds.</p>
                        </div>
                        <div className="vid-media rv">
                            <PromoVideo {...VIDEO} />
                            <a href="#claim" className="btn btn-primary btn-block">Claim my spot <ArrowRight /></a>
                        </div>
                        <div className="vid-points">
                            {VIDEO_POINTS.map((v, i) => (
                                <div key={v.title} className="vid-point rv" style={{ ["--d" as string]: `${i * 80}ms` }}>
                                    <span className="n mono">{pad(i + 1)}</span>
                                    <div>
                                        <h3 className="h3">{v.title}</h3>
                                        <p>{v.body}</p>
                                    </div>
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
                            <p className="lede">Most businesses start with Local Growth. Every package is month to month, with no contract.</p>
                        </div>
                        <div className="pkgs">
                            {PACKAGES.map((p, i) => (
                                <div key={p.name} className={`card pkg rv${p.featured ? " pkg-main vf" : ""}`} style={{ ["--d" as string]: `${i * 70}ms` }}>
                                    {p.featured && <Corners />}
                                    {p.badge && <span className="pill hot">{p.badge}</span>}
                                    <h3 className="h3">{p.name}</h3>
                                    <div className="price">{p.price} {p.unit && <small>{p.unit}</small>}</div>
                                    <p>{p.tagline}</p>
                                    <ul>
                                        {p.bullets.map((b) => <li key={b}>{b}</li>)}
                                    </ul>
                                    {p.note && <p className="roi"><Check /> {p.note}</p>}
                                    <div className="free">+ Free website <span>(normally from $997)</span></div>
                                </div>
                            ))}
                        </div>
                        <p className="note rv">Not sure which one fits? Pick &quot;Not sure yet&quot; on the form and we&apos;ll go through it with you on the call.</p>
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
