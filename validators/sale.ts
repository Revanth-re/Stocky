import { z } from "zod";
import { paymentMethodEnum } from "@/db/schema";

export const saleItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  discountAmount: z.coerce.number().min(0).default(0),
});

export const recordSaleSchema = z.object({
  items: z.array(saleItemInputSchema).min(1, "Add at least one product"),
  paymentMethod: z.enum(paymentMethodEnum),
  customerName: z.string().max(120).optional().or(z.literal("")),
  customerPhone: z.string().max(20).optional().or(z.literal("")),
});
export type RecordSaleInput = z.infer<typeof recordSaleSchema>;

export const saleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  paymentMethod: z.enum(paymentMethodEnum).optional(),
});
