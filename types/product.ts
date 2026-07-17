import type { StockStatus } from "@/db/schema";

export type ProductListRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  sku: string;
  barcode: string | null;
  brandName: string | null;
  categoryName: string | null;
  supplierName: string | null;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  status: StockStatus;
};

export type ProductListResult = {
  items: ProductListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductDetail = ProductListRow & {
  description: string | null;
  unit: string;
  packSize: string | null;
  taxPercent: number;
  maxStock: number | null;
  brandId: string | null;
  categoryId: string | null;
  supplierId: string | null;
  createdAt: string;
};

export type InventoryHistoryEntry = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  quantityDelta?: number;
};
