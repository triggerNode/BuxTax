import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Download, Eye, EyeOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EnhancedTableProps {
  children: ReactNode;
  density?: 'compact' | 'comfortable';
  exportable?: boolean;
  onExport?: () => void;
  className?: string;
}

export function EnhancedTable({ 
  children, 
  density = 'comfortable',
  exportable = false,
  onExport,
  className 
}: EnhancedTableProps) {
  const [currentDensity, setCurrentDensity] = useState(density);

  const densityClasses = {
    compact: "[&_td]:py-2 [&_th]:py-2",
    comfortable: "[&_td]:py-3 [&_th]:py-3"
  };

  return (
    <div className="space-y-4">
      {(exportable || true) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDensity(currentDensity === 'compact' ? 'comfortable' : 'compact')}
              className="mobile-touch-friendly"
            >
              {currentDensity === 'compact' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">
                {currentDensity === 'compact' ? 'Comfortable' : 'Compact'}
              </span>
            </Button>
          </div>
          
          {exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="mobile-touch-friendly">
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      
      <div className="table-scroll rounded-md border">
        <Table className={cn(densityClasses[currentDensity], className)}>
          {children}
        </Table>
      </div>
    </div>
  );
}

export { TableBody, TableCell, TableHead, TableHeader, TableRow };