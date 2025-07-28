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
  variant?: 'summary' | 'detailed' | 'chart' | 'dashboard';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  userType?: 'gameDev' | 'ugcCreator';
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
  size = 'md',
  userType,
  shareData
}: BuxCardProps) {
  const cardId = dataSourceId || `buxtax-card-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  const getUserTypeIcon = () => {
    if (userType === 'gameDev') return '🎮';
    if (userType === 'ugcCreator') return '🎨';
    return '';
  };

  const getUserTypeTheme = () => {
    if (userType === 'gameDev') return 'theme-gamedev';
    if (userType === 'ugcCreator') return 'theme-ugc';
    return '';
  };

  return (
    <Card 
      id={cardId}
      variant={variant}
      size={size}
      className={`w-full mx-auto bg-card border-border mobile-card-padding card-hover ${getUserTypeTheme()}`}
    >
      <CardHeader className="pb-4 mobile-card-padding">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative">
              <Icon className="w-5 h-5 text-primary" />
              {userType && (
                <div className="absolute -top-1 -right-1 text-xs bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center">
                  {getUserTypeIcon()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
              {userType && (
                <p className="text-xs text-muted-foreground">
                  {userType === 'gameDev' ? 'Game Developer' : 'UGC Creator'}
                </p>
              )}
            </div>
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