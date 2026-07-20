import { and, asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { productSupplierPrices, suppliers } from "@/db/schema";
import type { SupplierPriceRow } from "@/types/supplier-price";

/** All quoted prices for a product across suppliers, cheapest first, so the owner can pick the best deal before reordering. */
export async function listSupplierPricesForProduct(productId: string): Promise<SupplierPriceRow[]> {
  const rows = await db
    .select({
      supplierId: productSupplierPrices.supplierId,
      supplierName: suppliers.name,
      price: productSupplierPrices.price,
      updatedAt: productSupplierPrices.updatedAt,
    })
    .from(productSupplierPrices)
    .innerJoin(suppliers, eq(suppliers.id, productSupplierPrices.supplierId))
    .where(eq(productSupplierPrices.productId, productId))
    .orderBy(asc(productSupplierPrices.price));

  const cheapest = rows[0]?.price;
  return rows.map((r) => ({
    ...r,
    isCheapest: r.price === cheapest,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function upsertSupplierPrice(productId: string, supplierId: string, price: number) {
  await db
    .insert(productSupplierPrices)
    .values({ id: nanoid(), productId, supplierId, price })
    .onDuplicateKeyUpdate({ set: { price, updatedAt: new Date() } });
}

export async function deleteSupplierPrice(productId: string, supplierId: string) {
  await db
    .delete(productSupplierPrices)
    .where(and(eq(productSupplierPrices.productId, productId), eq(productSupplierPrices.supplierId, supplierId)));
}
