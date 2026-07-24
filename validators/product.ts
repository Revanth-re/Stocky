import { z } from "zod";
import { pricingTypeEnum } from "@/db/schema";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  sku: z.string().min(2, "SKU is required").max(64),
  barcode: z.string().max(64).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  unit: z.string().min(1).max(32).default("pcs"),
  packSize: z.string().max(32).optional().or(z.literal("")),
  /** "weight" = loose/weighed goods sold per unit weight (kg/g) with fractional quantities allowed at billing. */
  pricingType: z.enum(pricingTypeEnum).default("unit"),
  purchasePrice: z.coerce.number().min(0, "Required"),
  sellingPrice: z.coerce.number().min(0, "Required"),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  minStock: z.coerce.number().min(0).default(5),
  maxStock: z.coerce.number().min(0).optional(),
  currentStock: z.coerce.number().min(0).default(0),
  /** ISO date string (YYYY-MM-DD). Expiry of the current/opening batch. */
  expiryDate: z.string().optional().or(z.literal("")),
  /**
   * Business-template-specific attributes (IMEI, size/color, batch number,
   * ISBN, ...) rendered dynamically from the active template's
   * `productFields` descriptors — see `business/types.ts` and
   * `components/shared/dynamic-product-fields.tsx`. Kept loose here since
   * the shape varies per template; each descriptor is responsible for its
   * own value's meaning.
   */
  customFields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const productListQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.enum(["good", "medium", "low", "critical", "out_of_stock"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const stockAdjustmentSchema = z.object({
  productId: z.string(),
  quantityDelta: z.number(),
  reason: z.string().min(1).max(200),
});
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
