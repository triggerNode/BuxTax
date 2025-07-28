import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { ParsedPayoutData } from "@/utils/csvParser";
import { formatCurrency, formatRobux } from "@/lib/fees";
import { formatDistanceToNow } from "date-fns";

interface GoalTrackerProps {
  targetUSD: number;
  deadline?: string;
  csvData: ParsedPayoutData[];
  expectedCosts: {
    adSpend: number;
    otherCosts: number;
  };
}

export function GoalTracker({ targetUSD, deadline, csvData, expectedCosts }: GoalTrackerProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [projectedProgress, setProjectedProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (csvData.length === 0 || targetUSD <= 0) return;

    // Calculate current earnings from CSV data
    const totalEarned = csvData.reduce((sum, row) => sum + row.usdValue, 0);
    const currentPercent = Math.min((totalEarned / targetUSD) * 100, 100);
    setCurrentProgress(currentPercent);

    // Calculate projected progress based on recent trend
    if (csvData.length >= 7) { // Need at least a week of data
      const last7Days = csvData.slice(-7);
      const dailyAverage = last7Days.reduce((sum, row) => sum + row.usdValue, 0) / 7;
      
      if (deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        
        if (daysRemaining > 0) {
          const projectedTotal = totalEarned + (dailyAverage * daysRemaining);
          const projectedPercent = Math.min((projectedTotal / targetUSD) * 100, 100);
          setProjectedProgress(projectedPercent);
        }
        
        setTimeRemaining(formatDistanceToNow(deadlineDate, { addSuffix: true }));
      }
    }
  }, [csvData, targetUSD, deadline]);

  if (targetUSD <= 0) return null;

  const currentEarned = csvData.reduce((sum, row) => sum + row.usdValue, 0);
  const remaining = Math.max(0, targetUSD - currentEarned);
  const isOnTrack = projectedProgress >= 100;
  const hasDeadline = deadline && deadline !== "";

  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Goal Progress</h3>
        </div>
        {hasDeadline && (
          <Badge variant={isOnTrack ? "default" : "destructive"}>
            {isOnTrack ? "On Track" : "Behind"}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current Progress</span>
          <span className="font-medium">{formatCurrency(currentEarned)} / {formatCurrency(targetUSD)}</span>
        </div>
        <Progress value={currentProgress} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {currentProgress.toFixed(1)}% complete
        </div>
      </div>

      {projectedProgress > 0 && hasDeadline && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Projected Progress</span>
            <span className="font-medium text-muted-foreground">Based on recent trend</span>
          </div>
          <Progress value={projectedProgress} className="h-2 opacity-60" />
          <div className="text-xs text-muted-foreground">
            {projectedProgress.toFixed(1)}% projected by deadline
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Remaining</div>
          <div className="font-semibold text-destructive">{formatCurrency(remaining)}</div>
        </div>
        {hasDeadline && (
          <div>
            <div className="text-muted-foreground">Time Left</div>
            <div className="font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {timeRemaining}
            </div>
          </div>
        )}
      </div>

      {!isOnTrack && hasDeadline && remaining > 0 && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-destructive">Adjustment Needed</div>
            <div className="text-muted-foreground">
              You may need to increase daily earnings or extend your deadline to reach this goal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}