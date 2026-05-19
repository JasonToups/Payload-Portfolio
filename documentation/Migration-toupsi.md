# Migration: `now-hiring` → `toupsi` / `jasontoups.com` → `toupsi.com`

## Context

The project was originally branded as "now-hiring" with the domain `jasontoups.com`. This document tracks the full migration to the `toupsi` brand and `toupsi.com` domain — covering code changes, ENV updates, and external platform steps.

---

## Code Changes

| File | Change |
|---|---|
| `package.json` | `"name": "now-hiring"` → `"name": "toupsi"` |
| `docker-compose.yml` | `POSTGRES_DB: now-hiring` → `POSTGRES_DB: toupsi` |
| `scripts/db-pull.sh` | fallback LOCAL_URL database `now-hiring` → `toupsi` |
| `.env.local` | `POSTGRES_URL` database segment `now-hiring` → `toupsi` |
| `.env` | 4 ENV vars (see table below) |
| `.env.example` | comment: `now-hiring` database → `toupsi` |
| `src/utilities/blobUrl.ts` | comment: `updates.jasontoups.com` → `updates.toupsi.com` |
| `documentation/Development.md` | database references `now-hiring` → `toupsi` (lines 33, 53) |
| `.claude/agents/perf-audit.md` | project name reference `now-hiring` → `toupsi` |

### Docker DB note

After changing `docker-compose.yml`, recreate the local container to pick up the new DB name:

```bash
docker compose down -v
pnpm db:local
pnpm dev   # re-pushes schema to the new container
```

---

## ENV Vars to Update

Update in both `.env` (local) and the Vercel dashboard (all environments: Production, Preview, Development):

| Variable | Old Value | New Value |
|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `https://jasontoups.com` | `https://toupsi.com` |
| `RESEND_FROM` | `Jason Toups <newsletter@updates.jasontoups.com>` | `Jason Toups <newsletter@updates.toupsi.com>` |
| `RESEND_FROM_ADDRESS` | `newsletter@updates.jasontoups.com` | `newsletter@updates.toupsi.com` |
| `LINKEDIN_REDIRECT_URI` | `https://jasontoups.com/api/linkedin/callback` | `https://toupsi.com/api/linkedin/callback` |

---

## External Platform Checklist

### Database / Infrastructure
- [ ] **Neon** — rename project name in dashboard
- [ ] **Vercel** — rename project name in dashboard
- [ ] **Vercel Blob Storage** — rename store name

### Application
- [ ] **Payload Admin** — update Site Name in Settings
- [ ] **Vercel ENV vars** — update the 4 variables above (all environments)

### Auth / OAuth
- [ ] **LinkedIn Developer** — rename app name
- [ ] **LinkedIn Developer** — update Authorized Redirect URLs: `jasontoups.com` → `toupsi.com`

### DNS / Domains
- [ ] **Squarespace** — update DNS records on `jasontoups.com` (remove or set up redirect)
- [ ] **Squarespace** — configure DNS records on `toupsi.com` pointing to Vercel
- [ ] **Vercel** — add `toupsi.com` as a custom domain; remove or redirect `jasontoups.com`

### Email (Resend)
- [ ] **Resend Admin** — add `updates.toupsi.com` as a new sending domain
- [ ] **Resend Admin** — configure DNS records for `updates.toupsi.com` (DKIM/SPF/DMARC)
- [ ] **Resend Admin** — remove or archive `updates.jasontoups.com` after DNS propagates

### Contact
- [ ] **Google Voice** — set up `hi@toupsi.com`

---

## Order of Operations

1. **DNS first** — update Squarespace DNS for `toupsi.com` → Vercel. Propagation takes time; start here.
2. **Vercel** — rename project, add `toupsi.com` custom domain.
3. **Vercel ENV vars** — update the 4 variables, then redeploy.
4. **LinkedIn** — update redirect URIs once the domain is live.
5. **Resend** — add `updates.toupsi.com` sending domain + configure DNS.
6. **Code commit** — commit all code changes and push.

---

## Verification

- [ ] `https://toupsi.com` loads with no mixed-content errors
- [ ] `https://toupsi.com/admin` — Payload admin shows updated Site Name
- [ ] LinkedIn OAuth flow (post sharing) works end-to-end
- [ ] Test newsletter email arrives from `newsletter@updates.toupsi.com`
- [ ] `robots.txt` and `sitemap.xml` reference `toupsi.com` (regenerated at build via `next-sitemap`)
- [ ] `pnpm db:local` spins up the `toupsi` database successfully
