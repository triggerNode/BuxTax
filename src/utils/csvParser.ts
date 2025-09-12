import Papa from "papaparse";
import { formatDistanceToNow } from "date-fns";

export interface RawPayoutRow {
  [key: string]: string;
}

export interface TransactionRow {
  date: string;
  description: string;
  amount: number;
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
  // Transaction format specific
  description?: string;
  amount?: string;
}

export interface TransactionTypeMapping {
  [description: string]:
    | "sale"
    | "marketplaceFee"
    | "adSpend"
    | "groupSplit"
    | "affiliateFee"
    | "refund"
    | "otherCost";
}

export const DEFAULT_TRANSACTION_MAPPINGS: TransactionTypeMapping = {
  sale: "sale",
  "marketplace fee": "marketplaceFee",
  "ad spend": "adSpend",
  advertising: "adSpend",
  "group split": "groupSplit",
  "affiliate fee": "affiliateFee",
  "affiliate payout": "affiliateFee",
  refund: "refund",
  chargeback: "refund",
  other: "otherCost",
  misc: "otherCost",
};

const DEVEX_RATE = 0.0037975; // $0.0037975 per Robux

export function parseCSV(
  csvContent: string,
  columnMapping?: ColumnMapping,
  transactionMapping?: TransactionTypeMapping
): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const errors: string[] = [];
        let parsedData: ParsedPayoutData[] = [];

        if (results.errors.length > 0) {
          results.errors.forEach((error) => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });
        }

        // Auto-detect columns if no mapping provided
        const mapping =
          columnMapping || detectColumns(results.data[0] as RawPayoutRow);

        // Detect format type
        const isTransactionFormat = detectTransactionFormat(mapping);

        if (isTransactionFormat) {
          // Parse as transaction format
          const transactions = parseTransactions(
            results.data,
            mapping,
            transactionMapping
          );
          parsedData = aggregateTransactions(transactions);
        } else {
          // Parse as summary format (existing logic)
          results.data.forEach((row: any, index: number) => {
            try {
              const parsed = parseRow(row, mapping, index + 1);
              if (parsed) {
                parsedData.push(parsed);
              }
            } catch (error) {
              errors.push(
                `Row ${index + 1}: ${
                  error instanceof Error ? error.message : "Parse error"
                }`
              );
            }
          });
        }

        // Sort by date
        parsedData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const summary = {
          totalRows: results.data.length,
          validRows: parsedData.length,
          dateRange: {
            start: parsedData.length > 0 ? parsedData[0].date : "",
            end:
              parsedData.length > 0
                ? parsedData[parsedData.length - 1].date
                : "",
          },
        };

        resolve({ data: parsedData, errors, summary });
      },
    });
  });
}

function detectColumns(sampleRow: RawPayoutRow): ColumnMapping {
  const headers = Object.keys(sampleRow).map((h) => h.toLowerCase());
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
    // Transaction format patterns
    description: /^(description|type|category|transaction)/i,
    amount: /^(amount|value|sum|total)$/i,
  };

  Object.keys(sampleRow).forEach((header) => {
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

function detectTransactionFormat(mapping: ColumnMapping): boolean {
  // Transaction format requires date, description, and amount columns
  return !!(mapping.date && mapping.description && mapping.amount);
}

function parseTransactions(
  data: any[],
  mapping: ColumnMapping,
  transactionMapping: TransactionTypeMapping = DEFAULT_TRANSACTION_MAPPINGS
): TransactionRow[] {
  const transactions: TransactionRow[] = [];

  data.forEach((row: any, index: number) => {
    try {
      const dateStr = row[mapping.date || ""];
      const description = row[mapping.description || ""];
      const amountStr = row[mapping.amount || ""];

      if (!dateStr || !description || !amountStr) {
        return; // Skip invalid rows
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
      }

      const amount = parseFloat(amountStr.replace(/[$,\s]/g, ""));
      if (isNaN(amount)) {
        throw new Error(`Invalid amount: ${amountStr}`);
      }

      transactions.push({
        date: date.toISOString().split("T")[0],
        description: description.trim(),
        amount,
      });
    } catch (error) {
      console.warn(
        `Row ${index + 1}: ${
          error instanceof Error ? error.message : "Parse error"
        }`
      );
    }
  });

  return transactions;
}

function aggregateTransactions(
  transactions: TransactionRow[]
): ParsedPayoutData[] {
  const dailyData = new Map<string, ParsedPayoutData>();

  transactions.forEach((transaction) => {
    if (!dailyData.has(transaction.date)) {
      dailyData.set(transaction.date, {
        date: transaction.date,
        grossRobux: 0,
        netRobux: 0,
        marketplaceFee: 0,
        adSpend: 0,
        groupSplits: 0,
        affiliatePayouts: 0,
        refunds: 0,
        otherCosts: 0,
        usdValue: 0,
      });
    }

    const dayData = dailyData.get(transaction.date)!;
    const transactionType = categorizeTransaction(transaction.description);

    switch (transactionType) {
      case "sale":
        dayData.grossRobux += Math.max(0, transaction.amount);
        break;
      case "marketplaceFee":
        dayData.marketplaceFee += Math.abs(transaction.amount);
        break;
      case "adSpend":
        dayData.adSpend += Math.abs(transaction.amount);
        break;
      case "groupSplit":
        dayData.groupSplits += Math.abs(transaction.amount);
        break;
      case "affiliateFee":
        dayData.affiliatePayouts += Math.abs(transaction.amount);
        break;
      case "refund":
        dayData.refunds += Math.abs(transaction.amount);
        break;
      case "otherCost":
        dayData.otherCosts += Math.abs(transaction.amount);
        break;
    }
  });

  // Calculate net Robux and USD value for each day
  return Array.from(dailyData.values()).map((dayData) => {
    dayData.netRobux =
      dayData.grossRobux -
      dayData.marketplaceFee -
      dayData.adSpend -
      dayData.groupSplits -
      dayData.affiliatePayouts -
      dayData.refunds -
      dayData.otherCosts;
    dayData.usdValue = dayData.netRobux * DEVEX_RATE;
    return dayData;
  });
}

function categorizeTransaction(
  description: string
): keyof TransactionTypeMapping {
  const lowerDesc = description.toLowerCase().trim();

  // Check for exact matches first
  if (DEFAULT_TRANSACTION_MAPPINGS[lowerDesc]) {
    return DEFAULT_TRANSACTION_MAPPINGS[lowerDesc];
  }

  // Check for partial matches
  for (const [key, category] of Object.entries(DEFAULT_TRANSACTION_MAPPINGS)) {
    if (lowerDesc.includes(key)) {
      return category;
    }
  }

  // Default to sale if positive, other cost if negative
  return "sale";
}

function parseRow(
  row: RawPayoutRow,
  mapping: ColumnMapping,
  rowNumber: number
): ParsedPayoutData | null {
  const safeParseNumber = (
    value: string | undefined,
    fieldName: string
  ): number => {
    if (!value || value.trim() === "") return 0;

    // Remove common currency symbols and formatting
    const cleaned = value.replace(/[$,\s]/g, "");
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) {
      throw new Error(`Invalid number format in ${fieldName}: "${value}"`);
    }

    return Math.max(0, parsed); // Ensure non-negative
  };

  const safeParseDate = (value: string | undefined): string => {
    if (!value || value.trim() === "") {
      throw new Error("Date is required");
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: "${value}"`);
    }

    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  try {
    const grossRobux = safeParseNumber(
      row[mapping.grossRobux || ""],
      "grossRobux"
    );
    const netRobux = safeParseNumber(row[mapping.netRobux || ""], "netRobux");
    const marketplaceFee = safeParseNumber(
      row[mapping.marketplaceFee || ""],
      "marketplaceFee"
    );
    const adSpend = safeParseNumber(row[mapping.adSpend || ""], "adSpend");
    const groupSplits = safeParseNumber(
      row[mapping.groupSplits || ""],
      "groupSplits"
    );
    const affiliatePayouts = safeParseNumber(
      row[mapping.affiliatePayouts || ""],
      "affiliatePayouts"
    );
    const refunds = safeParseNumber(row[mapping.refunds || ""], "refunds");
    const otherCosts = safeParseNumber(
      row[mapping.otherCosts || ""],
      "otherCosts"
    );

    // Calculate net Robux if not provided
    const calculatedNetRobux =
      netRobux ||
      grossRobux -
        marketplaceFee -
        adSpend -
        groupSplits -
        affiliatePayouts -
        refunds -
        otherCosts;

    if (calculatedNetRobux < 0) {
      throw new Error("Net Robux cannot be negative");
    }

    const parsed: ParsedPayoutData = {
      date: safeParseDate(row[mapping.date || ""]),
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

export function exportToCSV(
  data: ParsedPayoutData[],
  filename: string = "buxtax-export.csv"
): void {
  const csv = Papa.unparse(
    data.map((row) => ({
      Date: row.date,
      "Gross Robux": row.grossRobux,
      "Net Robux": row.netRobux,
      "USD Value": `$${row.usdValue.toFixed(2)}`,
      "Marketplace Fee": row.marketplaceFee,
      "Ad Spend": row.adSpend,
      "Group Splits": row.groupSplits,
      "Affiliate Payouts": row.affiliatePayouts,
      Refunds: row.refunds,
      "Other Costs": row.otherCosts,
    }))
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
