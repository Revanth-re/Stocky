import { mysqlTable, varchar, text, decimal, mysqlEnum, timestamp, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { customers } from "./customers";
import { stores } from "./stores";
import { sales } from "./sales";

export const customerTransactionTypeEnum = ["credit_sale", "payment", "adjustment"] as const;
export type CustomerTransactionType = (typeof customerTransactionTypeEnum)[number];

/** Append-only ledger backing each customer's udhaar/khata balance. */
export const customerTransactions = mysqlTable(
  "customer_transactions",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    customerId: varchar("customer_id", { length: 21 }).notNull(),
    saleId: varchar("sale_id", { length: 21 }),
    type: mysqlEnum("type", customerTransactionTypeEnum).notNull(),
    // Positive = increases what the customer owes (credit sale). Negative = reduces it (payment).
    amount: decimal("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    balanceAfter: decimal("balance_after", { precision: 12, scale: 2, mode: "number" }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("customer_txns_store_id_idx").on(table.storeId),
    index("customer_txns_customer_id_idx").on(table.customerId),
  ],
);

export const customerTransactionsRelations = relations(customerTransactions, ({ one }) => ({
  store: one(stores, { fields: [customerTransactions.storeId], references: [stores.id] }),
  customer: one(customers, { fields: [customerTransactions.customerId], references: [customers.id] }),
  sale: one(sales, { fields: [customerTransactions.saleId], references: [sales.id] }),
}));
