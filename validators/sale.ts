import { z } from "zod";
import { paymentMethodEnum } from "@/db/schema";

export const saleItemInputSchema = z.object({
  productId: z.string().min(1),
  // Fractional for loose/weighed items (e.g. 0.25 kg) — enforced only to be > 0, not necessarily whole.
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  discountAmount: z.coerce.number().min(0).default(0),
});

export const recordSaleSchema = z
  .object({
    items: z.array(saleItemInputSchema).min(1, "Add at least one product"),
    paymentMethod: z.enum(paymentMethodEnum),
    customerName: z.string().max(120).optional().or(z.literal("")),
    customerPhone: z.string().max(20).optional().or(z.literal("")),
    /** Required when paymentMethod = "credit" — the udhaar customer this sale is billed to. */
    customerId: z.string().optional().or(z.literal("")),
    /** Optional combo/bundle applied at billing — its discount gets folded into the sale's discountAmount. */
    appliedBundleId: z.string().optional().or(z.literal("")),
    bundleDiscountAmount: z.coerce.number().min(0).default(0),
  })
  .refine((data) => data.paymentMethod !== "credit" || !!data.customerId, {
    message: "Select a customer for credit/udhaar sales",
    path: ["customerId"],
  });
export type RecordSaleInput = z.infer<typeof recordSaleSchema>;

export const saleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  paymentMethod: z.enum(paymentMethodEnum).optional(),
});
