import { mysqlTable, varchar, decimal, mysqlEnum, text, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { stores } from "./stores";
import { suppliers } from "./suppliers";
import { users } from "./users";
import { purchaseOrderItems } from "./purchase-order-items";

export const purchaseOrderStatusEnum = ["draft", "ordered", "received", "cancelled"] as const;
export type PurchaseOrderStatus = (typeof purchaseOrderStatusEnum)[number];

export const purchaseOrders = mysqlTable(
  "purchase_orders",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    poNumber: varchar("po_number", { length: 32 }).notNull(),
    supplierId: varchar("supplier_id", { length: 21 }).notNull(),
    createdById: varchar("created_by_id", { length: 21 }).notNull(),
    status: mysqlEnum("status", purchaseOrderStatusEnum).notNull().default("draft"),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    expectedDeliveryDate: varchar("expected_delivery_date", { length: 32 }),
    receivedAt: varchar("received_at", { length: 64 }),
    notes: text("notes"),
    /** True when generated from an AI forecast suggestion vs. manually created. */
    sourcedFromForecast: varchar("sourced_from_forecast", { length: 5 }).notNull().default("false"),
    ...timestamps(),
  },
  (table) => [
    index("purchase_orders_store_id_idx").on(table.storeId),
    index("purchase_orders_supplier_id_idx").on(table.supplierId),
    index("purchase_orders_status_idx").on(table.status),
  ],
);

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  store: one(stores, { fields: [purchaseOrders.storeId], references: [stores.id] }),
  supplier: one(suppliers, { fields: [purchaseOrders.supplierId], references: [suppliers.id] }),
  createdBy: one(users, { fields: [purchaseOrders.createdById], references: [users.id] }),
  items: many(purchaseOrderItems),
}));
