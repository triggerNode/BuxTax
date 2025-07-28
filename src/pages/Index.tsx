import { useState, useEffect } from "react";
import { BuxTaxHeader } from "@/components/BuxTaxHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { GoalSeeker } from "@/components/GoalSeeker";
import { PayoutPulse } from "@/components/PayoutPulse";
import { useLocalStorage, useUrlState } from "@/hooks/useLocalStorage";
import { analytics } from "@/utils/analytics";

const Index = () => {
  const [userType, setUserType] = useLocalStorage<'gameDev' | 'ugcCreator'>('buxtax-user-type', 'gameDev');
  const [activeTab, setActiveTab] = useUrlState<'profit' | 'goal' | 'pulse'>('tab', 'profit');

  // Track page views and user interactions
  useEffect(() => {
    analytics.track('page_loaded', { userType, activeTab });
  }, []);

  const handleUserTypeChange = (newUserType: 'gameDev' | 'ugcCreator') => {
    setUserType(newUserType);
    analytics.track('user_type_changed', { from: userType, to: newUserType });
  };

  const handleTabChange = (newTab: 'profit' | 'goal' | 'pulse') => {
    setActiveTab(newTab);
    analytics.track('tab_changed', { from: activeTab, to: newTab, userType });
  };

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
          onUserTypeChange={handleUserTypeChange}
        />
        
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />
        
        <div className="flex justify-center">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Index;
