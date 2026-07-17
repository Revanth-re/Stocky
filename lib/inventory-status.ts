import type { StockStatus } from "@/db/schema";

/** Derives a stock status badge from current quantity vs. the product's minimum threshold. */
export function computeStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= minStock * 0.5) return "critical";
  if (quantity <= minStock) return "low";
  if (quantity <= minStock * 2) return "medium";
  return "good";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  good: "Good",
  medium: "Medium",
  low: "Low",
  critical: "Critical",
  out_of_stock: "Out of Stock",
};

export const STOCK_STATUS_BADGE_VARIANT: Record<StockStatus, "success" | "warning" | "destructive"> = {
  good: "success",
  medium: "warning",
  low: "warning",
  critical: "destructive",
  out_of_stock: "destructive",
};
