import { z } from "zod";

/** One row after client-side spreadsheet parsing. Expected headers: Date, Product, SKU, Quantity, UnitPrice. */
export const salesImportRowSchema = z.object({
  date: z.string().min(1, "Date is required"),
  productName: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0).optional(),
});

export const salesImportSchema = z.object({
  rows: z.array(salesImportRowSchema).min(1, "No rows to import").max(2000, "Import is limited to 2000 rows at a time"),
});

export type SalesImportRow = z.infer<typeof salesImportRowSchema>;
export type SalesImportInput = z.infer<typeof salesImportSchema>;
