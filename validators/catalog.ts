import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2).max(160),
  contactPerson: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(400).optional().or(z.literal("")),
  gstNumber: z.string().max(20).optional().or(z.literal("")),
});
export type SupplierInput = z.infer<typeof supplierSchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  icon: z.string().max(64).optional().or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().min(2).max(120),
});
export type BrandInput = z.infer<typeof brandSchema>;
