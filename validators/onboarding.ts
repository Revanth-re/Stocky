import { z } from "zod";
import { storeTypeEnum } from "@/db/schema";

export const storeInfoSchema = z.object({
  storeName: z.string().min(2, "Store name is required").max(160),
  ownerName: z.string().min(2, "Owner name is required").max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  gstNumber: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(400).optional().or(z.literal("")),
});
export type StoreInfoInput = z.infer<typeof storeInfoSchema>;

export const storeTypeSchema = z.object({
  storeType: z.enum(storeTypeEnum),
});
export type StoreTypeInput = z.infer<typeof storeTypeSchema>;

export const brandSelectionSchema = z.object({
  brandSlugs: z.array(z.string()).min(1, "Pick at least one brand to continue"),
});
export type BrandSelectionInput = z.infer<typeof brandSelectionSchema>;

export const stockEntryRowSchema = z.object({
  productId: z.string(),
  purchasePrice: z.coerce.number().min(0, "Required"),
  currentStock: z.coerce.number().int().min(0, "Required"),
  supplierName: z.string().min(1, "Required"),
});

export const stockEntrySchema = z.object({
  rows: z.array(stockEntryRowSchema).min(1),
});
export type StockEntryInput = z.infer<typeof stockEntrySchema>;

/** Full onboarding payload submitted to POST /api/onboarding on the final step. */
export const completeOnboardingSchema = z.object({
  storeInfo: storeInfoSchema,
  storeType: storeTypeSchema.shape.storeType,
  brandSlugs: z.array(z.string()).min(1),
  stock: z.array(stockEntryRowSchema),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
