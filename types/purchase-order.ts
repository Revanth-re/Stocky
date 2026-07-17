import type { PurchaseOrderStatus } from "@/db/schema";

export type PurchaseOrderListRow = {
  id: string;
  poNumber: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  itemCount: number;
  expectedDeliveryDate: string | null;
  createdAt: string;
};

export type PurchaseOrderItemDTO = {
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
};

export type PurchaseOrderDetail = {
  id: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  supplierName: string;
  supplierPhone: string | null;
  storeName: string;
  createdByName: string | null;
  totalAmount: number;
  expectedDeliveryDate: string | null;
  receivedAt: string | null;
  notes: string | null;
  sourcedFromForecast: boolean;
  createdAt: string;
  items: PurchaseOrderItemDTO[];
};
