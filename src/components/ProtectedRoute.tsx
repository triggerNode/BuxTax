// src/components/ProtectedRoute.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait until we know for sure if the user is logged in or not.
    if (authLoading || profileLoading) {
      return; // Do nothing while loading
    }

    // SCENARIO 1: No user is logged in.
    // Redirect them to the sign-in page.
    if (!user) {
      navigate("/signin", {
        state: { from: location.pathname + location.search },
        replace: true,
      });
      return;
    }

    // SCENARIO 2: User is logged in, but has NO active payment.
    // We create a "jail" - they can only access the /account page.
    const hasActivePayment = profile?.payment_status === "active";
    if (!hasActivePayment && location.pathname !== "/account") {
      navigate("/account", { replace: true });
      return;
    }

    // If neither of the above conditions are met, the user is authenticated
    // and has an active payment (or is on the account page), so we do nothing
    // and let them see the content.

  }, [user, profile, authLoading, profileLoading, navigate, location]);

  // While we're determining where to send the user, show a loading spinner.
  if (authLoading || profileLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // All checks passed. The user is logged in, has a valid payment status (or is on their account page),
  // so we can render the requested child component.
  return <>{children}</>;
}
