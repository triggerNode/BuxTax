import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (
      !stripeSecret ||
      !webhookSecret ||
      !supabaseUrl ||
      !supabaseServiceRole
    ) {
      console.error("Missing required environment variables");
      return new Response("Missing env vars", { status: 500 });
    }

    const stripe = Stripe(stripeSecret, { apiVersion: "2024-04-10" });
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const sig = req.headers.get("Stripe-Signature");
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        sig!,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid =
          (session.metadata?.uid as string) ||
          (session.client_reference_id as string);
        const plan = (session.metadata?.plan as string) || undefined;
        if (uid) {
          const update: Record<string, unknown> = {
            payment_status: "active",
            updated_at: new Date().toISOString(),
          };
          if (plan) update["plan"] = plan;
          if (plan === "studio") update["studio_role"] = "owner";
          const { error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", uid);
          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = (subscription.metadata?.uid as string) || undefined;
        const plan = (subscription.metadata?.plan as string) || undefined;
        const status = subscription.status; // active, trialing, past_due, unpaid, canceled, incomplete
        if (uid) {
          const update: Record<string, unknown> = {
            payment_status: ["active", "trialing"].includes(status)
              ? "active"
              : status === "past_due"
              ? "past_due"
              : "inactive",
            updated_at: new Date().toISOString(),
          };
          if (plan) update["plan"] = plan;
          const { error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", uid);
          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = (subscription.metadata?.uid as string) || undefined;
        if (uid) {
          const { error } = await supabase
            .from("profiles")
            .update({
              payment_status: "inactive",
              updated_at: new Date().toISOString(),
            })
            .eq("id", uid);
          if (error) console.error("Supabase update error:", error);
        }
        break;
      }
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 500 });
  }
});
