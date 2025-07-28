import { Button } from "@/components/ui/button";

interface BuxTaxHeaderProps {
  userType: 'gameDev' | 'ugcCreator';
  onUserTypeChange: (type: 'gameDev' | 'ugcCreator') => void;
}

export function BuxTaxHeader({ userType, onUserTypeChange }: BuxTaxHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-primary mb-6">BuxTax</h1>
      
      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={userType === 'gameDev' ? 'default' : 'toggle'}
          onClick={() => onUserTypeChange('gameDev')}
          className="px-6"
        >
          Game Dev
        </Button>
        <Button
          variant={userType === 'ugcCreator' ? 'default' : 'toggle'}
          onClick={() => onUserTypeChange('ugcCreator')}
          className="px-6"
        >
          UGC Creator
        </Button>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Roblox Creator Earnings Calculator
        </h2>
        <p className="text-muted-foreground">
          Calculate your true USD earnings after Roblox's hidden fees and taxes
        </p>
      </div>
    </div>
  );
}