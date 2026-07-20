import { z } from "zod";

export const bundleItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export const bundleSchema = z.object({
  name: z.string().min(2, "Combo name is required").max(160),
  description: z.string().max(400).optional().or(z.literal("")),
  comboPrice: z.coerce.number().positive("Combo price must be greater than 0"),
  isActive: z.boolean().default(true),
  items: z.array(bundleItemInputSchema).min(2, "A combo needs at least 2 products"),
});
export type BundleInput = z.infer<typeof bundleSchema>;
