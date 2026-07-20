import { mysqlTable, varchar, int, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { productBundles } from "./product-bundles";
import { products } from "./products";

export const productBundleItems = mysqlTable(
  "product_bundle_items",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    bundleId: varchar("bundle_id", { length: 21 }).notNull(),
    productId: varchar("product_id", { length: 21 }).notNull(),
    quantity: int("quantity").notNull().default(1),
  },
  (table) => [
    index("bundle_items_bundle_id_idx").on(table.bundleId),
    index("bundle_items_product_id_idx").on(table.productId),
  ],
);

export const productBundleItemsRelations = relations(productBundleItems, ({ one }) => ({
  bundle: one(productBundles, { fields: [productBundleItems.bundleId], references: [productBundles.id] }),
  product: one(products, { fields: [productBundleItems.productId], references: [products.id] }),
}));
