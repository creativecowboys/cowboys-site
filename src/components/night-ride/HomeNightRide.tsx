import Image from "next/image";
import Link from "next/link";
import { nightRideFonts } from "./fonts";
import { CLIENT_VIDEOS, GOOGLE_RATING, PACKAGES, PROOF, TIMELINE } from "./home-content";
import { ArrowRight, Check, Corners, GoogleG, Stars } from "./icons";
import PromoVideo from "./PromoVideo";
import "./home.css";

/**
 * The Night Ride homepage, ported from the approved mockup. Server-rendered so search engines and
 * AI crawlers get the full text. Behaviour (hover-to-play recordings, the footer wordmark fit and
 * opening the proposal form from any `data-proposal` button) lives in HomeEffects / ProposalHost.
 *
 * Icons are the five <symbol>s at the top, used through <use href="#id" />.
 */
const pad = (n: number) => String(n).padStart(2, "0");

export default function HomeNightRide() {
  return (
    <div className={`nr-home ${nightRideFonts}`} id="top">
      {/* Black Friday 2026 deal banner. The Facebook ads say "go to creativecowboys.co", so the
          homepage has to point at the deal page. Remove this block when the deal closes. */}
      <Link href="/black-friday" className="bf-banner">
        Black Friday: a free website with any marketing package. Limited spots. <span>Claim yours &rarr;</span>
      </Link>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="star" viewBox="0 0 24 24"><rect x="1.5" y="4.5" width="21" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 7.6l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor"/></symbol>
        <symbol id="arr" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="arrup" viewBox="0 0 16 16"><path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="plus" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></symbol>
        <symbol id="phone" viewBox="0 0 16 16"><path d="M5.2 2.5l1.6 3-1.2 1.2a8 8 0 0 0 3.7 3.7l1.2-1.2 3 1.6-.6 2.4c-5.5.4-10.4-4.5-10-10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></symbol>
      </svg>

      <header className="nav">
        <div className="wrap">
          <div className="nav-in">
            <Link className="nav-logo" href="/" aria-label="Creative Cowboys home"><Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={158} height={30} /></Link>
            <nav className="nav-links" aria-label="Main">
              <a href="#crew">Crew</a><a href="#services">Services</a><a href="#work">Work</a><a href="#results">Results</a><a href="#reviews">Reviews</a><a href="#faq">FAQ</a>
            </nav>
            <a className="btn btn-primary" href="#start"><span>Free Proposal</span><svg><use href="#arr"/></svg></a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
        {/* Faint backdrop: the brick loft from the ads, without the Christmas decorations. */}
        <div className="hero-bg" aria-hidden="true">
          <Image src="/night-ride/loft.jpg" alt="" fill priority sizes="100vw" />
        </div>
          <div className="wrap">
            <span className="eyebrow"><svg><use href="#star"/></svg>Web design, SEO &amp; ads agency · Villa Rica, GA</span>
            <h1 className="h-display h1">Websites and ads that make your <span className="grad">phone ring.</span></h1>
            <div className="hero-foot">
              <p className="lede">We build fast websites, run Google and Facebook ads, and get local businesses found on Google. Roofers, law firms, contractors and shops across the Southeast. You see every call and lead it brings in.</p>
              <div className="hero-cta">
                <div className="btn-row">
                  <a className="btn btn-primary" href="#start">Get a free proposal <svg><use href="#arr"/></svg></a>
                  <a className="btn btn-ghost" href="#work">See our work</a>
                </div>
                <div className="trust"><span className="grate"><GoogleG size={16} /><Stars /><b>{GOOGLE_RATING.stars}</b> on Google</span><span className="dotsep"></span><span><b>99%</b> of clients stay</span><span className="dotsep"></span><a href="#crew" style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><span className="faces"><Image src="/night-ride/team/josh-face.jpg" alt="" width={30} height={30} /><Image src="/night-ride/team/dave-face.jpg" alt="" width={30} height={30} /></span>Josh &amp; Dave, Villa Rica GA</a></div>
              </div>
            </div>

            <div className="reel vf" aria-label="Recent client websites">
              <span className="c tl"></span><span className="c tr"></span><span className="c bl"></span><span className="c br"></span>
              <div className="reel-top mono"><span className="rec"><span id="reel-status">HOVER A SITE TO PLAY</span></span></div>
              <div className="reel-grid">
                <figure className="clip" tabIndex={0} data-name="Stemma Brewing">
                  <div className="shot"><div className="bar"><i></i><i></i><i></i><span>stemma-brewing.vercel.app</span></div>
                    <video muted loop playsInline preload="metadata" poster="/night-ride/reel/stemma.jpg" aria-label="Screen recording scrolling the Stemma Brewing website"><source src="/night-ride/reel/stemma.mp4" type="video/mp4" /></video>
                    <span className="play"><i></i>Hover to play</span><span className="prog"><b></b></span></div>
                  <figcaption><b>Stemma Brewing</b><span>Brewery · Bellingham, WA</span></figcaption>
                </figure>
                <figure className="clip" tabIndex={0} data-name="Sol Tacos &amp; Tequila">
                  <div className="shot"><div className="bar"><i></i><i></i><i></i><span>soltacos-mockup.vercel.app/concept</span></div>
                    <video muted loop playsInline preload="metadata" poster="/night-ride/reel/soltacos.jpg" aria-label="Screen recording scrolling the Sol Tacos and Tequila website"><source src="/night-ride/reel/soltacos.mp4" type="video/mp4" /></video>
                    <span className="play"><i></i>Hover to play</span><span className="prog"><b></b></span></div>
                  <figcaption><b>Sol Tacos &amp; Tequila</b><span>Rooftop restaurant · Douglasville, GA</span></figcaption>
                </figure>
                <figure className="clip" tabIndex={0} data-name="LEUCO">
                  <div className="shot"><div className="bar"><i></i><i></i><i></i><span>shopleuco.com</span></div>
                    <video muted loop playsInline preload="metadata" poster="/night-ride/reel/leuco.jpg" aria-label="Screen recording scrolling the LEUCO tooling store"><source src="/night-ride/reel/leuco.mp4" type="video/mp4" /></video>
                    <span className="play"><i></i>Hover to play</span><span className="prog"><b></b></span></div>
                  <figcaption><b>LEUCO Tools</b><span>Tooling store · Villa Rica, GA</span></figcaption>
                </figure>
              </div>
              <div className="reel-label"><span>Real client sites, recorded live</span></div>
            </div>
          </div>
        </section>

      {/* PROOF straight after the promise: Google review lines, word for word. */}
      <section id="proof" style={{ paddingBlock: "0 clamp(24px,3vw,40px)" }}>
        <div className="wrap">
          <div className="proof-strip">
            {PROOF.map((r) => (
              <blockquote key={r.who} className="card pq">
                <div className="pq-top"><Stars /><GoogleG size={18} /></div>
                <p>&ldquo;{r.quote}&rdquo;</p>
                <footer><b>{r.who}</b> · Google review</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="results">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow"><svg><use href="#star"/></svg>Results</span>
                <h2 className="h-display h2"><span className="grad">Numbers,</span><br />not promises.</h2>
              </div>
              <p className="lede">What changed for clients after they started with us, measured before and after.</p>
            </div>
            <div className="results">
              <article className="card res">
                <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 01</span><span className="pill plain">SEO &amp; Google Ads</span></div>
                <h3 className="h3">John B. Jackson &amp; Assoc.</h3>
                <p>Personal injury firm in Douglasville. We rebuilt the site, ran local SEO across the Southeast and built lead funnels with phone-call tracking.</p>
                <div className="stats">
                  <div className="stat"><small>#1 organic spots on Google</small><div className="val"><span className="from">0</span><strong className="grad">22</strong></div></div>
                  <div className="stat"><small>Revenue added</small><div className="val"><strong className="grad">+$500k</strong></div></div>
                  <div className="stat"><small>Time to get there</small><div className="val"><strong className="grad">12 months</strong></div></div>
                </div>
                <span className="src">Source: Creative Cowboys case study</span>
              </article>
              <article className="card res">
                <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 02</span><span className="pill plain">Web design &amp; SEO</span></div>
                <h3 className="h3">Harmonic Production</h3>
                <p>Concert AV outfit in Cleveland, TN. Full website rebuild, a move to a new domain and a localized SEO plan.</p>
                <div className="stats">
                  <div className="stat"><small>Customer engagement</small><div className="val"><strong className="grad">~300% ↑</strong></div></div>
                  <div className="stat"><small>Customer retention</small><div className="val"><strong className="grad">200% ↑</strong></div></div>
                  <div className="stat"><small>Downtime during domain move</small><div className="val"><strong className="grad">Zero</strong></div></div>
                </div>
                <span className="src">Source: client testimonial, Ryan Coffey</span>
              </article>
            </div>
            <div className="center-cta"><a className="btn btn-primary" href="#start">Get a free proposal <svg><use href="#arr"/></svg></a></div>
          </div>
        </section>

      {/* CLIENT VIDEOS: renders once CLIENT_VIDEOS in home-content.ts has an entry. */}
      {CLIENT_VIDEOS.length > 0 && (
        <section id="stories">
          <div className="wrap">
            {CLIENT_VIDEOS.length === 1 ? (
              CLIENT_VIDEOS.map((v) => (
                <div key={v.src} className="story-solo">
                  <div className="story-head">
                    <span className="eyebrow"><svg><use href="#star" /></svg>In their words</span>
                    <h2 className="h-display h2">Hear it from<br /><span className="grad">a client.</span></h2>
                  </div>
                  <div className="story-media">
                    <PromoVideo src={v.src} poster={v.poster} title={v.title} length={v.length} wide={!v.upright} />
                    {v.place && <p className="story-note"><b>{v.who}</b> · {v.place}</p>}
                    {v.note && <p className="story-note">{v.note}</p>}
                  </div>
                  <div className="story-body">
                    <blockquote>&ldquo;{v.quote}&rdquo;</blockquote>
                    <p className="story-who"><b>{v.who}</b> · {v.business}</p>
                    <ul className="story-points">
                      {v.points.map((x) => <li key={x}>{x}</li>)}
                    </ul>
                    <div className="btn-row">
                      <a className="btn btn-primary" href="#start">Get a free proposal <ArrowRight /></a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="head">
                  <div>
                    <span className="eyebrow"><svg><use href="#star" /></svg>In their words</span>
                    <h2 className="h-display h2">Hear it from<br /><span className="grad">our clients.</span></h2>
                  </div>
                  <p className="lede">Clients on camera, talking about what changed after we started working together.</p>
                </div>
                <div className="stories">
                  {CLIENT_VIDEOS.map((v) => (
                    <figure key={v.src} className="card story">
                      <PromoVideo src={v.src} poster={v.poster} title={v.title} length={v.length} wide={!v.upright} />
                      <figcaption>
                        <p>&ldquo;{v.quote}&rdquo;</p>
                        <span><b>{v.who}</b> · {v.business}</span>
                        {v.note && <span className="story-note">{v.note}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

        {/* CREW */}
        <section id="crew" style={{ paddingTop: "clamp(56px,7vw,96px)" }}>
          <div className="wrap crew">
            <div className="crew-copy">
              <span className="eyebrow"><svg><use href="#star"/></svg>The crew</span>
              <h2 className="h-display h2">Two cowboys.<br /><span className="grad">No call center.</span></h2>
              <p className="lede">Creative Cowboys is Dave and Josh, working out of Villa Rica, Georgia. The people you meet on the first call are the people who build your site and run your ads.</p>
              <div className="crew-facts">
                <div><span>Based in</span><b>Villa Rica, GA</b></div>
                <div><span>Client retention</span><b>99%</b></div>
                <div><span>Who answers the phone</span><b>Josh or Dave</b></div>
              </div>
              <div className="btn-row"><a className="btn btn-primary" href="#start">Talk to the crew <svg><use href="#arr"/></svg></a></div>
            </div>
            <div className="crew-cards">
              <figure className="card person">
                <div className="photo vf"><span className="c tl"></span><span className="c tr"></span><span className="c bl"></span><span className="c br"></span>
                  <Image src="/night-ride/team/josh.jpg" alt="Josh, smiling, in a black Creative Cowboys cap and T-shirt" width={800} height={1000} loading="lazy" /></div>
                <figcaption><h3 className="h3">Josh</h3><p>Websites, SEO and ads.</p></figcaption>
              </figure>
              <figure className="card person">
                <div className="photo vf"><span className="c tl"></span><span className="c tr"></span><span className="c bl"></span><span className="c br"></span>
                  <Image src="/night-ride/team/dave.jpg" alt="Dave, smiling, in a white Creative Cowboys T-shirt" width={800} height={1000} loading="lazy" /></div>
                <figcaption><h3 className="h3">Dave</h3><p>Websites, clients and strategy.</p></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow"><svg><use href="#star"/></svg>Services</span>
                <h2 className="h-display h2">Four services.<br />One crew.</h2>
              </div>
              <p className="lede">Websites, local SEO, Google Ads and social ads from one small team. Every job starts with one question: will this bring in more calls?</p>
            </div>

            <div className="bento">
              <Link className="card svc tall" href="/web-design">
                <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 01</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                <span className="ghostnum" aria-hidden="true">01</span>
                <h3 className="h3">Web<br />Design</h3>
                <p>Custom sites that load fast, look sharp on a phone, and turn visitors into calls.</p>
                <div className="pills"><span className="pill">Custom builds</span><span className="pill">Landing pages</span><span className="pill">E-commerce</span><span className="pill">UI / UX design</span><span className="pill">Hosting &amp; updates</span></div>
              </Link>
              <Link className="card svc" href="/seo">
                <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 02</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                <span className="ghostnum" aria-hidden="true">02</span>
                <h3 className="h3">Local SEO</h3>
                <p>Show up on Google and in the map pack where your customers live.</p>
                <div className="pills"><span className="pill">Google Business Profile</span><span className="pill">Service-area pages</span><span className="pill">Citations</span><span className="pill">Reviews</span></div>
              </Link>
              <Link className="card svc" href="/ppc">
                <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 03</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                <span className="ghostnum" aria-hidden="true">03</span>
                <h3 className="h3">Google Ads</h3>
                <p>Search ads that appear the moment someone needs you, tracked to the call.</p>
                <div className="pills"><span className="pill">Search campaigns</span><span className="pill">Call tracking</span><span className="pill">Negative keywords</span><span className="pill">Landing pages</span></div>
              </Link>
              <Link className="card svc wide" href="/social-media-ads">
                <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 04</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                <span className="ghostnum" aria-hidden="true">04</span>
                <h3 className="h3">Social Ads + CRM</h3>
                <p>Facebook and Instagram ads, plus a CRM with AI chat that catches every lead after hours.</p>
                <div className="pills"><span className="pill">Facebook &amp; Instagram</span><span className="pill">Creative testing</span><span className="pill">CRM</span><span className="pill">AI website chat</span><span className="pill">Text follow-up</span></div>
              </Link>
            </div>
            <div className="center-cta"><a className="btn btn-primary" href="#start">Get a free proposal</a></div>
          </div>
        </section>

        {/* WORK */}
        <section id="work">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow"><svg><use href="#star"/></svg>Our work</span>
                <h2 className="h-display h2">Sites that pull<br />their weight.</h2>
              </div>
              <p className="lede">Custom builds for venues, realtors, builders, insurers and other local businesses. Fast, mobile-first and set up for local search from day one.</p>
            </div>
            <div className="work">
              <a className="card proj" href="https://thegroveatdefoorfarm.com" target="_blank" rel="noopener">
                <div className="shot"><div className="bar"><i></i><i></i><i></i><span>thegroveatdefoorfarm.com</span></div><Image src="/night-ride/work/grove.jpg" alt="The Grove at DeFoor Farm homepage" loading="lazy" width={1200} height={750} /></div>
                <div className="proj-body">
                  <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 01</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                  <h3 className="h3">The Grove at DeFoor Farm</h3>
                  <p>Wedding and event venue · West Georgia</p>
                  <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Video hero</span><span className="pill plain">Local SEO</span></div>
                </div>
              </a>
              <a className="card proj" href="https://shanagenenbacher.com" target="_blank" rel="noopener">
                <div className="shot"><div className="bar"><i></i><i></i><i></i><span>shanagenenbacher.com</span></div><Image src="/night-ride/work/shana.jpg" alt="Shana Genenbacher real estate homepage" loading="lazy" width={1200} height={750} /></div>
                <div className="proj-body">
                  <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 02</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                  <h3 className="h3">Shana Genenbacher</h3>
                  <p>Realtor, KW Montgomery · Prattville, AL</p>
                  <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Live MLS search</span><span className="pill plain">CRM</span></div>
                </div>
              </a>
              <a className="card proj" href="https://blueridge.creativecowboys.co" target="_blank" rel="noopener">
                <div className="shot"><div className="bar"><i></i><i></i><i></i><span>blueridge.creativecowboys.co</span></div><Image src="/night-ride/work/blueridge.jpg" alt="Blue Ridge Golf Carts homepage" loading="lazy" width={1200} height={750} /></div>
                <div className="proj-body">
                  <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 03</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                  <h3 className="h3">Blue Ridge Golf Carts</h3>
                  <p>Golf cart sales and service · Travelers Rest, SC</p>
                  <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Online parts store</span><span className="pill plain">Cart builder</span></div>
                </div>
              </a>
              <a className="card proj" href="https://innovativeconstructiongroup.com" target="_blank" rel="noopener">
                <div className="shot"><div className="bar"><i></i><i></i><i></i><span>innovativeconstructiongroup.com</span></div><Image src="/night-ride/work/icg.jpg" alt="Innovative Construction Group homepage" loading="lazy" width={1200} height={750} /></div>
                <div className="proj-body">
                  <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 04</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                  <h3 className="h3">Innovative Construction Group</h3>
                  <p>Custom home builder · West Georgia and East Alabama</p>
                  <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Project portfolio</span><span className="pill plain">SEO articles</span></div>
                </div>
              </a>
              <a className="card proj" href="https://bremencia.com" target="_blank" rel="noopener">
                <div className="shot"><div className="bar"><i></i><i></i><i></i><span>bremencia.com</span></div><Image src="/night-ride/work/bremencia.jpg" alt="Commercial Insurance Agency homepage" loading="lazy" width={1200} height={750} /></div>
                <div className="proj-body">
                  <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 05</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                  <h3 className="h3">Commercial Insurance Agency</h3>
                  <p>Independent insurance · Bremen, GA</p>
                  <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Quote funnel</span><span className="pill plain">AI chat</span></div>
                </div>
              </a>
              <a className="card proj" href="https://www.harmonicproduction.co" target="_blank" rel="noopener">
                <div className="shot"><div className="bar"><i></i><i></i><i></i><span>harmonicproduction.co</span></div><Image src="/night-ride/work/harmonic.jpg" alt="Harmonic Production homepage" loading="lazy" width={1200} height={750} /></div>
                <div className="proj-body">
                  <div className="card-top"><span className="tag"><svg><use href="#star"/></svg>No. 06</span><span className="arrow"><svg><use href="#arrup"/></svg></span></div>
                  <h3 className="h3">Harmonic Production</h3>
                  <p>Audio visual and concert production · Cleveland, TN</p>
                  <div className="pills"><span className="pill plain">Web design</span><span className="pill plain">Local SEO</span><span className="pill plain">Project portfolio</span></div>
                </div>
              </a>
            </div>
            <div className="center-cta btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn btn-ghost" href="/results">See all work <svg><use href="#arr"/></svg></Link>
              <a className="btn btn-primary" href="#start">Start a website project</a>
            </div>
          </div>
        </section>

        {/* RESULTS */}

      {/* FINAL CTA */}
        {/* WHAT HAPPENS, AND WHEN: how long it takes and how little the client has to do. */}
      <section id="how">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="eyebrow"><svg><use href="#star" /></svg>How it works</span>
              <h2 className="h-display h2">What happens,<br /><span className="grad">and when.</span></h2>
            </div>
            <p className="lede">Your part is small. We do the building, and we show you what it brings in.</p>
          </div>
          <div className="grid-4">
            {TIMELINE.map((t, i) => (
              <div key={t.title} className="card tline">
                <span className="when mono">{pad(i + 1)} · {t.when.toUpperCase()}</span>
                <h3 className="h3">{t.title}</h3>
                <p>{t.body}</p>
                <div className="yours"><span>Your part</span>{t.yours}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES: Local Growth is the one to sell. Every package is month to month. */}
      <section id="pricing" style={{ paddingTop: "0" }}>
        <div className="wrap">
          <div className="head">
            <div>
              <span className="eyebrow"><svg><use href="#star" /></svg>Pricing</span>
              <h2 className="h-display h2">Start at <span className="grad">$297</span><br />a month.</h2>
            </div>
            <p className="lede">Most businesses start with Local Growth. Every package is month to month, with no contract.</p>
          </div>
          <div className="pkgs">
            {PACKAGES.map((p) => (
              <div key={p.name} className={`card pkg${p.featured ? " pkg-main vf" : ""}`}>
                {p.featured && <Corners />}
                {p.badge && <span className="pill hot">{p.badge}</span>}
                <h3 className="h3">{p.name}</h3>
                <div className="price">{p.price} {p.unit && <small>{p.unit}</small>}</div>
                <p>{p.tagline}</p>
                <ul>
                  {p.bullets.map((x) => <li key={x}>{x}</li>)}
                </ul>
                {p.note && <p className="roi"><Check /> {p.note}</p>}
              </div>
            ))}
          </div>
          <p className="note">Websites start at $997, one time, and you own the site. Hosting, maintenance and updates start at $30 a month.</p>
          <div className="btn-row" style={{ marginTop: "22px" }}>
            <a className="btn btn-primary" href="#start">Get a free proposal <ArrowRight /></a>
            <Link className="btn btn-ghost" href="/pricing">See full pricing</Link>
            {/* Black Friday 2026: remove this link with the banner when the deal closes. */}
            <Link className="btn btn-ghost" href="/black-friday">See the Black Friday deal</Link>
          </div>
        </div>
      </section>

      <section id="start" style={{ paddingBlock: "20px clamp(72px,10vw,140px)" }}>
          <div className="wrap">
            <div className="final card vf">
              <div className="beam" aria-hidden="true"></div>
              <span className="c tl"></span><span className="c tr"></span><span className="c bl"></span><span className="c br"></span>
              <div className="reel-top mono"><span className="rec">OPEN · MON–FRI 9–5</span><span>VILLA RICA, GA</span></div>
              <span className="eyebrow"><svg><use href="#star"/></svg>Saddle up</span>
              <h2 className="h-display h2">Your business deserves to <span className="grad">get found.</span></h2>
              <p className="lede">Tell us about your business. We look at your website, your Google profile and your top competitors, then send back a plan with clear prices.</p>
              <div className="btn-row">
                <button type="button" className="btn btn-primary" data-proposal="home_final_cta">Get my free proposal <svg><use href="#arr"/></svg></button>
                <a className="btn btn-ghost" href="tel:+14702437517"><svg><use href="#phone"/></svg>(470) 243-7517</a>
              </div>
              <div className="trust"><span className="faces"><Image src="/night-ride/team/dave-face.jpg" alt="" width={30} height={30} /><Image src="/night-ride/team/josh-face.jpg" alt="" width={30} height={30} /></span><span>Talk to Dave or Josh, not a call center</span><span className="dotsep"></span><a href="mailto:howdy@creativecowboys.co">howdy@creativecowboys.co</a></div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" style={{ paddingTop: "0" }}>
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow"><svg><use href="#star"/></svg>Client reviews</span>
                <h2 className="h-display h2">What our<br />clients say.</h2>
              </div>
              <p className="lede">About the work, the response time and the results. Word for word from our Google reviews.</p>
            </div>
          </div>
          <div className="marquee">
            <div className="track">
                <article className="card quote"><div className="qm">“</div><p>They have completely transformed my marketing, and my phone rings off the hook now! I am very satisfied with the service I have received from Creative Cowboys and will continue to use them for my website, SEO, and AIO</p><div className="who"><span className="avatar logo fill"><Image src="/night-ride/reviews/arctic-law.png" alt="" width={96} height={96} /></span><div><b>Kaden VanWey</b><span>Arctic Law Alaska · Wasilla, AK</span></div></div></article>
                <article className="card quote"><div className="qm">“</div><p>Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend.</p><div className="who"><span className="avatar logo light"><Image src="/night-ride/reviews/cia.png" alt="" width={96} height={96} /></span><div><b>Rob Goldin</b><span>Commercial Insurance Agency · Bremen, GA</span></div></div></article>
                <article className="card quote"><div className="qm">“</div><p>Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do. They wanted to get to know me and my business and they listened to what I wanted for my website and delivered just that.</p><div className="who"><span className="avatar logo pad-s"><Image src="/night-ride/reviews/shana.png" alt="" width={96} height={96} /></span><div><b>Shana Genenbacher</b><span>Realtor · Prattville, AL</span></div></div></article>
                <article className="card quote"><div className="qm">“</div><p>Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to updates and needs with zero downtime.</p><div className="who"><span className="avatar logo pad"><Image src="/night-ride/reviews/harmonic.png" alt="" width={240} height={93} /></span><div><b>Ryan Coffey</b><span>Harmonic Production · Cleveland, TN</span></div></div></article>
                <article className="card quote"><div className="qm">“</div><p>I had very specific needs for my website, and they worked closely with me to build exactly what my company required. It felt like I was the only company in the world and they invested all of their time and resources to me. Because of this, we are seeing fresh growth in our company.</p><div className="who"><span className="avatar">DH</span><div><b>Daniel Hooper</b><span>Google review</span></div></div></article>
                <article className="card quote"><div className="qm">“</div><p>Creative Cowboys Media knows exactly what they’re doing! They get the job done right and it shows in the projects that they get their hands on.</p><div className="who"><span className="avatar">AM</span><div><b>Alexandra McKinley</b><span>Google review</span></div></div></article>
                <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>They have completely transformed my marketing, and my phone rings off the hook now! I am very satisfied with the service I have received from Creative Cowboys and will continue to use them for my website, SEO, and AIO</p><div className="who"><span className="avatar logo fill"><Image src="/night-ride/reviews/arctic-law.png" alt="" width={96} height={96} /></span><div><b>Kaden VanWey</b><span>Arctic Law Alaska · Wasilla, AK</span></div></div></article>
                <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Top notch service! We have been with Josh and his crew for 2 years and have seen GREAT ROI. Always responsive when we have a question/issue. Highly recommend.</p><div className="who"><span className="avatar logo light"><Image src="/night-ride/reviews/cia.png" alt="" width={96} height={96} /></span><div><b>Rob Goldin</b><span>Commercial Insurance Agency · Bremen, GA</span></div></div></article>
                <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Josh and Dave are wonderful to work with. They are genuine, down-to-earth and truly care about the work they do. They wanted to get to know me and my business and they listened to what I wanted for my website and delivered just that.</p><div className="who"><span className="avatar logo pad-s"><Image src="/night-ride/reviews/shana.png" alt="" width={96} height={96} /></span><div><b>Shana Genenbacher</b><span>Realtor · Prattville, AL</span></div></div></article>
                <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Creative Cowboys provided us with a complete rehaul of our website and optimized our SEO which has provided our company with an almost 300% increase in customer engagement with a 200% customer retention. Cowboys always responded quickly to updates and needs with zero downtime.</p><div className="who"><span className="avatar logo pad"><Image src="/night-ride/reviews/harmonic.png" alt="" width={240} height={93} /></span><div><b>Ryan Coffey</b><span>Harmonic Production · Cleveland, TN</span></div></div></article>
                <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>I had very specific needs for my website, and they worked closely with me to build exactly what my company required. It felt like I was the only company in the world and they invested all of their time and resources to me. Because of this, we are seeing fresh growth in our company.</p><div className="who"><span className="avatar">DH</span><div><b>Daniel Hooper</b><span>Google review</span></div></div></article>
                <article className="card quote" aria-hidden="true"><div className="qm">“</div><p>Creative Cowboys Media knows exactly what they’re doing! They get the job done right and it shows in the projects that they get their hands on.</p><div className="who"><span className="avatar">AM</span><div><b>Alexandra McKinley</b><span>Google review</span></div></div></article>
              </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ paddingTop: "clamp(40px,6vw,80px)" }}>
          <div className="wrap faq">
            <div className="faq-side">
              <span className="eyebrow"><svg><use href="#star"/></svg>FAQ</span>
              <h2 className="h-display h2">Common<br />questions.</h2>
              <p className="lede">Everything you need to know before we work together.</p>
              <div className="card ask"><b>Don&apos;t see your question?</b><a className="btn btn-primary" href="#start" style={{ padding: "12px 18px", fontSize: "15px" }}>Ask us</a></div>
            </div>
            <div className="qa">
              <details open><summary><span className="n">01</span><span className="q">What does Creative Cowboys do?</span><span className="pm"><svg width="14" height="14"><use href="#plus"/></svg></span></summary><div className="a"><p>We build websites, run local SEO, manage Google Ads and Facebook and Instagram ads, and set up a CRM with AI chat so no lead slips through. It is a small team based in Villa Rica, Georgia, so you talk to the people doing the work.</p></div></details>
              <details><summary><span className="n">02</span><span className="q">How do we get started?</span><span className="pm"><svg width="14" height="14"><use href="#plus"/></svg></span></summary><div className="a"><p>Ask for a free proposal. We review your current website, your Google Business Profile and your competitors, then send a plan with what we would do and what it costs.</p></div></details>
              <details><summary><span className="n">03</span><span className="q">Do you only work in West Georgia?</span><span className="pm"><svg width="14" height="14"><use href="#plus"/></svg></span></summary><div className="a"><p>No. We started in Villa Rica, Carrollton and Douglasville, and now work with businesses across Georgia, Tennessee, Alabama and the rest of the Southeast.</p></div></details>
              <details><summary><span className="n">04</span><span className="q">Who do you usually work with?</span><span className="pm"><svg width="14" height="14"><use href="#plus"/></svg></span></summary><div className="a"><p>Local service businesses that need the phone to ring: roofers, law firms, contractors, pool companies, insurance agencies, restaurants and churches.</p></div></details>
              <details><summary><span className="n">05</span><span className="q">Can I hire you for just one thing?</span><span className="pm"><svg width="14" height="14"><use href="#plus"/></svg></span></summary><div className="a"><p>Yes. You can start with only a website, only Google Ads or only SEO. Each service works on its own, and they work better together.</p></div></details>
              <details><summary><span className="n">06</span><span className="q">How will I know it&apos;s working?</span><span className="pm"><svg width="14" height="14"><use href="#plus"/></svg></span></summary><div className="a"><p>We track calls, form leads and Google rankings, and we show you those numbers. If something isn&apos;t bringing in business, we change it.</p></div></details>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={190} height={36} style={{ height: "36px", width: "auto", marginBottom: "18px" }} />
              <p>Websites, SEO and ads for local businesses across the Southeast. Built in Villa Rica, Georgia.</p>
              <a className="btn btn-primary" href="#start" style={{ padding: "12px 18px", fontSize: "15px" }}>Get a free proposal <svg><use href="#arr"/></svg></a>
              <div className="socials"><a className="pill plain" href="https://www.facebook.com/creativecowboys" target="_blank" rel="noopener">Facebook</a><a className="pill plain" href="https://www.instagram.com/creativecowboysmedia" target="_blank" rel="noopener">Instagram</a></div>
            </div>
            <div>
                <h4 className="eyebrow"><svg><use href="#star"/></svg>Navigate</h4>
                <ul><li><Link href="/results">Results</Link></li><li><Link href="/pricing">Pricing</Link></li><li><Link href="/blog">Blog</Link></li><li><Link href="/about">About</Link></li><li><Link href="/contact">Contact</Link></li></ul>
              </div>
            <div>
                <h4 className="eyebrow"><svg><use href="#star"/></svg>Services</h4>
                <ul><li><Link href="/web-design">Web design</Link></li><li><Link href="/seo">Local SEO</Link></li><li><Link href="/ppc">Google Ads</Link></li><li><Link href="/social-media-ads">Social media ads</Link></li><li><Link href="/brand-strategy">Brand strategy</Link></li><li><Link href="/media-creation">Media creation</Link></li></ul>
              </div>
            <div>
              <h4 className="eyebrow"><svg><use href="#star"/></svg>Contact</h4>
              <dl className="contact" style={{ margin: "0" }}>
                <dt>Email</dt><dd><a href="mailto:howdy@creativecowboys.co">howdy@creativecowboys.co</a></dd>
                <dt>Phone</dt><dd><a href="tel:+14702437517">(470) 243-7517</a></dd>
                <dt>Hours</dt><dd>Mon–Fri, 9 AM–5 PM</dd>
                <dt>Based in</dt><dd>Villa Rica, Georgia</dd>
              </dl>
            </div>
          </div>
          <div className="wordmark" aria-hidden="true"><span className="wm-fit">Creative Cowboys</span></div>
          <div className="legal"><span>© 2026 Creative Cowboys</span><span className="credit">Designed &amp; built by <Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={600} height={114} /></span><nav><Link href="/privacy-policy">Privacy</Link><Link href="/legal/terms-of-service">Terms</Link><Link href="/sms-terms">SMS terms</Link><a className="arrow" href="#top" aria-label="Back to top"><svg style={{ transform: "rotate(-90deg)" }}><use href="#arr"/></svg></a></nav></div>
        </div>
      </footer>
    </div>
  );
}
