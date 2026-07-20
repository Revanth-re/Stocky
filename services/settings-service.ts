import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { settings, stores } from "@/db/schema";
import type { StoreType } from "@/db/schema";

export async function getSetting<T>(storeId: string, category: string, key: string): Promise<T | null> {
  const row = await db.query.settings.findFirst({
    where: and(eq(settings.storeId, storeId), eq(settings.category, category), eq(settings.key, key)),
  });
  return (row?.value as T) ?? null;
}

export async function listSettingsByCategory(storeId: string, category: string) {
  return db.query.settings.findMany({ where: and(eq(settings.storeId, storeId), eq(settings.category, category)) });
}

export async function upsertSetting(storeId: string, category: string, key: string, value: unknown) {
  const existing = await db.query.settings.findFirst({
    where: and(eq(settings.storeId, storeId), eq(settings.category, category), eq(settings.key, key)),
  });

  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values({ storeId, category, key, value });
  }
}

export async function getStoreProfile(storeId: string) {
  return db.query.stores.findFirst({ where: eq(stores.id, storeId) });
}

export async function updateStoreProfile(
  storeId: string,
  input: { name: string; ownerName: string; phone: string; gstNumber?: string; upiId?: string; address?: string; storeType?: StoreType },
) {
  await db
    .update(stores)
    .set({
      name: input.name,
      ownerName: input.ownerName,
      phone: input.phone,
      gstNumber: input.gstNumber || null,
      upiId: input.upiId || null,
      address: input.address || null,
      storeType: input.storeType,
    })
    .where(eq(stores.id, storeId));
}
