import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: 'profit' | 'goal' | 'pulse';
  onTabChange: (tab: 'profit' | 'goal' | 'pulse') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'profit' as const, label: 'Profit Calculator' },
    { id: 'goal' as const, label: 'Goal Seeker' },
    { id: 'pulse' as const, label: 'Payout Pulse' }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-muted rounded-lg p-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-6 py-2 ${
              activeTab === tab.id 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}