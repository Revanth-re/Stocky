import { mysqlTable, varchar, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { products } from "./products";

export const categories = mysqlTable(
  "categories",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    icon: varchar("icon", { length: 64 }),
    parentId: varchar("parent_id", { length: 21 }),
    isGlobal: varchar("is_global", { length: 5 }).notNull().default("true"),
    ...timestamps(),
  },
  (table) => [index("categories_store_id_idx").on(table.storeId)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));
