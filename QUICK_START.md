# 🚀 BuxTax Stripe Integration - Quick Start

## ⚡ Critical Steps (90-Minute Plan)

### 1. Environment Setup (0-10 min)

```bash
# Create .env file with your actual values
cp env.template .env
# Edit .env with your real keys
```

### 2. Stripe Dashboard (10-25 min)

- Create 3 products in Stripe:
  - Solo Lifetime (£39)
  - Studio Lifetime (£149)
  - Pro Monthly (£9/mo)
- Copy Price IDs and update in:
  - `src/components/Paywall.tsx`
  - `src/pages/Pricing.tsx`

### 3. Deploy Functions (25-45 min)

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase secrets set STRIPE_SECRET=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Database Migration (45-50 min)

```bash
supabase db push
```

### 5. Test & Deploy (50-90 min)

```bash
npm run dev  # Test locally
npm run build  # Build for production
# Deploy to Vercel/Netlify
```

## 🔑 Required Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SUPABASE_SERVICE_ROLE=your_service_role_key
```

## 📋 Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook secret to environment

## ✅ Success Checklist

- [ ] Environment variables set
- [ ] Stripe products created
- [ ] Price IDs updated in code
- [ ] Edge functions deployed
- [ ] Webhook configured
- [ ] Database migration applied
- [ ] Local testing successful
- [ ] Production deployment live

## 🆘 Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Review `STRIPE_INTEGRATION_TODO.md` for full checklist
- Run `./setup-stripe.sh` for automated setup
