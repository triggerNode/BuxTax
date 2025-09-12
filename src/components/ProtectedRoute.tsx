// src/components/ProtectedRoute.tsx

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth(); // Renamed loading to authLoading
  const { profile, loading: profileLoading } = useProfile(); // Renamed loading to profileLoading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This part is for redirecting users who are NOT logged in.
    // We only run this check once the initial auth check is done.
    if (!authLoading && !user) {
      navigate("/signin", {
        state: { from: location.pathname + location.search },
      });
    }
  }, [user, authLoading, navigate, location]);

  // THE KEY FIX: Wait until BOTH authentication and profile loading are finished.
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's no user at this point, the useEffect above will handle the redirect.
  // Returning null prevents a flicker of the protected content.
  if (!user) {
    return null;
  }

  // Now, with all data loaded, we can safely check the payment status.
  const hasActivePayment = profile?.payment_status === "active";

  if (!hasActivePayment) {
    // Allow access to the account page regardless of payment status.
    if (location.pathname !== "/account") {
      navigate("/#pricing");
      return null;
    }
  }

  return <>{children}</>;
}
