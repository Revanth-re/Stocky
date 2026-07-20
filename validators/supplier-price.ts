import { z } from "zod";

export const upsertSupplierPriceSchema = z.object({
  supplierId: z.string().min(1),
  price: z.coerce.number().positive("Price must be greater than 0"),
});
export type UpsertSupplierPriceInput = z.infer<typeof upsertSupplierPriceSchema>;
