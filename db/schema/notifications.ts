import { mysqlTable, varchar, text, boolean, mysqlEnum, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, jsonColumn } from "./_columns";
import { stores } from "./stores";
import { users } from "./users";

export const notificationTypeEnum = [
  "low_stock",
  "critical_stock",
  "purchase_order",
  "sale",
  "ai_forecast_ready",
  "system_alert",
] as const;
export type NotificationType = (typeof notificationTypeEnum)[number];

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    userId: varchar("user_id", { length: 21 }), // null = broadcast to whole store
    type: mysqlEnum("type", notificationTypeEnum).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    /** Deep-link payload, e.g. { productId } or { purchaseOrderId } */
    metadata: jsonColumn<Record<string, unknown>>("metadata"),
    isRead: boolean("is_read").notNull().default(false),
    ...timestamps(),
  },
  (table) => [
    index("notifications_store_id_idx").on(table.storeId),
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_type_idx").on(table.type),
  ],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  store: one(stores, { fields: [notifications.storeId], references: [stores.id] }),
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
