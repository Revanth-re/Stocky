import { z } from "zod";
import { purchaseOrderStatusEnum } from "@/db/schema";

export const poItemInputSchema = z.object({
  productId: z.string().min(1),
  quantityOrdered: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitCost: z.coerce.number().min(0, "Required"),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Choose a supplier"),
  items: z.array(poItemInputSchema).min(1, "Add at least one product"),
  expectedDeliveryDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;

export const receivedItemExpirySchema = z.object({
  productId: z.string().min(1),
  expiryDate: z.string().optional().or(z.literal("")),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(purchaseOrderStatusEnum),
  /** Optional per-item expiry dates, used when status is "received". */
  items: z.array(receivedItemExpirySchema).optional(),
});
