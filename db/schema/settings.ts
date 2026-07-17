import { mysqlTable, varchar, json, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { stores } from "./stores";

/**
 * Generic per-store key/value settings table: theme, language, notification
 * preferences, and the role -> permissions map. Keeps the schema open for
 * new setting categories without further migrations.
 */
export const settings = mysqlTable(
  "settings",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(), // appearance | notifications | permissions | language | general
    key: varchar("key", { length: 120 }).notNull(),
    value: json("value").$type<unknown>(),
    ...timestamps(),
  },
  (table) => [
    index("settings_store_id_idx").on(table.storeId),
    unique("settings_store_category_key_unique").on(table.storeId, table.category, table.key),
  ],
);

export const settingsRelations = relations(settings, ({ one }) => ({
  store: one(stores, { fields: [settings.storeId], references: [stores.id] }),
}));
