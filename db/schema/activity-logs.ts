import { mysqlTable, varchar, text, mysqlEnum, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { stores } from "./stores";
import { users } from "./users";

export const activityEntityEnum = [
  "product",
  "inventory",
  "sale",
  "purchase_order",
  "supplier",
  "user",
  "forecast",
  "settings",
] as const;

export const activityActionEnum = [
  "created",
  "updated",
  "deleted",
  "stock_in",
  "stock_out",
  "status_changed",
  "login",
  "logout",
] as const;

/** Append-only audit trail powering "Recent Activities" and product timelines. */
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    userId: varchar("user_id", { length: 21 }),
    entityType: mysqlEnum("entity_type", activityEntityEnum).notNull(),
    entityId: varchar("entity_id", { length: 21 }).notNull(),
    action: mysqlEnum("action", activityActionEnum).notNull(),
    description: text("description").notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamps().createdAt,
  },
  (table) => [
    index("activity_logs_store_id_idx").on(table.storeId),
    index("activity_logs_entity_idx").on(table.entityType, table.entityId),
    index("activity_logs_user_id_idx").on(table.userId),
  ],
);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  store: one(stores, { fields: [activityLogs.storeId], references: [stores.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));
