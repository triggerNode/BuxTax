import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
const buxtaxLogoPath = "/brand/buxtax-logo.svg";

interface AuthFormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from || "/app";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>();

  // Redirect if already authenticated AND profile has loaded
  useEffect(() => {
    if (user && !profileLoading) {
      console.log("🚀 SignIn redirect - User:", user.email, "Profile:", profile);
      setIsLoading(false); // Reset loading state before redirect
      navigate(from, { replace: true });
    }
  }, [user, profile, profileLoading, navigate, from]);

  const onSignIn = async (data: AuthFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      setIsLoading(false);
    } else {
      console.log("✅ SignIn successful, waiting for profile to load...");
      // Don't navigate immediately - let useEffect handle it after profile loads
      // setIsLoading will be set to false by useEffect when redirect happens
    }
  };

  const onSignUp = async (data: AuthFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Check your email",
        description:
          "We've sent you a confirmation link to complete your registration.",
      });
      reset();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              src={buxtaxLogoPath}
              alt="BuxTax Logo"
              className="h-16 w-auto mx-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Calculate your Robux-to-USD conversion
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-rounded">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit(onSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
