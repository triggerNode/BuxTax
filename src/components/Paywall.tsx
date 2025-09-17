import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const handleUpgrade = async (
  plan: "lifetime" | "studio" | "pro" = "lifetime"
) => {
  // Get the current Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          plan,
          success: `${window.location.origin}/app`,
          cancel: `${window.location.origin}/#pricing`,
          uid: user?.id,
          email: user?.email,
        },
      }
    );

    if (error) {
      throw error;
    }

    const { url } = data as { url: string };
    if (!url) throw new Error("No checkout URL returned");
    window.location.href = url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    alert("Failed to initiate payment. Please try again.");
  }
};

interface PaywallProps {
  children: ReactNode;
}

export function Paywall({ children }: PaywallProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);

  // Show content if user is authenticated and has active payment status
  // Also grant access if plan is lifetime or studio (paid plans), even if payment_status hasn't synced yet
  const hasAccess =
    !!user &&
    (profile?.payment_status === "active" ||
      profile?.plan === "lifetime" ||
      profile?.plan === "studio");

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-cream/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-royal/20 shadow-lg">
          <CardContent className="text-center p-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-royal/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-royal" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-rounded font-bold text-royal">
                Unlock Full Results
              </h3>
              <p className="text-muted-foreground">
                Get detailed conversion breakdowns, charts, and export features
              </p>
            </div>

            <div className="bg-royal/5 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-royal" />
                <span className="font-semibold text-royal">
                  Lifetime Access
                </span>
              </div>
              <div className="text-2xl font-bold text-royal">$39</div>
              <div className="text-sm text-muted-foreground">
                One-time payment
              </div>
            </div>

            <div className="space-y-3">
              {user ? (
                <Button
                  onClick={() => handleUpgrade("lifetime")}
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Unlock Now - $39"
                  )}
                </Button>
              ) : (
                <Button asChild className="w-full" size="lg">
                  <Link to="/signin">Sign In to Unlock</Link>
                </Button>
              )}

              <div className="text-xs text-muted-foreground">
                ✓ Instant access • ✓ No recurring fees • ✓ Lifetime pricing
                available for a limited time
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
