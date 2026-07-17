import { mysqlTable, varchar, text, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, softDelete } from "./_columns";
import { stores } from "./stores";
import { products } from "./products";
import { purchaseOrders } from "./purchase-orders";

export const suppliers = mysqlTable(
  "suppliers",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    contactPerson: varchar("contact_person", { length: 120 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 191 }),
    address: text("address"),
    gstNumber: varchar("gst_number", { length: 20 }),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
    ...softDelete(),
  },
  (table) => [index("suppliers_store_id_idx").on(table.storeId)],
);

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  store: one(stores, { fields: [suppliers.storeId], references: [stores.id] }),
  products: many(products),
  purchaseOrders: many(purchaseOrders),
}));
