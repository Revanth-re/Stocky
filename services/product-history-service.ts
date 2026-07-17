import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  saleItems,
  sales,
  purchaseOrderItems,
  purchaseOrders,
  suppliers,
  activityLogs,
  users,
} from "@/db/schema";
import type { ProductHistory } from "@/types/product-history";

export async function getProductHistory(storeId: string, productId: string): Promise<ProductHistory> {
  const [salesRows, purchaseRows, activityRows] = await Promise.all([
    db
      .select({
        id: saleItems.id,
        invoiceNumber: sales.invoiceNumber,
        quantity: saleItems.quantity,
        unitPrice: saleItems.unitPrice,
        lineTotal: saleItems.lineTotal,
        soldAt: sales.createdAt,
      })
      .from(saleItems)
      .innerJoin(sales, eq(sales.id, saleItems.saleId))
      .where(and(eq(sales.storeId, storeId), eq(saleItems.productId, productId)))
      .orderBy(desc(sales.createdAt))
      .limit(50),
    db
      .select({
        id: purchaseOrderItems.id,
        poNumber: purchaseOrders.poNumber,
        supplierName: suppliers.name,
        quantityOrdered: purchaseOrderItems.quantityOrdered,
        quantityReceived: purchaseOrderItems.quantityReceived,
        unitCost: purchaseOrderItems.unitCost,
        status: purchaseOrders.status,
        createdAt: purchaseOrders.createdAt,
      })
      .from(purchaseOrderItems)
      .innerJoin(purchaseOrders, eq(purchaseOrders.id, purchaseOrderItems.purchaseOrderId))
      .innerJoin(suppliers, eq(suppliers.id, purchaseOrders.supplierId))
      .where(and(eq(purchaseOrders.storeId, storeId), eq(purchaseOrderItems.productId, productId)))
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(50),
    db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        description: activityLogs.description,
        actorName: users.name,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .leftJoin(users, eq(users.id, activityLogs.userId))
      .where(and(eq(activityLogs.storeId, storeId), eq(activityLogs.entityId, productId)))
      .orderBy(desc(activityLogs.createdAt))
      .limit(50),
  ]);

  return {
    sales: salesRows.map((r) => ({
      ...r,
      unitPrice: Number(r.unitPrice),
      lineTotal: Number(r.lineTotal),
      soldAt: r.soldAt.toISOString(),
    })),
    purchases: purchaseRows.map((r) => ({ ...r, unitCost: Number(r.unitCost), createdAt: r.createdAt.toISOString() })),
    activity: activityRows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  };
}
