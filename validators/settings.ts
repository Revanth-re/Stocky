import { z } from "zod";
import { storeTypeEnum, userRoleEnum } from "@/db/schema";

export const storeProfileSchema = z.object({
  name: z.string().min(2).max(160),
  ownerName: z.string().min(2).max(120),
  phone: z.string().min(10).max(20),
  gstNumber: z.string().max(20).optional().or(z.literal("")),
  upiId: z.string().max(120).optional().or(z.literal("")),
  address: z.string().max(400).optional().or(z.literal("")),
  storeType: z.enum(storeTypeEnum).optional(),
});
export type StoreProfileInput = z.infer<typeof storeProfileSchema>;

export const inviteUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum(userRoleEnum),
  temporaryPassword: z.string().min(8),
});

export const updateUserRoleSchema = z.object({ role: z.enum(userRoleEnum) });
export const updateUserStatusSchema = z.object({ isActive: z.boolean() });

export const upsertSettingSchema = z.object({
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.unknown(),
});
