import { mysqlTable, varchar, decimal, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { purchaseOrders } from "./purchase-orders";
import { products } from "./products";

export const purchaseOrderItems = mysqlTable(
  "purchase_order_items",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    purchaseOrderId: varchar("purchase_order_id", { length: 21 }).notNull(),
    productId: varchar("product_id", { length: 21 }).notNull(),
    // decimal for loose/weighed products (order 25 kg of rice, etc).
    quantityOrdered: decimal("quantity_ordered", { precision: 12, scale: 3, mode: "number" }).notNull(),
    quantityReceived: decimal("quantity_received", { precision: 12, scale: 3, mode: "number" }).notNull().default(0),
    unitCost: decimal("unit_cost", { precision: 12, scale: 2 }).notNull(),
    lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    index("po_items_po_id_idx").on(table.purchaseOrderId),
    index("po_items_product_id_idx").on(table.productId),
  ],
);

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, { fields: [purchaseOrderItems.productId], references: [products.id] }),
}));
