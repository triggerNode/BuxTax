import { useState } from "react";
import { BuxTaxHeader } from "@/components/BuxTaxHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { GoalSeeker } from "@/components/GoalSeeker";
import { PayoutPulse } from "@/components/PayoutPulse";

const Index = () => {
  const [userType, setUserType] = useState<'gameDev' | 'ugcCreator'>('gameDev');
  const [activeTab, setActiveTab] = useState<'profit' | 'goal' | 'pulse'>('profit');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profit':
        return <ProfitCalculator userType={userType} />;
      case 'goal':
        return <GoalSeeker userType={userType} />;
      case 'pulse':
        return <PayoutPulse />;
      default:
        return <ProfitCalculator userType={userType} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BuxTaxHeader 
          userType={userType} 
          onUserTypeChange={setUserType}
        />
        
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        
        <div className="flex justify-center">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Index;
