// deno run --allow-env --allow-net
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
};

const PLAN_TO_LOOKUP: Record<string, string> = {
  lifetime: "robux_lifetime",
  studio: "robux_studio",
  pro: "robux_pro",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET");
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const stripe = Stripe(stripeSecret, { apiVersion: "2024-04-10" });

    const { plan = "lifetime", success, cancel, uid, email } = await req.json();

    if (!success || !cancel) {
      return new Response(JSON.stringify({ error: "Missing success/cancel" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!uid || !email) {
      return new Response(JSON.stringify({ error: "Missing uid/email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const lookupKey = PLAN_TO_LOOKUP[plan];
    if (!lookupKey) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      expand: ["data.product"],
    });
    const price = prices.data[0];
    if (!price) {
      return new Response(JSON.stringify({ error: "Price not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const mode = price.type === "recurring" ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      mode,
      success_url: success,
      cancel_url: cancel,
      client_reference_id: uid,
      customer_email: email,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { uid, plan },
      allow_promotion_codes: true,
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { uid, plan } } }
        : {}),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
