import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { handleUpgrade } from "@/components/Paywall";

export function Pricing() {
  const { user } = useAuth();

  const handleLifetimeClick = () => {
    handleUpgrade("lifetime");
  };

  const handleStudioClick = () => {
    handleUpgrade("studio");
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-rounded font-bold text-royal mb-4">
            Choose your plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <em>Monthly subscriptions coming soon!</em>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Lifetime Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-2 border-royal/20 relative overflow-hidden group hover:border-royal/40 transition-all duration-300">
              <div className="absolute top-4 right-4">
                <Badge variant="destructive">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>

              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-royal/10 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-royal" />
                </div>
                <CardTitle className="text-xl font-rounded">
                  Lifetime Access
                </CardTitle>
                <CardDescription>
                  Perfect for individual developers
                </CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold text-royal">$39</div>
                  <div className="text-sm text-muted-foreground">
                    One-time payment
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {[
                    "Unlimited calculations",
                    "Detailed fee breakdowns",
                    "Export to CSV/PDF",
                    "Mobile-friendly interface",
                    "Real-time rate updates",
                    "Email support",
                    "No recurring fees",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-brand-royal flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleLifetimeClick}
                  className="w-full bg-royal hover:bg-royal/90"
                  size="lg"
                >
                  Get Lifetime Access
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  One-time payment · lifetime access (30-day window)
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Studio Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-2 border-burgundy/20 relative overflow-hidden group hover:border-burgundy/40 transition-all duration-300">
              <div className="absolute top-4 right-4">
                <Badge variant="brandBurgundy">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>

              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-burgundy/10 rounded-xl flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-burgundy" />
                </div>
                <CardTitle className="text-xl font-rounded">
                  Studio Plan
                </CardTitle>
                <CardDescription>For teams and power users</CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold text-burgundy">$149</div>
                  <div className="text-sm text-muted-foreground">
                    One-time payment
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {[
                    "Everything in Lifetime",
                    "Advanced analytics dashboard",
                    "Bulk calculation tools",
                    "Team collaboration features",
                    "API access (coming soon)",
                    "Priority support",
                    "Custom integrations",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-brand-royal flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStudioClick}
                  variant="outline"
                  className="w-full border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                  size="lg"
                >
                  Get Studio Plan
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  One-time payment · lifetime access (30-day window)
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Limited-Time Lifetime Pricing Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="rounded-lg p-6 max-w-2xl mx-auto bg-[hsl(var(--action))]/15 border border-[hsl(var(--action))]/40">
            <h3 className="font-semibold text-royal mb-2">
              ⏳ Limited-Time Lifetime Pricing
            </h3>
            <p className="text-sm text-foreground">
              Pay once, own it for life. Our one-time price is available for the
              next 30 days; after that, new customers move to a subscription.
              Purchases made now keep lifetime access.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
