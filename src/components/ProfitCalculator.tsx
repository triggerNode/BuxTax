import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitCalculatorProps {
  userType: 'gameDev' | 'ugcCreator';
}

export function ProfitCalculator({ userType }: ProfitCalculatorProps) {
  const [grossRobux, setGrossRobux] = useState("");
  const [adSpend, setAdSpend] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [results, setResults] = useState<{
    netRobux: number;
    usdPayout: number;
  } | null>(null);

  const calculateProfits = () => {
    const gross = parseFloat(grossRobux) || 0;
    const ads = parseFloat(adSpend) || 0;
    const other = parseFloat(otherCosts) || 0;
    
    // Roblox platform fee (30% for game developers, 70% for UGC)
    const platformFeeRate = userType === 'gameDev' ? 0.30 : 0.70;
    const robuxAfterFee = gross * (1 - platformFeeRate);
    
    // Subtract additional costs
    const netRobux = robuxAfterFee - ads - other;
    
    // DevEx rate: 1000 Robux = $3.50
    const usdPayout = (netRobux / 1000) * 3.50;
    
    setResults({
      netRobux: Math.max(0, netRobux),
      usdPayout: Math.max(0, usdPayout)
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          Gross Robux Earned
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="number"
            placeholder="Enter your Robux amount"
            value={grossRobux}
            onChange={(e) => setGrossRobux(e.target.value)}
            className="text-center"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">
              Robux Spent on Ads (Optional)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={adSpend}
              onChange={(e) => setAdSpend(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Other Costs (Optional)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={otherCosts}
              onChange={(e) => setOtherCosts(e.target.value)}
            />
          </div>
        </div>

        <Button 
          variant="action" 
          className="w-full"
          onClick={calculateProfits}
        >
          Reveal My REAL Payout
        </Button>

        {results && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Robux:</span>
              <span className="font-semibold">{results.netRobux.toLocaleString()} R$</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">USD Payout:</span>
              <span className="font-bold text-primary">${results.usdPayout.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}