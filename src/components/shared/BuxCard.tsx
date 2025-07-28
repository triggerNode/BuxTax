import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShareMenu } from "./ShareMenu";
import { FEE_CONSTANTS } from "@/lib/fees";

interface BuxCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  shareable?: boolean;
  dataSourceId?: string;
  variant?: 'summary' | 'detailed';
  shareData?: {
    netEarnings?: number;
    effectiveTakeRate?: number;
    nextGoal?: number;
    goalDeadline?: string;
  };
}

export function BuxCard({ 
  title, 
  icon: Icon, 
  children, 
  shareable = true,
  dataSourceId,
  variant = 'summary',
  shareData
}: BuxCardProps) {
  const cardId = dataSourceId || `buxtax-card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card 
      id={cardId}
      className="w-full max-w-md mx-auto bg-card border-border shadow-lg mobile-card-padding"
    >
      <CardHeader className="pb-4 mobile-card-padding">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mini BuxTax logo */}
            <div className="text-xs font-bold text-muted-foreground">
              BuxTax
            </div>
            
            {shareable && (
              <ShareMenu 
                dataSourceId={dataSourceId}
                shareData={shareData}
                cardTitle={title}
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 mobile-card-padding pt-0">
        {children}
        
        {/* Footer with timestamp */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Rates updated {FEE_CONSTANTS.LAST_UPDATED} •{' '}
            <a 
              href={FEE_CONSTANTS.SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              Source
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}