import { Button } from "@/components/ui/button";
import { RatesDrawer } from "@/components/shared/RatesDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
interface BuxTaxHeaderProps {
  userType: "gameDev" | "ugcCreator";
  onUserTypeChange: (type: "gameDev" | "ugcCreator") => void;
}
export function BuxTaxHeader({
  userType,
  onUserTypeChange,
}: BuxTaxHeaderProps) {
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  return (
    <div className="text-center mb-8">
      <div className="mb-6">
        {/* Top row: BuxTax wordmark and primary actions */}
        <div className="relative flex items-center justify-center mb-2">
          <img
            src="/brand/buxtax-logo.svg"
            alt="BuxTax Logo"
            className="h-16 w-auto"
          />

          <div className="absolute right-0 flex items-center gap-2 text-sm">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-2xl border-2 border-brand-royal bg-[hsl(var(--background))] text-brand-royal hover:bg-brand-cream/80 hover:text-brand-royal shadow-sm hover:shadow-md transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">What's the difference?</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Game Dev vs UGC Creator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-primary">
                      Game Developer
                    </h4>
                    <p className="text-muted-foreground">
                      Earns from game passes, developer products, and premium
                      payouts. Marketplace fee: 30% on all sales.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">UGC Creator</h4>
                    <p className="text-muted-foreground">
                      Earns from avatar items, accessories, and catalog sales.
                      Marketplace fee: 70% on all sales.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      These rates reflect Roblox's current marketplace policies
                      as of December 2024.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-2xl border-2 border-brand-royal bg-brand-royal text-white hover:bg-brand-royal/90 data-[state=open]:bg-brand-royal data-[state=open]:text-white shadow-sm hover:shadow-md transition-colors transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-0 rounded-3xl bg-[linear-gradient(180deg,hsl(var(--yellow))_0%,hsl(var(--yellow)/0.94)_100%)] text-brand-royal border-2 border-brand-royal shadow-xl ring-1 ring-brand-royal/15 overflow-hidden"
              >
                <Link to="/account">
                  <DropdownMenuItem className="px-5 py-3 text-base font-semibold rounded-none border-b border-brand-royal/30 data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow">
                    View account
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onSelect={() => setIsRatesOpen(true)}
                  className="px-5 py-3 text-base font-semibold rounded-none data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow"
                >
                  Rates & assumptions
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-0 bg-brand-royal/30" />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="px-5 py-3 font-semibold text-[hsl(var(--destructive))] data-[highlighted]:bg-brand-cherry data-[highlighted]:text-white"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <RatesDrawer
              open={isRatesOpen}
              onOpenChange={setIsRatesOpen}
              showTrigger={false}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {/* Game Dev pill — royal when active, neutral toggle when inactive */}
        <Button
          variant={userType === "gameDev" ? "default" : "toggle"}
          onClick={() => onUserTypeChange?.("gameDev")}
          aria-pressed={userType === "gameDev"}
          className={cn(
            "rounded-full px-4",
            userType === "gameDev"
              ? "bg-brand-royal text-white hover:bg-brand-royal/90"
              : "data-[state=on]:bg-brand-royal data-[state=on]:text-white"
          )}
        >
          Game Dev
        </Button>

        {/* UGC pill — burgundy when active, neutral toggle when inactive */}
        <Button
          variant={userType === "ugcCreator" ? "default" : "toggle"}
          onClick={() => onUserTypeChange?.("ugcCreator")}
          aria-pressed={userType === "ugcCreator"}
          className={cn(
            "rounded-full px-4",
            userType === "ugcCreator"
              ? "bg-brand-burgundy text-white hover:bg-brand-burgundy/90"
              : "data-[state=on]:bg-brand-burgundy data-[state=on]:text-white"
          )}
        >
          UGC Creator
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Roblox Creator Earnings Calculator
        </h2>
        <p className="text-muted-foreground">
          Calculate your true USD earnings after Roblox's hidden fees and taxes
        </p>
      </div>
    </div>
  );
}
