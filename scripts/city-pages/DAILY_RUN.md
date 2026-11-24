# Daily city page launch

Josh (Nov 18 2026): launch 10-15 new city landing pages every day, each with every
piece it needs to rank in Google's top 3 organic results. This file is the runbook
the scheduled task `cowboys-city-pages-daily` follows. Keep it current when the
process changes.

Repo: `/Users/cowboysmac/Documents/Claude/cowboys-site-citypages`
(GitHub `creativecowboys/cowboys-site`; Vercel deploys `main` to www.creativecowboys.co.
Never deploy straight to Vercel.)

## 1. Start clean

```bash
cd /Users/cowboysmac/Documents/Claude/cowboys-site-citypages
git checkout main && git pull --ff-only
npm ci --no-audit --no-fund   # only if package-lock.json changed
```

If `git status` shows uncommitted work, stop and report it. Don't discard anything.

## 2. Pick today's cities

Open `scripts/city-pages/queue.json`. Take the first **12** entries with
`"status": "queued"` (raise to 15 if yesterday's run had no failures). Skip any
whose `src/content/city-pages/<slug>.json` already exists.

## 3. Write the pages

Spawn writer subagents in parallel, 3 cities each, with this brief (fill in cities):

> You are writing SEO city landing pages for Creative Cowboys in the Next.js repo at
> /Users/cowboysmac/Documents/Claude/cowboys-site-citypages. Write: <City ST (slug)>, ...
> Read scripts/city-pages/CONTENT_SPEC.md (the rules), src/content/city-pages/dunwoody-ga.json
> (the reference: match its depth and voice, never its sentences), src/lib/city-pages/types.ts,
> and each city's entry in scripts/city-pages/queue.json (use its lat, lon, population, metro,
> stateName exactly). Load the `humanizer` skill and apply it. Research real local facts with
> web search and list every source. Leave out anything you can't verify. No invented clients,
> numbers, offices or rankings. Prices only as the spec says. Write
> src/content/city-pages/<slug>.json with published/updated = today, then run
> `node scripts/city-pages/validate.mjs <slug>` and fix every FAIL. Only create your JSON
> files; never edit another file, build, commit or push. Report slugs, validator result,
> and anything you left out, under 200 words.

## 4. Check the work yourself

- `node scripts/city-pages/validate.mjs` must pass for every page. A page that still
  fails after one fix attempt is deleted and stays `queued`; note it in the log.
- Read at least 3 of today's pages in full. Spot-check 2 facts per page against the
  listed sources. Fix or cut anything wrong, stuffed, or AI-sounding.

## 5. Build

```bash
node scripts/city-pages/generate.mjs
npx tsc --noEmit -p .
npm run build
```

All three must succeed. Never ship a failing build.

## 6. Ship

- Set each shipped entry in `queue.json` to `"status": "published", "publishedOn": "<today>"`.
- Append a line per page to `scripts/city-pages/launch-log.md`
  (`date | slug | url | web design/seo/marketing searches/mo`).
- Branch `city-pages/<today>`, one commit ("City pages: <n> new for <date>: <cities>",
  ending with the Co-Authored-By line), push, open a PR, and merge it to main with
  `gh pr merge --squash --delete-branch`.
- If pushing to main or merging is blocked by permissions, stop there: leave the PR
  open and report its link so Josh can merge.

## 7. Verify it's live

Wait for the Vercel production deployment of the merge commit (check
`gh api repos/creativecowboys/cowboys-site/commits/<sha>/status` slowly, every
60-90 seconds, up to 15 minutes; don't hammer the site). Then confirm:

- each new URL returns 200 on https://www.creativecowboys.co
- each appears in https://www.creativecowboys.co/sitemap.xml
- /areas-we-serve lists it

## 8. Report

Finish with a short summary: pages shipped (with URLs), any held back and why, the
build and deploy status, and the next 5 cities in the queue.
