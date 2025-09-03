import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { handleUpgrade } from "@/components/Paywall";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  User,
  CreditCard,
  LogOut,
  ArrowLeft,
  Users,
  MailPlus,
} from "lucide-react";
import { useStudioSeats } from "@/hooks/useStudioSeats";
import { inviteStudioMember } from "@/lib/studio";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

function AccountContent() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { seats, loading: seatsLoading } = useStudioSeats();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
    setIsSigningOut(false);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "lifetime":
        // Royal pill
        return "default";
      case "studio":
        // Burgundy pill per brand
        return "brandBurgundy" as const;
      default:
        // Free
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    // Active = royal, Inactive = neutral (not red). Use destructive only for real error states elsewhere.
    return status === "active" ? "default" : "secondary";
  };

  const formatPlanName = (plan: string) => {
    switch (plan) {
      case "lifetime":
        return "Lifetime Access";
      case "studio":
        return "Studio Plan";
      case "free":
        return "Free Plan";
      default:
        return plan;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/app" className="text-royal hover:text-royal/80">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-rounded font-bold text-royal">
              Account
            </h1>
          </div>
          <Button
            variant="action"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="rounded-2xl border-2 border-brand-royal bg-card">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-royal" />
                <CardTitle className="text-foreground">
                  Profile Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-foreground">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-foreground">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="rounded-2xl border-2 border-brand-royal bg-card">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-royal" />
                <CardTitle className="text-foreground">Subscription</CardTitle>
              </div>
              <CardDescription>
                Manage your BuxTax subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPlanName(profile.plan)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={getPlanBadgeVariant(profile.plan)}>
                        {formatPlanName(profile.plan)}
                      </Badge>
                      <Badge
                        variant={getStatusBadgeVariant(profile.status)}
                        className="block"
                      >
                        {profile.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Show upgrade offers unless the user already owns the Studio plan */}
                  {(profile.plan === "free" || profile.plan === "lifetime") && (
                    <div className="rounded-2xl p-4 bg-brand-yellow/70 border-2 border-brand-royal">
                      <h4 className="font-semibold text-[hsl(var(--action-foreground))] mb-2">
                        Upgrade Your Plan
                      </h4>
                      <p className="text-sm text-[hsl(var(--action-foreground))] mb-3">
                        Unlock unlimited calculations and advanced features with
                        a paid plan.
                      </p>
                      <div className="space-y-2">
                        {/* Lifetime offer appears ONLY for free-plan users */}
                        {profile.plan === "free" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpgrade("lifetime")}
                          >
                            Upgrade to Lifetime – $39
                          </Button>
                        )}
                        {/* Studio offer appears for both free and lifetime owners */}
                        <Button
                          size="sm"
                          variant={
                            profile.plan === "free" ? "outline" : "default"
                          }
                          onClick={() => handleUpgrade("studio")}
                        >
                          Upgrade to Studio – $149
                        </Button>
                      </div>
                    </div>
                  )}

                  {profile.status === "active" && (
                    <div className="rounded-2xl p-4 bg-brand-yellow border-2 border-brand-royal">
                      <h4 className="font-semibold text-brand-black mb-1">
                        ✅ Account Active
                      </h4>
                      <p className="text-sm text-brand-black/80">
                        Your account is active and all features are unlocked.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading subscription information...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Studio Team (owner only) */}
          {profile?.plan === "studio" && profile?.studio_role !== "member" && (
            <Card className="rounded-2xl border-2 border-brand-royal bg-card">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-royal" />
                  <CardTitle className="text-foreground">Studio Team</CardTitle>
                </div>
                <Badge variant="outline">
                  {seats?.filter((s) => s.status !== "revoked").length ?? 0}/4
                  seats
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="teammate@studio.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      try {
                        await inviteStudioMember(inviteEmail);
                        setInviteEmail("");
                        toast({
                          title: "Invite sent",
                          description: "We emailed your teammate an invite.",
                        });
                      } catch (err: any) {
                        toast({
                          variant: "destructive",
                          title: "Invite failed",
                          description: err.message || "Please try again.",
                        });
                      }
                    }}
                    disabled={!inviteEmail || seatsLoading}
                  >
                    <MailPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  {(seats ?? []).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="font-medium">{s.member_email}</div>
                        <div className="text-muted-foreground">{s.status}</div>
                      </div>
                      {s.status !== "revoked" && (
                        <Button
                          size="sm"
                          variant="action"
                          onClick={async () => {
                            // owner can revoke directly via RLS
                            const { error } = await supabase
                              .from("studio_members")
                              .update({
                                status: "revoked",
                                revoked_at: new Date().toISOString(),
                              })
                              .eq("id", s.id);
                            if (error) {
                              toast({
                                variant: "destructive",
                                title: "Revoke failed",
                                description: error.message,
                              });
                            } else {
                              toast({ title: "Invite revoked" });
                            }
                          }}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                  {!seats?.length && (
                    <div className="text-muted-foreground text-sm">
                      No invites yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link to="/app">Open Calculator</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <a href="mailto:support@buxtax.com">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
