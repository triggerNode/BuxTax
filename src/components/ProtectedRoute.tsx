import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Store the intended destination
      navigate("/signin", {
        state: { from: location.pathname + location.search },
      });
    }
  }, [user, loading, navigate, location]);

  // Check if user has active payment status
  const hasActivePayment = user && profile?.payment_status === "active";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If the user is authenticated but lacks an active payment,
  // allow them to visit /account, otherwise push them to landing pricing section
  if (user && !hasActivePayment) {
    const allowed = ["/account"];
    if (!allowed.includes(location.pathname)) {
      navigate("/#pricing");
      return null;
    }
  }

  return <>{children}</>;
}
