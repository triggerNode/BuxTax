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
    <div className="flex justify-center mb-12">
      <div className="flex bg-muted/50 backdrop-blur-sm rounded-xl p-2 border border-border/50 shadow-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-8 py-3 font-medium transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-background shadow-md text-primary border border-primary/20' 
                : 'hover:bg-background/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}