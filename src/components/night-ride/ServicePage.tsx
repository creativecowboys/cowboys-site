import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { nightRideFonts } from "./fonts";
import { type ClientVideo, GOOGLE_RATING, PROOF, TIMELINE } from "./home-content";
import HomeEffects from "./HomeEffects";
import { GoogleG, Stars } from "./icons";
import PromoVideo from "./PromoVideo";
import { ReviewsMarquee, WorkGrid } from "./Proof";
import type { ServiceResult } from "./service-content";
import { NrBanner, NrFooter, NrNav, NrSprite } from "./Shell";
import "./home.css";
import "./service.css";

/**
 * One layout for every service page in the Night Ride look. It follows the same order as the
 * homepage and the Black Friday page: the promise, proof straight after it, what you get, results,
 * what happens and when, the price, questions, then the form.
 *
 * The page is server-rendered. HomeEffects adds the proposal form (opened by any
 * `data-proposal` button) and the footer wordmark fit. The form has no phone field: the
 * GoHighLevel chat widget on the homepage has to stay the only place the site collects a phone
 * number for texting (A2P 10DLC registration).
 */

export type ServiceItem = { label: string; desc: string; tag?: string; href?: string };
export type ServiceBlock = {
  id?: string;
  eyebrow: string;
  heading: ReactNode;
  lede?: ReactNode;
  items: ServiceItem[];
  cols?: 2 | 3 | 4;
};
export type ServiceStep = { when: string; title: string; body: string; yours?: string };
export type ServiceFaq = { q: string; a: ReactNode };

export type ServicePageData = {
  /** short id used in the lead source, e.g. "web_design" */
  slug: string;
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  subhead: ReactNode;
  /** short proof points shown as pills under the hero buttons */
  pills?: string[];
  secondary?: { label: string; href: string };
  /** faint hero background. Each page gets its own picture; the homepage loft is only the fallback. */
  heroImage?: { src: string; position?: string };
  /** review lines under the hero, word for word from Google. Defaults to the homepage three. */
  proof?: Array<{ who: string; quote: string }>;
  /** client testimonial videos, shown straight after the review lines */
  videos?: ClientVideo[];
  /** show the six sites we built, after the results */
  work?: { heading: ReactNode; lede: string };
  /** show the scrolling Google reviews before the FAQ */
  reviews?: boolean;
  /** optional "why it matters" explainer straight after the review lines */
  intro?: { eyebrow: string; heading: ReactNode; paragraphs: ReactNode[]; quote?: ReactNode; quoteSource?: string };
  /** card grids; the first one renders before the results, the rest after */
  blocks: ServiceBlock[];
  results?: ServiceResult[];
  resultsLede?: string;
  steps?: { eyebrow: string; heading: ReactNode; lede: string; items: ServiceStep[] };
  /** one line of real prices, with a link to the full price list */
  pricing?: { line: string; note?: string };
  faqs?: ServiceFaq[];
  ctaHeadline: ReactNode;
  ctaSub?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

const Star = () => <svg><use href="#star" /></svg>;
const Arrow = () => <svg><use href="#arr" /></svg>;

function Block({ block }: { block: ServiceBlock }) {
  return (
    <section id={block.id}>
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow"><Star />{block.eyebrow}</span>
            <h2 className="h-display h2">{block.heading}</h2>
          </div>
          {block.lede ? <p className="lede">{block.lede}</p> : null}
        </div>
        <div className={`svc-grid cols-${block.cols ?? 3}`}>
          {block.items.map((it, i) => {
            const inner = (
              <>
                <div className="card-top">
                  <span className="tag"><Star />{it.tag ?? `No. ${pad(i + 1)}`}</span>
                  {it.href ? <span className="arrow"><svg><use href="#arrup" /></svg></span> : null}
                </div>
                <h3 className="h3">{it.label}</h3>
                <p>{it.desc}</p>
              </>
            );
            return it.href ? (
              <Link key={it.label} className="card feat" href={it.href}>{inner}</Link>
            ) : (
              <div key={it.label} className="card feat">{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function ServicePage({ data, children }: { data: ServicePageData; children?: ReactNode }) {
  const [first, ...rest] = data.blocks;
  const steps = data.steps ?? {
    eyebrow: "How it works",
    heading: <>What happens,<br /><span className="grad">and when.</span></>,
    lede: "Your part is small. We do the work, and we show you what it brings in.",
    items: TIMELINE,
  };

  return (
    <div className={`nr-home nr-svc ${nightRideFonts}`} id="top">
      <NrBanner />
      <NrSprite />
      <NrNav />

      <main>
        {/* HERO: the promise, with the proof numbers beside the buttons. */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <Image src={data.heroImage?.src ?? "/night-ride/loft.jpg"} alt="" fill priority sizes="100vw" style={data.heroImage?.position ? { objectPosition: data.heroImage.position } : undefined} />
          </div>
          <div className="wrap">
            <span className="eyebrow"><Star />{data.eyebrow}</span>
            <h1 className="h-display h1">{data.titleLead} <span className="grad">{data.titleHighlight}</span></h1>
            <div className="hero-foot">
              <p className="lede">{data.subhead}</p>
              <div className="hero-cta">
                <div className="btn-row">
                  <button type="button" className="btn btn-primary" data-proposal={`${data.slug}_hero`}>Get a free proposal <Arrow /></button>
                  {data.secondary ? <a className="btn btn-ghost" href={data.secondary.href}>{data.secondary.label}</a> : null}
                </div>
                <div className="trust">
                  <span className="grate"><GoogleG size={16} /><Stars /><b>{GOOGLE_RATING.stars}</b> on Google</span>
                  <span className="dotsep"></span>
                  <span><b>99%</b> of clients stay</span>
                  <span className="dotsep"></span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                    <span className="faces"><Image src="/night-ride/team/josh-face.jpg" alt="" width={30} height={30} /><Image src="/night-ride/team/dave-face.jpg" alt="" width={30} height={30} /></span>
                    Josh &amp; Dave, Villa Rica GA
                  </span>
                </div>
              </div>
            </div>
            {data.pills?.length ? (
              <div className="pills hero-pills">{data.pills.map((p) => <span key={p} className="pill">{p}</span>)}</div>
            ) : null}
          </div>
        </section>

        {/* PROOF straight after the promise: Google review lines, word for word. */}
        <section id="proof" style={{ paddingBlock: "0 clamp(24px,3vw,40px)" }}>
          <div className="wrap">
            <div className="proof-strip">
              {(data.proof ?? PROOF).map((r) => (
                <blockquote key={r.who} className="card pq">
                  <div className="pq-top"><Stars /><GoogleG size={18} /></div>
                  <p>&ldquo;{r.quote}&rdquo;</p>
                  <footer><b>{r.who}</b> · Google review</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* CLIENT VIDEOS: people on camera, in their own words. */}
        {data.videos?.length ? (
          <section id="stories">
            <div className="wrap">
              <div className="head">
                <div>
                  <span className="eyebrow"><Star />In their words</span>
                  <h2 className="h-display h2">Hear it from<br /><span className="grad">{data.videos.length > 1 ? "our clients." : "a client."}</span></h2>
                </div>
                <p className="lede">Clients on camera, talking about what changed after we built their site.</p>
              </div>
              <div className="vrows">
                {data.videos.map((v) => (
                  <div key={v.src} className={`card vrow ${v.upright ? "upright" : "wide"}`}>
                    <div className="vrow-media">
                      <PromoVideo src={v.src} poster={v.poster} title={v.title} length={v.length} wide={!v.upright} />
                    </div>
                    <div className="vrow-body">
                      <blockquote>&ldquo;{v.quote}&rdquo;</blockquote>
                      <p className="story-who"><b>{v.who}</b> · {v.business}</p>
                      <ul className="story-points">{v.points.map((x) => <li key={x}>{x}</li>)}</ul>
                      {v.note ? <p className="story-note">{v.note}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {data.intro ? (
          <section id="why">
            <div className="wrap intro">
              <div>
                <span className="eyebrow"><Star />{data.intro.eyebrow}</span>
                <h2 className="h-display h2">{data.intro.heading}</h2>
              </div>
              <div className="intro-body">
                {data.intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                {data.intro.quote ? (
                  <div className="card intro-quote">
                    <p>{data.intro.quote}</p>
                    {data.intro.quoteSource ? <span className="src">{data.intro.quoteSource}</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {first ? <Block block={first} /> : null}

        {data.results?.length ? (
          <section id="results">
            <div className="wrap">
              <div className="head">
                <div>
                  <span className="eyebrow"><Star />Results</span>
                  <h2 className="h-display h2"><span className="grad">Numbers,</span><br />not promises.</h2>
                </div>
                <p className="lede">{data.resultsLede ?? "What changed for clients after they started with us, measured before and after."}</p>
              </div>
              <div className="results">
                {data.results.map((r, i) => (
                  <article key={r.name} className="card res">
                    <div className="card-top"><span className="tag"><Star />No. {pad(i + 1)}</span><span className="pill plain">{r.pill}</span></div>
                    <h3 className="h3">{r.name}</h3>
                    <p>{r.body}</p>
                    {r.stats ? (
                      <div className="stats">
                        {r.stats.map((s) => (
                          <div key={s.label} className="stat"><small>{s.label}</small><div className="val">{s.from ? <span className="from">{s.from}</span> : null}<strong className="grad">{s.value}</strong></div></div>
                        ))}
                      </div>
                    ) : null}
                    {r.points ? <ul className="points">{r.points.map((p) => <li key={p}>{p}</li>)}</ul> : null}
                    {r.source ? <span className="src">{r.source}</span> : null}
                  </article>
                ))}
              </div>
              <div className="center-cta"><button type="button" className="btn btn-primary" data-proposal={`${data.slug}_results`}>Get a free proposal <Arrow /></button></div>
            </div>
          </section>
        ) : null}

        {/* OUR WORK: the sites themselves. */}
        {data.work ? (
          <section id="work">
            <div className="wrap">
              <div className="head">
                <div>
                  <span className="eyebrow"><Star />Our work</span>
                  <h2 className="h-display h2">{data.work.heading}</h2>
                </div>
                <p className="lede">{data.work.lede}</p>
              </div>
              <WorkGrid />
            </div>
          </section>
        ) : null}

        {rest.map((b) => <Block key={b.eyebrow} block={b} />)}

        {/* WHAT HAPPENS, AND WHEN */}
        <section id="how">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow"><Star />{steps.eyebrow}</span>
                <h2 className="h-display h2">{steps.heading}</h2>
              </div>
              <p className="lede">{steps.lede}</p>
            </div>
            <div className="grid-4">
              {steps.items.map((t, i) => (
                <div key={t.title} className="card tline">
                  <span className="when mono">{/^step/i.test(t.when) ? t.when.toUpperCase() : `${pad(i + 1)} · ${t.when.toUpperCase()}`}</span>
                  <h3 className="h3">{t.title}</h3>
                  <p>{t.body}</p>
                  {t.yours ? <div className="yours"><span>Your part</span>{t.yours}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {children}

        {data.pricing ? (
          <section id="pricing" style={{ paddingTop: "0" }}>
            <div className="wrap">
              <div className="card price-strip">
                <div>
                  <span className="eyebrow"><Star />What it costs</span>
                  <p className="price-line">{data.pricing.line}</p>
                  <p className="note">{data.pricing.note ?? "Month to month. No contract."}</p>
                </div>
                <div className="btn-row">
                  <Link className="btn btn-ghost" href="/pricing">See all pricing</Link>
                  <button type="button" className="btn btn-primary" data-proposal={`${data.slug}_pricing`}>Get a free proposal <Arrow /></button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* REVIEWS: the full Google reviews, scrolling. */}
        {data.reviews ? (
          <section id="reviews" style={{ paddingTop: "0" }}>
            <div className="wrap">
              <div className="head">
                <div>
                  <span className="eyebrow"><Star />Client reviews</span>
                  <h2 className="h-display h2">What our<br />clients say.</h2>
                </div>
                <p className="lede"><b>{GOOGLE_RATING.stars}</b> stars across {GOOGLE_RATING.count} Google reviews. These are word for word.</p>
              </div>
            </div>
            <ReviewsMarquee />
          </section>
        ) : null}

        {data.faqs?.length ? (
          <section id="faq" style={{ paddingTop: "clamp(40px,6vw,80px)" }}>
            <div className="wrap faq">
              <div className="faq-side">
                <span className="eyebrow"><Star />FAQ</span>
                <h2 className="h-display h2">Common<br />questions.</h2>
                <p className="lede">Straight answers before we talk.</p>
                <div className="card ask"><b>Don&apos;t see your question?</b><a className="btn btn-primary" href="#start" style={{ padding: "12px 18px", fontSize: "15px" }}>Ask us</a></div>
              </div>
              <div className="qa">
                {data.faqs.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary><span className="n">{pad(i + 1)}</span><span className="q">{f.q}</span><span className="pm"><svg width="14" height="14"><use href="#plus" /></svg></span></summary>
                    <div className="a"><p>{f.a}</p></div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* FINAL CTA: the form, with the phone number and who answers beside it. */}
        <section id="start" style={{ paddingBlock: "20px clamp(72px,10vw,140px)" }}>
          <div className="wrap">
            <div className="final card vf">
              <div className="beam" aria-hidden="true"></div>
              <span className="c tl"></span><span className="c tr"></span><span className="c bl"></span><span className="c br"></span>
              <div className="reel-top mono"><span className="rec"><i></i>OPEN · MON–FRI 9–5</span><span>VILLA RICA, GA</span></div>
              <span className="eyebrow"><Star />Saddle up</span>
              <h2 className="h-display h2">{data.ctaHeadline}</h2>
              <p className="lede">{data.ctaSub ?? "Tell us about your business. We look at your website, your Google profile and your top competitors, then send back a plan with clear prices."}</p>
              <div className="btn-row">
                <button type="button" className="btn btn-primary" data-proposal={`${data.slug}_final_cta`}>Get my free proposal <Arrow /></button>
                <a className="btn btn-ghost" href="tel:+14702437517"><svg><use href="#phone" /></svg>(470) 243-7517</a>
              </div>
              <div className="trust"><span className="faces"><Image src="/night-ride/team/josh-face.jpg" alt="" width={30} height={30} /><Image src="/night-ride/team/dave-face.jpg" alt="" width={30} height={30} /></span><span>Talk to Josh or Dave, not a call center</span><span className="dotsep"></span><span>Month to month. No contract.</span></div>
            </div>
          </div>
        </section>
      </main>

      <NrFooter />
      <HomeEffects />
    </div>
  );
}
