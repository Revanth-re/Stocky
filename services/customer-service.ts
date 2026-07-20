import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { customers, customerTransactions, activityLogs } from "@/db/schema";
import type { CustomerInput, CustomerListQuery, RecordPaymentInput } from "@/validators/customer";
import type { CustomerListResult, CustomerDetail } from "@/types/customer";

export async function listCustomers(storeId: string, query: CustomerListQuery): Promise<CustomerListResult> {
  const offset = (query.page - 1) * query.pageSize;
  const whereClauses = [
    eq(customers.storeId, storeId),
    query.search ? or(like(customers.name, `%${query.search}%`), like(customers.phone, `%${query.search}%`)) : undefined,
  ].filter(Boolean);

  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        currentBalance: customers.currentBalance,
        creditLimit: customers.creditLimit,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .where(and(...whereClauses))
      .orderBy(desc(customers.currentBalance))
      .limit(query.pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(customers).where(and(...whereClauses)),
  ]);

  return {
    items: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    total: Number(countRows[0]?.count ?? 0),
  };
}

export async function getCustomerDetail(storeId: string, customerId: string): Promise<CustomerDetail | null> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.storeId, storeId), eq(customers.id, customerId)))
    .limit(1);
  if (!customer) return null;

  const transactions = await db
    .select({
      id: customerTransactions.id,
      type: customerTransactions.type,
      amount: customerTransactions.amount,
      balanceAfter: customerTransactions.balanceAfter,
      note: customerTransactions.note,
      saleId: customerTransactions.saleId,
      createdAt: customerTransactions.createdAt,
    })
    .from(customerTransactions)
    .where(eq(customerTransactions.customerId, customerId))
    .orderBy(desc(customerTransactions.createdAt))
    .limit(100);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    creditLimit: customer.creditLimit,
    currentBalance: customer.currentBalance,
    createdAt: customer.createdAt.toISOString(),
    transactions: transactions.map((t) => ({ ...t, saleId: t.saleId ?? null, createdAt: t.createdAt.toISOString() })),
  };
}

export async function createCustomer(storeId: string, input: CustomerInput) {
  const [created] = await db
    .insert(customers)
    .values({ storeId, name: input.name, phone: input.phone, address: input.address || null, creditLimit: input.creditLimit })
    .$returningId();
  return created!.id;
}

export async function updateCustomer(storeId: string, customerId: string, input: CustomerInput) {
  await db
    .update(customers)
    .set({ name: input.name, phone: input.phone, address: input.address || null, creditLimit: input.creditLimit })
    .where(and(eq(customers.storeId, storeId), eq(customers.id, customerId)));
}

/** Records a payment against a customer's udhaar balance, reducing what they owe. */
export async function recordPayment(storeId: string, userId: string, customerId: string, input: RecordPaymentInput) {
  return db.transaction(async (tx) => {
    const [customer] = await tx
      .select()
      .from(customers)
      .where(and(eq(customers.storeId, storeId), eq(customers.id, customerId)))
      .limit(1);
    if (!customer) throw new Error("Customer not found");

    const newBalance = customer.currentBalance - input.amount;

    await tx.update(customers).set({ currentBalance: newBalance }).where(eq(customers.id, customerId));

    await tx.insert(customerTransactions).values({
      storeId,
      customerId,
      type: "payment",
      amount: -input.amount,
      balanceAfter: newBalance,
      note: input.note || null,
      createdAt: new Date(),
    });

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "customer",
      entityId: customerId,
      action: "payment_recorded",
      description: `Recorded ₹${input.amount.toFixed(2)} payment from ${customer.name}`,
      metadata: { amount: input.amount, newBalance },
      createdAt: new Date(),
    });

    return { newBalance };
  });
}
