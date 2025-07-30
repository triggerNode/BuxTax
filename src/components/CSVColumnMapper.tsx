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
  date: { label: 'Date', required: true, description: 'Transaction or payout date' },
};

const SUMMARY_FIELDS = {
  grossRobux: { label: 'Gross Robux', required: true, description: 'Total Robux earned before deductions' },
  netRobux: { label: 'Net Robux', required: false, description: 'Final Robux after all deductions' },
  marketplaceFee: { label: 'Marketplace Fee', required: false, description: 'Platform commission (30%)' },
  adSpend: { label: 'Ad Spend', required: false, description: 'Advertising costs' },
  groupSplits: { label: 'Group Splits', required: false, description: 'Revenue sharing with group members' },
  affiliatePayouts: { label: 'Affiliate Payouts', required: false, description: 'Referral commissions' },
  refunds: { label: 'Refunds', required: false, description: 'Refunded transactions' },
  otherCosts: { label: 'Other Costs', required: false, description: 'Additional deductions' },
};

const TRANSACTION_FIELDS = {
  description: { label: 'Description/Type', required: true, description: 'Transaction description or type' },
  amount: { label: 'Amount', required: true, description: 'Transaction amount (positive or negative)' },
};

export function CSVColumnMapper({ csvHeaders, suggestedMapping, onMappingConfirm, onCancel }: CSVColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(suggestedMapping);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Detect format type based on suggested mapping
  const isTransactionFormat = !!(mapping.description && mapping.amount);
  const formatType = isTransactionFormat ? 'Transaction' : 'Summary';

  const updateMapping = (field: string, header: string | undefined) => {
    setMapping(prev => ({
      ...prev,
      [field]: header === "none" ? undefined : header
    }));
  };

  const validateMapping = (): boolean => {
    const newErrors: string[] = [];
    const usedHeaders = new Set<string>();

    // Check required fields (always need date)
    Object.entries(REQUIRED_FIELDS).forEach(([field, config]) => {
      const mappedHeader = mapping[field as keyof ColumnMapping];
      if (!mappedHeader) {
        newErrors.push(`${config.label} is required`);
      } else if (usedHeaders.has(mappedHeader)) {
        newErrors.push(`${mappedHeader} is mapped to multiple fields`);
      } else {
        usedHeaders.add(mappedHeader);
      }
    });

    // Check format-specific required fields
    if (isTransactionFormat) {
      Object.entries(TRANSACTION_FIELDS).forEach(([field, config]) => {
        const mappedHeader = mapping[field as keyof ColumnMapping];
        if (!mappedHeader) {
          newErrors.push(`${config.label} is required for transaction format`);
        } else if (usedHeaders.has(mappedHeader)) {
          newErrors.push(`${mappedHeader} is mapped to multiple fields`);
        } else {
          usedHeaders.add(mappedHeader);
        }
      });
    } else {
      // Summary format requires at least gross Robux
      const grossRobux = mapping.grossRobux;
      if (!grossRobux) {
        newErrors.push('Gross Robux is required for summary format');
      } else if (usedHeaders.has(grossRobux)) {
        newErrors.push(`${grossRobux} is mapped to multiple fields`);
      } else {
        usedHeaders.add(grossRobux);
      }
    }

    // Check for duplicate mappings in optional fields
    Object.keys(SUMMARY_FIELDS).forEach(field => {
      const mappedHeader = mapping[field as keyof ColumnMapping];
      if (mappedHeader && field !== 'grossRobux') { // grossRobux already checked above
        if (usedHeaders.has(mappedHeader)) {
          newErrors.push(`${mappedHeader} is mapped to multiple fields`);
        } else {
          usedHeaders.add(mappedHeader);
        }
      }
    });

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
            {status === "mapped" && <CheckCircle2 className="h-4 w-4 text-success" />}
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
          Detected format: <span className="font-medium">{formatType}</span>. 
          Match your CSV columns to the expected data fields.
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
          {isTransactionFormat && 
            Object.entries(TRANSACTION_FIELDS).map(([field, config]) =>
              renderFieldRow(field, config, true)
            )
          }
          {!isTransactionFormat && 
            renderFieldRow('grossRobux', SUMMARY_FIELDS.grossRobux, true)
          }
        </div>

        {!isTransactionFormat && (
          <div className="space-y-3">
            <h3 className="font-semibold">Optional Fields</h3>
            <p className="text-xs text-muted-foreground">
              These fields will be calculated automatically if not provided
            </p>
            {Object.entries(SUMMARY_FIELDS).filter(([field]) => field !== 'grossRobux').map(([field, config]) =>
              renderFieldRow(field, config, false)
            )}
          </div>
        )}

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