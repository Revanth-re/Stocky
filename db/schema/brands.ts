import { mysqlTable, varchar, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { products } from "./products";

/** Global catalog brands (Amul, Nestle, Coca-Cola...) selectable during onboarding. */
export const brands = mysqlTable(
  "brands",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    logoUrl: varchar("logo_url", { length: 512 }),
    isGlobal: boolean("is_global").notNull().default(true),
    storeId: varchar("store_id", { length: 21 }),
    ...timestamps(),
  },
  (table) => [index("brands_slug_idx").on(table.slug)],
);

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));
