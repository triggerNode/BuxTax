import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BuxCard } from "@/components/shared/BuxCard";
import { useLiveCalculation } from "@/hooks/useLiveCalculation";
import { formatCurrency, formatRobux, formatPercentage } from "@/lib/fees";

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

  // Live calculation using custom hook
  const results = useLiveCalculation(
    parseFloat(grossRobux) || 0,
    userType,
    {
      adSpend: parseFloat(adSpend) || 0,
      groupSplits: parseFloat(groupSplits) || 0,
      affiliatePayouts: parseFloat(affiliatePayouts) || 0,
      refunds: parseFloat(refunds) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
    }
  );

  const shareData = {
    netEarnings: results.usdPayout,
    effectiveTakeRate: results.effectiveTakeRate,
  };

  return (
    <BuxCard 
      title="Profit Calculator" 
      icon={Calculator}
      shareData={shareData}
      dataSourceId="profit-calc"
    >
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-2xl font-bold text-primary">{formatCurrency(results.usdPayout)}</div>
          <div className="text-sm text-muted-foreground">USD Payout</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">{formatRobux(results.netRobux)}</div>
          <div className="text-sm text-muted-foreground">Net Robux</div>
        </div>
      </div>

      {/* Take Rate Highlight */}
      <div className="mb-6 p-3 border border-border rounded-lg bg-background">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Effective Take Rate:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-destructive">{formatPercentage(results.effectiveTakeRate)}</span>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total percentage lost to fees and costs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Gross Robux Input */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="gross-robux">Gross Robux Earned</Label>
        <Input
          id="gross-robux"
          type="number"
          placeholder="10000"
          value={grossRobux}
          onChange={(e) => setGrossRobux(e.target.value)}
          className="text-center text-lg font-semibold"
        />
      </div>

      {/* Quick Costs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-sm">Ad Spend</Label>
          <Input
            type="number"
            placeholder="0"
            value={adSpend}
            onChange={(e) => setAdSpend(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-sm">Other Costs</Label>
          <Input
            type="number"
            placeholder="0"
            value={otherCosts}
            onChange={(e) => setOtherCosts(e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Costs Accordion */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <span className="text-sm">Advanced Costs</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <div>
            <Label className="text-sm">Group Splits</Label>
            <Input
              type="number"
              placeholder="0"
              value={groupSplits}
              onChange={(e) => setGroupSplits(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm">Affiliate Payouts</Label>
            <Input
              type="number"
              placeholder="0"
              value={affiliatePayouts}
              onChange={(e) => setAffiliatePayouts(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm">Refunds</Label>
            <Input
              type="number"
              placeholder="0"
              value={refunds}
              onChange={(e) => setRefunds(e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Fee Breakdown Table */}
      {results.grossRobux > 0 && (
        <div className="mt-6 space-y-2 p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-3">Fee Breakdown</h4>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Marketplace Fee ({userType === 'gameDev' ? '30%' : '70%'}):</span>
              <span>-{formatRobux(results.breakdown.marketplaceFee)}</span>
            </div>
            
            {results.breakdown.adSpend > 0 && (
              <div className="flex justify-between">
                <span>Ad Spend:</span>
                <span>-{formatRobux(results.breakdown.adSpend)}</span>
              </div>
            )}
            
            {results.breakdown.groupSplits > 0 && (
              <div className="flex justify-between">
                <span>Group Splits:</span>
                <span>-{formatRobux(results.breakdown.groupSplits)}</span>
              </div>
            )}
            
            {results.breakdown.affiliatePayouts > 0 && (
              <div className="flex justify-between">
                <span>Affiliate Payouts:</span>
                <span>-{formatRobux(results.breakdown.affiliatePayouts)}</span>
              </div>
            )}
            
            {results.breakdown.refunds > 0 && (
              <div className="flex justify-between">
                <span>Refunds:</span>
                <span>-{formatRobux(results.breakdown.refunds)}</span>
              </div>
            )}
            
            {results.breakdown.otherCosts > 0 && (
              <div className="flex justify-between">
                <span>Other Costs:</span>
                <span>-{formatRobux(results.breakdown.otherCosts)}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-1 mt-2 flex justify-between font-medium">
              <span>Net Robux:</span>
              <span className="text-primary">{formatRobux(results.netRobux)}</span>
            </div>
          </div>
        </div>
      )}
    </BuxCard>
  );
}