import { useEffect } from "react";
import { BuxTaxHeader } from "@/components/BuxTaxHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { GoalSeeker } from "@/components/GoalSeeker";
import { PayoutPulse } from "@/components/PayoutPulse";
import { Footer } from "@/components/Footer";
import { useLocalStorage, useUrlState } from "@/hooks/useLocalStorage";
import { analytics } from "@/utils/analytics";
import { ParsedPayoutData } from "@/utils/csvParser";
import { AppStateProvider, useClearUserType } from "@/contexts/AppStateContext";

function IndexContent() {
  const [userType, setUserType] = useLocalStorage<'gameDev' | 'ugcCreator'>('buxtax-user-type', 'gameDev');
  const [activeTab, setActiveTab] = useUrlState<'profit' | 'goal' | 'pulse'>('tab', 'profit');
  const clearUserType = useClearUserType();

  // Track page views and user interactions
  useEffect(() => {
    analytics.track('page_loaded', { userType, activeTab });
  }, []);

  const handleUserTypeChange = (newUserType: 'gameDev' | 'ugcCreator') => {
    // Clear the previous user type's state
    clearUserType(userType);
    setUserType(newUserType);
    analytics.track('user_type_changed', { from: userType, to: newUserType });
  };

  const handleTabChange = (newTab: 'profit' | 'goal' | 'pulse') => {
    setActiveTab(newTab);
    analytics.track('tab_changed', { from: activeTab, to: newTab, userType });
  };

  const handleCsvDataChange = (data: ParsedPayoutData[]) => {
    analytics.track('csv_data_loaded', { userType, recordCount: data.length });
  };

  const renderTabs = () => {
    return (
      <div className="space-y-8">
        <div className={activeTab !== 'profit' ? 'hidden' : ''}>
          <ProfitCalculator userType={userType} />
        </div>
        <div className={activeTab !== 'goal' ? 'hidden' : ''}>
          <GoalSeeker userType={userType} />
        </div>
        <div className={activeTab !== 'pulse' ? 'hidden' : ''}>
          <PayoutPulse userType={userType} onDataChange={handleCsvDataChange} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 ${userType === 'gameDev' ? 'theme-gamedev' : 'theme-ugc'} flex flex-col`}>
      <div className="dashboard-container flex-1">
        <BuxTaxHeader 
          userType={userType} 
          onUserTypeChange={handleUserTypeChange}
        />
        
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />
        
        <div className="dashboard-grid">
          <div className="lg:col-span-12">
            {renderTabs()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const Index = () => {
  return (
    <AppStateProvider>
      <IndexContent />
    </AppStateProvider>
  );
};

export default Index;
