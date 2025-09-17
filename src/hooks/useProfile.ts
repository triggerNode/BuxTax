import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  plan: string;
  status: string;
  payment_status?: string;
  studio_role?: "owner" | "member" | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      if (isDev) console.log("🔍 Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        if (isDev) console.error("❌ Error fetching profile:", error);
      } else {
        if (isDev) console.log("✅ Profile loaded:", data);
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();

    // Subscribe to profile changes
    const subscription = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setProfile(null);
          } else {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { profile, loading };
}
