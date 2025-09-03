# 🚀 BuxTax Stripe Integration - TODO List

## ✅ Completed Tasks

- [x] Created environment template (`env.template`)
- [x] Built Supabase Edge Functions:
  - [x] `create-checkout-session` function
  - [x] `stripe-webhook` function
- [x] Updated frontend components:
  - [x] `Paywall.tsx` with Stripe integration
  - [x] `ProtectedRoute.tsx` with payment status checks
  - [x] Created comprehensive `Pricing.tsx` page
- [x] Created database migration for `payment_status` column
- [x] Created deployment guide (`DEPLOYMENT_GUIDE.md`)
- [x] Created setup script (`setup-stripe.sh`)

## 🔄 Remaining Tasks (90-Minute Strike Plan)

### Phase 1: Environment Setup (0-10 min)

- [ ] **Create `.env` file** with actual values:
  ```bash
  VITE_SUPABASE_URL=your_actual_supabase_url
  VITE_SUPABASE_ANON_KEY=your_actual_anon_key
  STRIPE_SECRET=sk_test_your_actual_stripe_secret
  STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
  SUPABASE_SERVICE_ROLE=your_actual_service_role_key
  ```

### Phase 2: Stripe Dashboard Setup (10-25 min)

- [ ] **Create Products in Stripe Dashboard:**
  - [ ] "Solo Lifetime" - £39 one-off
  - [ ] "Studio Lifetime" - £149 one-off
  - [ ] "Pro Monthly" - £9/mo with 7-day trial
- [ ] **Copy Price IDs** and update in components:
  - [ ] Update `src/components/Paywall.tsx` priceMap
  - [ ] Update `src/pages/Pricing.tsx` priceMap

### Phase 3: Supabase Edge Functions (25-45 min)

- [ ] **Deploy Edge Functions:**
  ```bash
  supabase functions deploy create-checkout-session
  supabase functions deploy stripe-webhook
  ```
- [ ] **Set environment secrets:**
  ```bash
  supabase secrets set STRIPE_SECRET=sk_live_xxx
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
  supabase secrets set SUPABASE_SERVICE_ROLE=your_service_role_key
  ```
- [ ] **Configure Stripe Webhook:**
  - [ ] Go to Stripe Dashboard → Webhooks
  - [ ] Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
  - [ ] Select events: `checkout.session.completed`
  - [ ] Copy webhook secret

### Phase 4: Database Migration (45-50 min)

- [ ] **Apply database migration:**
  ```bash
  supabase db push
  ```

### Phase 5: Frontend Integration (50-75 min)

- [ ] **Test locally:**
  ```bash
  npm run dev
  ```
- [ ] **Verify components work:**
  - [ ] Paywall shows for unpaid users
  - [ ] Pricing page loads correctly
  - [ ] Stripe checkout redirects properly
  - [ ] Payment status updates after successful payment

### Phase 6: Production Deployment (75-90 min)

- [ ] **Build for production:**
  ```bash
  npm run build
  ```
- [ ] **Deploy to hosting platform:**
  - [ ] Push to GitHub
  - [ ] Connect to Vercel/Netlify
  - [ ] Set environment variables in deployment platform
- [ ] **Test production deployment:**
  - [ ] Verify live URL works
  - [ ] Test payment flow end-to-end
  - [ ] Check webhook receives events

## 🔧 Configuration Checklist

### Environment Variables

- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `STRIPE_SECRET` - Your Stripe secret key (test/live)
- [ ] `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- [ ] `SUPABASE_SERVICE_ROLE` - Your Supabase service role key

### Stripe Configuration

- [ ] Products created in Stripe Dashboard
- [ ] Price IDs copied and updated in code
- [ ] Webhook endpoint configured
- [ ] Webhook secret copied to environment

### Supabase Configuration

- [ ] Edge functions deployed
- [ ] Environment secrets set
- [ ] Database migration applied
- [ ] Service role key configured

### Frontend Configuration

- [ ] Price IDs updated in Paywall component
- [ ] Price IDs updated in Pricing page
- [ ] Routes configured for pricing page
- [ ] Loading states and error handling tested

## 🚨 Critical Path Items

1. **Environment Variables** - Must be set before any testing
2. **Stripe Products** - Must be created before price IDs can be used
3. **Webhook Configuration** - Critical for payment status updates
4. **Database Migration** - Required for payment_status column
5. **Production Deployment** - Final step to go live

## 📊 Success Metrics

- [ ] Users can sign up and access free features
- [ ] Paywall blocks access to premium features
- [ ] Stripe checkout redirects properly
- [ ] Payment status updates after successful payment
- [ ] Users can access premium features after payment
- [ ] Webhook receives and processes events correctly

## 🔒 Security Checklist

- [ ] Environment variables not committed to version control
- [ ] Test keys used for development
- [ ] Production keys secured
- [ ] Webhook signature verification enabled
- [ ] Database RLS policies in place

## 📝 Notes

- Replace all placeholder price IDs with actual Stripe price IDs
- Test with Stripe test mode before going live
- Monitor webhook events in Stripe Dashboard
- Check Supabase logs for any errors
- Verify user profiles are updated correctly after payments

## 🆘 Troubleshooting

If stuck on any step:

1. Check environment variables are set correctly
2. Verify Stripe products and prices exist
3. Test webhook endpoint manually
4. Check Supabase function logs
5. Verify database migration applied successfully
