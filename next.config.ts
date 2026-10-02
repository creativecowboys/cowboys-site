import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "ruixen.com",
      },
    ],
  },
  async redirects() {
    return [
      // NOTE: /about is now a real page (src/app/about/page.tsx). It used to
      // redirect here, which left the site with no About page at all — a gap
      // for both E-E-A-T and AI engines trying to resolve us as an entity.
      // Short link printed on the giveaway video + social assets. Next preserves
      // the query string automatically, so per-channel UTMs survive the hop (§8).
      // statusCode 301 rather than `permanent: true` (which emits 308) — the spec
      // asks for a 301 and some social crawlers still treat it more predictably.
      { source: '/giveaway', destination: '/thebiggiveaway', statusCode: 301 },
      // The campaign page shipped briefly at its old path; keep that alive so
      // anything already linking or crawling it doesn't hit a 404.
      { source: '/christmas-in-september', destination: '/thebiggiveaway', statusCode: 301 },
      // The old in-site client portal was retired Oct 2 2026. A bookmarked portal link goes home instead of a 404.
      // 307 on purpose (not cached), same as the /leads → /admin forward.
      { source: '/clients', destination: '/', permanent: false },
      { source: '/clients/:path*', destination: '/', permanent: false },
      { source: '/home-new', destination: '/', permanent: true },
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      {
        source: '/BlogPost',
        has: [{ type: 'query', key: 'slug' }],
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/BlogPost',
        has: [{ type: 'query', key: 'id' }],
        destination: '/blog',
        permanent: true,
      },
      { source: '/blog/how-to-turn-your-website-into-your-1-salesperson', destination: '/blog', permanent: true },
      { source: '/blog/saas-marketing', destination: '/blog', permanent: true },
      { source: '/blog/the-power-of-content-marketing-in-saas', destination: '/blog', permanent: true },
      { source: '/blog/leveraging-seo-for-saas-success', destination: '/blog', permanent: true },
      { source: '/blog/small-business-ai-practical-tools-strategies-for-local-business-growth', destination: '/blog', permanent: true },
      { source: '/blog/5-key-trends-in-saas-growth-for-2025', destination: '/blog', permanent: true },
      // /local-seo and /national-seo are real pages again — they're distinct
      // buyer intents (proximity/map-pack vs. architecture/authority) and each
      // has actual client work behind it, so collapsing both into /seo was
      // throwing away two commercial-intent URLs.
      //
      // These two stay redirected on purpose:
      //   /ppc-management — same intent as /ppc. Two pages chasing one query
      //     just split the signal between them.
      //   /ecommerce-seo  — no ecommerce client work to point at yet. Revisit
      //     when there's a case study to put on it.
      { source: '/ecommerce-seo', destination: '/seo', permanent: true },
      { source: '/ppc-management', destination: '/ppc', permanent: true },
      { source: '/thank-you', destination: '/', permanent: true },
      { source: '/single-service', destination: '/services', permanent: true },
      // The team desk moved from /leads to /admin on Oct 2 2026. Bookmarks, the Oct 2 team email, calendar-feed
      // events and the "Desk Link" stored on GoHighLevel contacts all still say /leads, so it forwards for good:
      // the same path under /admin, and Next keeps the query string (/leads?tab=clients&client=abc lands on
      // /admin?tab=clients&client=abc). 307 on purpose: a browser caches a permanent redirect indefinitely, and a
      // team tool gains nothing from that. These run before the middleware, which then asks for sign-in on /admin.
      { source: '/leads', destination: '/admin', permanent: false },
      { source: '/leads/:path*', destination: '/admin/:path*', permanent: false },
      // The old admin screen (logins for the retired in-site client portal) was removed the same day. Its pages
      // lived under /admin/clients; anything still pointing there goes to the desk.
      { source: '/admin/clients', destination: '/admin', permanent: false },
      { source: '/admin/clients/:path*', destination: '/admin', permanent: false },
    ];
  },
};

export default nextConfig;
