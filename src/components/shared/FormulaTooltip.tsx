import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormulaTooltipProps {
  formula: string;
  description?: string;
  variables?: Record<string, string>;
}

export function FormulaTooltip({
  formula,
  description,
  variables,
}: FormulaTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-share-exclude="true"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Show formula</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-4">
          <div className="space-y-2">
            {description && (
              <p className="text-sm font-medium">{description}</p>
            )}

            <div className="bg-muted/50 rounded p-2 font-mono text-xs">
              {formula}
            </div>

            {variables && Object.keys(variables).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Where:</p>
                <div className="space-y-1">
                  {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="text-xs text-muted-foreground">
                      <span className="font-mono">{key}</span> = {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
