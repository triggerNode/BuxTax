import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import testimonials from "@/data/testimonials.json";

export function SocialProof() {
  console.log("SocialProof component rendering");
  const [count, setCount] = useState(1200);

  // Animate the counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev < 1300) {
          return prev + 1;
        }
        return 1300;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Live Activity widget + license counter updater
  useEffect(() => {
    // Add a small delay to ensure DOM elements are rendered
    const timeoutId = setTimeout(() => {
      const licenseCounterElement = document.getElementById("license-counter");
      const liveActivityWidget = document.getElementById(
        "live-activity-widget"
      );

      if (licenseCounterElement && liveActivityWidget) {
        let licenseCount = 47;

        const studioNames = [
          "PixelStorm",
          "Synthwave",
          "DreamWeaver",
          "QuantumLeap",
          "StarForge",
          "ByteMasons",
          "CodeWizards",
          "Ghost-Ops",
        ];
        const countries = [
          "the United States",
          "Germany",
          "the UK",
          "Canada",
          "Australia",
          "Japan",
          "Brazil",
          "France",
          "India",
          "South Korea",
        ];

        const generateMessage = () => {
          const isStudio = Math.random() > 0.5;
          if (isStudio) {
            const studio =
              studioNames[Math.floor(Math.random() * studioNames.length)];
            return `A developer from <strong class="font-semibold text-cherry">${studio}</strong> just purchased a Studio License.`;
          } else {
            const country =
              countries[Math.floor(Math.random() * countries.length)];
            return `An individual developer from <strong class="font-semibold text-cherry">${country}</strong> just purchased a license.`;
          }
        };

        const showNotification = () => {
          // 1. Increment license count
          licenseCount++;
          licenseCounterElement.innerText = licenseCount.toString();

          // 2. Update and show widget
          liveActivityWidget.innerHTML = generateMessage();
          liveActivityWidget.classList.remove("opacity-0", "translate-y-10");

          // 3. Hide widget after 5 seconds
          setTimeout(() => {
            liveActivityWidget.classList.add("opacity-0", "translate-y-10");
          }, 5000);
        };

        // Set up the timers
        const initialTimeoutId = setTimeout(() => {
          showNotification();
          const intervalId = setInterval(
            showNotification,
            Math.random() * (30000 - 15000) + 15000
          ); // 15-30 seconds for demo

          // Store interval ID for cleanup
          window.licenseIntervalId = intervalId;
        }, 4000); // 4-second initial delay

        // Store timeout ID for cleanup
        window.licenseTimeoutId = initialTimeoutId;
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId);
      if (window.licenseTimeoutId) clearTimeout(window.licenseTimeoutId);
      if (window.licenseIntervalId) clearInterval(window.licenseIntervalId);
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Trust Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-rounded font-bold text-royal mb-4">
            Lifetime Licenses Sold:{" "}
            <span id="license-counter" className="text-cherry font-black">
              47
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of Roblox developers who use BuxTax to calculate
            their DevEx earnings accurately.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-royal/10 hover:border-royal/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow text-yellow"
                      />
                    ))}
                  </div>

                  <blockquote className="text-foreground mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-royal/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-royal text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-brand-royal rounded-full"></div>
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-brand-royal rounded-full"></div>
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-brand-royal rounded-full"></div>
            <span>Privacy First</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-brand-royal rounded-full"></div>
            <span>Lifetime Access (limited time)</span>
          </div>
        </motion.div>
      </div>
      {/* Live Activity Widget */}
      <div
        id="live-activity-widget"
        className="fixed bottom-5 left-5 bg-card border-gray-200 rounded-full shadow-lg p-3 px-5 text-sm transition-all duration-500 ease-in-out transform translate-y-10 opacity-0 z-50"
      >
        {/* Content will be injected by JavaScript */}
      </div>
    </section>
  );
}
