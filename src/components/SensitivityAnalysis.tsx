import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calculateProfit, formatCurrency, formatRobux } from "@/lib/fees";

interface SensitivityAnalysisProps {
  baseRobux: number;
  userType: 'gameDev' | 'ugcCreator';
  baseCosts: {
    adSpend: number;
    groupSplits: number;
    affiliatePayouts: number;
    refunds: number;
    otherCosts: number;
  };
}

export function SensitivityAnalysis({ baseRobux, userType, baseCosts }: SensitivityAnalysisProps) {
  const [robuxMultiplier, setRobuxMultiplier] = useState([1]);
  const [adSpendMultiplier, setAdSpendMultiplier] = useState([1]);
  const [otherCostsMultiplier, setOtherCostsMultiplier] = useState([1]);

  const baseResult = useMemo(() => {
    return calculateProfit(baseRobux, userType, baseCosts);
  }, [baseRobux, userType, baseCosts]);

  const sensitivityResult = useMemo(() => {
    const adjustedRobux = baseRobux * robuxMultiplier[0];
    const adjustedCosts = {
      ...baseCosts,
      adSpend: baseCosts.adSpend * adSpendMultiplier[0],
      otherCosts: baseCosts.otherCosts * otherCostsMultiplier[0],
    };

    return calculateProfit(adjustedRobux, userType, adjustedCosts);
  }, [baseRobux, userType, baseCosts, robuxMultiplier, adSpendMultiplier, otherCostsMultiplier]);

  const getChangeIndicator = (current: number, base: number) => {
    const change = ((current - base) / base) * 100;
    if (Math.abs(change) < 0.1) return { icon: Minus, color: "text-muted-foreground", text: "0%" };
    if (change > 0) return { icon: TrendingUp, color: "text-green-500", text: `+${change.toFixed(1)}%` };
    return { icon: TrendingDown, color: "text-red-500", text: `${change.toFixed(1)}%` };
  };

  const profitChange = getChangeIndicator(sensitivityResult.usdPayout, baseResult.usdPayout);
  const takeRateChange = getChangeIndicator(sensitivityResult.effectiveTakeRate, baseResult.effectiveTakeRate);

  if (baseRobux <= 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Sensitivity Analysis
          <Badge variant="outline">What-if scenarios</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Adjust parameters to see how changes affect your earnings
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Parameter Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Gross Robux</span>
              <span className="text-sm text-muted-foreground">
                {formatRobux(baseRobux * robuxMultiplier[0])} ({(robuxMultiplier[0] * 100).toFixed(0)}%)
              </span>
            </Label>
            <Slider
              value={robuxMultiplier}
              onValueChange={setRobuxMultiplier}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Ad Spend</span>
              <span className="text-sm text-muted-foreground">
                {formatRobux(baseCosts.adSpend * adSpendMultiplier[0])} ({(adSpendMultiplier[0] * 100).toFixed(0)}%)
              </span>
            </Label>
            <Slider
              value={adSpendMultiplier}
              onValueChange={setAdSpendMultiplier}
              min={0}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Other Costs</span>
              <span className="text-sm text-muted-foreground">
                {formatRobux(baseCosts.otherCosts * otherCostsMultiplier[0])} ({(otherCostsMultiplier[0] * 100).toFixed(0)}%)
              </span>
            </Label>
            <Slider
              value={otherCostsMultiplier}
              onValueChange={setOtherCostsMultiplier}
              min={0}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* Results Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Base Scenario</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>USD Payout:</span>
                <span className="font-medium">{formatCurrency(baseResult.usdPayout)}</span>
              </div>
              <div className="flex justify-between">
                <span>Take Rate:</span>
                <span className="font-medium">{baseResult.effectiveTakeRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Adjusted Scenario</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>USD Payout:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(sensitivityResult.usdPayout)}</span>
                  <div className={`flex items-center gap-1 ${profitChange.color}`}>
                    <profitChange.icon className="h-3 w-3" />
                    <span className="text-xs">{profitChange.text}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Take Rate:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{sensitivityResult.effectiveTakeRate.toFixed(1)}%</span>
                  <div className={`flex items-center gap-1 ${takeRateChange.color}`}>
                    <takeRateChange.icon className="h-3 w-3" />
                    <span className="text-xs">{takeRateChange.text}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Key Insight</h4>
          <p className="text-xs text-muted-foreground">
            {Math.abs(parseFloat(profitChange.text.replace('%', '').replace('+', ''))) > 10 
              ? "Small changes in parameters can significantly impact your earnings. Consider optimizing your highest-impact variables."
              : "Your earnings are relatively stable to parameter changes. This suggests a balanced cost structure."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}