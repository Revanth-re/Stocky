import type { StockStatus, PricingType } from "@/db/schema";

export type ProductListRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  sku: string;
  barcode: string | null;
  pricingType: PricingType;
  unit: string;
  brandName: string | null;
  categoryName: string | null;
  supplierName: string | null;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  status: StockStatus;
  /** Soonest upcoming (not-yet-expired) batch expiry date for this product, ISO date string, or null if none tracked. */
  nearestExpiryDate: string | null;
};

export type ProductListResult = {
  items: ProductListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductDetail = ProductListRow & {
  description: string | null;
  packSize: string | null;
  taxPercent: number;
  maxStock: number | null;
  brandId: string | null;
  categoryId: string | null;
  supplierId: string | null;
  createdAt: string;
};

export type InventoryBatch = {
  id: string;
  quantity: number;
  expiryDate: string | null;
  source: "initial" | "purchase_order";
  receivedAt: string;
};

export type InventoryHistoryEntry = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  quantityDelta?: number;
};
