import { useState, useEffect } from "react";
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BuxCard } from "@/components/shared/BuxCard";
import { useLiveCalculation } from "@/hooks/useLiveCalculation";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatRobux, formatPercentage } from "@/lib/fees";
import { FormulaTooltip } from "@/components/shared/FormulaTooltip";
import { analytics } from "@/utils/analytics";

interface ProfitCalculatorProps {
  userType: 'gameDev' | 'ugcCreator';
}

export function ProfitCalculator({ userType }: ProfitCalculatorProps) {
  const [grossRobux, setGrossRobux] = useState("10000");
  const [adSpend, setAdSpend] = useState("0");
  const [groupSplits, setGroupSplits] = useState("0");
  const [affiliatePayouts, setAffiliatePayouts] = useState("0");
  const [refunds, setRefunds] = useState("0");
  const [otherCosts, setOtherCosts] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce inputs for better performance
  const debouncedGrossRobux = useDebounce(parseFloat(grossRobux) || 0, 300);
  const debouncedAdSpend = useDebounce(parseFloat(adSpend) || 0, 300);
  const debouncedOtherCosts = useDebounce(parseFloat(otherCosts) || 0, 300);

  // Live calculation using custom hook
  const results = useLiveCalculation(
    debouncedGrossRobux,
    userType,
    {
      adSpend: debouncedAdSpend,
      groupSplits: parseFloat(groupSplits) || 0,
      affiliatePayouts: parseFloat(affiliatePayouts) || 0,
      refunds: parseFloat(refunds) || 0,
      otherCosts: debouncedOtherCosts,
    }
  );

  // Track significant calculations
  useEffect(() => {
    if (debouncedGrossRobux > 0) {
      analytics.track('calculation_performed', {
        userType,
        grossRobux: debouncedGrossRobux,
        usdPayout: results.usdPayout,
        effectiveTakeRate: results.effectiveTakeRate,
      });
    }
  }, [debouncedGrossRobux, results.usdPayout, userType]);

  const shareData = {
    netEarnings: results.usdPayout,
    effectiveTakeRate: results.effectiveTakeRate,
  };

  return (
    <BuxCard 
      title="Profit Calculator"
      icon={Calculator}
      variant="detailed"
      size="lg"
      userType={userType}
      shareData={shareData}
      dataSourceId="profit-calc"
    >
      {/* Primary Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <div className="text-3xl font-bold text-primary mb-2">{formatCurrency(results.usdPayout)}</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground font-medium">USD Payout</div>
            <FormulaTooltip 
              formula="Net Robux ÷ 350"
              description="USD payout calculation"
              variables={{
                "Net Robux": "Gross Robux - All Costs - Marketplace Fee",
                "350": "Current DevEx rate (Robux per USD)"
              }}
            />
          </div>
          <div className="mt-3 text-xs text-primary/80 bg-primary/10 rounded-full px-3 py-1 inline-block">
            Primary Earnings
          </div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border">
          <div className="text-3xl font-bold mb-2">{formatRobux(results.netRobux)}</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground font-medium">Net Robux</div>
            <FormulaTooltip 
              formula="Gross Robux - Total Costs - Marketplace Fee"
              description="Net Robux calculation"
              variables={{
                "Marketplace Fee": `${userType === 'gameDev' ? '30%' : '70%'} of gross Robux`,
                "Total Costs": "Sum of all your business expenses"
              }}
            />
          </div>
          <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
            After Deductions
          </div>
        </div>
      </div>

      {/* Take Rate Highlight */}
      <div className="mb-8 p-4 border border-destructive/20 rounded-xl bg-gradient-to-r from-destructive/5 to-destructive/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Effective Take Rate:</span>
            <FormulaTooltip 
              formula="((Gross Robux - Net Robux) ÷ Gross Robux) × 100"
              description="Your true cost percentage"
              variables={{
                "Gross Robux": "Total Robux earned before any deductions",
                "Net Robux": "Final Robux after all costs and fees"
              }}
            />
          </div>
          <div className="text-right">
            <span className="font-bold text-destructive text-lg">{formatPercentage(results.effectiveTakeRate)}</span>
            <div className="text-xs text-muted-foreground">Total Cost %</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-muted/30 rounded-xl p-6 mb-6">
        <h4 className="font-semibold mb-4 text-center">Revenue & Costs</h4>
        
        {/* Gross Robux Input */}
        <div className="space-y-3 mb-6">
          <Label htmlFor="gross-robux" className="text-sm font-medium">Gross Robux Earned</Label>
          <Input
            id="gross-robux"
            type="number"
            placeholder="10000"
            value={grossRobux}
            onChange={(e) => setGrossRobux(e.target.value)}
            className="text-center text-xl font-bold mobile-text-input mobile-touch-target focus-ring h-12"
          />
        </div>

        {/* Quick Costs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm font-medium">Ad Spend</Label>
            <Input
              type="number"
              placeholder="0"
              value={adSpend}
              onChange={(e) => setAdSpend(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Other Costs</Label>
            <Input
              type="number"
              placeholder="0"
              value={otherCosts}
              onChange={(e) => setOtherCosts(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Advanced Costs Accordion */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto mobile-touch-target focus-ring rounded-lg border border-dashed">
              <span className="text-sm font-medium">Advanced Cost Breakdown</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Group Splits</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={groupSplits}
                  onChange={(e) => setGroupSplits(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Affiliate Payouts</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={affiliatePayouts}
                  onChange={(e) => setAffiliatePayouts(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Refunds</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={refunds}
                  onChange={(e) => setRefunds(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Fee Breakdown Table */}
      {results.grossRobux > 0 && (
        <div className="mt-8 bg-gradient-to-br from-background to-muted/20 rounded-xl border p-6">
          <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Detailed Breakdown
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-muted">
              <span className="font-medium">Gross Revenue:</span>
              <span className="font-bold text-primary">{formatRobux(results.grossRobux)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Marketplace Fee ({userType === 'gameDev' ? '30%' : '70%'}):</span>
              <span className="text-destructive">-{formatRobux(results.breakdown.marketplaceFee)}</span>
            </div>
            
            {results.breakdown.adSpend > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Ad Spend:</span>
                <span className="text-destructive">-{formatRobux(results.breakdown.adSpend)}</span>
              </div>
            )}
            
            {results.breakdown.groupSplits > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Group Splits:</span>
                <span className="text-destructive">-{formatRobux(results.breakdown.groupSplits)}</span>
              </div>
            )}
            
            {results.breakdown.affiliatePayouts > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Affiliate Payouts:</span>
                <span className="text-destructive">-{formatRobux(results.breakdown.affiliatePayouts)}</span>
              </div>
            )}
            
            {results.breakdown.refunds > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Refunds:</span>
                <span className="text-destructive">-{formatRobux(results.breakdown.refunds)}</span>
              </div>
            )}
            
            {results.breakdown.otherCosts > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Other Costs:</span>
                <span className="text-destructive">-{formatRobux(results.breakdown.otherCosts)}</span>
              </div>
            )}
            
            <div className="border-t border-primary/20 pt-3 mt-4 flex justify-between items-center">
              <span className="font-semibold text-base">Net Earnings:</span>
              <span className="font-bold text-primary text-lg">{formatRobux(results.netRobux)}</span>
            </div>
          </div>
        </div>
      )}
    </BuxCard>
  );
}