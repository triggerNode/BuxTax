import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PayoutData {
  date: string;
  netRobux: number;
  fees: number;
}

interface FeeBreakdown {
  category: string;
  totalRobux: number;
  percentage: number;
}

export function PayoutPulse() {
  const [chartData, setChartData] = useState<PayoutData[]>([]);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown[]>([]);
  const [period, setPeriod] = useState<'Daily' | 'Weekly'>('Daily');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSVData(csv);
    };
    reader.readAsText(file);
  };

  const parseCSVData = (csv: string) => {
    // Simulate parsing CSV and generating chart data
    const mockChartData: PayoutData[] = [];
    const startDate = new Date('2024-01-01');
    
    for (let i = 0; i < 24; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      mockChartData.push({
        date: date.toLocaleDateString(),
        netRobux: 5000 + (i * 2000) + Math.random() * 1000,
        fees: 1000 + (i * 500)
      });
    }
    
    setChartData(mockChartData);
    
    // Mock fee breakdown
    setFeeBreakdown([
      { category: 'Gross Sales', totalRobux: 264243, percentage: 100.0 },
      { category: 'Marketplace Fee', totalRobux: -78869, percentage: 29.8 },
      { category: 'Affiliate Payouts', totalRobux: -2444, percentage: 0.9 },
      { category: 'Group Splits', totalRobux: -2818, percentage: 1.1 },
      { category: 'Refund', totalRobux: -2259, percentage: 0.9 },
      { category: 'Net Earnings', totalRobux: 177856, percentage: 67.3 }
    ]);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {chartData.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drag & Drop your Payouts CSV here</h3>
              <p className="text-muted-foreground mb-6">
                Upload your Roblox payout data to see detailed analytics
              </p>
              <Button variant="default" onClick={triggerFileUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Or Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Chart Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Net Robux by Period</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={period === 'Daily' ? 'default' : 'toggle'}
                    size="sm"
                    onClick={() => setPeriod('Daily')}
                  >
                    Daily
                  </Button>
                  <Button 
                    variant={period === 'Weekly' ? 'default' : 'toggle'}
                    size="sm"
                    onClick={() => setPeriod('Weekly')}
                  >
                    Weekly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="netRobux" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <span>Fee Category</span>
                  <span className="text-right">Total Robux</span>
                  <span className="text-right">% of Gross</span>
                </div>
                {feeBreakdown.map((fee, index) => (
                  <div 
                    key={index}
                    className={`grid grid-cols-3 gap-4 text-sm py-2 ${
                      fee.category === 'Net Earnings' ? 'font-bold text-primary border-t pt-2' : ''
                    } ${
                      fee.category === 'Gross Sales' ? 'font-semibold' : ''
                    }`}
                  >
                    <span>{fee.category}</span>
                    <span className={`text-right ${fee.totalRobux < 0 ? 'text-destructive' : ''}`}>
                      {fee.totalRobux.toLocaleString()} R$
                    </span>
                    <span className="text-right">{fee.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}