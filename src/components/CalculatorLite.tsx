import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { robuxToUsd, parseRobux, formatUsd } from "@/utils/devex";
import { analytics } from "@/utils/analytics";

interface CalculatorLiteProps {
  source?: "hero" | "calculator";
  prefillFromQuery?: boolean;
  autoFocusInput?: boolean;
  onValueChange?: (robux: number, usd: number) => void;
}

export function CalculatorLite({
  source = "hero",
  prefillFromQuery = true,
  autoFocusInput = false,
  onValueChange,
}: CalculatorLiteProps) {
  const [robuxText, setRobuxText] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const robux = useMemo(() => parseRobux(robuxText), [robuxText]);
  const usd = useMemo(() => robuxToUsd(robux), [robux]);

  // Prefill from ?r on first mount
  useEffect(() => {
    if (!prefillFromQuery) return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("r")) {
        const v = parseRobux(params.get("r") || "0");
        if (v > 0) setRobuxText(String(v));
      }
    } catch {}
  }, [prefillFromQuery]);

  // Notify parent on value change
  useEffect(() => {
    if (onValueChange) onValueChange(robux, usd);
  }, [robux, usd, onValueChange]);

  // Debounced analytics on value change
  useEffect(() => {
    const handle = setTimeout(() => {
      analytics.track("calculator_lite_calculate", {
        source,
        robux,
        usd,
        version: "lite_v1",
      });
    }, 400);
    return () => clearTimeout(handle);
  }, [robux, usd, source]);

  function formatWithSeparators(value: number): string {
    return value ? value.toLocaleString("en-US") : "";
  }

  function handleFocus() {
    setFocused(true);
    setRobuxText(robux ? String(robux) : "");
  }

  function handleBlur() {
    setFocused(false);
    setRobuxText(formatWithSeparators(robux));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Robux Amount</label>
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g. 100,000"
          value={robuxText}
          onChange={(e) => setRobuxText(e.target.value)}
          aria-describedby="calc-disclaimer"
          className="text-lg font-semibold bg-brand-cream/60"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocusInput}
        />
      </div>

      <div className="bg-royal/5 border-2 border-royal/20 rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">
          You'll receive:
        </div>
        <div className="text-2xl font-bold text-royal">
          {formatUsd(usd)} USD
        </div>
        <div className="text-xs text-muted-foreground">After all fees</div>
      </div>

      <div id="calc-disclaimer" className="text-xs text-muted-foreground">
        Estimates only / not affiliated with Roblox.
      </div>
    </div>
  );
}

export default CalculatorLite;
