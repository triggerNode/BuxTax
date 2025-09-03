<img width="48" height="48" alt="icon48" src="https://github.com/user-attachments/assets/252a23a8-3266-4d21-b655-f246f1a748ec" /> 

**BuxTax**


Reveal the true USD value of your Roblox work.

## Why BuxTax exists

Roblox creators often guess their real earnings. Marketplace fees, group splits, ad spend, affiliate payouts, refunds, and the DevEx conversion all blur the truth. You see Robux totals. You need to know your take home in USD. That clarity guides pricing, ad budgets, and roadmap decisions.

BuxTax exists to make the money side legible. It turns messy Robux inputs into clean USD insights you can act on.

## How BuxTax delivers clarity

BuxTax focuses on three moments where creators need answers.

1. Profit Calculator

- Enter gross Robux and optional costs like ad spend, group splits, affiliate payouts, refunds, and other costs.
- See your net Robux, your USD payout, and your effective take rate.
- Choose your creator type. Game developers use a 30% platform fee. UGC creators use a 70% platform fee.
- Based on the current DevEx rate of 350 Robux per 1 USD.

2. Goal Seeker

- Set a target USD payout and a deadline.
- Get the required gross Robux to hit that goal, factoring in expected costs and marketplace fees.
- See the exact reverse math so you can plan your path with confidence.

3. Payout Pulse

- Upload your CSV payout exports.
- Track net earnings over time in Robux or USD. Filter by 30 or 90 days.
- Break down the impact of key cost categories. Export a cleaned CSV.
- Map columns with a guided mapper so your data lines up.

On top of that you can share visuals. Download clean PNG or PDF snapshots. Generate captions for social posts. Turn insights into momentum.

## What you get

- Transparent math: 350 Robux equals 1 USD DevEx, 30% platform fee for game developers, 70% for UGC creators. Values live in `src/lib/fees.ts` and can be updated.
- Two creator modes: Game Developer and UGC Creator. Each mode uses the correct fee structure.
- Live insights: Effective take rate, USD payout, net Robux, and goal math update as you type.
- CSV analytics: Time series charts, fee breakdown tables, date range filters, and CSV export.
- Social sharing and export: PNG and PDF exports with on brand visuals.
- Modern UI: Built with React, Vite, TypeScript, Tailwind, and shadcn UI.
- Auth and paywall: Supabase Auth with branded emails, Stripe checkout, and webhook driven access.

## Screenshots

**Profit Calculator**     

<img width="554" height="419" alt="Profit Calculator" src="https://github.com/user-attachments/assets/fe63d842-f08b-4e91-89ce-6141751ae772" />

**Goals**                 

<img width="549" height="333" alt="Goals" src="https://github.com/user-attachments/assets/110a2699-22c9-4b9a-89a8-fcdd02508ab6" />

**Payout Pulse**          

<img width="732" height="454" alt="Payout Pulse" src="https://github.com/user-attachments/assets/94ccf078-d59f-4c7f-a836-77a0432e35a4" />


## Quick start

1. Requirements

- Node 18 or newer
- npm 9 or newer

2. Clone and install

```bash
git clone <your_repo_url>
cd BuxTax
npm install
```

3. Configure environment

```bash
cp env.template .env
# Edit .env and set values for:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_STRIPE_LIFETIME_PAYMENT_LINK (optional if using payment link)
# STRIPE_SECRET
# STRIPE_WEBHOOK_SECRET
# SUPABASE_SERVICE_ROLE
```

4. Run the app

```bash
npm run dev
```

5. Build for production

```bash
npm run build
```

## Configuration

Environment variables used by the app. See `env.template` for the canonical list.

- VITE_SUPABASE_URL: Your Supabase project URL
- VITE_SUPABASE_ANON_KEY: Supabase anonymous key
- VITE_STRIPE_LIFETIME_PAYMENT_LINK: Optional Stripe Payment Link for lifetime plan
- STRIPE_SECRET: Stripe secret key
- STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret
- SUPABASE_SERVICE_ROLE: Supabase service role key for secure server logic

Payments and auth

- Supabase Auth is used for sign in and user profiles. Email templates live in `supabase/templates`.
- Stripe powers checkout and webhooks. Edge functions live in `supabase/functions`.
- See the guides for end to end setup:
  - [Quick Start](QUICK_START.md)
  - [Deployment Guide](DEPLOYMENT_GUIDE.md)
  - [Stripe Integration TODO](STRIPE_INTEGRATION_TODO.md)

## Data and assumptions

- DevEx conversion: 350 Robux equals 1 USD. Implemented as `DEVEX_RATE_USD_PER_ROBUX` in `src/lib/fees.ts`.
- Platform fee: 30% for game developers, 70% for UGC creators.
- Last update for these constants: 2025-01-28. Source: [Roblox Help Center](https://en.help.roblox.com/hc/en-us/articles/13061189551124).
- Numbers can change. If rates update, edit `src/lib/fees.ts` and redeploy.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn UI
- Supabase for Auth and database
- Stripe for payments
- Recharts for charts

## Project structure

```
src/
  components/        # UI and feature components
  pages/             # App pages and routes
  contexts/          # App state providers
  lib/fees.ts        # Fees, DevEx rate, and money math
  utils/             # CSV parsing, sharing, export utilities
supabase/
  functions/         # Edge functions for checkout and webhooks
  migrations/        # Database migrations
public/              # Static assets and screenshots
```

## Contributing

Issues and pull requests are welcome. Share your use case and the decision you want clarity on. Clear problems lead to clear improvements.

## A note to creators

You deserve to see the real value of your work. Use BuxTax to understand your earnings, set better goals, and make smarter bets. If it saves you time or money, tell another creator.
