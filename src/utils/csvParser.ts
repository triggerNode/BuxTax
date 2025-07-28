import Papa from 'papaparse';
import { formatDistanceToNow } from 'date-fns';

export interface RawPayoutRow {
  [key: string]: string;
}

export interface ParsedPayoutData {
  date: string;
  grossRobux: number;
  netRobux: number;
  marketplaceFee: number;
  adSpend: number;
  groupSplits: number;
  affiliatePayouts: number;
  refunds: number;
  otherCosts: number;
  usdValue: number;
}

export interface CSVParseResult {
  data: ParsedPayoutData[];
  errors: string[];
  summary: {
    totalRows: number;
    validRows: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface ColumnMapping {
  date?: string;
  grossRobux?: string;
  netRobux?: string;
  marketplaceFee?: string;
  adSpend?: string;
  groupSplits?: string;
  affiliatePayouts?: string;
  refunds?: string;
  otherCosts?: string;
}

const DEVEX_RATE = 0.0035; // $0.0035 per Robux

export function parseCSV(csvContent: string, columnMapping?: ColumnMapping): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const errors: string[] = [];
        const parsedData: ParsedPayoutData[] = [];
        
        if (results.errors.length > 0) {
          results.errors.forEach(error => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });
        }

        // Auto-detect columns if no mapping provided
        const mapping = columnMapping || detectColumns(results.data[0] as RawPayoutRow);
        
        results.data.forEach((row: any, index: number) => {
          try {
            const parsed = parseRow(row, mapping, index + 1);
            if (parsed) {
              parsedData.push(parsed);
            }
          } catch (error) {
            errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
          }
        });

        // Sort by date
        parsedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const summary = {
          totalRows: results.data.length,
          validRows: parsedData.length,
          dateRange: {
            start: parsedData.length > 0 ? parsedData[0].date : '',
            end: parsedData.length > 0 ? parsedData[parsedData.length - 1].date : '',
          },
        };

        resolve({ data: parsedData, errors, summary });
      },
    });
  });
}

function detectColumns(sampleRow: RawPayoutRow): ColumnMapping {
  const headers = Object.keys(sampleRow).map(h => h.toLowerCase());
  const mapping: ColumnMapping = {};

  // Common patterns for column detection
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
}

function parseRow(row: RawPayoutRow, mapping: ColumnMapping, rowNumber: number): ParsedPayoutData | null {
  const safeParseNumber = (value: string | undefined, fieldName: string): number => {
    if (!value || value.trim() === '') return 0;
    
    // Remove common currency symbols and formatting
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) {
      throw new Error(`Invalid number format in ${fieldName}: "${value}"`);
    }
    
    return Math.max(0, parsed); // Ensure non-negative
  };

  const safeParseDate = (value: string | undefined): string => {
    if (!value || value.trim() === '') {
      throw new Error('Date is required');
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: "${value}"`);
    }
    
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  try {
    const grossRobux = safeParseNumber(row[mapping.grossRobux || ''], 'grossRobux');
    const netRobux = safeParseNumber(row[mapping.netRobux || ''], 'netRobux');
    const marketplaceFee = safeParseNumber(row[mapping.marketplaceFee || ''], 'marketplaceFee');
    const adSpend = safeParseNumber(row[mapping.adSpend || ''], 'adSpend');
    const groupSplits = safeParseNumber(row[mapping.groupSplits || ''], 'groupSplits');
    const affiliatePayouts = safeParseNumber(row[mapping.affiliatePayouts || ''], 'affiliatePayouts');
    const refunds = safeParseNumber(row[mapping.refunds || ''], 'refunds');
    const otherCosts = safeParseNumber(row[mapping.otherCosts || ''], 'otherCosts');

    // Calculate net Robux if not provided
    const calculatedNetRobux = netRobux || (grossRobux - marketplaceFee - adSpend - groupSplits - affiliatePayouts - refunds - otherCosts);
    
    if (calculatedNetRobux < 0) {
      throw new Error('Net Robux cannot be negative');
    }

    const parsed: ParsedPayoutData = {
      date: safeParseDate(row[mapping.date || '']),
      grossRobux,
      netRobux: calculatedNetRobux,
      marketplaceFee,
      adSpend,
      groupSplits,
      affiliatePayouts,
      refunds,
      otherCosts,
      usdValue: calculatedNetRobux * DEVEX_RATE,
    };

    return parsed;
  } catch (error) {
    // Return null for rows that can't be parsed
    return null;
  }
}

export function exportToCSV(data: ParsedPayoutData[], filename: string = 'buxtax-export.csv'): void {
  const csv = Papa.unparse(data.map(row => ({
    Date: row.date,
    'Gross Robux': row.grossRobux,
    'Net Robux': row.netRobux,
    'USD Value': `$${row.usdValue.toFixed(2)}`,
    'Marketplace Fee': row.marketplaceFee,
    'Ad Spend': row.adSpend,
    'Group Splits': row.groupSplits,
    'Affiliate Payouts': row.affiliatePayouts,
    'Refunds': row.refunds,
    'Other Costs': row.otherCosts,
  })));

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}