import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { stores, products, inventory, suppliers, categories, brands } from "@/db/schema";
import { GLOBAL_CATALOG, GLOBAL_BRANDS, getCatalogForBrands } from "@/lib/catalog/global-catalog";
import type { CompleteOnboardingInput } from "@/validators/onboarding";

/**
 * Finalizes onboarding: updates store profile/type, ensures brand + category
 * rows exist, creates a product + inventory row per selected catalog item
 * (using the price/stock/supplier the owner entered in Step 5), and marks
 * the store as onboarded.
 */
export async function completeOnboarding(storeId: string, input: CompleteOnboardingInput) {
  const catalogItems = getCatalogForBrands(input.brandSlugs);
  const catalogById = new Map(catalogItems.map((item) => [item.id, item]));

  await db.transaction(async (tx) => {
    await tx
      .update(stores)
      .set({
        name: input.storeInfo.storeName,
        ownerName: input.storeInfo.ownerName,
        phone: input.storeInfo.phone,
        gstNumber: input.storeInfo.gstNumber || null,
        address: input.storeInfo.address || null,
        businessTemplate: input.businessTemplate,
        selectedBrandSlugs: input.brandSlugs,
        onboardingStep: "completed",
        onboardingCompletedAt: new Date().toISOString(),
      })
      .where(eq(stores.id, storeId));

    // Ensure global brand + category rows exist (idempotent upsert-by-slug).
    for (const slug of input.brandSlugs) {
      const brand = GLOBAL_BRANDS.find((b) => b.slug === slug);
      if (!brand) continue;
      const existing = await tx.query.brands.findFirst({ where: eq(brands.slug, slug) });
      if (!existing) {
        await tx.insert(brands).values({ name: brand.name, slug: brand.slug, isGlobal: true });
      }
    }

    const supplierCache = new Map<string, string>();

    for (const row of input.stock) {
      const catalogItem = catalogById.get(row.productId);
      if (!catalogItem) continue;

      let supplierId = supplierCache.get(row.supplierName);
      if (!supplierId) {
        const [createdSupplier] = await tx
          .insert(suppliers)
          .values({ storeId, name: row.supplierName })
          .$returningId();
        supplierId = createdSupplier!.id;
        supplierCache.set(row.supplierName, supplierId);
      }

      const categorySlug = catalogItem.category.toLowerCase().replace(/\s+/g, "-");
      let category = await tx.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      if (!category) {
        const [createdCategory] = await tx
          .insert(categories)
          .values({ name: catalogItem.category, slug: categorySlug, isGlobal: "true" })
          .$returningId();
        category = { id: createdCategory!.id } as unknown as typeof category;
      }

      const [createdProduct] = await tx
        .insert(products)
        .values({
          storeId,
          name: catalogItem.name,
          sku: catalogItem.id.toUpperCase(),
          unit: catalogItem.unit,
          packSize: catalogItem.packSize,
          categoryId: category!.id,
          supplierId,
          purchasePrice: row.purchasePrice.toFixed(2),
          sellingPrice: catalogItem.suggestedSellingPrice.toFixed(2),
          minStock: catalogItem.minStock,
          source: "catalog",
        })
        .$returningId();

      await tx.insert(inventory).values({
        storeId,
        productId: createdProduct!.id,
        quantity: row.currentStock,
        status: row.currentStock === 0 ? "out_of_stock" : row.currentStock <= catalogItem.minStock ? "low" : "good",
      });
    }
  });

  return { redirectTo: "/dashboard" };
}

export function listCatalogForBrands(brandSlugs: string[]) {
  if (brandSlugs.length === 0) return GLOBAL_CATALOG;
  return getCatalogForBrands(brandSlugs);
}
