export type ReportType =
  | "revenue"
  | "profit"
  | "sales"
  | "inventory"
  | "fast-moving"
  | "slow-moving"
  | "dead-stock"
  | "category-performance";

export type ReportColumn = { key: string; label: string; align?: "left" | "right" };

export type ReportResult = {
  title: string;
  description: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  totals?: Record<string, string | number>;
};
