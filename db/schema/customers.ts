import { mysqlTable, varchar, text, decimal, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, softDelete } from "./_columns";
import { stores } from "./stores";
import { sales } from "./sales";
import { customerTransactions } from "./customer-transactions";

/**
 * A store's regular/credit ("udhaar") customers. `currentBalance` is a
 * denormalized running total (positive = customer owes the store) kept in
 * sync by customer-service on every credit sale or recorded payment — the
 * full history lives in `customer_transactions`.
 */
export const customers = mysqlTable(
  "customers",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    address: text("address"),
    creditLimit: decimal("credit_limit", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
    currentBalance: decimal("current_balance", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
    ...timestamps(),
    ...softDelete(),
  },
  (table) => [
    index("customers_store_id_idx").on(table.storeId),
    unique("customers_store_phone_unique").on(table.storeId, table.phone),
  ],
);

export const customersRelations = relations(customers, ({ one, many }) => ({
  store: one(stores, { fields: [customers.storeId], references: [stores.id] }),
  sales: many(sales),
  transactions: many(customerTransactions),
}));
