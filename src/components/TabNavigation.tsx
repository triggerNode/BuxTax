import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: "profit" | "goal" | "pulse";
  onTabChange: (tab: "profit" | "goal" | "pulse") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "profit" as const, label: "Profit Calculator" },
    { id: "goal" as const, label: "Goal Seeker" },
    { id: "pulse" as const, label: "Payout Pulse" },
  ];

  return (
    <div className="flex justify-center mb-12">
      <div className="flex bg-brand-yellow backdrop-blur-sm rounded-2xl p-2 border-2 border-brand-royal shadow-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-8 py-3 font-medium rounded-full transition-all duration-200
              ${
                isActive
                  ? // Keep royal background on hover; only change text color subtly
                    "bg-brand-royal text-white hover:!bg-brand-royal hover:!text-brand-yellow"
                  : // Inactive gets a subtle hover tint
                    "text-foreground hover:text-white hover:bg-brand-royal/10"
              }`}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
