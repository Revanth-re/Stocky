import { mysqlTable, varchar, text, int, decimal, boolean, mysqlEnum, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, softDelete, jsonColumn } from "./_columns";
import { stores } from "./stores";
import { brands } from "./brands";
import { categories } from "./categories";
import { suppliers } from "./suppliers";
import { inventory } from "./inventory";
import { saleItems } from "./sale-items";
import { purchaseOrderItems } from "./purchase-order-items";
import { forecasts } from "./forecasts";
import { productSupplierPrices } from "./product-supplier-prices";

/**
 * "unit" = sold as whole pieces (pcs, packet, box…), price is per piece.
 * "weight" = loose/weighed goods (rice, dal, oil…), price is per 1 `unit`
 * (e.g. per kg if `unit` = "kg"), and sale quantities can be fractional
 * (0.25 kg, 1.5 kg, …) via the decimal quantity columns on sale_items /
 * inventory / purchase_order_items.
 */
export const pricingTypeEnum = ["unit", "weight"] as const;
export type PricingType = (typeof pricingTypeEnum)[number];

export const products = mysqlTable(
  "products",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    sku: varchar("sku", { length: 64 }).notNull(),
    barcode: varchar("barcode", { length: 64 }),
    imageUrl: varchar("image_url", { length: 512 }),
    brandId: varchar("brand_id", { length: 21 }),
    categoryId: varchar("category_id", { length: 21 }),
    supplierId: varchar("supplier_id", { length: 21 }),
    unit: varchar("unit", { length: 32 }).notNull().default("pcs"), // pcs, kg, g, ltr, ml, packet
    packSize: varchar("pack_size", { length: 32 }), // e.g. "500ml", "1kg"
    pricingType: mysqlEnum("pricing_type", pricingTypeEnum).notNull().default("unit"),
    purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull().default("0"),
    sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }).notNull().default("0"),
    taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("0"),
    minStock: int("min_stock").notNull().default(5),
    maxStock: int("max_stock"),
    isActive: boolean("is_active").notNull().default(true),
    source: varchar("source", { length: 16 }).notNull().default("catalog"), // catalog | manual | import
    /**
     * Business-template-specific attributes that don't warrant a dedicated
     * column (IMEI/serial for electronics, size/color for fashion, part
     * number/vehicle compatibility for automobile, ISBN for books, etc).
     * Shape is driven by the active template's `productFields` descriptors
     * — see `business/types.ts` — so new verticals never need a schema
     * migration, just a new config entry.
     */
    customFields: jsonColumn<Record<string, string | number | boolean | null>>("custom_fields").default({}),
    ...timestamps(),
    ...softDelete(),
  },
  (table) => [
    index("products_store_id_idx").on(table.storeId),
    index("products_sku_idx").on(table.sku),
    index("products_barcode_idx").on(table.barcode),
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_supplier_id_idx").on(table.supplierId),
  ],
);

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
  saleItems: many(saleItems),
  purchaseOrderItems: many(purchaseOrderItems),
  forecasts: many(forecasts),
  supplierPrices: many(productSupplierPrices),
}));
