import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve both hooks before deciding
  const isReady = !authLoading && !profileLoading;

  // Handle navigation only for unauthenticated users
  useEffect(() => {
    if (isReady && !user) {
      navigate("/signin", {
        state: { from: location.pathname + location.search },
      });
    }
  }, [isReady, user, navigate, location]);

  // Show loading while either auth or profile is loading
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
