# BuxTax Stripe Integration - Deployment Guide

## 🚀 90-Minute Strike Plan Implementation

### Phase 1: Environment Setup (0-10 min)

1. **Create `.env` file in project root:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration
STRIPE_SECRET=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Service Role (for webhook)
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key_here
```

### Phase 2: Stripe Dashboard Setup (10-25 min)

1. **Create Products in Stripe Dashboard:**

   - "Solo Lifetime" - £39 one-off
   - "Studio Lifetime" - £149 one-off
   - "Pro Monthly" - £9/mo with 7-day trial

2. **Copy Price IDs** (format: `price_abc123`) and update in `src/components/Paywall.tsx`:

```typescript
const priceMap = {
  solo: "price_actual_solo_id",
  studio: "price_actual_studio_id",
  pro: "price_actual_pro_id",
};
```

### Phase 3: Supabase Edge Functions (25-45 min)

1. **Deploy Edge Functions:**

```bash
# Deploy checkout session function
supabase functions deploy create-checkout-session

# Deploy webhook handler
supabase functions deploy stripe-webhook

# Set environment secrets
supabase secrets set STRIPE_SECRET=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set SUPABASE_SERVICE_ROLE=your_service_role_key
```

2. **Configure Stripe Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook secret to environment variables

### Phase 4: Database Migration (45-50 min)

1. **Apply database migration:**

```bash
supabase db push
```

### Phase 5: Frontend Integration (50-75 min)

✅ **Completed automatically:**

- Updated `Paywall.tsx` with Stripe integration
- Updated `ProtectedRoute.tsx` with payment status checks
- Added loading states and error handling

### Phase 6: Testing & Deployment (75-90 min)

1. **Test locally:**

```bash
npm run dev
```

2. **Deploy to production:**

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
# Set environment variables in deployment platform
```

## 🔧 Configuration Checklist

- [ ] Environment variables set
- [ ] Stripe products and prices created
- [ ] Price IDs updated in Paywall component
- [ ] Edge functions deployed
- [ ] Webhook configured in Stripe
- [ ] Database migration applied
- [ ] Frontend tested locally
- [ ] Production deployment completed

## 🚨 Troubleshooting

### Common Issues:

1. **Webhook not receiving events:**

   - Check webhook endpoint URL
   - Verify webhook secret in environment
   - Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

2. **Checkout session creation fails:**

   - Verify Stripe secret key
   - Check price IDs are correct
   - Ensure Edge Function is deployed

3. **Payment status not updating:**
   - Check webhook is receiving events
   - Verify database migration applied
   - Check Supabase service role key

## 📊 Monitoring

- Monitor Stripe Dashboard for successful payments
- Check Supabase logs for webhook events
- Verify user profiles are updated correctly

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use test keys for development
- Rotate production keys regularly
- Enable webhook signature verification
