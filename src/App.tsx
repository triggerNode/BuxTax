import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import GtagRouteListener from "@/components/GtagRouteListener";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

// Public Routes
const Landing = lazy(() => import("@/pages/Landing"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const CalculatorPage = lazy(() => import("@/pages/Calculator"));

// App Routes (Protected)
const CalculatorApp = lazy(() => import("@/pages/App"));
const Account = lazy(() => import("@/pages/Account"));

// Export Routes
const ProfitCardExport = lazy(() => import("@/pages/export/ProfitCardExport"));

// Blog Routes
const BlogIndex = lazy(() => import("@/pages/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));

// Catch-all
const NotFound = lazy(() => import("@/pages/NotFound"));

function AppRouter() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <BrowserRouter>
                <GtagRouteListener />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/thank-you" element={<ThankYou />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route
                      path="/app"
                      element={
                        <ProtectedRoute>
                          <CalculatorApp />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/export/profit"
                      element={
                        <ProtectedRoute>
                          <ProfitCardExport />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/blog" element={<BlogIndex />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default AppRouter;
