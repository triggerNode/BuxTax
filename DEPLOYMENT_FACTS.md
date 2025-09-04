# BuxTax — Vercel Hobby + Cloudflare DNS Deployment Audit

## 1) Framework & Tooling

- **Framework**: Vite + React + TypeScript (shadcn UI, Tailwind CSS)
  - Vite config: `vite.config.ts` (React SWC, MDX plugin, aliases `@ -> ./src`)
  - Router: `react-router-dom` v6
- **Versions (key)**:
  - `vite` ^5.4.1, `react` ^18.3.1, `typescript` ^5.5.3, `tailwindcss` ^3.4.11
  - MDX via `@mdx-js/rollup` ^3.1.0
- **Node version in use**: Not pinned in `engines`. Tooling implies Node >=18.18 (Vite 5 requires this). Recommend Node 18 LTS (>=18.18) on Vercel.
- **Monorepo?**: Yes. Two Vite apps exist:
  - Root app at `/` (deployable)
  - Secondary sample app at `temp-shell-repo/` (not primary; can be ignored for deploy)

## 2) Build & Start

- **Scripts (root `package.json`)**:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `export:dev`: `ts-node server/exporter.ts` (local Playwright export server; not needed on Vercel)
- **Vercel recommendations**:
  - Install command: `npm ci` (or `npm install`)
  - Build command: `npm run build`
  - Output directory: `dist`
- Not Next.js (no app/pages router). No SSG adapters; SPA served via `vercel.json` rewrite to `/index.html`.

## 3) Static Assets & Logo

- **Logo files**:
  - `/public/brand/buxtax-logo.svg`
  - `/src/assets/buxtax-logo.svg` and `/src/assets/buxtax-logo.png` (imported into components)
  - Favicons: `/public/brand/favicon.ico` (linked in `index.html`)
- **Where referenced**:
  - Components import from `@/assets/buxtax-logo.svg`:
    - `src/components/Header.tsx`, `src/components/BuxTaxHeader.tsx`, `src/pages/SignIn.tsx`, `src/pages/Terms.tsx`, `src/pages/Privacy.tsx`, `src/pages/ThankYou.tsx`
  - HTML references `/brand/favicon.ico` and OG images under `/public/og/*` in `index.html` and blog pages.
- **Case/path issues**:
  - Folder with spaces exists: `/public/Brand Asset/` (empty). `vercel.json` has redirects from spaced paths → `/brand/...`. OK on Linux due to redirects.
  - All in-code imports use consistent lowercase (`@/assets/...`, `/brand/...`). No mixed-case path imports detected.
- Next/Image: Not used.

## 4) Routing & Data

- **Client routes** (`react-router-dom`): `/`, `/calculator`, `/signin`, `/thank-you`, `/thanks` → redirect, `/terms`, `/privacy`, `/app`, `/export/profit`, `/blog`, `/blog/:slug`, `/account`, wildcard → `NotFound`.
- **SPA rewrite**: `vercel.json` rewrites `/(.*)` → `/index.html`.
- **Server-only code**: none for the frontend. Supabase Edge Functions live under `supabase/functions/*` (external to Vercel runtime). Optional local export server `server/exporter.ts` (Express + Playwright) is dev-only.
- `getServerSideProps/getStaticProps`: N/A.

## 5) Environment Variables

- Frontend uses Vite envs (prefixed with `VITE_`):
  - `VITE_SUPABASE_URL` (src/integrations generated client currently hardcodes URL; see “Risks”)
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_LIFETIME_PAYMENT_LINK` (optional, used in `src/config/links.ts`)
  - `VITE_EXPORT_BASE` (optional; used for share/export; blank in prod)
- Supabase Edge Functions (deployed via Supabase, not Vercel) require secrets set in Supabase:
  - `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- Defaults: Errors are logged in dev if `VITE_STRIPE_LIFETIME_PAYMENT_LINK` missing; otherwise no default fallbacks.

## 6) Config Files

- `vite.config.ts`: React SWC, MDX, `@` alias, dev server on port 8080. No custom `base` set.
- `tailwind.config.ts`: standard setup, extends brand theme.
- `vercel.json`:
  - `headers`: cache control for `/`, `/index.html` (no-store), `/assets/*` (1 year immutable), `/brand/*` (1 hour)
  - `rewrites`: all paths → `/index.html`
  - `redirects`: fix legacy `Brand Asset` paths and `/favicon.ico` to `/brand/favicon.ico`
- No Next/Remix/Svelte config present.

## 7) External Services & Domains

- Supabase: `https://ttumoijdqryptsnojubl.supabase.co`
- Stripe (via Supabase Functions): Webhooks and Checkout. No direct Stripe use from browser.
- Social/OG assets: absolute links to `https://bux.tax/...` inside blog/SEO. Fine in prod; in preview these still point to prod.
- Docs/links to Roblox domains; no image domain allowlists needed.

## 8) Dependencies & Native Modules

- Native-ish/large deps:
  - `playwright` (only used by `server/exporter.ts` for local export). Not needed on Vercel Hobby and should not run in build; safe to keep as dependency. No postinstall.
  - `html2canvas`, `jspdf`, `dom-to-image-more` (client-side only)
- No `sharp`/`canvas` required.

## 9) Tests to Run Locally (dry-run build)

- Commands:
  - `npm ci`
  - `npm run build`
  - Optional preview: `npm run preview` then visit http://localhost:4173

## 10) Git Status (read-only)

- Git repo detected.
- Current branch: `color-refactor` (tracking `origin/color-refactor`).
- Remote `origin`: `https://github.com/triggerNode/BuxTax.git`.

## 11) Proposed Vercel Settings (DRAFT)

- **Framework preset**: Vite
- **Root directory**: `/` (ignore `temp-shell-repo/` for deploy)
- **Install command**: `npm ci`
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment variables** (Project → Settings → Environment Variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_LIFETIME_PAYMENT_LINK` (optional)
  - `VITE_EXPORT_BASE` (leave blank in prod)
- **Node version**: 18.x (>=18.18). Set “Node.js Version” to 18.
- **Additional**: Keep `vercel.json` in repo for SPA rewrite and caching headers.

## 12) What Will Break in Prod (Risks)

- **Hardcoded Supabase client credentials**: `src/integrations/supabase/client.ts` contains a hardcoded `SUPABASE_URL` and an embedded publishable anon key.
  - Fix: regenerate the client to read `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in prod. Ensure Vercel envs are set.
- **Missing Vercel envs**: If `VITE_*` envs aren’t present, auth and API calls fail.
  - Fix: set all required envs in Vercel before deploying.
- **Preview vs prod absolute URLs**: Blog meta tags reference `https://bux.tax/...` which is fine for prod domain, but previews will point to prod images/URLs.
  - Fix: acceptable; optionally make URLs relative.
- **`public/Brand Asset/` case/space folder**: On Linux, direct references would 404.
  - Fix: Already covered via `vercel.json` redirects; keep using `/brand/...` paths in code.
- **Exporter server (Playwright)**: Not used on Vercel. If attempted to run, it would fail.
  - Fix: Don’t run `export:dev` on Vercel; only local use.

---

## COPY/PASTE CHECKLIST

- Project Settings → Framework Preset: Vite
- Root Directory: `/`
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Node.js Version: 18.x
- Env Vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_LIFETIME_PAYMENT_LINK` (optional)
  - `VITE_EXPORT_BASE` (leave empty in prod)
- Keep `vercel.json` for SPA rewrite and caching
- Configure Cloudflare DNS: A/AAAA or CNAME per Vercel domain guidance; proxy (orange-cloud) acceptable, purge cache on brand asset changes
