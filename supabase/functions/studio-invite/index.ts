// deno run --allow-env --allow-net
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }

    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Authenticated user (owner)
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Admin client for privileged ops (bypasses RLS)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Ensure owner has Studio plan (owner-only invites)
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("plan, studio_role")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      console.error("profile fetch error", profErr);
      return new Response(JSON.stringify({ error: "Profile lookup failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    if (!profile || profile.plan !== "studio") {
      return new Response(
        JSON.stringify({ error: "Invites available to Studio owners only" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }

    // Enforce seat cap: invited + accepted <= 4
    const { count: seatCount, error: countErr } = await admin
      .from("studio_members")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .in("status", ["invited", "accepted"]);

    if (countErr) {
      console.error("seat count error", countErr);
      return new Response(JSON.stringify({ error: "Seat count failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    if ((seatCount ?? 0) >= 4) {
      return new Response(
        JSON.stringify({ error: "Seat limit reached (4/4)" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }

    // Prevent duplicate active invites for the same email
    const { data: existing, error: existErr } = await admin
      .from("studio_members")
      .select("id, status")
      .eq("owner_id", user.id)
      .eq("member_email", normalizedEmail)
      .maybeSingle();

    if (existErr) {
      console.error("existing invite lookup error", existErr);
      return new Response(JSON.stringify({ error: "Invite lookup failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    if (existing && existing.status !== "revoked") {
      return new Response(
        JSON.stringify({ error: "Invite already exists for this email" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }

    // Create or re-create the invite row
    if (!existing) {
      const { error: insertErr } = await admin.from("studio_members").insert({
        owner_id: user.id,
        member_email: normalizedEmail,
        status: "invited",
      });
      if (insertErr) {
        console.error("insert invite row error", insertErr);
        return new Response(
          JSON.stringify({ error: "Failed to create invite row" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }
    } else {
      // If a revoked row exists, re-open it
      const { error: reviveErr } = await admin
        .from("studio_members")
        .update({ status: "invited", revoked_at: null })
        .eq("id", existing.id);
      if (reviveErr) {
        console.error("revive invite row error", reviveErr);
        return new Response(
          JSON.stringify({ error: "Failed to revive invite row" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }
    }

    // Send Supabase invite email (Admin API)
    const { data: inviteRes, error: inviteErr } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: { plan: "studio" },
      });

    if (inviteErr) {
      console.error("admin.inviteUserByEmail error", inviteErr);
      return new Response(
        JSON.stringify({ error: "Failed to send invite email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true, invite: inviteRes }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    console.error("studio-invite error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }
});
