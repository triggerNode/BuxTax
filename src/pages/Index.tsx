import { useState, useEffect } from "react";
import { BuxTaxHeader } from "@/components/BuxTaxHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { GoalSeeker } from "@/components/GoalSeeker";
import { PayoutPulse } from "@/components/PayoutPulse";
import { useLocalStorage, useUrlState } from "@/hooks/useLocalStorage";
import { analytics } from "@/utils/analytics";
import { ParsedPayoutData } from "@/utils/csvParser";

const Index = () => {
  const [userType, setUserType] = useLocalStorage<'gameDev' | 'ugcCreator'>('buxtax-user-type', 'gameDev');
  const [activeTab, setActiveTab] = useUrlState<'profit' | 'goal' | 'pulse'>('tab', 'profit');
  const [csvData, setCsvData] = useState<ParsedPayoutData[]>([]);

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

  const handleCsvDataChange = (data: ParsedPayoutData[]) => {
    setCsvData(data);
    analytics.track('csv_data_loaded', { userType, recordCount: data.length });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profit':
        return <ProfitCalculator userType={userType} />;
      case 'goal':
        return <GoalSeeker userType={userType} csvData={csvData} />;
      case 'pulse':
        return <PayoutPulse onDataChange={handleCsvDataChange} />;
      default:
        return <ProfitCalculator userType={userType} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 ${userType === 'gameDev' ? 'theme-gamedev' : 'theme-ugc'}`}>
      <div className="dashboard-container">
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
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
