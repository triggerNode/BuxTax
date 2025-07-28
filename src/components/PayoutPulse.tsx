import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Upload, Calendar, TrendingUp, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuxCard } from "@/components/shared/BuxCard";
import { FileUpload } from "@/components/shared/FileUpload";
import { parseCSV, exportToCSV, ParsedPayoutData, CSVParseResult } from "@/utils/csvParser";
import { formatCurrency, formatRobux } from "@/lib/fees";
import { useToast } from "@/hooks/use-toast";

interface FeeBreakdown {
  category: string;
  totalRobux: number;
  totalUSD: number;
  percentage: number;
}

export function PayoutPulse() {
  const { toast } = useToast();
  const [parsedData, setParsedData] = useState<ParsedPayoutData[]>([]);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown[]>([]);
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly">("daily");
  const [viewMode, setViewMode] = useState<"robux" | "usd">("usd");
  const [dateRange, setDateRange] = useState<"all" | "30d" | "90d">("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const csvContent = await file.text();
      const result: CSVParseResult = await parseCSV(csvContent);
      
      if (result.errors.length > 0) {
        toast({
          title: "CSV parsing warnings",
          description: `${result.errors.length} rows had issues. ${result.data.length} rows processed successfully.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "CSV uploaded successfully",
          description: `Processed ${result.data.length} rows of payout data.`,
        });
      }
      
      setParsedData(result.data);
      generateFeeBreakdown(result.data);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to parse CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  if (parsedData.length === 0) {
    return (
      <BuxCard 
        title="Payout Pulse" 
        icon={TrendingUp}
      >
        <div className="text-center py-12">
          <FileUpload
            onFileSelect={handleFileUpload}
            accept=".csv"
            maxSize={10}
            className="max-w-md mx-auto"
          />
          <div className="mt-6 space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload your Roblox payout CSV to see detailed analytics
            </p>
            <p className="text-xs text-muted-foreground">
              File processed locally - your data never leaves your device
            </p>
          </div>
        </div>
      </BuxCard>
    );
  }

  const chartData = getChartData();
  const totalEarnings = getTotalEarnings();
  const effectiveTakeRate = getEffectiveTakeRate();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BuxCard title="Total Earnings" icon={TrendingUp} variant="summary">
          <div className="text-3xl font-bold">
            {viewMode === "robux" ? formatRobux(totalEarnings) : formatCurrency(totalEarnings)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {dateRange === "all" ? "All time" : `Last ${dateRange}`}
          </p>
        </BuxCard>

        <BuxCard title="Effective Take Rate" icon={Calendar} variant="summary">
          <div className="text-3xl font-bold text-destructive">
            {effectiveTakeRate.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Platform + costs
          </p>
        </BuxCard>

        <BuxCard title="Data Points" icon={Upload} variant="summary">
          <div className="text-3xl font-bold">
            {getFilteredData().length}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Payout records
          </p>
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
        shareable
        shareData={{
          netEarnings: totalEarnings,
          effectiveTakeRate: effectiveTakeRate,
        }}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ strokeOpacity: 0.3 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ strokeOpacity: 0.3 }}
                tickFormatter={(value) => viewMode === "robux" ? `${(value / 1000).toFixed(0)}k` : `$${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [
                  viewMode === "robux" ? formatRobux(value) : formatCurrency(value),
                  viewMode === "robux" ? "Net Robux" : "Net USD"
                ]}
              />
              <Line 
                type="monotone" 
                dataKey={viewMode === "robux" ? "netRobux" : "netUSD"}
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </BuxCard>

      {/* Fee Breakdown */}
      <BuxCard 
        title="Fee Breakdown" 
        icon={Filter}
        shareable
        shareData={{
          netEarnings: totalEarnings,
          effectiveTakeRate: effectiveTakeRate,
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Robux</TableHead>
              <TableHead className="text-right">USD</TableHead>
              <TableHead className="text-right">% of Gross</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeBreakdown.map((fee, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{fee.category}</TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatRobux(fee.totalRobux)}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(fee.totalUSD)}
                </TableCell>
                <TableCell className="text-right">
                  {fee.percentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </BuxCard>
    </div>
  );
}