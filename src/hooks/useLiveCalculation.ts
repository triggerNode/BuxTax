import { useMemo } from "react";
import { calculateProfit, CalculationResult } from "@/lib/fees";

interface CostInputs {
  adSpend: number;
  groupSplits: number;
  affiliatePayouts: number;
  refunds: number;
  otherCosts: number;
}

export function useLiveCalculation(
  grossRobux: number,
  userType: 'gameDev' | 'ugcCreator',
  costs: Partial<CostInputs> = {}
): CalculationResult {
  return useMemo(() => {
    if (grossRobux <= 0) {
      return {
        grossRobux: 0,
        totalCosts: 0,
        netRobux: 0,
        usdPayout: 0,
        effectiveTakeRate: 0,
        breakdown: {
          grossRobux: 0,
          adSpend: 0,
          groupSplits: 0,
          affiliatePayouts: 0,
          refunds: 0,
          otherCosts: 0,
          marketplaceFee: 0,
        },
      };
    }

    return calculateProfit(grossRobux, userType, costs);
  }, [grossRobux, userType, costs]);
}