import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartContainerProps {
  children: ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  description?: string;
}

export function ChartContainer({ 
  children, 
  loading = false, 
  size = 'md',
  className,
  title,
  description
}: ChartContainerProps) {
  const sizeClasses = {
    sm: 'chart-container-sm',
    md: 'chart-container',
    lg: 'chart-container-lg'
  };

  if (loading) {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        {title && (
          <div className="mb-4">
            <Skeleton className="h-6 w-48 mb-2" />
            {description && <Skeleton className="h-4 w-32" />}
          </div>
        )}
        <div className="w-full h-full flex items-center justify-center">
          <div className="space-y-3 w-full">
            <div className="skeleton-shimmer h-8 rounded-md w-full" />
            <div className="skeleton-shimmer h-4 rounded-md w-3/4" />
            <div className="skeleton-shimmer h-4 rounded-md w-1/2" />
            <div className="skeleton-shimmer h-32 rounded-md w-full" />
            <div className="skeleton-shimmer h-4 rounded-md w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {title && (
        <div className="mb-4">
          <h4 className="font-semibold text-foreground">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}