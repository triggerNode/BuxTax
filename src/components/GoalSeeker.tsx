import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoalSeekerProps {
  userType: 'gameDev' | 'ugcCreator';
}

export function GoalSeeker({ userType }: GoalSeekerProps) {
  const [targetPayout, setTargetPayout] = useState("");
  const [requiredRobux, setRequiredRobux] = useState<number | null>(null);

  const calculateRequiredRobux = () => {
    const target = parseFloat(targetPayout) || 0;
    
    // DevEx rate: $3.50 = 1000 Robux
    const robuxNeeded = (target / 3.50) * 1000;
    
    // Account for platform fee
    const platformFeeRate = userType === 'gameDev' ? 0.30 : 0.70;
    const grossRobuxNeeded = robuxNeeded / (1 - platformFeeRate);
    
    setRequiredRobux(grossRobuxNeeded);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          My Target Payout (USD)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="number"
            placeholder="50"
            value={targetPayout}
            onChange={(e) => setTargetPayout(e.target.value)}
            className="text-center"
          />
        </div>

        <Button 
          variant="action" 
          className="w-full"
          onClick={calculateRequiredRobux}
        >
          Calculate Required Robux
        </Button>

        {requiredRobux && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Required Gross Robux:</span>
              <span className="font-bold text-primary">{requiredRobux.toLocaleString()} R$</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              This accounts for Roblox's {userType === 'gameDev' ? '30%' : '70%'} platform fee
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}