export type SaleHistoryRow = {
  id: string;
  invoiceNumber: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  soldAt: string;
};

export type PurchaseHistoryRow = {
  id: string;
  poNumber: string;
  supplierName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  status: string;
  createdAt: string;
};

export type ActivityTimelineRow = {
  id: string;
  action: string;
  description: string;
  actorName: string | null;
  createdAt: string;
};

export type ProductHistory = {
  sales: SaleHistoryRow[];
  purchases: PurchaseHistoryRow[];
  activity: ActivityTimelineRow[];
};
