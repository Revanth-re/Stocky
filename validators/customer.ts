import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  phone: z.string().min(10, "Enter a valid phone number").max(20),
  address: z.string().max(400).optional().or(z.literal("")),
  creditLimit: z.coerce.number().min(0).default(0),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  note: z.string().max(300).optional().or(z.literal("")),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const customerListQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
