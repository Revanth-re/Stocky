import { mysqlTable, varchar, decimal, timestamp, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { products } from "./products";
import { suppliers } from "./suppliers";

/**
 * A quoted price from a given supplier for a given product — lets the owner
 * compare "who's cheapest for rice this week" across their local wholesalers
 * before placing a purchase order. Independent from `products.supplierId`
 * (the default/primary supplier); this table can hold quotes from others too.
 */
export const productSupplierPrices = mysqlTable(
  "product_supplier_prices",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    productId: varchar("product_id", { length: 21 }).notNull(),
    supplierId: varchar("supplier_id", { length: 21 }).notNull(),
    price: decimal("price", { precision: 12, scale: 2, mode: "number" }).notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("supplier_prices_product_id_idx").on(table.productId),
    index("supplier_prices_supplier_id_idx").on(table.supplierId),
    unique("supplier_prices_product_supplier_unique").on(table.productId, table.supplierId),
  ],
);

export const productSupplierPricesRelations = relations(productSupplierPrices, ({ one }) => ({
  product: one(products, { fields: [productSupplierPrices.productId], references: [products.id] }),
  supplier: one(suppliers, { fields: [productSupplierPrices.supplierId], references: [suppliers.id] }),
}));
