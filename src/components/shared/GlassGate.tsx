import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";

interface GlassGateProps {
  show: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function GlassGate({
  show,
  title = "Premium feature",
  description = "Unlock this section with Lifetime access.",
  ctaLabel = "Upgrade to Lifetime – $39",
  onCta,
  className,
  children,
}: PropsWithChildren<GlassGateProps>) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Content underneath (blocked when show=true) */}
      <div className={show ? "pointer-events-none" : undefined}>{children}</div>

      {show && (
        <div className="absolute inset-0 z-10 rounded-[inherit] border border-border/40 bg-brand-cream/80 backdrop-blur-md shadow-inner flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
            {onCta && (
              <Button size="sm" onClick={onCta}>
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
