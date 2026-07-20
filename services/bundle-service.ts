import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { productBundles, productBundleItems, products } from "@/db/schema";
import type { BundleInput } from "@/validators/bundle";
import type { BundleDTO } from "@/types/bundle";

async function hydrateBundles(bundleRows: (typeof productBundles.$inferSelect)[]): Promise<BundleDTO[]> {
  if (bundleRows.length === 0) return [];

  const bundleIds = bundleRows.map((b) => b.id);
  const itemRows = await db
    .select({
      bundleId: productBundleItems.bundleId,
      productId: productBundleItems.productId,
      quantity: productBundleItems.quantity,
      productName: products.name,
      sellingPrice: products.sellingPrice,
    })
    .from(productBundleItems)
    .innerJoin(products, eq(products.id, productBundleItems.productId))
    .where(inArray(productBundleItems.bundleId, bundleIds));

  const itemsByBundle = new Map<string, typeof itemRows>();
  for (const row of itemRows) {
    const list = itemsByBundle.get(row.bundleId) ?? [];
    list.push(row);
    itemsByBundle.set(row.bundleId, list);
  }

  return bundleRows.map((bundle) => {
    const items = (itemsByBundle.get(bundle.id) ?? []).map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: Number(i.sellingPrice),
    }));
    const regularTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return {
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      comboPrice: bundle.comboPrice,
      isActive: bundle.isActive,
      items,
      regularTotal,
      savings: Math.max(0, regularTotal - bundle.comboPrice),
    };
  });
}

export async function listBundles(storeId: string, activeOnly = false): Promise<BundleDTO[]> {
  const whereClauses = [eq(productBundles.storeId, storeId), ...(activeOnly ? [eq(productBundles.isActive, true)] : [])];
  const bundleRows = await db
    .select()
    .from(productBundles)
    .where(and(...whereClauses));
  return hydrateBundles(bundleRows);
}

export async function getBundleDetail(storeId: string, bundleId: string): Promise<BundleDTO | null> {
  const [bundle] = await db
    .select()
    .from(productBundles)
    .where(and(eq(productBundles.storeId, storeId), eq(productBundles.id, bundleId)))
    .limit(1);
  if (!bundle) return null;
  const [dto] = await hydrateBundles([bundle]);
  return dto ?? null;
}

export async function createBundle(storeId: string, input: BundleInput) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(productBundles)
      .values({
        storeId,
        name: input.name,
        description: input.description || null,
        comboPrice: input.comboPrice,
        isActive: input.isActive,
      })
      .$returningId();

    await tx.insert(productBundleItems).values(
      input.items.map((item) => ({
        id: nanoid(),
        bundleId: created!.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    return created!.id;
  });
}

export async function updateBundle(storeId: string, bundleId: string, input: BundleInput) {
  await db.transaction(async (tx) => {
    await tx
      .update(productBundles)
      .set({
        name: input.name,
        description: input.description || null,
        comboPrice: input.comboPrice,
        isActive: input.isActive,
      })
      .where(and(eq(productBundles.storeId, storeId), eq(productBundles.id, bundleId)));

    await tx.delete(productBundleItems).where(eq(productBundleItems.bundleId, bundleId));
    await tx.insert(productBundleItems).values(
      input.items.map((item) => ({
        id: nanoid(),
        bundleId,
        productId: item.productId,
        quantity: item.quantity,
      })),
    );
  });
}

export async function deleteBundle(storeId: string, bundleId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(productBundleItems).where(eq(productBundleItems.bundleId, bundleId));
    await tx.delete(productBundles).where(and(eq(productBundles.storeId, storeId), eq(productBundles.id, bundleId)));
  });
}
