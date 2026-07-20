import { mysqlTable, varchar, decimal, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sales } from "./sales";
import { products } from "./products";

export const saleItems = mysqlTable(
  "sale_items",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    saleId: varchar("sale_id", { length: 21 }).notNull(),
    productId: varchar("product_id", { length: 21 }).notNull(),
    // decimal, not int: loose/weighed items (pricingType = "weight") can be
    // sold in fractional quantities, e.g. 0.25 kg. mode: "number" keeps this
    // a plain JS number everywhere it's used, same as the old int column.
    quantity: decimal("quantity", { precision: 10, scale: 3, mode: "number" }).notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    index("sale_items_sale_id_idx").on(table.saleId),
    index("sale_items_product_id_idx").on(table.productId),
  ],
);

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));
