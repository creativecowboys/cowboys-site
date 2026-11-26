import Image from "next/image";
import Link from "next/link";

/**
 * The parts every Night Ride page shares: the icon sprite, the Black Friday banner, the top nav and
 * the footer. They only render correctly inside a `.nr-home` wrapper (see home.css).
 *
 * Icons are the five <symbol>s in NrSprite, used through <use href="#id" />.
 */

const NAV_LINKS = [
  { id: "crew", label: "Crew" },
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "results", label: "Results" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
];

export function NrSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="star" viewBox="0 0 24 24"><rect x="1.5" y="4.5" width="21" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 7.6l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor"/></symbol>
      <symbol id="arr" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="arrup" viewBox="0 0 16 16"><path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="plus" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></symbol>
      <symbol id="phone" viewBox="0 0 16 16"><path d="M5.2 2.5l1.6 3-1.2 1.2a8 8 0 0 0 3.7 3.7l1.2-1.2 3 1.6-.6 2.4c-5.5.4-10.4-4.5-10-10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></symbol>
    </svg>
  );
}

/** Black Friday 2026 deal banner. The Facebook ads say "go to creativecowboys.co", so the site has
 *  to point at the deal page. Remove this (and its uses) when the deal closes. */
export function NrBanner() {
  return (
    <Link href="/black-friday" className="bf-banner">
      Black Friday: a free website with any marketing package. Limited spots. <span>Claim yours &rarr;</span>
    </Link>
  );
}

/** Top nav. On the homepage the links jump to its sections; on every other page they go to the
 *  same sections on the homepage. The button always goes to the page's own `#start` section. */
export function NrNav({ home = false }: { home?: boolean }) {
  const base = home ? "" : "/";
  return (
    <header className="nav">
      <div className="wrap">
        <div className="nav-in">
          <Link className="nav-logo" href="/" aria-label="Creative Cowboys home"><Image src="/night-ride/logo-white.png" alt="Creative Cowboys" width={158} height={30} /></Link>
          <nav className="nav-links" aria-label="Main">
            {NAV_LINKS.map((l) => (<a key={l.id} href={`${base}#${l.id}`}>{l.label}</a>))}
          </nav>
          <a className="btn btn-primary" href="#start"><span>Free Proposal</span><svg><use href="#arr"/></svg></a>
        </div>
      </div>
    </header>
  );
}

export function NrFooter() {
  return (
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
        <div className="wordmark" aria-hidden="true"><span className="wm-fit"><span>C</span>owboys</span></div>
        <div className="legal"><span>© 2026 Creative Cowboys</span><nav><Link href="/privacy-policy">Privacy</Link><Link href="/legal/terms-of-service">Terms</Link><Link href="/sms-terms">SMS terms</Link><a className="arrow" href="#top" aria-label="Back to top"><svg style={{ transform: "rotate(-90deg)" }}><use href="#arr"/></svg></a></nav></div>
      </div>
    </footer>
  );
}
