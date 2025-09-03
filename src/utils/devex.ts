import { FEE_CONSTANTS } from "@/lib/fees";

// Lightweight helpers for public mini-calculator

export function robuxToUsd(robux: number): number {
  if (!isFinite(robux) || robux <= 0) return 0;
  const usd = robux * FEE_CONSTANTS.DEVEX_RATE_USD_PER_ROBUX;
  return Math.round(usd * 100) / 100; // 2 decimals
}

export function parseRobux(input: string): number {
  // Strip non-digits, allow very large numbers but clamp to a safe cap
  const cleaned = (input || "").replace(/[^0-9]/g, "");
  const value = cleaned.length ? Number(cleaned) : 0;
  if (!isFinite(value) || value < 0) return 0;
  // Cap to 1e9 Robux to avoid overflow visuals
  return Math.min(value, 1_000_000_000);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
}

export function formatRobux(amount: number): string {
  return (
    new Intl.NumberFormat("en-US").format(
      Math.max(0, Math.floor(amount || 0))
    ) + " R$"
  );
}

