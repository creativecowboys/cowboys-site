import type { Metadata } from "next";
import ProposalTracker from "@/components/ProposalTracker";
import InfoToggles from "./InfoToggles";
import "./shana.css";

/**
 * Private proposal for Shana Genenbacher.
 *
 * Kept as a server component specifically so it can export `robots: noindex,
 * nofollow` — the source build set that meta tag deliberately and the README
 * calls it out. The existing proposal pages are all "use client", which means
 * none of them can export metadata and none of them carry a noindex tag; they
 * rely solely on /proposals being in sitemap.ts's PRIVATE_SEGMENTS. Belt and
 * braces is cheap here, so this one has both.
 *
 * All interactivity lives in <InfoToggles />.
 */
export const metadata: Metadata = {
    title: "Shana Genenbacher Proposal",
    description:
        "Website, local SEO and ad proposal for Shana Genenbacher from Creative Cowboys Media.",
    robots: { index: false, follow: false },
};

/**
 * Ticker items. Rendered as "item ★" so the sequence is uniform and the loop
 * seam looks like every other gap. Repeated per copy because the -50% scroll
 * needs one copy to be wider than the viewport.
 */
const TICKER = [
    "Custom website",
    "Local SEO",
    "AI search",
    "Facebook & Instagram ads",
    "Your footage, running",
    "Seller leads",
];
const TICKER_REPEATS = 3;

type Feature = { txt: React.ReactNode; id: string; label: string; det: React.ReactNode };

function FeatureRow({ txt, id, label, det }: Feature) {
    return (
        <div className="f">
            <div className="f-row">
                <span className="tick">✦</span>
                <span className="txt">{txt}</span>
                <button
                    className="info"
                    type="button"
                    aria-expanded="false"
                    aria-controls={id}
                    aria-label={label}
                >
                    i
                </button>
            </div>
            <div className="det" id={id} hidden>
                {det}
            </div>
        </div>
    );
}

const BUILD: Feature[] = [
    {
        id: "d1",
        label: "More about the custom build",
        txt: "Built from scratch, with IDX/MLS listings and map search",
        det: (
            <>
                <p>
                    No Wix, no Squarespace, no realtor template — built from the ground up to the
                    clean, classy direction you described. You&rsquo;ll see a full homepage mockup
                    before a single line of code gets written.
                </p>
                <p>
                    IDX brings your MLS listings in automatically: property search, map search,
                    saved searches, plus school and neighborhood data.
                </p>
            </>
        ),
    },
    {
        id: "d2",
        label: "More about the interactive map",
        txt: "An interactive map of the ring of cities around Montgomery",
        det: (
            <>
                <p>
                    A visitor clicks Prattville, Millbrook, Wetumpka or Pike Road and lands on your
                    guide to that city.
                </p>
                <p>
                    This is the best answer to the thing you described — military families arrive
                    knowing they don&rsquo;t want Montgomery proper, but not which outskirt city.
                    It&rsquo;s the first thing they&rsquo;ll see and the thing they&rsquo;ll
                    remember.
                </p>
            </>
        ),
    },
    {
        id: "d3",
        label: "More about area and military guides",
        txt: "Area guides and Maxwell military resource pages",
        det: (
            <>
                <p>
                    A real page per city: neighborhoods, commute to base, schools, what it&rsquo;s
                    actually like to live there.
                </p>
                <p>
                    Plus the Maxwell pages — base area orientation, where to eat and stay on a
                    house-hunting trip, what to see if you&rsquo;ve got two days and a rental car.
                    This is where twenty-one years as a military spouse goes on the record, and
                    it&rsquo;s the content that ranks.
                </p>
            </>
        ),
    },
    {
        id: "d4",
        label: "More about the PCS relocation guide",
        txt: "A PCS relocation guide people trade their email for",
        det: (
            <>
                <p>
                    A downloadable guide to moving to Maxwell, gated behind a name and an email.
                </p>
                <p>
                    This catches families at the orders stage — months before they&rsquo;d call an
                    agent, and long before they reach a model home. Nobody in your market has one.
                </p>
            </>
        ),
    },
    {
        id: "d5",
        label: "More about listing capture and open house sign-in",
        txt: "Listing pages that capture, and an open house sign-in",
        det: (
            <>
                <p>
                    Every listing gets a shareable page with a light registration step, so when we
                    push it into an ad the traffic lands somewhere that actually captures the person
                    instead of bouncing.
                </p>
                <p>
                    The open house page is tablet-friendly — everyone who walks through on Sunday is
                    in your CRM by Sunday night, tagged to that property, with no clipboard to type
                    up.
                </p>
            </>
        ),
    },
    {
        id: "d6",
        label: "More about AI chat intake",
        txt: "AI chat that answers questions at 9pm so you don't have to",
        det: (
            <>
                <p>
                    A spouse three time zones away isn&rsquo;t always ready to pick up the phone.
                    Chat gives them a way to ask real questions first.
                </p>
                <p>
                    You get the lead with the whole conversation attached, so you already know what
                    they&rsquo;re looking for before you call back.
                </p>
            </>
        ),
    },
];

const FOUNDATION: Feature[] = [
    {
        id: "t1",
        label: "More about local SEO",
        txt: "Local SEO & Google Business Profile",
        det: (
            <>
                <p>
                    Posts, photos, review responses and category accuracy on your Google profile.
                    Your listings across every directory cleaned up so Google stops seeing three
                    different versions of you.
                </p>
                <p>
                    Most importantly: targeting the searches from people who{" "}
                    <em>don&rsquo;t know your name yet.</em> &ldquo;Realtor near Maxwell AFB.&rdquo;
                    &ldquo;Best places to live Prattville.&rdquo; That&rsquo;s the part that grows
                    the business.
                </p>
            </>
        ),
    },
    {
        id: "t2",
        label: "More about AI search visibility",
        txt: "AI search visibility",
        det: (
            <>
                <p>
                    You said it yourself — they&rsquo;re going to Google it or ask a chatbot. Google
                    reads a site one way; ChatGPT, Gemini and Claude read it another.
                </p>
                <p>
                    We structure for both, so when a spouse asks an assistant where to live near
                    Maxwell, your guides are what it draws from.
                </p>
            </>
        ),
    },
    {
        id: "t3",
        label: "More about blog content",
        txt: "Monthly blog content",
        det: (
            <p>
                Honest note: blogs carry less weight than they did five years ago, now that anyone
                can generate a hundred a day. They&rsquo;re roughly ten percent of the horsepower
                and we&rsquo;ll treat them that way rather than overselling them.
            </p>
        ),
    },
    {
        id: "t4",
        label: "More about CRM and dashboard",
        txt: "CRM and a live reporting dashboard",
        det: (
            <>
                <p>
                    Keep HubSpot and we&rsquo;ll integrate it, move to GoHighLevel at no extra cost,
                    or keep it simple with a password-protected page on your own site where every
                    lead lands in one list. Your call — your contacts are yours and they&rsquo;re
                    portable either way.
                </p>
                <p>
                    The dashboard is always on, so you can check at 9pm on a Sunday without asking
                    anybody. In plain language, not impressions and click-through rates.
                </p>
            </>
        ),
    },
];

const GROWTH: Feature[] = [
    {
        id: "t5",
        label: "More about campaign management",
        txt: "Facebook & Instagram campaign management",
        det: (
            <>
                <p>
                    Campaign build, targeting, testing and budget pacing — timed to the PCS cycle so
                    spend goes heavy when orders drop and light in the slow months. That one
                    decision is worth more than most of what an ad budget gets spent on.
                </p>
                <p>
                    <strong>
                        You control the ad budget and 100% of it goes to the platforms.
                    </strong>{" "}
                    We never take a percentage of your spend.
                </p>
            </>
        ),
    },
    {
        id: "t6",
        label: "More about how we use your footage",
        txt: "Your footage cut into ad formats and tested",
        det: (
            <>
                <p>
                    You already have the military-spouse relocation video, and a new-construction one
                    coming. You drop footage, photos and graphics into a shared library and we take
                    it from there.
                </p>
                <p>
                    We cut to the format each placement needs — 9:16 for Reels and Stories, 1:1 and
                    4:5 for feed — caption everything for sound-off viewing, and build several hook
                    variants from the same footage so we&rsquo;re testing rather than guessing which
                    opening lands.
                </p>
                <p>
                    <strong>We don&rsquo;t shoot and we don&rsquo;t produce</strong> — you&rsquo;ve
                    got people for that, and you said so. What we do is make sure the footage you
                    already paid for is working during PCS season instead of sitting on a hard
                    drive.
                </p>
            </>
        ),
    },
    {
        id: "t7",
        label: "More about landing pages",
        txt: "Campaign landing pages",
        det: (
            <p>
                Traffic from an ad lands on a page built to convert for that specific campaign, not
                on your homepage where it wanders off.
            </p>
        ),
    },
    {
        id: "t8",
        label: "More about AI chat",
        txt: "AI chat intake switched on",
        det: (
            <p>
                The chat is built into your site at every level — here it&rsquo;s live and managed,
                with conversations flowing into your CRM.
            </p>
        ),
    },
];

const GROWTH_PLUS: Feature[] = [
    {
        id: "t10",
        label: "More about the home valuation tool",
        txt: "“What’s your home worth?” valuation tool",
        det: (
            <>
                <p>
                    <strong>This is the reason we&rsquo;d put you here.</strong> A homeowner enters
                    their address, gives a name and email, and gets an instant estimated value range
                    with recent nearby sales.
                </p>
                <p>
                    It&rsquo;s the strongest seller-lead magnet there is — and everything else in
                    this plan catches buyers. Without it you&rsquo;d have nothing working the
                    listing side.
                </p>
                <p>
                    We show a <em>range</em>, never a single number, and say plainly it&rsquo;s a
                    computer&rsquo;s estimate that knows nothing about a renovated kitchen — then
                    point them to you for the real number. That makes your CMA the product, which is
                    exactly right.
                </p>
            </>
        ),
    },
    {
        id: "t12",
        label: "More about seller lead follow-up",
        txt: "Automatic follow-up on every seller lead",
        det: (
            <>
                <p>
                    A valuation lead that sits untouched for three days is a lead you&rsquo;ve lost.
                    So the moment someone uses the tool, a follow-up sequence starts in your CRM —
                    without you remembering to do anything.
                </p>
                <p>
                    You&rsquo;re showing houses most of the week. This keeps the listing side warm
                    while you&rsquo;re busy, and hands you a person who&rsquo;s already been spoken
                    to by the time you call.
                </p>
            </>
        ),
    },
    {
        id: "t11",
        label: "More about value monitoring",
        txt: "Monthly home value monitoring",
        det: (
            <>
                <p>
                    Everyone who uses the tool gets a monthly email showing how their estimated value
                    moved.
                </p>
                <p>
                    The gap between &ldquo;curious what my house is worth&rdquo; and &ldquo;calling
                    an agent&rdquo; is usually twelve to twenty-four months. This keeps you in their
                    inbox for the whole stretch without you lifting a finger — so you&rsquo;re the
                    obvious call when they&rsquo;re finally ready. Quietest, highest-return thing on
                    this page.
                </p>
            </>
        ),
    },
];

export default function ShanaProposalPage() {
    return (
        <div className="shana">
            <ProposalTracker proposalName="Shana Genenbacher" />
            <InfoToggles />

            <div className="topbar">
                <div className="wrap">
                    <div className="logo">
                        Creative <b>&amp;</b> Cowboys
                    </div>
                    <div className="loc">Villa Rica, GA · Franklin, TN</div>
                </div>
            </div>

            <div className="herobg">
                <div className="wrap">
                    <div className="hero hero-grid">
                      <div className="hero-copy">
                        <div className="eyebrow">Prepared for Shana Genenbacher</div>
                        <h1>
                            The house hunt starts{" "}
                            <em>long before the moving truck.</em>
                        </h1>
                        <p>
                            A family gets orders to Maxwell. Before they ever set foot in Alabama,
                            they open Google and start typing. Right now someone answers them — it
                            just isn&rsquo;t you, unless a friend already gave them your name.
                            Here&rsquo;s how we fix that.
                        </p>
                        <div className="forwho">
                            <div>
                                <span>Prepared by</span>
                                <strong>Joshua Pack</strong>
                            </div>
                            <div>
                                <span>Date</span>
                                <strong>September 18, 2026</strong>
                            </div>
                            <div>
                                <span>Good for</span>
                                <strong>30 days</strong>
                            </div>
                        </div>
                      </div>

                      {/* Intro clip. Click-to-play with native controls rather than
                          autoplay: it's Josh talking, so it's worthless muted, and a
                          proposal shouldn't start making noise on its own. preload
                          is metadata so the 7.5MB isn't fetched until she presses
                          play. */}
                      <figure className="hero-video">
                        <video
                          controls
                          preload="metadata"
                          playsInline
                          poster="/proposals/shana-genenbacher/intro-poster.jpg"
                        >
                          <source src="/proposals/shana-genenbacher/intro.webm" type="video/webm" />
                          <source src="/proposals/shana-genenbacher/intro.mp4" type="video/mp4" />
                          Your browser can&rsquo;t play this video.{" "}
                          <a href="/proposals/shana-genenbacher/intro.mp4">Download it instead</a>.
                        </video>
                        <figcaption>Watch the intro · 0:54</figcaption>
                      </figure>
                    </div>
                </div>
            </div>

            <div className="marquee">
                <div className="marquee-track">
                    {[0, 1].map((copy) => (
                        <div className="marquee-copy" key={copy} aria-hidden={copy === 1}>
                            {Array.from({ length: TICKER_REPEATS }).flatMap((_, r) =>
                                TICKER.map((item) => (
                                    <span key={`${r}-${item}`}>
                                        {item}
                                        <i> ★</i>
                                    </span>
                                )),
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── The build ── */}
            <div className="wrap">
                <section>
                    <div className="shead">
                        <h2>First, the website</h2>
                        <p>
                            Same build at every level below — same design, same custom work, and
                            it&rsquo;s yours to keep. Tap any <strong>i</strong> for the detail.
                        </p>
                    </div>

                    <div className="build">
                        <div className="build-top">
                            <h3>Custom website &amp; build</h3>
                            <div className="amt">
                                $6,500<small>One-time</small>
                            </div>
                        </div>
                        <ul>
                            {BUILD.map((f) => (
                                <li className="f" key={f.id}>
                                    <div className="f-row">
                                        <span className="tick">✦</span>
                                        <span className="txt">{f.txt}</span>
                                        <button
                                            className="info"
                                            type="button"
                                            aria-expanded="false"
                                            aria-controls={f.id}
                                            aria-label={f.label}
                                        >
                                            i
                                        </button>
                                    </div>
                                    <div className="det" id={f.id} hidden>
                                        {f.det}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>

            {/* ── Tiers ── */}
            <div className="wrap">
                <section style={{ paddingTop: 8 }}>
                    <div className="shead">
                        <h2>Then, pick your engine</h2>
                        <p>
                            What changes between these is how much of the ongoing machine you switch
                            on. You can move up any time with no penalty.
                        </p>
                    </div>

                    <div className="tiers">
                        <div className="tier">
                            <div className="tier-head">
                                <h3>Foundation</h3>
                                <p className="for">
                                    Get found first. Add the ad engine when you&rsquo;re ready.
                                </p>
                                <div className="price">
                                    <sup>$</sup>497<small> / month</small>
                                </div>
                            </div>
                            <div className="tier-body">
                                <div className="incl">What you get</div>
                                {FOUNDATION.map((f) => (
                                    <FeatureRow key={f.id} {...f} />
                                ))}
                            </div>
                            <div className="tier-foot">
                                <span>Year one, all in</span>
                                <strong>$12,464</strong>
                            </div>
                        </div>

                        <div className="tier">
                            <div className="tier-head">
                                <h3>Growth</h3>
                                <p className="for">Get found, and put real budget behind it.</p>
                                <div className="price">
                                    <sup>$</sup>697<small> / month</small>
                                </div>
                            </div>
                            <div className="tier-body">
                                <div className="incl">Everything above, plus</div>
                                {GROWTH.map((f) => (
                                    <FeatureRow key={f.id} {...f} />
                                ))}
                            </div>
                            <div className="tier-foot">
                                <span>Year one, all in</span>
                                <strong>$14,864</strong>
                            </div>
                        </div>

                        <div className="tier best">
                            <div className="tier-head">
                                <span className="flag">What we&rsquo;d pick for you</span>
                                <h3>Growth+</h3>
                                <p className="for">
                                    Everything working — including the seller side you&rsquo;re
                                    missing.
                                </p>
                                <div className="price">
                                    <sup>$</sup>897<small> / month</small>
                                </div>
                            </div>
                            <div className="tier-body">
                                <div className="incl">Everything above, plus</div>
                                {GROWTH_PLUS.map((f) => (
                                    <FeatureRow key={f.id} {...f} />
                                ))}
                            </div>
                            <div className="tier-foot">
                                <span>Year one, all in</span>
                                <strong>$17,264</strong>
                            </div>
                        </div>
                    </div>

                    <p className="fine">
                        Year one = the $6,500 build plus twelve months. Ad spend is separate at every
                        level and paid by you directly to Meta. MLS/IDX feed fees are set by your MLS
                        and passed through at cost. Growth+ includes a property-data subscription
                        billed to you at cost with no markup — roughly $50–100/month at your likely
                        volume, confirmed in writing before you commit. Twelve-month term on the
                        monthly; the website is yours to keep either way.
                    </p>
                </section>
            </div>

            {/* ── Comparison ── */}
            <div className="wrap">
                <section style={{ paddingTop: 8 }}>
                    <div className="cmp">
                        <div className="cmp-head">
                            <h3>You mentioned AgentFire</h3>
                            <p>
                                So we priced out what your specific build would actually cost there,
                                using their own published rates. Configured for what you described,
                                they come to <strong style={{ color: "#F5C842" }}>$16,203</strong> in
                                year one.
                            </p>
                        </div>
                        <div className="tscroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>What matters to you</th>
                                        <th className="c">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                className="cmp-logo"
                                                src="/proposals/shana-genenbacher/agentfire-logo.svg"
                                                alt="AgentFire"
                                            />
                                        </th>
                                        <th className="c">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                className="cmp-logo cmp-logo-us"
                                                src="/proposals/shana-genenbacher/cowboys-logo.png"
                                                alt="Creative Cowboys"
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="feat">
                                            Ongoing local SEO
                                            <em>
                                                Monthly work to rank for people who don&rsquo;t know
                                                your name
                                            </em>
                                        </td>
                                        <td className="c bad">None offered</td>
                                        <td className="c win">Every tier</td>
                                    </tr>
                                    <tr>
                                        <td className="feat">
                                            Your footage, actually used
                                            <em>Cut to format, captioned, tested as hook variants</em>
                                        </td>
                                        <td className="c bad">Neither</td>
                                        <td className="c win">Every ad tier</td>
                                    </tr>
                                    <tr>
                                        <td className="feat">Where the ads run</td>
                                        <td className="c">
                                            Google Search
                                            <em style={{ textAlign: "right" }}>
                                                FB/IG retargeting only
                                            </em>
                                        </td>
                                        <td className="c win">Facebook &amp; Instagram</td>
                                    </tr>
                                    <tr>
                                        <td className="feat">Minimum ad spend</td>
                                        <td className="c bad">
                                            $1,000/mo
                                            <em style={{ textAlign: "right" }}>
                                                6-month commitment
                                            </em>
                                        </td>
                                        <td className="c win">Your call</td>
                                    </tr>
                                    <tr>
                                        <td className="feat">When you need something changed</td>
                                        <td className="c bad">
                                            3 hours a month
                                            <em style={{ textAlign: "right" }}>
                                                then a request queue
                                            </em>
                                        </td>
                                        <td className="c win">Three named people</td>
                                    </tr>
                                    <tr className="sum">
                                        <td className="feat">Year one</td>
                                        <td className="c">$16,203+</td>
                                        <td className="c win">$12,464–$17,264</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="cmp-note">
                            <p style={{ margin: 0 }}>
                                <strong>The thing worth knowing:</strong> AgentFire doesn&rsquo;t
                                sell ongoing local SEO at all. Their Local SEO Setup is a one-time
                                $250 service, and their own product page says it&rsquo;s built to
                                help you rank when someone searches{" "}
                                <em>your name or your team&rsquo;s name directly</em> — explicitly
                                not &ldquo;real estate agent&rdquo; or &ldquo;homes for sale.&rdquo;
                                A family that just got orders to Maxwell doesn&rsquo;t know your
                                name. That&rsquo;s the entire problem you&rsquo;re trying to solve.
                            </p>
                        </div>
                    </div>

                </section>
            </div>

            {/* Josh is already in email contact with the client, so the pitch and
                CTA that were here would just be noise. What's left is a colophon. */}
            <footer>
                <div className="wrap">
                    <div className="fmeta">
                        Joshua Pack &amp; Dave Column · Creative Cowboys Media · Villa Rica, GA ·
                        Franklin, TN (new office) · howdy@creativecowboys.co
                    </div>
                </div>
            </footer>
        </div>
    );
}
