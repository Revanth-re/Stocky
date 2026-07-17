import { mysqlTable, varchar, int, mysqlEnum, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { products } from "./products";
import { stores } from "./stores";

export const stockStatusEnum = ["good", "medium", "low", "critical", "out_of_stock"] as const;
export type StockStatus = (typeof stockStatusEnum)[number];

/** Current stock snapshot per product. Historical movements live in `activity_logs`. */
export const inventory = mysqlTable(
  "inventory",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    productId: varchar("product_id", { length: 21 }).notNull(),
    quantity: int("quantity").notNull().default(0),
    reservedQuantity: int("reserved_quantity").notNull().default(0),
    status: mysqlEnum("status", stockStatusEnum).notNull().default("good"),
    lastRestockedAt: varchar("last_restocked_at", { length: 64 }),
    lastSoldAt: varchar("last_sold_at", { length: 64 }),
    ...timestamps(),
  },
  (table) => [
    index("inventory_store_id_idx").on(table.storeId),
    unique("inventory_product_id_unique").on(table.productId),
  ],
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  store: one(stores, { fields: [inventory.storeId], references: [stores.id] }),
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));
