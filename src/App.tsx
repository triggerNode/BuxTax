import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import GtagRouteListener from "@/components/GtagRouteListener";

// Current pages (preserved)
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

// Moved calculator
import App from "./pages/App";
import ProfitCardExport from "./pages/export/ProfitCardExport";
// Remove dedicated pricing route; use landing section via /#pricing

// Lazy load shell pages
const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/SignIn"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Account = lazy(() => import("./pages/Account"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const CalculatorPage = lazy(() => import("./pages/Calculator"));

const queryClient = new QueryClient();

const AppRouter = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GtagRouteListener />
            <Routes>
              {/* Redirect legacy /pricing route to landing section without flashing 404 */}
              <Route
                path="/pricing"
                element={<Navigate to="/#pricing" replace />}
              />
              <Route
                path="/pricing/"
                element={<Navigate to="/#pricing" replace />}
              />
              {/* Public routes from shell */}
              <Route
                path="/"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <Landing />
                  </Suspense>
                }
              />
              <Route
                path="/calculator"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <CalculatorPage />
                  </Suspense>
                }
              />
              <Route
                path="/signin"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <SignIn />
                  </Suspense>
                }
              />
              <Route
                path="/thank-you"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <ThankYou />
                  </Suspense>
                }
              />
              {/* Alias route */}
              <Route
                path="/thanks"
                element={<Navigate to="/thank-you" replace />}
              />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Protected routes - require payment */}
              <Route path="/app" element={<App />} />
              {/* Export-only route (read-only) */}
              <Route path="/export/profit" element={<ProfitCardExport />} />
              {/* Blog routes */}
              <Route
                path="/blog"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <BlogIndex />
                  </Suspense>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <BlogPost />
                  </Suspense>
                }
              />
              <Route
                path="/account"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-cream flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <Account />
                  </Suspense>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default AppRouter;
