import type { PaymentMethod } from "@/db/schema";

export type SaleListRow = {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  itemCount: number;
  soldByName: string | null;
  createdAt: string;
};

export type SaleItemDTO = {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
};

export type SaleDetail = {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName: string | null;
  customerPhone: string | null;
  soldByName: string | null;
  storeName: string;
  storeUpiId: string | null;
  createdAt: string;
  items: SaleItemDTO[];
};
