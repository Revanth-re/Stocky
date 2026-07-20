import { mysqlTable, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { stores } from "./stores";
import { productBundleItems } from "./product-bundle-items";

/** A festival/combo offer, e.g. "Diwali Snack Pack" — a fixed set of products sold together at a fixed combo price. */
export const productBundles = mysqlTable(
  "product_bundles",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: varchar("description", { length: 400 }),
    comboPrice: decimal("combo_price", { precision: 12, scale: 2, mode: "number" }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [index("product_bundles_store_id_idx").on(table.storeId)],
);

export const productBundlesRelations = relations(productBundles, ({ one, many }) => ({
  store: one(stores, { fields: [productBundles.storeId], references: [stores.id] }),
  items: many(productBundleItems),
}));
