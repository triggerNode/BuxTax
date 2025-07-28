import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { ColumnMapping } from "@/utils/csvParser";

interface CSVColumnMapperProps {
  csvHeaders: string[];
  suggestedMapping: ColumnMapping;
  onMappingConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

const REQUIRED_FIELDS = {
  date: { label: "Date", required: true, description: "Transaction date" },
  grossRobux: { label: "Gross Robux", required: true, description: "Total Robux earned before fees" },
} as const;

const OPTIONAL_FIELDS = {
  netRobux: { label: "Net Robux", required: false, description: "Final Robux after all deductions" },
  marketplaceFee: { label: "Marketplace Fee", required: false, description: "Platform commission" },
  adSpend: { label: "Ad Spend", required: false, description: "Advertising costs" },
  groupSplits: { label: "Group Splits", required: false, description: "Revenue sharing payouts" },
  affiliatePayouts: { label: "Affiliate Payouts", required: false, description: "Referral commissions" },
  refunds: { label: "Refunds", required: false, description: "Customer refunds" },
  otherCosts: { label: "Other Costs", required: false, description: "Additional expenses" },
} as const;

export function CSVColumnMapper({ csvHeaders, suggestedMapping, onMappingConfirm, onCancel }: CSVColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(suggestedMapping);
  const [errors, setErrors] = useState<string[]>([]);

  const updateMapping = (field: string, header: string | undefined) => {
    setMapping(prev => ({
      ...prev,
      [field]: header === "none" ? undefined : header
    }));
  };

  const validateMapping = () => {
    const newErrors: string[] = [];
    
    // Check required fields
    Object.entries(REQUIRED_FIELDS).forEach(([field, config]) => {
      if (!mapping[field as keyof ColumnMapping]) {
        newErrors.push(`${config.label} is required`);
      }
    });

    // Check for duplicate mappings
    const usedHeaders = Object.values(mapping).filter(Boolean);
    const duplicates = usedHeaders.filter((header, index) => 
      usedHeaders.indexOf(header) !== index
    );
    
    if (duplicates.length > 0) {
      newErrors.push(`Duplicate column mappings: ${duplicates.join(", ")}`);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleConfirm = () => {
    if (validateMapping()) {
      onMappingConfirm(mapping);
    }
  };

  const getMappingStatus = (field: string, isRequired: boolean) => {
    const isMapped = mapping[field as keyof ColumnMapping];
    if (isMapped) return "mapped";
    if (isRequired) return "error";
    return "optional";
  };

  const renderFieldRow = (field: string, config: any, isRequired: boolean) => {
    const status = getMappingStatus(field, isRequired);
    
    return (
      <div key={field} className="grid grid-cols-3 gap-4 items-center p-3 border rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{config.label}</span>
            {status === "mapped" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
            {isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground justify-self-center" />
        
        <Select
          value={mapping[field as keyof ColumnMapping] || "none"}
          onValueChange={(value) => updateMapping(field, value)}
        >
          <SelectTrigger className={status === "error" ? "border-destructive" : ""}>
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No mapping</SelectItem>
            {csvHeaders.map(header => (
              <SelectItem key={header} value={header}>
                {header}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Map CSV Columns
          <Badge variant="outline">{csvHeaders.length} columns detected</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Match your CSV columns to the expected data fields. Required fields must be mapped.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Mapping Issues</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-primary">Required Fields</h3>
          {Object.entries(REQUIRED_FIELDS).map(([field, config]) =>
            renderFieldRow(field, config, true)
          )}
        </div>

        {/* Optional Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold">Optional Fields</h3>
          <p className="text-xs text-muted-foreground">
            These fields will be calculated automatically if not provided
          </p>
          {Object.entries(OPTIONAL_FIELDS).map(([field, config]) =>
            renderFieldRow(field, config, false)
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={errors.length > 0}>
            Confirm Mapping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}