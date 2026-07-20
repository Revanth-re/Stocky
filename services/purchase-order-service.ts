import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import {
  purchaseOrders,
  purchaseOrderItems,
  suppliers,
  products,
  inventory,
  inventoryBatches,
  users,
  stores,
  activityLogs,
  notifications,
} from "@/db/schema";
import { computeStockStatus } from "@/lib/inventory-status";
import type { CreatePurchaseOrderInput } from "@/validators/purchase-order";
import type { PurchaseOrderDetail, PurchaseOrderListRow } from "@/types/purchase-order";
import type { PurchaseOrderStatus } from "@/db/schema";

async function nextPoNumber(storeId: string) {
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrders).where(eq(purchaseOrders.storeId, storeId));
  return `PO-${String(Number(countRow?.count ?? 0) + 1).padStart(5, "0")}`;
}

export async function createPurchaseOrder(
  storeId: string,
  userId: string,
  input: CreatePurchaseOrderInput,
  sourcedFromForecast = false,
) {
  return db.transaction(async (tx) => {
    const poId = nanoid();
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantityOrdered * item.unitCost, 0);
    const poNumber = await nextPoNumber(storeId);

    await tx.insert(purchaseOrders).values({
      id: poId,
      storeId,
      poNumber,
      supplierId: input.supplierId,
      createdById: userId,
      status: "ordered",
      totalAmount: totalAmount.toFixed(2),
      expectedDeliveryDate: input.expectedDeliveryDate || null,
      notes: input.notes || null,
      sourcedFromForecast: sourcedFromForecast ? "true" : "false",
    });

    await tx.insert(purchaseOrderItems).values(
      input.items.map((item) => ({
        id: nanoid(),
        purchaseOrderId: poId,
        productId: item.productId,
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost.toFixed(2),
        lineTotal: (item.quantityOrdered * item.unitCost).toFixed(2),
      })),
    );

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "purchase_order",
      entityId: poId,
      action: "created",
      description: `Created purchase order ${poNumber}`,
      createdAt: new Date(),
      metadata: null,
    });

    await tx.insert(notifications).values({
      storeId,
      type: "purchase_order",
      title: "Purchase order created",
      message: `${poNumber} has been sent to the supplier.`,
      metadata: { purchaseOrderId: poId },
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false,
    });

    return { id: poId, poNumber };
  });
}

export async function updatePurchaseOrderStatus(
  storeId: string,
  userId: string,
  poId: string,
  status: PurchaseOrderStatus,
  itemExpiries?: { productId: string; expiryDate?: string }[],
) {
  await db.transaction(async (tx) => {
    await tx.update(purchaseOrders).set({ status, receivedAt: status === "received" ? new Date().toISOString() : undefined }).where(
      and(eq(purchaseOrders.storeId, storeId), eq(purchaseOrders.id, poId)),
    );

    if (status === "received") {
      const items = await tx.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, poId));
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
        const [inv] = await tx.select().from(inventory).where(eq(inventory.productId, item.productId)).limit(1);
        if (!product) continue;

        const newQuantity = (inv?.quantity ?? 0) + item.quantityOrdered;
        await tx
          .update(inventory)
          .set({ quantity: newQuantity, status: computeStockStatus(newQuantity, product.minStock), lastRestockedAt: new Date().toISOString() })
          .where(eq(inventory.productId, item.productId));

        await tx.update(purchaseOrderItems).set({ quantityReceived: item.quantityOrdered }).where(eq(purchaseOrderItems.id, item.id));

        const expiryDate = itemExpiries?.find((e) => e.productId === item.productId)?.expiryDate;
        await tx.insert(inventoryBatches).values({
          storeId,
          productId: item.productId,
          quantity: item.quantityOrdered,
          expiryDate: expiryDate || null,
          source: "purchase_order",
          purchaseOrderId: poId,
        });
      }
    }

    await tx.insert(activityLogs).values({
      storeId,
      userId,
      entityType: "purchase_order",
      entityId: poId,
      action: "status_changed",
      description: `Purchase order marked as ${status}`,
      createdAt: new Date(),
      metadata: null,
    });
  });
}

export async function listPurchaseOrders(storeId: string, page: number, pageSize: number): Promise<{ items: PurchaseOrderListRow[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: purchaseOrders.id,
        poNumber: purchaseOrders.poNumber,
        supplierName: suppliers.name,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
        createdAt: purchaseOrders.createdAt,
        itemCount: sql<number>`(select count(*) from ${purchaseOrderItems} where ${purchaseOrderItems.purchaseOrderId} = ${purchaseOrders.id})`,
      })
      .from(purchaseOrders)
      .innerJoin(suppliers, eq(suppliers.id, purchaseOrders.supplierId))
      .where(eq(purchaseOrders.storeId, storeId))
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(purchaseOrders).where(eq(purchaseOrders.storeId, storeId)),
  ]);

  return {
    items: rows.map((r) => ({ ...r, totalAmount: Number(r.totalAmount), itemCount: Number(r.itemCount), createdAt: r.createdAt.toISOString() })),
    total: Number(countRows[0]?.count ?? 0),
  };
}

export async function getPurchaseOrderDetail(storeId: string, poId: string): Promise<PurchaseOrderDetail | null> {
  const [po] = await db
    .select({
      id: purchaseOrders.id,
      poNumber: purchaseOrders.poNumber,
      status: purchaseOrders.status,
      supplierName: suppliers.name,
      supplierPhone: suppliers.phone,
      storeName: stores.name,
      createdByName: users.name,
      totalAmount: purchaseOrders.totalAmount,
      expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
      receivedAt: purchaseOrders.receivedAt,
      notes: purchaseOrders.notes,
      sourcedFromForecast: purchaseOrders.sourcedFromForecast,
      createdAt: purchaseOrders.createdAt,
    })
    .from(purchaseOrders)
    .innerJoin(suppliers, eq(suppliers.id, purchaseOrders.supplierId))
    .innerJoin(stores, eq(stores.id, purchaseOrders.storeId))
    .leftJoin(users, eq(users.id, purchaseOrders.createdById))
    .where(and(eq(purchaseOrders.storeId, storeId), eq(purchaseOrders.id, poId)))
    .limit(1);

  if (!po) return null;

  const items = await db
    .select({
      productId: purchaseOrderItems.productId,
      productName: products.name,
      quantityOrdered: purchaseOrderItems.quantityOrdered,
      quantityReceived: purchaseOrderItems.quantityReceived,
      unitCost: purchaseOrderItems.unitCost,
      lineTotal: purchaseOrderItems.lineTotal,
    })
    .from(purchaseOrderItems)
    .innerJoin(products, eq(products.id, purchaseOrderItems.productId))
    .where(eq(purchaseOrderItems.purchaseOrderId, poId));

  return {
    ...po,
    totalAmount: Number(po.totalAmount),
    sourcedFromForecast: po.sourcedFromForecast === "true",
    createdAt: po.createdAt.toISOString(),
    items: items.map((i) => ({ ...i, unitCost: Number(i.unitCost), lineTotal: Number(i.lineTotal) })),
  };
}
