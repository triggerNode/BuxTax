import { useEffect } from "react";
import { BuxTaxHeader } from "@/components/BuxTaxHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { GoalSeeker } from "@/components/GoalSeeker";
import { PayoutPulse } from "@/components/PayoutPulse";
import { Footer } from "@/components/Footer";
import { useLocalStorage, useUrlState } from "@/hooks/useLocalStorage";
import { useProfile } from "@/hooks/useProfile";
import { GlassGate } from "@/components/shared/GlassGate";
import { handleUpgrade } from "@/components/Paywall";
import { analytics } from "@/utils/analytics";
import { ParsedPayoutData } from "@/utils/csvParser";
import { AppStateProvider, useClearUserType } from "@/contexts/AppStateContext";

function AppContent() {
  const [userType, setUserType] = useLocalStorage<"gameDev" | "ugcCreator">(
    "buxtax-user-type",
    "gameDev"
  );
  const [activeTab, setActiveTab] = useUrlState<"profit" | "goal" | "pulse">(
    "tab",
    "profit"
  );
  const clearUserType = useClearUserType();
  const { profile } = useProfile();

  // Track page views and user interactions
  useEffect(() => {
    analytics.track("page_loaded", { userType, activeTab });
  }, []);

  const handleUserTypeChange = (newUserType: "gameDev" | "ugcCreator") => {
    // Clear the previous user type's state
    clearUserType(userType);
    setUserType(newUserType);
    analytics.track("user_type_changed", { from: userType, to: newUserType });
  };

  const handleTabChange = (newTab: "profit" | "goal" | "pulse") => {
    setActiveTab(newTab);
    analytics.track("tab_changed", { from: activeTab, to: newTab, userType });
  };

  const handleCsvDataChange = (data: ParsedPayoutData[]) => {
    analytics.track("csv_data_loaded", { userType, recordCount: data.length });
  };

  const renderTabs = () => {
    return (
      <div className="space-y-8">
        <div className={activeTab !== "profit" ? "hidden" : ""}>
          {userType === "ugcCreator" && profile?.plan === "free" ? (
            <GlassGate
              show
              title="UGC tools are premium"
              description="Upgrade to access all UGC calculators and insights."
              onCta={() => handleUpgrade("lifetime")}
            >
              <ProfitCalculator userType={userType} readonly={true} />
            </GlassGate>
          ) : (
            <ProfitCalculator
              userType={userType}
              readonly={profile?.plan === "free"}
            />
          )}
        </div>
        <div className={activeTab !== "goal" ? "hidden" : ""}>
          {userType === "ugcCreator" && profile?.plan === "free" ? (
            <GlassGate
              show
              title="UGC Goal Seeker is premium"
              description="Upgrade to unlock goal planning for UGC."
              onCta={() => handleUpgrade("lifetime")}
            >
              <GoalSeeker userType={userType} readonly />
            </GlassGate>
          ) : (
            <GoalSeeker
              userType={userType}
              readonly={profile?.plan === "free"}
            />
          )}
        </div>
        <div className={activeTab !== "pulse" ? "hidden" : ""}>
          {userType === "ugcCreator" && profile?.plan === "free" ? (
            <GlassGate
              show
              title="UGC analytics are premium"
              description="Upgrade to view payout analytics for UGC."
              onCta={() => handleUpgrade("lifetime")}
            >
              <PayoutPulse
                userType={userType}
                onDataChange={handleCsvDataChange}
                readonly
              />
            </GlassGate>
          ) : (
            <PayoutPulse
              userType={userType}
              onDataChange={handleCsvDataChange}
              readonly={profile?.plan === "free"}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 ${
        userType === "gameDev" ? "theme-gamedev" : "theme-ugc"
      } flex flex-col`}
    >
      <div id="main-content" className="dashboard-container flex-1">
        <BuxTaxHeader
          userType={userType}
          onUserTypeChange={handleUserTypeChange}
        />

        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="dashboard-grid">
          <div className="lg:col-span-12">{renderTabs()}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const App = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default App;
