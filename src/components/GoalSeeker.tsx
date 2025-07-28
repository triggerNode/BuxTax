import { useState, useMemo } from "react";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuxCard } from "@/components/shared/BuxCard";
import { calculateRequiredRobux, formatCurrency, formatRobux } from "@/lib/fees";
import { FormulaTooltip } from "@/components/shared/FormulaTooltip";
import { useDebounce } from "@/hooks/useDebounce";
import { analytics } from "@/utils/analytics";

interface GoalSeekerProps {
  userType: 'gameDev' | 'ugcCreator';
}

export function GoalSeeker({ userType }: GoalSeekerProps) {
  const [targetPayout, setTargetPayout] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [expectedAdSpend, setExpectedAdSpend] = useState("0");
  const [expectedOtherCosts, setExpectedOtherCosts] = useState("0");

  // Debounce inputs for better performance
  const debouncedTargetPayout = useDebounce(parseFloat(targetPayout) || 0, 300);
  const debouncedExpectedAdSpend = useDebounce(parseFloat(expectedAdSpend) || 0, 300);
  const debouncedExpectedOtherCosts = useDebounce(parseFloat(expectedOtherCosts) || 0, 300);

  // Live calculation of required Robux
  const requiredRobux = useMemo(() => {
    if (debouncedTargetPayout <= 0) return 0;

    const result = calculateRequiredRobux(debouncedTargetPayout, userType, {
      adSpend: debouncedExpectedAdSpend,
      otherCosts: debouncedExpectedOtherCosts,
    });

    // Track goal setting
    if (debouncedTargetPayout > 0) {
      analytics.track('goal_calculated', {
        userType,
        targetUSD: debouncedTargetPayout,
        requiredRobux: result,
        deadline: deadline || null,
      });
    }

    return result;
  }, [debouncedTargetPayout, userType, debouncedExpectedAdSpend, debouncedExpectedOtherCosts, deadline]);

  const shareData = {
    nextGoal: parseFloat(targetPayout) || 0,
    goalDeadline: deadline,
  };

  return (
    <BuxCard 
      title={`${userType === 'gameDev' ? 'Game Dev' : 'UGC Creator'} Goal Seeker`}
      icon={Target}
      shareData={shareData}
      dataSourceId="goal-seeker"
    >
      {/* Required Robux Display */}
      {requiredRobux > 0 && (
        <div className="text-center p-4 bg-primary/5 rounded-lg mb-6">
          <div className="text-2xl font-bold text-primary">{formatRobux(requiredRobux)}</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground">Required Gross Robux</div>
            <FormulaTooltip 
              formula="(Target USD × 350 + Expected Costs) ÷ (1 - Marketplace Fee)"
              description="Reverse calculation to find required gross Robux"
              variables={{
                "Target USD": "Your desired USD payout",
                "350": "Current DevEx rate",
                "Marketplace Fee": `${userType === 'gameDev' ? '30%' : '70%'} (Roblox fee)`,
                "Expected Costs": "Your estimated business expenses"
              }}
            />
          </div>
        </div>
      )}

      {/* Target USD Input */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="target-usd">Target USD Payout</Label>
        <Input
          id="target-usd"
          type="number"
          placeholder="100"
          value={targetPayout}
          onChange={(e) => setTargetPayout(e.target.value)}
          className="text-center text-lg font-semibold"
        />
      </div>

      {/* Deadline Input */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="deadline">Deadline (Optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* Expected Costs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <Label className="text-sm">Expected Ad Spend</Label>
          <Input
            type="number"
            placeholder="0"
            value={expectedAdSpend}
            onChange={(e) => setExpectedAdSpend(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-sm">Expected Other Costs</Label>
          <Input
            type="number"
            placeholder="0"
            value={expectedOtherCosts}
            onChange={(e) => setExpectedOtherCosts(e.target.value)}
          />
        </div>
      </div>

      {/* Goal Summary */}
      {requiredRobux > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Goal Summary</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Target Payout:</span>
              <span className="font-medium text-primary">{formatCurrency(parseFloat(targetPayout) || 0)}</span>
            </div>
            {deadline && (
              <div className="flex justify-between">
                <span>Deadline:</span>
                <span>{new Date(deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Platform Fee ({userType === 'gameDev' ? '30%' : '70%'}):</span>
              <span>-{formatRobux(requiredRobux * (userType === 'gameDev' ? 0.30 : 0.70))}</span>
            </div>
            {(parseFloat(expectedAdSpend) || 0) > 0 && (
              <div className="flex justify-between">
                <span>Expected Ad Spend:</span>
                <span>-{formatRobux(parseFloat(expectedAdSpend) || 0)}</span>
              </div>
            )}
            {(parseFloat(expectedOtherCosts) || 0) > 0 && (
              <div className="flex justify-between">
                <span>Expected Other Costs:</span>
                <span>-{formatRobux(parseFloat(expectedOtherCosts) || 0)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </BuxCard>
  );
}