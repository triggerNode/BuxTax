import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { BuxCard } from "@/components/shared/BuxCard";
import { Calculator } from "lucide-react";
import { formatCurrency, formatRobux, formatPercentage } from "@/lib/fees";

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ProfitCardExport() {
  const qs = useQueryParams();

  const userType = (
    qs.get("userType") === "ugcCreator" ? "ugcCreator" : "gameDev"
  ) as "gameDev" | "ugcCreator";

  // Core metrics
  const usdPayout = Number(qs.get("usdPayout") || 0);
  const netRobux = Number(qs.get("netRobux") || 0);
  const effectiveTakeRate = Number(qs.get("effectiveTakeRate") || 0);

  // Breakdown rows (optional)
  const grossRobux = Number(qs.get("grossRobux") || 0);
  const marketplaceFee = Number(qs.get("marketplaceFee") || 0);
  const adSpend = Number(qs.get("adSpend") || 0);
  const groupSplits = Number(qs.get("groupSplits") || 0);
  const affiliatePayouts = Number(qs.get("affiliatePayouts") || 0);
  const refunds = Number(qs.get("refunds") || 0);
  const otherCosts = Number(qs.get("otherCosts") || 0);

  return (
    <div
      className={`min-h-screen bg-background text-foreground export-mode p-8 ${
        userType === "gameDev" ? "theme-gamedev" : "theme-ugc"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <BuxCard
          title="Profit Calculator"
          icon={Calculator}
          variant="detailed"
          size="lg"
          userType={userType}
          cardType="profit"
          shareable={false}
          dataSourceId="buxtax-card-profit-calculator"
        >
          {/* Primary Metrics Dashboard */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            data-share-id="pc-stats"
          >
            <div className="text-center p-6 rounded-xl border bg-destructive text-white border-transparent">
              <div className="text-3xl font-bold mb-2">
                {formatCurrency(usdPayout)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-medium">USD Payout</div>
              </div>
              <div className="mt-3 text-xs rounded-full px-3 py-1 inline-block text-white/90 bg-white/20">
                Primary Earnings
              </div>
            </div>

            <div className="text-center p-6 rounded-xl border bg-brand-royal text-white border-brand-royal">
              <div className="text-3xl font-bold mb-2">
                {formatRobux(netRobux)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-medium">Net Robux</div>
              </div>
              <div className="mt-3 text-xs bg-white/20 text-white/90 rounded-full px-3 py-1 inline-block">
                After Deductions
              </div>
            </div>
          </div>

          {/* Effective Take Rate */}
          <div
            className="mb-8 p-4 border border-destructive/20 rounded-xl bg-gradient-to-r from-destructive/5 to-destructive/10"
            data-share-id="pc-etr"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  Effective Take Rate:
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-destructive text-lg">
                  {formatPercentage(effectiveTakeRate)}
                </span>
                <div className="text-xs text-muted-foreground">
                  Total Cost %
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div
            className="mt-8 bg-card rounded-2xl border-2 border-brand-royal p-6"
            data-share-id="pc-breakdown"
          >
            <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Detailed Breakdown
            </h4>

            <div className="space-y-3 text-sm">
              {grossRobux > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-brand-royal">
                  <span className="font-medium">Gross Revenue:</span>
                  <span className="font-bold text-primary">
                    {formatRobux(grossRobux)}
                  </span>
                </div>
              )}

              {marketplaceFee > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-foreground">Marketplace Fee:</span>
                  <span className="text-destructive">
                    -{formatRobux(marketplaceFee)}
                  </span>
                </div>
              )}

              {adSpend > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-foreground">Ad Spend:</span>
                  <span className="text-destructive">
                    -{formatRobux(adSpend)}
                  </span>
                </div>
              )}

              {groupSplits > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-foreground">Group Splits:</span>
                  <span className="text-destructive">
                    -{formatRobux(groupSplits)}
                  </span>
                </div>
              )}

              {affiliatePayouts > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-foreground">Affiliate Payouts:</span>
                  <span className="text-destructive">
                    -{formatRobux(affiliatePayouts)}
                  </span>
                </div>
              )}

              {refunds > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-foreground">Refunds:</span>
                  <span className="text-destructive">
                    -{formatRobux(refunds)}
                  </span>
                </div>
              )}

              {otherCosts > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-foreground">Other Costs:</span>
                  <span className="text-destructive">
                    -{formatRobux(otherCosts)}
                  </span>
                </div>
              )}

              <div className="mt-4 px-3 py-2 rounded-lg bg-brand-yellow flex justify-between items-center">
                <span className="font-semibold text-base text-foreground">
                  Net Earnings:
                </span>
                <span className="font-bold text-primary text-lg">
                  {formatRobux(netRobux)}
                </span>
              </div>
            </div>
          </div>
        </BuxCard>
      </div>
    </div>
  );
}
