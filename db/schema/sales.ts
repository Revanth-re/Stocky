import { mysqlTable, varchar, decimal, mysqlEnum, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { stores } from "./stores";
import { users } from "./users";
import { saleItems } from "./sale-items";
import { customers } from "./customers";

export const paymentMethodEnum = ["cash", "upi", "card", "credit"] as const;
export type PaymentMethod = (typeof paymentMethodEnum)[number];

export const saleStatusEnum = ["completed", "refunded", "voided"] as const;

export const sales = mysqlTable(
  "sales",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    invoiceNumber: varchar("invoice_number", { length: 32 }).notNull(),
    soldById: varchar("sold_by_id", { length: 21 }).notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: mysqlEnum("payment_method", paymentMethodEnum).notNull().default("cash"),
    status: mysqlEnum("status", saleStatusEnum).notNull().default("completed"),
    customerName: varchar("customer_name", { length: 120 }),
    customerPhone: varchar("customer_phone", { length: 20 }),
    /** Set when paymentMethod = "credit" (udhaar) — links this sale to the customer's ledger. */
    customerId: varchar("customer_id", { length: 21 }),
    /** Set when a combo/bundle discount was applied at billing. Purely for traceability/reporting. */
    appliedBundleId: varchar("applied_bundle_id", { length: 21 }),
    ...timestamps(),
  },
  (table) => [
    index("sales_store_id_idx").on(table.storeId),
    index("sales_invoice_number_idx").on(table.invoiceNumber),
    index("sales_sold_by_id_idx").on(table.soldById),
    index("sales_customer_id_idx").on(table.customerId),
  ],
);

export const salesRelations = relations(sales, ({ one, many }) => ({
  store: one(stores, { fields: [sales.storeId], references: [stores.id] }),
  soldBy: one(users, { fields: [sales.soldById], references: [users.id] }),
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  items: many(saleItems),
}));
