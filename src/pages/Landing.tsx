import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { useEffect } from "react";

export default function Landing() {
  // Ensure visiting /#pricing scrolls to the pricing section after mount
  useEffect(() => {
    if (window.location.hash === "#pricing") {
      const el = document.getElementById("pricing");
      if (el) {
        // Use a small timeout to ensure layout is ready before scrolling
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 0);
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <div id="pricing">
        <Pricing />
      </div>
      <FAQ />
      <footer className="bg-royal text-cream py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm">© 2024 BuxTax. All rights reserved.</div>
            <div className="flex space-x-6 text-sm">
              <a href="/terms" className="hover:text-yellow">
                Terms
              </a>
              <a href="/privacy" className="hover:text-yellow">
                Privacy
              </a>
              <a href="/blog" className="hover:text-yellow">
                Blog
              </a>
              <a href="mailto:support@buxtax.com" className="hover:text-yellow">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
