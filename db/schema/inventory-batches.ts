import { mysqlTable, varchar, decimal, date, mysqlEnum, timestamp, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { products } from "./products";
import { stores } from "./stores";
import { purchaseOrders } from "./purchase-orders";

export const batchSourceEnum = ["initial", "purchase_order"] as const;
export type BatchSource = (typeof batchSourceEnum)[number];

/**
 * One row per "batch" of stock received for a product — created either when
 * a product is first added with opening stock, or when a purchase order is
 * marked received. Each batch can carry its own expiry date, since the same
 * product gets restocked over time with different expiry dates.
 *
 * This is a record of what came in and when it expires — it does not track
 * batch-level depletion as sales happen (sales still decrement the single
 * `inventory.quantity` total). Use it to answer "what's expiring soon" /
 * "what already expired", not "how much of batch X is left".
 */
export const inventoryBatches = mysqlTable(
  "inventory_batches",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    productId: varchar("product_id", { length: 21 }).notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 3, mode: "number" }).notNull(),
    expiryDate: date("expiry_date", { mode: "string" }),
    source: mysqlEnum("source", batchSourceEnum).notNull().default("initial"),
    purchaseOrderId: varchar("purchase_order_id", { length: 21 }),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
  },
  (table) => [
    index("inventory_batches_store_id_idx").on(table.storeId),
    index("inventory_batches_product_id_idx").on(table.productId),
    index("inventory_batches_expiry_date_idx").on(table.expiryDate),
  ],
);

export const inventoryBatchesRelations = relations(inventoryBatches, ({ one }) => ({
  store: one(stores, { fields: [inventoryBatches.storeId], references: [stores.id] }),
  product: one(products, { fields: [inventoryBatches.productId], references: [products.id] }),
  purchaseOrder: one(purchaseOrders, { fields: [inventoryBatches.purchaseOrderId], references: [purchaseOrders.id] }),
}));
