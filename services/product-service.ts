import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { products, inventory, brands, categories, suppliers, activityLogs } from "@/db/schema";
import { computeStockStatus } from "@/lib/inventory-status";
import type { ProductInput, ProductListQuery } from "@/validators/product";
import type { ProductListResult, ProductDetail } from "@/types/product";

export async function listProducts(storeId: string, query: ProductListQuery): Promise<ProductListResult> {
  const offset = (query.page - 1) * query.pageSize;

  const whereClauses = [
    eq(products.storeId, storeId),
    query.categoryId ? eq(products.categoryId, query.categoryId) : undefined,
    query.brandId ? eq(products.brandId, query.brandId) : undefined,
    query.supplierId ? eq(products.supplierId, query.supplierId) : undefined,
    query.status ? eq(inventory.status, query.status) : undefined,
    query.search
      ? or(like(products.name, `%${query.search}%`), like(products.sku, `%${query.search}%`), like(products.barcode, `%${query.search}%`))
      : undefined,
  ].filter(Boolean);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        sku: products.sku,
        barcode: products.barcode,
        brandName: brands.name,
        categoryName: categories.name,
        supplierName: suppliers.name,
        purchasePrice: products.purchasePrice,
        sellingPrice: products.sellingPrice,
        currentStock: sql<number>`coalesce(${inventory.quantity}, 0)`,
        minStock: products.minStock,
        status: sql<string>`coalesce(${inventory.status}, 'out_of_stock')`,
      })
      .from(products)
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
      .where(and(...whereClauses))
      .orderBy(desc(products.createdAt))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .where(and(...whereClauses)),
  ]);

  return {
    items: rows.map((r) => ({
      ...r,
      purchasePrice: Number(r.purchasePrice),
      sellingPrice: Number(r.sellingPrice),
      currentStock: Number(r.currentStock),
      status: r.status as ProductListResult["items"][number]["status"],
    })),
    total: Number(count),
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getProductDetail(storeId: string, productId: string): Promise<ProductDetail | null> {
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      imageUrl: products.imageUrl,
      sku: products.sku,
      barcode: products.barcode,
      unit: products.unit,
      packSize: products.packSize,
      brandId: products.brandId,
      brandName: brands.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      supplierId: products.supplierId,
      supplierName: suppliers.name,
      purchasePrice: products.purchasePrice,
      sellingPrice: products.sellingPrice,
      taxPercent: products.taxPercent,
      minStock: products.minStock,
      maxStock: products.maxStock,
      currentStock: sql<number>`coalesce(${inventory.quantity}, 0)`,
      status: sql<string>`coalesce(${inventory.status}, 'out_of_stock')`,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
    .where(and(eq(products.storeId, storeId), eq(products.id, productId)))
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    purchasePrice: Number(row.purchasePrice),
    sellingPrice: Number(row.sellingPrice),
    taxPercent: Number(row.taxPercent),
    currentStock: Number(row.currentStock),
    status: row.status as ProductDetail["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createProduct(storeId: string, userId: string, input: ProductInput) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(products)
      .values({
        storeId,
        name: input.name,
        description: input.description || null,
        sku: input.sku,
        barcode: input.barcode || null,
        imageUrl: input.imageUrl || null,
        brandId: input.brandId || null,
        categoryId: input.categoryId || null,
        supplierId: input.supplierId || null,
        unit: input.unit,
        packSize: input.packSize || null,
        purchasePrice: input.purchasePrice.toFixed(2),
        sellingPrice: input.sellingPrice.toFixed(2),
        taxPercent: input.taxPercent.toFixed(2),
        minStock: input.minStock,
        maxStock: input.maxStock ?? null,
        source: "manual",
      })
      .$returningId();

    await tx.insert(inventory).values({
      storeId,
      productId: created!.id,
      quantity: input.currentStock,
      status: computeStockStatus(input.currentStock, input.minStock),
    });

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "product",
      entityId: created!.id,
      action: "created",
      description: `Added new product "${input.name}"`,
      createdAt: new Date(),
      metadata: null,
    });

    return created!.id;
  });
}

export async function updateProduct(storeId: string, userId: string, productId: string, input: ProductInput) {
  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        name: input.name,
        description: input.description || null,
        sku: input.sku,
        barcode: input.barcode || null,
        imageUrl: input.imageUrl || null,
        brandId: input.brandId || null,
        categoryId: input.categoryId || null,
        supplierId: input.supplierId || null,
        unit: input.unit,
        packSize: input.packSize || null,
        purchasePrice: input.purchasePrice.toFixed(2),
        sellingPrice: input.sellingPrice.toFixed(2),
        taxPercent: input.taxPercent.toFixed(2),
        minStock: input.minStock,
        maxStock: input.maxStock ?? null,
      })
      .where(and(eq(products.storeId, storeId), eq(products.id, productId)));

    await tx
      .update(inventory)
      .set({ quantity: input.currentStock, status: computeStockStatus(input.currentStock, input.minStock) })
      .where(eq(inventory.productId, productId));

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "product",
      entityId: productId,
      action: "updated",
      description: `Updated product "${input.name}"`,
      createdAt: new Date(),
      metadata: null,
    });
  });
}

export async function deleteProduct(storeId: string, userId: string, productId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({ deletedAt: new Date(), isActive: false })
      .where(and(eq(products.storeId, storeId), eq(products.id, productId)));

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "product",
      entityId: productId,
      action: "deleted",
      description: "Removed product from catalog",
      createdAt: new Date(),
      metadata: null,
    });
  });
}

export async function adjustStock(storeId: string, userId: string, productId: string, quantityDelta: number, reason: string) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(inventory).where(eq(inventory.productId, productId)).limit(1);
    const [product] = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!current || !product) throw new Error("Product inventory not found");

    const newQuantity = Math.max(0, current.quantity + quantityDelta);
    await tx
      .update(inventory)
      .set({
        quantity: newQuantity,
        status: computeStockStatus(newQuantity, product.minStock),
        ...(quantityDelta > 0 ? { lastRestockedAt: new Date().toISOString() } : { lastSoldAt: new Date().toISOString() }),
      })
      .where(eq(inventory.productId, productId));

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "inventory",
      entityId: productId,
      action: quantityDelta > 0 ? "stock_in" : "stock_out",
      description: reason,
      metadata: { quantityDelta, newQuantity },
      createdAt: new Date(),
    });

    return newQuantity;
  });
}
