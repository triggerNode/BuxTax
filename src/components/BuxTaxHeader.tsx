import { Button } from "@/components/ui/button";
import { RatesDrawer } from "@/components/shared/RatesDrawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface BuxTaxHeaderProps {
  userType: 'gameDev' | 'ugcCreator';
  onUserTypeChange: (type: 'gameDev' | 'ugcCreator') => void;
}

export function BuxTaxHeader({ userType, onUserTypeChange }: BuxTaxHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="mb-6">
        {/* Top row: BuxTax wordmark and primary actions */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-primary">BuxTax</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Get BuxTax
            </Button>
          </div>
        </div>
        
        {/* Bottom row: Utility functions */}
        <div className="flex justify-end">
          <div className="flex items-center gap-3 text-sm">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">What's the difference?</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Game Dev vs UGC Creator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-primary">Game Developer</h4>
                    <p className="text-muted-foreground">
                      Earns from game passes, developer products, and premium payouts. 
                      Marketplace fee: 30% on all sales.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">UGC Creator</h4>
                    <p className="text-muted-foreground">
                      Earns from avatar items, accessories, and catalog sales. 
                      Marketplace fee: 70% on all sales.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      These rates reflect Roblox's current marketplace policies as of December 2024.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <RatesDrawer />
          </div>
        </div>
      </div>
      
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