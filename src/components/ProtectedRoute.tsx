// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  // 1. Show a spinner while we wait for user and profile data to load.
  if (authLoading || profileLoading) {
    // The user's status is still being determined.
    return <LoadingSpinner />;
  }

  // 2. After loading, if there is still no user, they are not logged in.
  // Redirect them to the sign-in page.
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 3. A user exists. Now we can check their payment status.
  const hasActivePayment = profile?.payment_status === "active";

  if (hasActivePayment) {
    // GREEN LANE: The user is logged in and has an active payment.
    // Grant them access to the page they requested.
    return <>{children}</>;
  } else {
    // RED LANE: The user is logged in but is NOT paid.
    // We create the "payment jail".
    
    // Are they already on the account page? If so, let them stay.
    if (location.pathname === "/account") {
      return <>{children}</>;
    } else {
      // If they try to go anywhere else, force them to the /account page.
      return <Navigate to="/account" replace />;
    }
  }
}
