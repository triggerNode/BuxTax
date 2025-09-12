import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { handleUpgrade } from "@/components/Paywall";

export function Pricing() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: "solo",
      name: "Solo Lifetime",
      price: "£39",
      description: "Perfect for freelancers and small businesses",
      features: [
        "Unlimited tax calculations",
        "CSV import/export",
        "Basic reporting",
        "Email support",
        "Lifetime access",
      ],
      popular: false,
      icon: Sparkles,
    },
    {
      id: "studio",
      name: "Studio Lifetime",
      price: "£149",
      description: "For growing agencies and studios",
      features: [
        "Everything in Solo",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "Custom branding",
        "API access",
        "Lifetime access",
      ],
      popular: true,
      icon: Crown,
    },
    {
      id: "pro",
      name: "Pro Monthly",
      price: "£9",
      period: "/month",
      description: "Flexible monthly billing with trial",
      features: [
        "Everything in Studio",
        "Advanced integrations",
        "White-label options",
        "Dedicated support",
        "7-day free trial",
        "Cancel anytime",
      ],
      popular: false,
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-rounded font-bold text-royal mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with our free trial, then choose the plan that grows with your
            business
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = profile?.plan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-2 border-royal shadow-lg scale-105"
                    : ""
                } ${isCurrentPlan ? "ring-2 ring-brand-royal" : ""}`}
              >
                {plan.popular && (
                  <Badge
                    variant="default"
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    Most Popular
                  </Badge>
                )}

                {isCurrentPlan && (
                  <Badge variant="warning" className="absolute -top-3 right-4">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-royal/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-royal" />
                  </div>
                  <CardTitle className="text-2xl font-rounded font-bold text-royal">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-royal">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-brand-royal flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() =>
                      handleUpgrade(
                        (plan.id === "solo" ? "lifetime" : plan.id) as
                          | "lifetime"
                          | "studio"
                          | "pro"
                      )
                    }
                    className="w-full bg-royal hover:bg-royal/90"
                    disabled={loading === plan.id || isCurrentPlan}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-rounded font-bold text-royal text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-royal mb-2">
                  Can I change plans later?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-royal mb-2">
                  What's included in the free trial?
                </h3>
                <p className="text-sm text-muted-foreground">
                  The Pro Monthly plan includes a 7-day free trial with full
                  access to all features.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-royal mb-2">
                  Is lifetime pricing limited-time?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes. Our one-time “buy once” lifetime access is available for
                  a limited time. After that, new customers will be on a
                  subscription plan. Purchases made during this window keep
                  lifetime access permanently.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-royal mb-2">
                  How is billing handled?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use Stripe for secure payment processing. Your data is
                  never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
