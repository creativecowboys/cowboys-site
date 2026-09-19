import type { Metadata } from "next";
import ProposalTracker from "@/components/ProposalTracker";
import InfoToggles from "./InfoToggles";
import "./storysmith.css";

/**
 * Private paid-social proposal for Tyler Robinson at StorySmith.
 *
 * Same shape as the Shana Genenbacher proposal: a server component so it can
 * export `robots: noindex, nofollow` (the source build set that meta tag and
 * this is a private client document), with all interactivity isolated in
 * <InfoToggles />. /proposals is also in sitemap.ts's PRIVATE_SEGMENTS, so
 * that's belt and braces.
 */
export const metadata: Metadata = {
    title: "StorySmith Growth Plan",
    description: "Paid social proposal for StorySmith from Creative Cowboys Media.",
    robots: { index: false, follow: false },
};

/**
 * Ticker items. Rendered as "item ★" so the sequence is uniform and the loop
 * seam looks like every other gap. Repeated per copy because the -50% scroll
 * needs one copy to be wider than the viewport.
 */
const TICKER = [
    "Facebook & Instagram",
    "Video ads",
    "Static ads",
    "Ad copy",
    "Daily management",
    "Fortnightly reporting",
];
const TICKER_REPEATS = 3;

type Feature = { id: string; label: string; txt: string; det: React.ReactNode };

function FeatureRow({ id, label, txt, det }: Feature) {
    return (
        <li className="f">
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
        </li>
    );
}

const TERMS: Feature[] = [
    {
        id: "s1",
        label: "More about the ad budget floor",
        txt: "Why we’d suggest a floor on the ad budget",
        det: (
            <>
                <p>
                    Below roughly a thousand a month the algorithm doesn&rsquo;t get enough
                    conversion data to optimize, and you end up spending real money without
                    crossing the threshold where it starts working.
                </p>
                <p>
                    That&rsquo;s the worst outcome, because it looks like the channel failed when
                    it was never given enough to learn from.
                </p>
            </>
        ),
    },
    {
        id: "s2",
        label: "More about the two month term",
        txt: "Why two months",
        det: (
            <>
                <p>
                    It&rsquo;s the minimum honest window to build creative, let campaigns exit the
                    learning phase, test, and read a real result. One month tells you nothing.
                </p>
                <p>
                    After that you decide. No lock-in, no penalty, and you own everything we made
                    either way.
                </p>
            </>
        ),
    },
    {
        id: "s3",
        label: "More about featuring family in creative",
        txt: "If any creative features your family",
        det: (
            <p>
                You approve it before it runs, every time, and you can pull it at any point without
                discussion. We&rsquo;re equally happy to build the whole campaign without putting
                them on camera at all &mdash; your call.
            </p>
        ),
    },
];

/** The monthly deliverables list. `count` is the ✦ bullet where there's no number. */
const MONTHLY: { count: string; what: string; note: string }[] = [
    {
        count: "4",
        what: "Video ads, Reels-format",
        note: "Built for sound-off viewing with captions. Multiple cuts and hooks from each concept so we’re testing, not guessing.",
    },
    {
        count: "6",
        what: "Static ads",
        note: "Designed graphics with headline and copy variants for split testing.",
    },
    {
        count: "✦",
        what: "Ad copy written per audience",
        note: "Parents of creative kids, aspiring novelists, and writing teachers each need different words.",
    },
    {
        count: "✦",
        what: "Campaign build, targeting and daily management",
        note: "Structure, placements, budget pacing and ongoing optimization.",
    },
    {
        count: "✦",
        what: "Landing page direction",
        note: "You already built the campaign and landing page system, so we won’t replace it. We’ll tell you what each page needs to say to match its ad.",
    },
    {
        count: "✦",
        what: "A live dashboard, plus a written read every two weeks",
        note: "What’s working, what we’re killing, what’s next. Month two’s creative comes from month one’s data.",
    },
];

export default function StorySmithProposalPage() {
    return (
        <div className="storysmith">
            <ProposalTracker proposalName="StorySmith" />
            <InfoToggles />

            <div className="topbar">
                <div className="wrap">
                    <div className="logo">
                        Creative <b>&amp;</b> Cowboys
                    </div>
                    <div className="loc">Villa Rica, GA · Franklin, TN</div>
                </div>
            </div>

            <div className="wrap">
                <div className="hero">
                    <div className="eyebrow">Prepared for Tyler Robinson · StorySmith</div>
                    <h1>
                        Here&rsquo;s what
                        <br />
                        we&rsquo;d <em>suggest.</em>
                    </h1>
                    <p className="intro">
                        Thanks for taking the time to walk us through StorySmith &mdash; it&rsquo;s
                        a good product, and a more thought-through one than most of what we get
                        shown. Below is the plan we&rsquo;d put behind it and what it would cost.
                        Nothing complicated.
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

            {/* ── What we'd do ── */}
            <div className="wrap">
                <section>
                    <div className="shead">
                        <h2>What we&rsquo;d do</h2>
                    </div>

                    <p className="lede" style={{ marginTop: 12 }}>
                        Paid social on Facebook and Instagram, Reels-led. Keep writing the
                        comparison posts &mdash; organic traffic is free traffic and they&rsquo;ll
                        keep compounding &mdash; but search isn&rsquo;t where a product like this
                        gets found. People don&rsquo;t go looking for writing software they
                        don&rsquo;t know exists. They come across it.
                    </p>

                    <p className="lede">
                        We&rsquo;d run the 7-day trial as the offer in the ads, with no price
                        mentioned, then close on the $199 founders deal at the end of the trial
                        with the hundred-seat cap doing the work. A $199 ask lands very differently
                        on someone who&rsquo;s spent six days building a world than on a stranger.
                        Creative would lean on why you built it in the first place, which is the one
                        thing your competitors can&rsquo;t copy.
                    </p>

                    <div className="box">
                        <h3>Each month, you&rsquo;d get</h3>
                        <ul className="plain">
                            {MONTHLY.map((m) => (
                                <li key={m.what}>
                                    <b>{m.count}</b>
                                    <span>
                                        {m.what}
                                        <em>{m.note}</em>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>

            {/* ── What it costs ── */}
            <div className="wrap">
                <section style={{ paddingTop: 8 }}>
                    <div className="shead">
                        <h2>What it costs</h2>
                    </div>

                    <div className="pricebox">
                        <div className="prow">
                            <div className="what">
                                <h3>Our fee</h3>
                                <p>
                                    Everything above &mdash; creative, copy, campaign build,
                                    management, reporting.
                                </p>
                            </div>
                            <div className="amt">
                                <sup>$</sup>997<small>Per month</small>
                            </div>
                        </div>
                        <div className="prow">
                            <div className="what">
                                <h3>Your ad budget</h3>
                                <p>
                                    Paid by you, directly to Meta. You set it and you can change it
                                    any day. We don&rsquo;t take a percentage of it and we never
                                    touch it.
                                </p>
                            </div>
                            <div className="amt you">
                                You decide<small>We&rsquo;d say $1,000&ndash;1,500</small>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <ul>
                            {TERMS.map((t) => (
                                <FeatureRow key={t.id} {...t} />
                            ))}
                        </ul>
                    </div>
                </section>
            </div>

            {/* ── Break-even ── */}
            <div className="wrap">
                <section style={{ paddingTop: 8 }}>
                    <div className="math">
                        <div className="math-head">
                            <h3>What it takes to break even</h3>
                            <p>
                                At our $997 fee plus $1,200 in ad spend you&rsquo;re at roughly{" "}
                                <strong>$2,197 a month</strong>, or <strong>$4,394</strong> across
                                the two months. Against the $199 founders deal:
                            </p>
                        </div>
                        <div className="tscroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>To cover the engagement</th>
                                        <th className="c">You&rsquo;d need</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Founders conversions at $199</td>
                                        <td className="c">23</td>
                                    </tr>
                                    <tr>
                                        <td>Roughly per month</td>
                                        <td className="c">12</td>
                                    </tr>
                                    <tr>
                                        <td>As a share of your 100 founder seats</td>
                                        <td className="c">23%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="math-note">
                            <p style={{ margin: 0 }}>
                                So it pays for itself at about a quarter of your founders tier, and
                                the trial signups that don&rsquo;t convert are still in your funnel.
                                We&rsquo;ll redo this against your real trial-to-paid rate once we
                                have two weeks of data, and if the numbers stop working we&rsquo;ll
                                tell you.
                            </p>
                        </div>
                    </div>

                    <p className="fine">
                        Month one invoiced at start, month two at day thirty. Ad spend billed by
                        Meta directly to your card. Everything we produce is yours &mdash; video,
                        graphics, copy, campaign structures &mdash; whether you continue or not.
                    </p>
                </section>
            </div>

            <div className="wrap">
                <div className="signoff">
                    <p>
                        That&rsquo;s the whole thing. If it looks right, say the word and we&rsquo;ll
                        get started. If you&rsquo;ve got questions, or want to change the shape of
                        it, just reply and we&rsquo;ll work it out.
                    </p>
                    <p>
                        Two small things from your site worth doing either way: give the About page
                        a bit more room to tell the story behind the product, and vary the imagery
                        across the feature sections &mdash; right now those tiles read as
                        near-identical. Neither costs anything and both help.
                    </p>
                    <p>Thanks again for the time. Good luck with it whichever way you go.</p>
                    <p className="sig">
                        <strong>Joshua Pack</strong>
                        <br />
                        Creative Cowboys Media ·{" "}
                        <a href="mailto:howdy@creativecowboys.co">howdy@creativecowboys.co</a> ·
                        Villa Rica, GA · Franklin, TN
                    </p>
                </div>
            </div>
        </div>
    );
}
