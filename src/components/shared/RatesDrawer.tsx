import { useState } from "react";
import { Settings, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FEE_CONSTANTS } from "@/lib/fees";

interface RatesDrawerProps {
  onRatesChange?: (rates: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function RatesDrawer({
  onRatesChange,
  open,
  onOpenChange,
  showTrigger = true,
}: RatesDrawerProps) {
  const [rates, setRates] = useState(FEE_CONSTANTS);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const controlledOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  const handleDevExRateChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newRates = { ...rates, DEVEX_RATE_USD_PER_ROBUX: numericValue };
    setRates(newRates);
    onRatesChange?.(newRates);
  };

  const handleMarketplaceFeeChange = (
    userType: "GAME_DEV" | "UGC_CREATOR",
    value: string
  ) => {
    const numericValue = (parseFloat(value) || 0) / 100;
    const newRates = {
      ...rates,
      MARKETPLACE_FEE: {
        ...rates.MARKETPLACE_FEE,
        [userType]: numericValue,
      },
    };
    setRates(newRates);
    onRatesChange?.(newRates);
  };

  const resetToDefaults = () => {
    setRates(FEE_CONSTANTS);
    onRatesChange?.(FEE_CONSTANTS);
  };

  return (
    <Sheet open={controlledOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Rates & Assumptions</span>
          </Button>
        </SheetTrigger>
      )}

      <SheetContent className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rates & Assumptions
          </SheetTitle>
          <SheetDescription>
            Current marketplace rates and DevEx conversion rates. Advanced mode
            allows customization.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* DevEx Rate */}
          <div className="space-y-2">
            <Label htmlFor="devex-rate" className="text-sm font-medium">
              DevEx Rate (USD per Robux)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                id="devex-rate"
                type="number"
                step="0.0001"
                value={rates.DEVEX_RATE_USD_PER_ROBUX}
                onChange={(e) => handleDevExRateChange(e.target.value)}
                disabled={!isAdvancedMode}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Official Roblox DevEx rate as of January 2025
            </p>
          </div>

          <Separator />

          {/* Marketplace Fees */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Marketplace Fees</h4>

            <div className="space-y-2">
              <Label htmlFor="game-dev-fee" className="text-sm">
                Game Developer Fee (%)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="game-dev-fee"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={(rates.MARKETPLACE_FEE.GAME_DEV * 100).toFixed(0)}
                  onChange={(e) =>
                    handleMarketplaceFeeChange("GAME_DEV", e.target.value)
                  }
                  disabled={!isAdvancedMode}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ugc-fee" className="text-sm">
                UGC Creator Fee (%)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ugc-fee"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={(rates.MARKETPLACE_FEE.UGC_CREATOR * 100).toFixed(0)}
                  onChange={(e) =>
                    handleMarketplaceFeeChange("UGC_CREATOR", e.target.value)
                  }
                  disabled={!isAdvancedMode}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Advanced Mode</p>
              <p className="text-xs text-muted-foreground">
                Allow editing of rates and assumptions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            >
              {isAdvancedMode ? "Lock" : "Unlock"}
            </Button>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={resetToDefaults}
            disabled={!isAdvancedMode}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>

          <Separator />

          {/* Source Attribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Sources</h4>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>DevEx Rate:</span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  asChild
                >
                  <a
                    href="https://en.help.roblox.com/hc/en-us/articles/13061189551124-Developer-Exchange-DevEx-FAQs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Roblox DevEx FAQ
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span>Marketplace Fees:</span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  asChild
                >
                  <a
                    href="https://create.roblox.com/docs/production/earning-on-roblox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Roblox Creator Hub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
