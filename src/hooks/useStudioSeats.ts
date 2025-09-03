import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface StudioSeat {
  id: string;
  owner_id: string;
  member_email: string;
  member_user_id: string | null;
  status: "invited" | "accepted" | "revoked";
  invited_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
}

export function useStudioSeats() {
  const { user } = useAuth();
  const [seats, setSeats] = useState<StudioSeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSeats = async () => {
      const { data, error } = await supabase
        .from("studio_members")
        .select("*")
        .eq("owner_id", user.id)
        .order("invited_at", { ascending: false });

      if (!error && data) setSeats(data as StudioSeat[]);
      setLoading(false);
    };

    fetchSeats();

    // live updates
    const channel = supabase
      .channel("studio-members")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "studio_members",
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          setSeats((prev) => {
            const row = payload.new as StudioSeat;
            if (payload.eventType === "DELETE")
              return prev.filter((s) => s.id !== (payload.old as any).id);
            const next = prev.filter((s) => s.id !== row.id);
            return [row, ...next];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return { seats, loading };
}
