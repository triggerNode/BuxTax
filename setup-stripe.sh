#!/bin/bash

echo "🚀 BuxTax Stripe Integration Setup"
echo "=================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your configuration."
    echo "See env.template for required variables."
    exit 1
fi

echo "✅ Environment check passed"

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."

echo "Deploying create-checkout-session..."
supabase functions deploy create-checkout-session

echo "Deploying stripe-webhook..."
supabase functions deploy stripe-webhook

# Apply database migration
echo "🗄️ Applying database migration..."
supabase db push

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create products in Stripe Dashboard"
echo "2. Update price IDs in src/components/Paywall.tsx"
echo "3. Configure webhook in Stripe Dashboard"
echo "4. Test the integration"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions." 