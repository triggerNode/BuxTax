import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Upload, Calendar, TrendingUp, Filter, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/enhanced-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartContainer as CustomChartContainer } from "@/components/ui/chart-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuxCard } from "@/components/shared/BuxCard";
import { FileUpload } from "@/components/shared/FileUpload";
import { parseCSV, exportToCSV, ParsedPayoutData, CSVParseResult, ColumnMapping } from "@/utils/csvParser";
import { formatCurrency, formatRobux } from "@/lib/fees";
import { useToast } from "@/hooks/use-toast";
import { CSVColumnMapper } from "@/components/CSVColumnMapper";

interface FeeBreakdown {
  category: string;
  totalRobux: number;
  totalUSD: number;
  percentage: number;
}

interface PayoutPulseProps {
  onDataChange?: (data: ParsedPayoutData[]) => void;
}

export function PayoutPulse({ onDataChange }: PayoutPulseProps) {
  const { toast } = useToast();
  const [parsedData, setParsedData] = useState<ParsedPayoutData[]>([]);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown[]>([]);
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly">("daily");
  const [viewMode, setViewMode] = useState<"robux" | "usd">("usd");
  const [dateRange, setDateRange] = useState<"all" | "30d" | "90d">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [suggestedMapping, setSuggestedMapping] = useState<ColumnMapping>({});

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setPendingFile(file);
    
    try {
      const csvContent = await file.text();
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length === 0) throw new Error("Empty CSV file");
      
      // Extract headers from first line
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      setDetectedHeaders(headers);
      
      // Get suggested mapping by analyzing first few rows
      const sampleData = lines.slice(0, 3).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      // Auto-detect column mapping
      const mapping = detectColumns(sampleData[0]);
      setSuggestedMapping(mapping);
      
      // Show column mapper for user confirmation
      setShowColumnMapper(true);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to analyze CSV file. Please check the format and try again.",
        variant: "destructive",
      });
      setPendingFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingConfirm = async (mapping: ColumnMapping) => {
    if (!pendingFile) return;
    
    setIsLoading(true);
    setShowColumnMapper(false);
    
    try {
      const csvContent = await pendingFile.text();
      const result: CSVParseResult = await parseCSV(csvContent, mapping);
      
      if (result.errors.length > 0) {
        toast({
          title: "CSV parsing warnings",
          description: `${result.errors.length} rows had issues. ${result.data.length} rows processed successfully.`,
          variant: "destructive",
        });
      } else {
        const formatType = (mapping.description && mapping.amount) ? 'transaction' : 'summary';
        toast({
          title: "CSV uploaded successfully",
          description: `Processed ${result.data.length} ${formatType} rows of payout data.`,
        });
      }
      
      setParsedData(result.data);
      generateFeeBreakdown(result.data);
      onDataChange?.(result.data);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process CSV file with the provided mapping.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPendingFile(null);
    }
  };

  const handleMappingCancel = () => {
    setShowColumnMapper(false);
    setPendingFile(null);
    setDetectedHeaders([]);
    setSuggestedMapping({});
  };

  // Helper function for column detection (moved from utils)
  const detectColumns = (sampleRow: any): ColumnMapping => {
    const headers = Object.keys(sampleRow).map(h => h.toLowerCase());
    const mapping: ColumnMapping = {};

    const patterns = {
      date: /^(date|time|period|day|month)/i,
      grossRobux: /^(gross|total|revenue|earnings|income).*(robux|r\$)/i,
      netRobux: /^(net|final|payout).*(robux|r\$)/i,
      marketplaceFee: /^(marketplace|platform|roblox).*(fee|cut|commission)/i,
      adSpend: /^(ad|advertising|ads).*(spend|cost|expense)/i,
      groupSplits: /^(group|split|share).*(payout|payment)/i,
      affiliatePayouts: /^(affiliate|referral).*(payout|payment)/i,
      refunds: /^(refund|chargeback|return)/i,
      otherCosts: /^(other|misc|additional).*(cost|expense|fee)/i,
      // Transaction format patterns
      description: /^(description|type|category|transaction)/i,
      amount: /^(amount|value|sum|total)$/i,
    };

    Object.keys(sampleRow).forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      for (const [field, pattern] of Object.entries(patterns)) {
        if (pattern.test(lowerHeader)) {
          mapping[field as keyof ColumnMapping] = header;
          break;
        }
      }
    });

    return mapping;
  };

  const generateFeeBreakdown = (data: ParsedPayoutData[]) => {
    const totals = data.reduce((acc, row) => ({
      grossRobux: acc.grossRobux + row.grossRobux,
      marketplaceFee: acc.marketplaceFee + row.marketplaceFee,
      adSpend: acc.adSpend + row.adSpend,
      groupSplits: acc.groupSplits + row.groupSplits,
      affiliatePayouts: acc.affiliatePayouts + row.affiliatePayouts,
      refunds: acc.refunds + row.refunds,
      otherCosts: acc.otherCosts + row.otherCosts,
    }), {
      grossRobux: 0,
      marketplaceFee: 0,
      adSpend: 0,
      groupSplits: 0,
      affiliatePayouts: 0,
      refunds: 0,
      otherCosts: 0,
    });

    const breakdown: FeeBreakdown[] = [
      {
        category: "Marketplace Fee",
        totalRobux: totals.marketplaceFee,
        totalUSD: totals.marketplaceFee * 0.0035,
        percentage: (totals.marketplaceFee / totals.grossRobux) * 100,
      },
      {
        category: "Ad Spend",
        totalRobux: totals.adSpend,
        totalUSD: totals.adSpend * 0.0035,
        percentage: (totals.adSpend / totals.grossRobux) * 100,
      },
      {
        category: "Group Splits",
        totalRobux: totals.groupSplits,
        totalUSD: totals.groupSplits * 0.0035,
        percentage: (totals.groupSplits / totals.grossRobux) * 100,
      },
      {
        category: "Affiliate Payouts",
        totalRobux: totals.affiliatePayouts,
        totalUSD: totals.affiliatePayouts * 0.0035,
        percentage: (totals.affiliatePayouts / totals.grossRobux) * 100,
      },
      {
        category: "Refunds",
        totalRobux: totals.refunds,
        totalUSD: totals.refunds * 0.0035,
        percentage: (totals.refunds / totals.grossRobux) * 100,
      },
      {
        category: "Other Costs",
        totalRobux: totals.otherCosts,
        totalUSD: totals.otherCosts * 0.0035,
        percentage: (totals.otherCosts / totals.grossRobux) * 100,
      },
    ].filter(item => item.totalRobux > 0);

    setFeeBreakdown(breakdown);
  };

  const getFilteredData = () => {
    if (!parsedData.length) return [];
    
    let filtered = [...parsedData];
    
    // Apply date range filter
    if (dateRange !== "all") {
      const days = dateRange === "30d" ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(item => new Date(item.date) >= cutoffDate);
    }
    
    return filtered;
  };

  const getChartData = () => {
    const filtered = getFilteredData();
    return filtered.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      [viewMode === "robux" ? "netRobux" : "netUSD"]: viewMode === "robux" ? item.netRobux : item.usdValue,
      [viewMode === "robux" ? "grossRobux" : "grossUSD"]: viewMode === "robux" ? item.grossRobux : item.grossRobux * 0.0035,
    }));
  };

  const handleExportData = () => {
    const filtered = getFilteredData();
    if (filtered.length > 0) {
      exportToCSV(filtered, `buxtax-payout-data-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Data exported",
        description: "CSV file has been downloaded successfully.",
      });
    }
  };

  const getTotalEarnings = () => {
    const filtered = getFilteredData();
    return filtered.reduce((sum, item) => sum + (viewMode === "robux" ? item.netRobux : item.usdValue), 0);
  };

  const getEffectiveTakeRate = () => {
    const filtered = getFilteredData();
    const totalGross = filtered.reduce((sum, item) => sum + item.grossRobux, 0);
    const totalNet = filtered.reduce((sum, item) => sum + item.netRobux, 0);
    return totalGross > 0 ? ((totalGross - totalNet) / totalGross) * 100 : 0;
  };

  // Show column mapper if needed
  if (showColumnMapper) {
    return (
      <CSVColumnMapper
        csvHeaders={detectedHeaders}
        suggestedMapping={suggestedMapping}
        onMappingConfirm={handleMappingConfirm}
        onCancel={handleMappingCancel}
      />
    );
  }

  if (parsedData.length === 0) {
    return (
      <BuxCard 
        title="Payout Pulse" 
        icon={TrendingUp}
        variant="detailed"
        size="lg"
      >
        <EmptyState
          icon={Upload}
          title="Upload Your Payout Data"
          description="Upload your Roblox payout data (CSV, XLS, or XLSX) to analyze your earning trends and calculate precise profit margins."
          action={{
            label: "Choose File",
            onClick: () => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()
          }}
        >
          <div className="mt-4">
            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".csv"
              maxSize={10}
              className="max-w-md mx-auto"
            />
            <div className="mt-6 space-y-2">
              <p className="text-xs text-muted-foreground">
                File processed locally - your data never leaves your device
              </p>
            </div>
          </div>
        </EmptyState>
      </BuxCard>
    );
  }

  const chartData = getChartData();
  const totalEarnings = getTotalEarnings();
  const effectiveTakeRate = getEffectiveTakeRate();

  return (
    <div className="space-y-6">
      {/* Summary Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BuxCard title="Total Earnings" icon={TrendingUp} variant="dashboard" size="sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {viewMode === "robux" ? formatRobux(totalEarnings) : formatCurrency(totalEarnings)}
            </div>
            <p className="text-sm text-muted-foreground">
              {dateRange === "all" ? "All time" : `Last ${dateRange}`}
            </p>
            <div className="mt-3 text-xs text-primary/80 bg-primary/10 rounded-full px-3 py-1 inline-block">
              Total Revenue
            </div>
          </div>
        </BuxCard>

        <BuxCard title="Effective Take Rate" icon={Calendar} variant="dashboard" size="sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive mb-2">
              {effectiveTakeRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              Platform + costs
            </p>
            <div className="mt-3 text-xs text-destructive/80 bg-destructive/10 rounded-full px-3 py-1 inline-block">
              Cost Rate
            </div>
          </div>
        </BuxCard>

        <BuxCard title="Data Points" icon={Upload} variant="dashboard" size="sm">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {getFilteredData().length}
            </div>
            <p className="text-sm text-muted-foreground">
              Payout records
            </p>
            <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
              Data Records
            </div>
          </div>
        </BuxCard>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "robux" | "usd")}>
            <TabsList>
              <TabsTrigger value="usd">USD View</TabsTrigger>
              <TabsTrigger value="robux">Robux View</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={dateRange} onValueChange={(value) => setDateRange(value as "all" | "30d" | "90d")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="90d">Last 90d</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Chart */}
      <BuxCard 
        title="Earnings Over Time" 
        icon={TrendingUp}
        variant="chart"
        size="xl"
        shareable
        shareData={{
          netEarnings: totalEarnings,
          effectiveTakeRate: effectiveTakeRate,
        }}
      >
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ strokeOpacity: 0.3 }}
                axisLine={{ strokeOpacity: 0.3 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ strokeOpacity: 0.3 }}
                axisLine={{ strokeOpacity: 0.3 }}
                tickFormatter={(value) => viewMode === "robux" ? `${(value / 1000).toFixed(0)}k` : `$${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [
                  viewMode === "robux" ? formatRobux(value) : formatCurrency(value),
                  viewMode === "robux" ? "Net Robux" : "Net USD"
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey={viewMode === "robux" ? "netRobux" : "netUSD"}
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 0, fill: 'hsl(var(--primary-glow))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </BuxCard>

      {/* Fee Breakdown */}
      <BuxCard 
        title="Fee Breakdown" 
        icon={Filter}
        variant="detailed"
        size="lg"
        shareable
        shareData={{
          netEarnings: totalEarnings,
          effectiveTakeRate: effectiveTakeRate,
        }}
      >
        <EnhancedTable 
          exportable 
          onExport={() => {
            const csvContent = "data:text/csv;charset=utf-8," 
              + "Category,Robux,USD,Percentage\n"
              + feeBreakdown.map(fee => `${fee.category},${fee.totalRobux},${fee.totalUSD.toFixed(2)},${fee.percentage.toFixed(1)}%`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "fee_breakdown.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="text-right font-semibold">Robux</TableHead>
              <TableHead className="text-right font-semibold">USD</TableHead>
              <TableHead className="text-right font-semibold">% of Gross</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeBreakdown.map((fee, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium py-3">{fee.category}</TableCell>
                <TableCell className="text-right text-destructive font-mono py-3">
                  -{formatRobux(fee.totalRobux)}
                </TableCell>
                <TableCell className="text-right text-destructive font-mono py-3">
                  -{formatCurrency(fee.totalUSD)}
                </TableCell>
                <TableCell className="text-right font-semibold py-3">
                  {fee.percentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </EnhancedTable>
      </BuxCard>
    </div>
  );
}