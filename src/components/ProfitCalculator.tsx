import { useEffect, memo } from "react";
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassGate } from "@/components/shared/GlassGate";
import { handleUpgrade } from "@/components/Paywall";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BuxCard } from "@/components/shared/BuxCard";
import { ChartContainer } from "@/components/ui/chart-container";
import { cn } from "@/lib/utils";
import { useLiveCalculation } from "@/hooks/useLiveCalculation";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatRobux, formatPercentage } from "@/lib/fees";
import { FormulaTooltip } from "@/components/shared/FormulaTooltip";
import { analytics } from "@/utils/analytics";
import { useProfitCalculatorState } from "@/contexts/AppStateContext";

interface ProfitCalculatorProps {
  userType: "gameDev" | "ugcCreator";
  /** Free plan flag – used to show glass overlays rather than disabling inputs */
  readonly?: boolean;
}

const ProfitCalculator = memo(function ProfitCalculator({
  userType,
  readonly = false,
}: ProfitCalculatorProps) {
  const { profitState, updateState } = useProfitCalculatorState(userType);

  const {
    grossRobux,
    adSpend,
    groupSplits,
    affiliatePayouts,
    refunds,
    otherCosts,
    showAdvanced,
  } = profitState;

  // Debounce inputs for better performance
  const debouncedGrossRobux = useDebounce(parseFloat(grossRobux) || 0, 300);
  const debouncedAdSpend = useDebounce(parseFloat(adSpend) || 0, 300);
  const debouncedOtherCosts = useDebounce(parseFloat(otherCosts) || 0, 300);

  // Live calculation using custom hook
  const results = useLiveCalculation(debouncedGrossRobux, userType, {
    adSpend: debouncedAdSpend,
    groupSplits: parseFloat(groupSplits) || 0,
    affiliatePayouts: parseFloat(affiliatePayouts) || 0,
    refunds: parseFloat(refunds) || 0,
    otherCosts: debouncedOtherCosts,
  });

  // persist unit across reloads
  const [breakdownUnit, setBreakdownUnit] = useLocalStorage<"robux" | "usd">(
    "buxtax-breakdown-unit",
    "robux"
  );

  // Track significant calculations
  useEffect(() => {
    if (debouncedGrossRobux > 0) {
      analytics.track("calculation_performed", {
        userType,
        grossRobux: debouncedGrossRobux,
        usdPayout: results.usdPayout,
        effectiveTakeRate: results.effectiveTakeRate,
      });
    }
  }, [debouncedGrossRobux, results.usdPayout, userType]);

  const shareData = {
    netEarnings: results.usdPayout,
    netRobux: results.netRobux,
    effectiveTakeRate: results.effectiveTakeRate,
  };

  return (
    <BuxCard
      title="Profit Calculator"
      icon={Calculator}
      variant="detailed"
      size="lg"
      userType={userType}
      cardType="profit"
      shareData={shareData}
      dataSourceId="buxtax-card-profit-calculator"
    >
      {/* Primary Metrics Dashboard */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        data-share-id="pc-stats"
      >
        <div
          className={cn(
            "text-center p-6 rounded-xl border",
            readonly
              ? "bg-gradient-to-br from-muted/50 to-muted/30 border"
              : "bg-destructive text-white border-transparent"
          )}
        >
          <div
            className={cn("text-3xl font-bold mb-2", !readonly && "text-white")}
          >
            {formatCurrency(results.usdPayout)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className={cn(
                "text-sm font-medium",
                !readonly && "text-white/90"
              )}
            >
              USD Payout
            </div>
            <FormulaTooltip
              formula="Net Robux × 0.0037975"
              description="USD payout calculation"
              variables={{
                "Net Robux": "Gross Robux - All Costs - Marketplace Fee",
                "0.0037975": "Current DevEx rate (USD per Robux)",
              }}
            />
          </div>
          <div
            className={cn(
              "mt-3 text-xs rounded-full px-3 py-1 inline-block",
              readonly
                ? "text-primary/80 bg-primary/10"
                : "text-white/90 bg-white/20"
            )}
          >
            Primary Earnings
          </div>
        </div>

        <div className="text-center p-6 rounded-xl border bg-brand-royal text-white border-brand-royal">
          <div className="text-3xl font-bold mb-2">
            {formatRobux(results.netRobux)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-sm font-medium">Net Robux</div>
            <FormulaTooltip
              formula="Gross Robux - Total Costs - Marketplace Fee"
              description="Net Robux calculation"
              variables={{
                "Marketplace Fee": `${
                  userType === "gameDev" ? "30%" : "70%"
                } of gross Robux`,
                "Total Costs": "Sum of all your business expenses",
              }}
            />
          </div>
          <div className="mt-3 text-xs bg-white/20 text-white/90 rounded-full px-3 py-1 inline-block">
            After Deductions
          </div>
        </div>
      </div>

      {/* Take Rate Highlight */}
      <div
        className="mb-8 p-4 border border-destructive/20 rounded-xl bg-gradient-to-r from-destructive/5 to-destructive/10"
        data-share-id="pc-etr"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Effective Take Rate:</span>
            <FormulaTooltip
              formula="((Gross Robux - Net Robux) ÷ Gross Robux) × 100"
              description="Your true cost percentage"
              variables={{
                "Gross Robux": "Total Robux earned before any deductions",
                "Net Robux": "Final Robux after all costs and fees",
              }}
            />
          </div>
          <div className="text-right">
            <span className="font-bold text-destructive text-lg">
              {formatPercentage(results.effectiveTakeRate)}
            </span>
            <div className="text-xs text-muted-foreground">Total Cost %</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div
        className="bg-muted/30 rounded-xl p-6 mb-6"
        data-share-exclude="true"
      >
        <h4 className="font-semibold mb-4 text-center">Revenue & Costs</h4>

        {/* Gross Robux Input */}
        <div className="space-y-3 mb-6">
          <Label htmlFor="gross-robux" className="text-sm font-medium">
            Gross Robux Earned
          </Label>
          <Input
            id="gross-robux"
            type="number"
            step="1"
            min="0"
            value={grossRobux}
            onChange={(e) => updateState({ grossRobux: e.target.value })}
            className="text-center text-xl font-bold mobile-text-input mobile-touch-friendly focus-ring h-12"
          />
        </div>

        {/* Costs + Advanced, gated for Free with a glass overlay */}
        <GlassGate
          show={readonly}
          title={
            userType === "ugcCreator"
              ? "UGC tools are premium"
              : "Advanced costs are premium"
          }
          description={
            userType === "ugcCreator"
              ? "Upgrade to access UGC Creator calculators."
              : "Upgrade to edit costs and detailed breakdown."
          }
          onCta={() => handleUpgrade("lifetime")}
        >
          {/* Quick Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium">Ad Spend</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={adSpend}
                onChange={(e) => updateState({ adSpend: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Other Costs</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={otherCosts}
                onChange={(e) => updateState({ otherCosts: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Advanced Costs Accordion */}
          <Collapsible
            open={showAdvanced}
            onOpenChange={(open) => updateState({ showAdvanced: open })}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between p-3 h-auto mobile-touch-target focus-ring rounded-lg transition-colors",
                  showAdvanced
                    ? "bg-brand-royal text-white border border-brand-royal shadow-md hover:!bg-brand-royal hover:!text-[hsl(var(--action))]"
                    : "bg-brand-royal text-white border border-brand-royal shadow-md hover:!bg-brand-royal hover:!text-[hsl(var(--action))]"
                )}
              >
                <span className="text-sm font-medium">
                  Advanced Cost Breakdown
                </span>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Group Splits</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={groupSplits}
                    onChange={(e) =>
                      updateState({ groupSplits: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Affiliate Payouts
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={affiliatePayouts}
                    onChange={(e) =>
                      updateState({ affiliatePayouts: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Refunds</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={refunds}
                    onChange={(e) => updateState({ refunds: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </GlassGate>
      </div>

      {/* Fee Breakdown Table */}
      {results.grossRobux > 0 && (
        <div
          className="mt-8 bg-card rounded-2xl border-2 border-brand-royal p-6"
          data-share-id="pc-breakdown"
        >
          {/* Derive a USD-per-R$ from what we already show in the top cards. */}
          {(() => {
            const DEFAULT_USD_PER_ROBUX = 0.0037975;
            const usdPerRobux =
              results?.netRobux > 0 && typeof results?.usdPayout === "number"
                ? results.usdPayout / results.netRobux
                : DEFAULT_USD_PER_ROBUX;
            const fmt = (robuxAmount: number) =>
              breakdownUnit === "robux"
                ? formatRobux(robuxAmount)
                : formatCurrency(robuxAmount * usdPerRobux);
            return (
              <>
                <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Detailed Breakdown
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Toggle amounts to ${
                      breakdownUnit === "robux" ? "USD" : "Robux"
                    }`}
                    aria-pressed={breakdownUnit === "usd"}
                    onClick={() =>
                      setBreakdownUnit(
                        breakdownUnit === "robux" ? "usd" : "robux"
                      )
                    }
                    data-share-exclude="true"
                    className="ml-auto h-6 px-2.5 rounded-full text-xs font-semibold bg-brand-royal text-white border border-brand-royal hover:!bg-brand-royal/90 hover:!text-[hsl(var(--action))]"
                  >
                    {breakdownUnit === "robux" ? "USD" : "R$"}
                  </Button>
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-brand-royal">
                    <span className="font-medium">Gross Revenue:</span>
                    <span className="font-bold text-primary">
                      {fmt(results.grossRobux)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-foreground">
                      Marketplace Fee ({userType === "gameDev" ? "30%" : "70%"}
                      ):
                    </span>
                    <span className="text-destructive">
                      -{fmt(results.breakdown.marketplaceFee)}
                    </span>
                  </div>

                  {results.breakdown.adSpend > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-foreground">Ad Spend:</span>
                      <span className="text-destructive">
                        -{fmt(results.breakdown.adSpend)}
                      </span>
                    </div>
                  )}

                  {results.breakdown.groupSplits > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-foreground">Group Splits:</span>
                      <span className="text-destructive">
                        -{fmt(results.breakdown.groupSplits)}
                      </span>
                    </div>
                  )}

                  {results.breakdown.affiliatePayouts > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-foreground">
                        Affiliate Payouts:
                      </span>
                      <span className="text-destructive">
                        -{fmt(results.breakdown.affiliatePayouts)}
                      </span>
                    </div>
                  )}

                  {results.breakdown.refunds > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-foreground">Refunds:</span>
                      <span className="text-destructive">
                        -{fmt(results.breakdown.refunds)}
                      </span>
                    </div>
                  )}

                  {results.breakdown.otherCosts > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-foreground">Other Costs:</span>
                      <span className="text-destructive">
                        -{fmt(results.breakdown.otherCosts)}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 px-3 py-2 rounded-lg bg-brand-yellow flex justify-between items-center">
                    <span className="font-semibold text-base text-foreground">
                      Net Earnings:
                    </span>
                    <span className="font-bold text-primary text-lg">
                      {fmt(results.netRobux)}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </BuxCard>
  );
});

export { ProfitCalculator };
