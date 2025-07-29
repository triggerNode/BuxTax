import { useMemo, memo } from "react";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuxCard } from "@/components/shared/BuxCard";
import { calculateRequiredRobux, formatCurrency, formatRobux } from "@/lib/fees";
import { FormulaTooltip } from "@/components/shared/FormulaTooltip";
import { useDebounce } from "@/hooks/useDebounce";
import { analytics } from "@/utils/analytics";
import { GoalTracker } from "@/components/GoalTracker";
import { ParsedPayoutData } from "@/utils/csvParser";
import { useGoalSeekerState } from "@/contexts/AppStateContext";

interface GoalSeekerProps {
  userType: 'gameDev' | 'ugcCreator';
}

const GoalSeeker = memo(function GoalSeeker({ userType }: GoalSeekerProps) {
  const { goalState, updateState, csvData } = useGoalSeekerState(userType);
  
  const {
    targetPayout,
    deadline,
    expectedAdSpend,
    expectedOtherCosts,
  } = goalState;

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
      title="Goal Seeker"
      icon={Target}
      variant="detailed"
      size="lg"
      userType={userType}
      shareData={shareData}
      dataSourceId="goal-seeker"
    >
      {/* Required Robux Display */}
      {requiredRobux > 0 && (
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 mb-8">
          <div className="text-3xl font-bold text-primary mb-2">{formatRobux(requiredRobux)}</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground font-medium">Required Gross Robux</div>
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
          <div className="mt-3 text-xs text-primary/80 bg-primary/10 rounded-full px-3 py-1 inline-block">
            Goal Target
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-muted/30 rounded-xl p-6 mb-6">
        <h4 className="font-semibold mb-4 text-center">Goal Settings</h4>
        
        {/* Target USD Input */}
        <div className="space-y-3 mb-6">
          <Label htmlFor="target-usd" className="text-sm font-medium">Target USD Payout</Label>
          <Input
            id="target-usd"
            type="number"
            placeholder="100"
              value={targetPayout}
              onChange={(e) => updateState({ targetPayout: e.target.value })}
            className="text-center text-xl font-bold h-12"
          />
        </div>

        {/* Deadline Input */}
        <div className="space-y-3 mb-6">
          <Label htmlFor="deadline" className="text-sm font-medium">Deadline (Optional)</Label>
          <Input
            id="deadline"
            type="date"
              value={deadline}
              onChange={(e) => updateState({ deadline: e.target.value })}
            className="h-11"
          />
        </div>

        {/* Expected Costs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Expected Ad Spend</Label>
            <Input
              type="number"
              placeholder="0"
              value={expectedAdSpend}
              onChange={(e) => updateState({ expectedAdSpend: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Expected Other Costs</Label>
            <Input
              type="number"
              placeholder="0"
              value={expectedOtherCosts}
              onChange={(e) => updateState({ expectedOtherCosts: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Goal Tracker - shows progress if CSV data is available */}
      {csvData.length > 0 && parseFloat(targetPayout) > 0 && (
        <GoalTracker
          targetUSD={parseFloat(targetPayout)}
          deadline={deadline}
          csvData={csvData}
          expectedCosts={{
            adSpend: parseFloat(expectedAdSpend) || 0,
            otherCosts: parseFloat(expectedOtherCosts) || 0,
          }}
        />
      )}

      {/* Goal Summary */}
      {requiredRobux > 0 && (
        <div className="mt-8 bg-gradient-to-br from-background to-muted/20 rounded-xl border p-6">
          <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Goal Summary
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-muted">
              <span className="font-medium">Target Payout:</span>
              <span className="font-bold text-primary">{formatCurrency(parseFloat(targetPayout) || 0)}</span>
            </div>
            
            {deadline && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Deadline:</span>
                <span>{new Date(deadline).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Platform Fee ({userType === 'gameDev' ? '30%' : '70%'}):</span>
              <span className="text-destructive">-{formatRobux(requiredRobux * (userType === 'gameDev' ? 0.30 : 0.70))}</span>
            </div>
            
            {(parseFloat(expectedAdSpend) || 0) > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Expected Ad Spend:</span>
                <span className="text-destructive">-{formatRobux(parseFloat(expectedAdSpend) || 0)}</span>
              </div>
            )}
            
            {(parseFloat(expectedOtherCosts) || 0) > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Expected Other Costs:</span>
                <span className="text-destructive">-{formatRobux(parseFloat(expectedOtherCosts) || 0)}</span>
              </div>
            )}
            
            <div className="border-t border-primary/20 pt-3 mt-4 flex justify-between items-center">
              <span className="font-semibold text-base">Required Revenue:</span>
              <span className="font-bold text-primary text-lg">{formatRobux(requiredRobux)}</span>
            </div>
          </div>
        </div>
      )}
    </BuxCard>
  );
});

export { GoalSeeker };