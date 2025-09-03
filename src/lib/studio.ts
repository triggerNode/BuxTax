import { supabase } from "@/integrations/supabase/client";

export async function inviteStudioMember(email: string) {
  // Supabase JS sends the user's JWT automatically with functions.invoke
  const { data, error } = await supabase.functions.invoke("studio-invite", {
    body: { email },
  });
  if (error) throw error;
  return data;
}
