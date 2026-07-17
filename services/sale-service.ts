import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { sales, saleItems, products, inventory, activityLogs, users, notifications, stores } from "@/db/schema";
import { computeStockStatus } from "@/lib/inventory-status";
import type { RecordSaleInput } from "@/validators/sale";
import type { SaleDetail, SaleListRow } from "@/types/sale";

async function nextInvoiceNumber(storeId: string) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(sales).where(eq(sales.storeId, storeId));
  return `INV-${String(Number(count) + 1).padStart(5, "0")}`;
}

/** Records a sale: validates stock, decrements inventory, computes totals, logs activity, and fires a low-stock notification if needed. */
export async function recordSale(storeId: string, userId: string, input: RecordSaleInput) {
  return db.transaction(async (tx) => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    const itemsToInsert: (typeof saleItems.$inferInsert)[] = [];
    const saleId = nanoid();

    for (const item of input.items) {
      const [product] = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      const [inv] = await tx.select().from(inventory).where(eq(inventory.productId, item.productId)).limit(1);
      const currentStock = inv?.quantity ?? 0;
      if (currentStock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name} (only ${currentStock} left)`);
      }

      const unitPrice = Number(product.sellingPrice);
      const lineSubtotal = unitPrice * item.quantity - item.discountAmount;
      const lineTax = lineSubtotal * (Number(product.taxPercent) / 100);

      subtotal += unitPrice * item.quantity;
      discountTotal += item.discountAmount;
      taxTotal += lineTax;

      itemsToInsert.push({
        id: nanoid(),
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        discountAmount: item.discountAmount.toFixed(2),
        lineTotal: (lineSubtotal + lineTax).toFixed(2),
      });

      const newQuantity = currentStock - item.quantity;
      await tx
        .update(inventory)
        .set({
          quantity: newQuantity,
          status: computeStockStatus(newQuantity, product.minStock),
          lastSoldAt: new Date().toISOString(),
        })
        .where(eq(inventory.productId, item.productId));

      if (newQuantity <= product.minStock) {
        await tx.insert(notifications).values({
          storeId,
          type: newQuantity === 0 ? "critical_stock" : "low_stock",
          title: newQuantity === 0 ? "Out of stock" : "Running low on stock",
          message: `${product.name} is down to ${newQuantity} ${product.unit}.`,
          metadata: { productId: product.id },
          createdAt: new Date(),
          updatedAt: new Date(),
          isRead: false,
        });
      }
    }

    const totalAmount = subtotal - discountTotal + taxTotal;
    const invoiceNumber = await nextInvoiceNumber(storeId);

    await tx.insert(sales).values({
      id: saleId,
      storeId,
      invoiceNumber,
      soldById: userId,
      subtotal: subtotal.toFixed(2),
      discountAmount: discountTotal.toFixed(2),
      taxAmount: taxTotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paymentMethod: input.paymentMethod,
      customerName: input.customerName || null,
      customerPhone: input.customerPhone || null,
    });

    await tx.insert(saleItems).values(itemsToInsert);

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "sale",
      entityId: saleId,
      action: "created",
      description: `Recorded sale ${invoiceNumber} for ${formatMoney(totalAmount)}`,
      createdAt: new Date(),
      metadata: null,
    });

    return { saleId, invoiceNumber };
  });
}

function formatMoney(value: number) {
  return `₹${value.toFixed(2)}`;
}

export async function listSales(storeId: string, page: number, pageSize: number): Promise<{ items: SaleListRow[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        soldByName: users.name,
        createdAt: sales.createdAt,
        itemCount: sql<number>`(select count(*) from ${saleItems} where ${saleItems.saleId} = ${sales.id})`,
      })
      .from(sales)
      .leftJoin(users, eq(users.id, sales.soldById))
      .where(eq(sales.storeId, storeId))
      .orderBy(desc(sales.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(sales).where(eq(sales.storeId, storeId)),
  ]);

  return {
    items: rows.map((r) => ({ ...r, totalAmount: Number(r.totalAmount), itemCount: Number(r.itemCount), createdAt: r.createdAt.toISOString() })),
    total: Number(count),
  };
}

export async function getSaleDetail(storeId: string, saleId: string): Promise<SaleDetail | null> {
  const [sale] = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      subtotal: sales.subtotal,
      discountAmount: sales.discountAmount,
      taxAmount: sales.taxAmount,
      totalAmount: sales.totalAmount,
      paymentMethod: sales.paymentMethod,
      customerName: sales.customerName,
      customerPhone: sales.customerPhone,
      soldByName: users.name,
      storeName: stores.name,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .leftJoin(users, eq(users.id, sales.soldById))
    .innerJoin(stores, eq(stores.id, sales.storeId))
    .where(and(eq(sales.storeId, storeId), eq(sales.id, saleId)))
    .limit(1);

  if (!sale) return null;

  const items = await db
    .select({
      productId: saleItems.productId,
      productName: products.name,
      quantity: saleItems.quantity,
      unitPrice: saleItems.unitPrice,
      discountAmount: saleItems.discountAmount,
      lineTotal: saleItems.lineTotal,
    })
    .from(saleItems)
    .innerJoin(products, eq(products.id, saleItems.productId))
    .where(eq(saleItems.saleId, saleId));

  return {
    ...sale,
    subtotal: Number(sale.subtotal),
    discountAmount: Number(sale.discountAmount),
    taxAmount: Number(sale.taxAmount),
    totalAmount: Number(sale.totalAmount),
    createdAt: sale.createdAt.toISOString(),
    items: items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      discountAmount: Number(i.discountAmount),
      lineTotal: Number(i.lineTotal),
    })),
  };
}
