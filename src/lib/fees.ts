// Centralized fee calculations and constants
export const FEE_CONSTANTS = {
  // DevEx conversion rate: $3.7975 per 1000 Robux (reflects 8.5% increase)
  DEVEX_RATE_USD_PER_ROBUX: 0.0037975,

  // Platform fees by user type
  MARKETPLACE_FEE: {
    GAME_DEV: 0.3, // 30% for game developers
    UGC_CREATOR: 0.7, // 70% for UGC creators
  },

  // Last updated timestamp
  LAST_UPDATED: "2025-01-28",
  SOURCE_URL: "https://en.help.roblox.com/hc/en-us/articles/13061189551124",
} as const;

export interface CostBreakdown {
  grossRobux: number;
  adSpend: number;
  groupSplits: number;
  affiliatePayouts: number;
  refunds: number;
  otherCosts: number;
  marketplaceFee: number;
}

export interface CalculationResult {
  grossRobux: number;
  totalCosts: number;
  netRobux: number;
  usdPayout: number;
  effectiveTakeRate: number; // Percentage of gross lost to all fees/costs
  breakdown: CostBreakdown;
}

export function calculateProfit(
  grossRobux: number,
  userType: "gameDev" | "ugcCreator",
  costs: Partial<Omit<CostBreakdown, "grossRobux" | "marketplaceFee">> = {}
): CalculationResult {
  const {
    adSpend = 0,
    groupSplits = 0,
    affiliatePayouts = 0,
    refunds = 0,
    otherCosts = 0,
  } = costs;

  // Calculate marketplace fee
  const feeRate =
    FEE_CONSTANTS.MARKETPLACE_FEE[
      userType === "gameDev" ? "GAME_DEV" : "UGC_CREATOR"
    ];
  const marketplaceFee = grossRobux * feeRate;

  // Calculate total costs
  const totalCosts =
    marketplaceFee +
    adSpend +
    groupSplits +
    affiliatePayouts +
    refunds +
    otherCosts;

  // Calculate net Robux
  const netRobux = Math.max(0, grossRobux - totalCosts);

  // Convert to USD
  const usdPayout = netRobux * FEE_CONSTANTS.DEVEX_RATE_USD_PER_ROBUX;

  // Calculate effective take rate
  const effectiveTakeRate =
    grossRobux > 0 ? (totalCosts / grossRobux) * 100 : 0;

  const breakdown: CostBreakdown = {
    grossRobux,
    adSpend,
    groupSplits,
    affiliatePayouts,
    refunds,
    otherCosts,
    marketplaceFee,
  };

  return {
    grossRobux,
    totalCosts,
    netRobux: Math.round(netRobux), // Round to whole Robux
    usdPayout: Math.round(usdPayout * 100) / 100, // Round to 2 decimal places
    effectiveTakeRate: Math.round(effectiveTakeRate * 10) / 10, // Round to 1 decimal place
    breakdown,
  };
}

export function calculateRequiredRobux(
  targetUSD: number,
  userType: "gameDev" | "ugcCreator",
  expectedCosts: Partial<
    Omit<CostBreakdown, "grossRobux" | "marketplaceFee">
  > = {}
): number {
  // Convert target USD to required net Robux
  const requiredNetRobux = targetUSD / FEE_CONSTANTS.DEVEX_RATE_USD_PER_ROBUX;

  // Get platform fee rate
  const feeRate =
    FEE_CONSTANTS.MARKETPLACE_FEE[
      userType === "gameDev" ? "GAME_DEV" : "UGC_CREATOR"
    ];

  // Calculate expected non-platform costs
  const {
    adSpend = 0,
    groupSplits = 0,
    affiliatePayouts = 0,
    refunds = 0,
    otherCosts = 0,
  } = expectedCosts;

  const fixedCosts =
    adSpend + groupSplits + affiliatePayouts + refunds + otherCosts;

  // Solve for gross Robux: netRobux = grossRobux * (1 - feeRate) - fixedCosts
  // grossRobux = (netRobux + fixedCosts) / (1 - feeRate)
  const requiredGrossRobux = (requiredNetRobux + fixedCosts) / (1 - feeRate);

  return Math.ceil(requiredGrossRobux); // Round up to ensure target is met
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatRobux(amount: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(amount)) + " R$";
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
