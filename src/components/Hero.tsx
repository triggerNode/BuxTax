import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { handleUpgrade } from "@/components/Paywall";
import { CalculatorLite } from "@/components/CalculatorLite";

export function Hero() {
  const { user } = useAuth();

  const handleLifetimeClick = () => {
    handleUpgrade("lifetime");
  };

  const handleStudioClick = () => {
    handleUpgrade("studio");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream to-cream/50 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black font-rounded text-royal leading-tight">
                Turn Robux Into Real-World Cash,{" "}
                <span className="text-cherry">Instantly Today</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Know exactly what you'll bank after Roblox fees with no
                spreadsheets. Calculate your DevEx earnings and{" "}
                <span className="font-rounded font-black text-royal lowercase underline decoration-brand-yellow underline-offset-4 decoration-4">
                  more
                </span>{" "}
                in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-royal hover:bg-royal/90"
                onClick={() => handleUpgrade("lifetime")}
              >
                Get Lifetime Access - $39
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-cherry text-cherry hover:bg-cherry hover:text-white"
                onClick={() => handleUpgrade("studio")}
              >
                Studio Plan - $149
              </Button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>✓ Instant calculations</span>
              <span>✓ No recurring fees</span>
              <span>✓ Lifetime pricing available for a limited time</span>
            </div>
          </motion.div>

          {/* Right Column - Animated Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-royal/10">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Calculator className="w-6 h-6 text-royal" />
                  <h3 className="font-rounded font-semibold text-lg">
                    BuxTax Calculator
                  </h3>
                </div>
                <CalculatorLite source="hero" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
