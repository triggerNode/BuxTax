import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ThankYou() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id"); // from Stripe redirect
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track conversion + check auth
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).plausible) {
      (window as any).plausible("Purchase");
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      setAuthed(!!data.session);
      // keep in sync if they log in from magic link in another tab
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
        setAuthed(!!s?.access_token)
      );
      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  async function resendLink() {
    setError(null);
    setSent(false);
    setLoading(true);
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError("Enter a valid email.");
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "Failed to send link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <img
              src="/Brand Asset/BuxTax svg Logo.svg"
              alt="BuxTax Logo"
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>
        <Card className="text-center rounded-2xl border-2 border-brand-royal bg-card">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-brand-royal text-white ring-2 ring-brand-royal">
              <CheckCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-rounded text-foreground">
              Payment Successful
            </CardTitle>
            <CardDescription>
              Thanks for supporting BuxTax. Your purchase was confirmed
              {sessionId ? " by Stripe" : ""}.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {authed === null ? (
              <p className="text-sm text-muted-foreground">
                Checking your account…
              </p>
            ) : authed ? (
              <>
                <div className="rounded-2xl p-4 bg-brand-yellow border-2 border-brand-royal text-left">
                  <h3 className="font-semibold text-brand-black mb-1">
                    You’re all set
                  </h3>
                  <p className="text-sm text-brand-black/80">
                    Your account is active. Jump in below.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/app">Start Calculating</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/account">View Account</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl p-4 bg-brand-yellow border-2 border-brand-royal text-left">
                  <h3 className="font-semibold text-brand-black mb-1">
                    Confirm your email
                  </h3>
                  <p className="text-sm text-brand-black/80">
                    We’ve sent a sign-in link to your email. Open it on this
                    device to access the app.
                  </p>
                </div>

                <div className="text-left space-y-2">
                  <label className="text-sm font-medium">
                    Didn’t get it? Resend the link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button onClick={resendLink} disabled={loading}>
                      {loading ? "Sending…" : "Send"}
                    </Button>
                  </div>
                  {sent && (
                    <p className="text-xs text-foreground">
                      Link sent. Check your inbox (and spam).
                    </p>
                  )}
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/app">I’m already signed in</Link>
                  </Button>
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground">
              <p>You’ll also receive a Stripe receipt by email.</p>
              <p className="mt-2">
                Need help? Email{" "}
                <a
                  href="mailto:support@buxtax.com"
                  className="text-royal hover:underline"
                >
                  support@buxtax.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
