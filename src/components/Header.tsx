import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import buxtaxLogo from "@/assets/buxtax-logo.svg";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-cream backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={buxtaxLogo} alt="BuxTax Logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signin">
              <Button
                variant="ghost"
                className="text-royal hover:text-royal/80"
              >
                Log In
              </Button>
            </Link>
            <Button
              onClick={scrollToPricing}
              className="bg-royal text-cream hover:bg-royal/90"
            >
              Get BuxTax
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-royal"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-3">
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-royal hover:text-royal/80"
                >
                  Log In
                </Button>
              </Link>
              <Button
                onClick={scrollToPricing}
                className="w-full bg-royal text-cream hover:bg-royal/90"
              >
                Get BuxTax
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
