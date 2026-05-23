# Antigravity Prompt — Fix creativecowboys.co Indexing Issues

> Copy everything below the line into Antigravity. The bracketed `[YOU CONFIRM]` notes at the top are things to fill in or strip before pasting.

---

## Pre-flight (fill in or delete before pasting)

- **Hosting / framework:** [YOU CONFIRM — e.g. "Next.js on Vercel", "Astro on Netlify", "Framer", "Webflow"]
- **Production domain:** `www.creativecowboys.co` (this is the canonical we're standardizing on)
- **Repo root path in Antigravity workspace:** [YOU CONFIRM]
- **Deploy command / preview URL after merge:** [YOU CONFIRM]

If the site is on Framer or Webflow (no code repo), skip Sections 4–6 below and tell me — those need to be done in the visual editor and I'll write you a separate checklist.

---

# Task: Fix Google Search Console indexing issues for creativecowboys.co

You are working on the production website for Creative Cowboys (a marketing agency). Google Search Console currently reports **5 indexed pages and 50 not-indexed pages**. I have already audited GSC and identified the root causes — your job is to implement the fixes, not re-diagnose. Do **not** change visual design, copy, or page content unless explicitly listed below. Stay surgical.

## Verified findings (do not redo this analysis)

1. The site does a **307 (Temporary)** redirect from `creativecowboys.co` → `www.creativecowboys.co`. It needs to be **301 (Permanent)**. The 307 is the single biggest cause of pages stalling in "Crawled — currently not indexed."
2. `/sitemap.xml` lists every URL with the **non-www** hostname (`https://creativecowboys.co/...`). Those URLs all 307-redirect on every Googlebot fetch. They need to use `https://www.creativecowboys.co/...`.
3. `/robots.txt` also references the non-www sitemap location. Same fix.
4. The site has **legacy URL patterns from a prior version** that now return 404 or are duplicated. They need permanent (301) redirects to the current equivalents.
5. A few real pages return **404 on the www host** even though they look like they should exist (`/local-seo`, `/single-service`, several blog posts). These need to either be built/restored or 301'd to the closest live equivalent.
6. `lastmod` dates in the sitemap are all hardcoded to `2025-01-01`. They need to reflect real content modification dates.

## What to do, in order

### 1. Change non-www → www redirect from 307 to 301

Find wherever the apex-domain → www redirect is configured. Possibilities, in likely order:

- **Next.js (`next.config.js` / `next.config.mjs`):** `redirects()` entries default to 307 unless `permanent: true` is set. Find any redirect with `source` matching the apex host and set `permanent: true`.
- **Vercel (`vercel.json`):** `"redirects"` array — set `"permanent": true`.
- **Netlify (`_redirects` or `netlify.toml`):** change `301!` or add the `301` status code; do not use `302`.
- **Cloudflare Page Rules / Redirect Rules:** change "Forwarding URL — Temporary (302)" to "Permanent (301)".
- **DNS-level (e.g. Cloudflare Bulk Redirects):** set status to 301.

After the change, verify with:
```
curl -sI https://creativecowboys.co/ | head -5
```
The first response line must be `HTTP/2 301` (not 307, not 302), and `location:` must be `https://www.creativecowboys.co/`.

### 2. Fix `/sitemap.xml`

Locate the sitemap source. It is most likely one of:
- A static `public/sitemap.xml`
- A dynamic route (`app/sitemap.ts`, `pages/sitemap.xml.tsx`, `src/routes/sitemap.xml.js`, etc.)
- A build-time generator (e.g. `next-sitemap`, `astro-sitemap`)

Make these changes:

1. **Hostname:** every `<loc>` value must start with `https://www.creativecowboys.co/` (currently `https://creativecowboys.co/`).
2. **`<lastmod>` dates:** stop hardcoding `2025-01-01`. Either use the file's `mtime`, the CMS `updatedAt` field, or the build timestamp — whichever is realistic for that page type. Format as ISO 8601 (`2026-05-23` or `2026-05-23T00:00:00+00:00`).
3. **Remove any URL that 404s** when fetched (see Section 5 for the audit list). Stale entries in a sitemap are an active negative signal.
4. **Add any current live pages that are missing.** Walk the routes/pages directory and make sure each public, indexable page appears. Common omissions: blog post detail pages, location/landing pages, legal pages.

Keep the existing `<?xml-stylesheet href="/sitemap.xsl"?>` line if it exists — that's the styling that makes it readable in a browser, it's fine.

### 3. Fix `/robots.txt`

Current content includes:
```
Sitemap: https://creativecowboys.co/sitemap.xml
```

Change to:
```
Sitemap: https://www.creativecowboys.co/sitemap.xml
```

Leave the `Disallow: /cia/`, `Disallow: /proposals/`, `Disallow: /api/` rules as they are.

### 4. Add 301 redirects for legacy URL patterns

These URLs currently 404 (or duplicate live pages) and are bleeding indexing budget. Add **permanent (301)** redirects in whatever redirect mechanism the project uses (`next.config.js` `redirects()`, `vercel.json`, `_redirects`, middleware, etc.).

**Case-variant routes (PascalCase → lowercase):**

| From | To |
|---|---|
| `/Home` | `/` |
| `/About` | `/about` |
| `/Contact` | `/contact` |
| `/Services` | `/services` |
| `/Blog` | `/blog` |
| `/SEO` | `/seo` |
| `/PPC` | `/ppc` |
| `/WebDesign` | `/web-design` |

If the framework supports a case-insensitive route rule, prefer that over enumerating each one. In Next.js this is `experimental.caseSensitiveRoutes: false` (default), but for *redirects* you may need a middleware that lowercases the path and 301s.

**Legacy `/en/` locale prefix (site is monolingual now):**

| Pattern | Behavior |
|---|---|
| `/en/` | 301 → `/` |
| `/en/:path*` | 301 → `/:path*` |

Specific confirmed offenders to make sure are caught: `/en/about`, `/en/contact`, `/en/blog`, `/en/local-seo`, `/en/legal/privacy-policy`, `/en/legal/terms-of-service`, `/en/blog/saas-marketing`, `/en/blog/5-key-trends-in-saas-growth-for-2025`, `/en/blog/the-power-of-content-marketing-in-saas`.

**Legacy query-string blog routes:**

| From | To |
|---|---|
| `/BlogPost?slug=:slug` | `/blog/:slug` (301) |
| `/BlogPost?id=:id` | `/blog` (301) — we don't have the id-to-slug mapping, send them to the index |

In Next.js, query-param redirects need either `has: [{ type: 'query', key: 'slug' }]` in `next.config.js` redirects, or middleware logic.

**Renamed / moved pages:**

| From | To |
|---|---|
| `/blog/how-to-turn-your-website-into-your-1-salesperson` | `/blog` (or the closest current post — confirm with me if there's a 1:1 replacement) |
| `/blog/saas-marketing` | `/blog` |
| `/blog/the-power-of-content-marketing-in-saas` | `/blog` |
| `/blog/leveraging-seo-for-saas-success` | `/blog` |
| `/blog/small-business-ai-practical-tools-strategies-for-local-business-growth` | `/blog` |
| `/blog/5-key-trends-in-saas-growth-for-2025` | `/blog` |
| `/national-seo/` | `/seo` |
| `/ecommerce-seo/` | `/seo` |
| `/ppc-management/` | `/ppc` |
| `/local-seo/` | `/seo` (or `/local-seo` if you're building that page — see Section 5) |
| `/thank-you` | `/` (or whatever the current thank-you / confirmation route is — find it) |

**Trailing slash normalization:** Pick one canonical style (no trailing slash is the cleaner default) and 301 the other. In Next.js, set `trailingSlash: false` in `next.config.js`. In Vercel, set `cleanUrls: true, trailingSlash: false` in `vercel.json`.

### 5. Resolve the soft-404s and missing pages

GSC flagged these as "Soft 404" — Google fetched them, got an HTTP 200 (or a 404 dressed up like a 200), and decided there was no real content. Confirm each one's current state and act:

| URL | Current state (verify) | Action |
|---|---|---|
| `/single-service` | Likely a CMS template stub | Delete the route entirely, OR redirect to `/services` |
| `/local-seo` | 404 on www | Either build the page (it's a strong service-page candidate for a local agency) or 301 → `/seo` |
| `/legal/terms-of-service` | 404 | Build the page (legal must exist), or restore from version history |
| `/blog/the-power-of-content-marketing-in-saas`, `/blog/saas-marketing`, `/blog/leveraging-seo-for-saas-success` | 404 | Already covered in Section 4 redirects |

For the **"Excluded by 'noindex' tag" (1 page)** finding: search the codebase for `noindex` meta tags or `X-Robots-Tag: noindex` headers. Confirm with me which page it is before removing — it might be intentional (thank-you / admin / staging route).

### 6. Make sure canonical tags and Open Graph URLs match

Search the codebase for `<link rel="canonical"`, `og:url`, and any hardcoded site URL constants. They should all use `https://www.creativecowboys.co/` (with www, https, no trailing slash on path-bearing URLs). Common gotchas:

- A `SITE_URL` constant set to `https://creativecowboys.co` in `.env` or a config file
- Canonical tags built from `process.env.NEXT_PUBLIC_SITE_URL` that points to the non-www version
- Open Graph tags rendered in a layout that strips/adds `www` inconsistently

Also make sure the title tag stops duplicating the brand. The blog index currently renders `"Digital Marketing Blog | Creative Cowboys | Creative Cowboys"` — the brand is being appended twice. Find and fix.

### 7. Verification (do this before claiming done)

Run these checks and paste the output in your response:

```bash
# 1. Apex should 301 to www
curl -sI https://creativecowboys.co/ | head -3

# 2. Every legacy URL should 301 to the right destination
for url in \
  "https://www.creativecowboys.co/Home" \
  "https://www.creativecowboys.co/About" \
  "https://www.creativecowboys.co/Contact" \
  "https://www.creativecowboys.co/Services" \
  "https://www.creativecowboys.co/Blog" \
  "https://www.creativecowboys.co/SEO" \
  "https://www.creativecowboys.co/PPC" \
  "https://www.creativecowboys.co/WebDesign" \
  "https://www.creativecowboys.co/en/about" \
  "https://www.creativecowboys.co/en/blog" \
  "https://www.creativecowboys.co/BlogPost?slug=saas-marketing" \
  "https://www.creativecowboys.co/national-seo/" \
  "https://www.creativecowboys.co/ppc-management/"; do
  echo "=== $url ==="
  curl -sIL "$url" | grep -iE "^(HTTP|Location)"
done

# 3. Sitemap should be www, parse cleanly, and lastmod should not all be 2025-01-01
curl -s https://www.creativecowboys.co/sitemap.xml | grep -E "<loc>|<lastmod>" | head -20

# 4. Robots.txt should reference www sitemap
curl -s https://www.creativecowboys.co/robots.txt

# 5. Spot-check that canonical tags use www
curl -s https://www.creativecowboys.co/ | grep -i 'rel="canonical"\|og:url'
```

**Pass criteria:**
- Check 1: first line is `HTTP/2 301` and `location:` points to `https://www.creativecowboys.co/`
- Check 2: every URL ends in a `HTTP/2 200` (after redirects) and the first hop is `HTTP/2 301`, never 307 or 404
- Check 3: every `<loc>` starts with `https://www.creativecowboys.co/` and `<lastmod>` values are not all identical
- Check 4: the `Sitemap:` line uses `www.`
- Check 5: canonical and og:url both use `https://www.creativecowboys.co/` (with www)

## Out of scope (don't touch)

- Page copy, headlines, design, fonts, colors
- Image optimization, performance work
- New page creation beyond what Section 5 explicitly calls for
- Any GSC settings — I'll add the Domain property and run "Validate fix" in GSC myself once you deploy

## When you're done

Give me back:
1. A summary of every file you changed and why
2. The verification command output from Section 7
3. A list of any decisions you had to make that weren't explicit in this prompt (e.g. "I mapped `/blog/saas-marketing` to `/blog/google-ads-vs-seo-small-business` because the slug overlap was 80%")
4. Any URLs in Section 4 you couldn't redirect because you couldn't find a sensible destination — leave those for me to decide
