import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sales, saleItems, products, inventory, categories } from "@/db/schema";
import { getDeadStock } from "./dashboard-service";
import type { ReportResult, ReportType } from "@/types/report";

function since(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function buildReport(storeId: string, type: ReportType, days: number): Promise<ReportResult> {
  switch (type) {
    case "revenue":
      return revenueReport(storeId, days);
    case "profit":
      return profitReport(storeId, days);
    case "sales":
      return salesReport(storeId, days);
    case "inventory":
      return inventoryReport(storeId);
    case "fast-moving":
      return movementReport(storeId, days, "desc");
    case "slow-moving":
      return movementReport(storeId, days, "asc");
    case "dead-stock":
      return deadStockReport(storeId);
    case "category-performance":
      return categoryPerformanceReport(storeId, days);
  }
}

async function revenueReport(storeId: string, days: number): Promise<ReportResult> {
  const rows = await db
    .select({ day: sql<string>`date(${sales.createdAt})`, revenue: sql<number>`coalesce(sum(${sales.totalAmount}), 0)` })
    .from(sales)
    .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since(days))))
    .groupBy(sql`date(${sales.createdAt})`)
    .orderBy(sql`date(${sales.createdAt})`);

  return {
    title: "Revenue Report",
    description: `Daily revenue over the last ${days} days`,
    columns: [
      { key: "day", label: "Date" },
      { key: "revenue", label: "Revenue", align: "right" },
    ],
    rows: rows.map((r) => ({ day: r.day, revenue: Number(r.revenue) })),
    totals: { day: "Total", revenue: rows.reduce((s, r) => s + Number(r.revenue), 0) },
  };
}

async function profitReport(storeId: string, days: number): Promise<ReportResult> {
  const rows = await db
    .select({
      day: sql<string>`date(${sales.createdAt})`,
      revenue: sql<number>`coalesce(sum(${saleItems.lineTotal}), 0)`,
      cost: sql<number>`coalesce(sum(${saleItems.quantity} * ${products.purchasePrice}), 0)`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(sales.id, saleItems.saleId))
    .innerJoin(products, eq(products.id, saleItems.productId))
    .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since(days))))
    .groupBy(sql`date(${sales.createdAt})`)
    .orderBy(sql`date(${sales.createdAt})`);

  const shaped = rows.map((r) => ({ day: r.day, revenue: Number(r.revenue), cost: Number(r.cost), profit: Number(r.revenue) - Number(r.cost) }));

  return {
    title: "Profit Report",
    description: `Estimated gross profit over the last ${days} days`,
    columns: [
      { key: "day", label: "Date" },
      { key: "revenue", label: "Revenue", align: "right" },
      { key: "cost", label: "COGS", align: "right" },
      { key: "profit", label: "Profit", align: "right" },
    ],
    rows: shaped,
    totals: {
      day: "Total",
      revenue: shaped.reduce((s, r) => s + r.revenue, 0),
      cost: shaped.reduce((s, r) => s + r.cost, 0),
      profit: shaped.reduce((s, r) => s + r.profit, 0),
    },
  };
}

async function salesReport(storeId: string, days: number): Promise<ReportResult> {
  const rows = await db
    .select({
      invoiceNumber: sales.invoiceNumber,
      paymentMethod: sales.paymentMethod,
      totalAmount: sales.totalAmount,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since(days))))
    .orderBy(desc(sales.createdAt))
    .limit(200);

  return {
    title: "Sales Report",
    description: `All sales over the last ${days} days`,
    columns: [
      { key: "invoiceNumber", label: "Invoice" },
      { key: "paymentMethod", label: "Payment" },
      { key: "totalAmount", label: "Total", align: "right" },
      { key: "createdAt", label: "Date" },
    ],
    rows: rows.map((r) => ({
      invoiceNumber: r.invoiceNumber,
      paymentMethod: r.paymentMethod,
      totalAmount: Number(r.totalAmount),
      createdAt: r.createdAt.toISOString().slice(0, 10),
    })),
  };
}

async function inventoryReport(storeId: string): Promise<ReportResult> {
  const rows = await db
    .select({
      name: products.name,
      sku: products.sku,
      quantity: sql<number>`coalesce(${inventory.quantity}, 0)`,
      purchasePrice: products.purchasePrice,
      status: sql<string>`coalesce(${inventory.status}, 'out_of_stock')`,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))
    .orderBy(products.name);

  const shaped = rows.map((r) => ({
    name: r.name,
    sku: r.sku,
    quantity: Number(r.quantity),
    value: Number(r.quantity) * Number(r.purchasePrice),
    status: r.status,
  }));

  return {
    title: "Inventory Report",
    description: "Current stock valuation across all active products",
    columns: [
      { key: "name", label: "Product" },
      { key: "sku", label: "SKU" },
      { key: "quantity", label: "Stock", align: "right" },
      { key: "value", label: "Value", align: "right" },
      { key: "status", label: "Status" },
    ],
    rows: shaped,
    totals: { name: "Total", value: shaped.reduce((s, r) => s + r.value, 0) },
  };
}

async function movementReport(storeId: string, days: number, order: "asc" | "desc"): Promise<ReportResult> {
  const rows = await db
    .select({
      name: products.name,
      unitsSold: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
      revenue: sql<number>`coalesce(sum(${saleItems.lineTotal}), 0)`,
    })
    .from(products)
    .leftJoin(saleItems, eq(saleItems.productId, products.id))
    .leftJoin(sales, and(eq(sales.id, saleItems.saleId), gte(sales.createdAt, since(days))))
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))
    .groupBy(products.id, products.name)
    .orderBy(order === "desc" ? desc(sql`coalesce(sum(${saleItems.quantity}), 0)`) : sql`coalesce(sum(${saleItems.quantity}), 0) asc`)
    .limit(20);

  return {
    title: order === "desc" ? "Fast Moving Products" : "Slow Moving Products",
    description: `Ranked by units sold over the last ${days} days`,
    columns: [
      { key: "name", label: "Product" },
      { key: "unitsSold", label: "Units Sold", align: "right" },
      { key: "revenue", label: "Revenue", align: "right" },
    ],
    rows: rows.map((r) => ({ name: r.name, unitsSold: Number(r.unitsSold), revenue: Number(r.revenue) })),
  };
}

async function deadStockReport(storeId: string): Promise<ReportResult> {
  const rows = await getDeadStock(storeId, 50);
  return {
    title: "Dead Stock Report",
    description: "Products with stock but no sales in 60+ days",
    columns: [
      { key: "name", label: "Product" },
      { key: "currentStock", label: "Stock", align: "right" },
      { key: "daysSinceLastSale", label: "Days Since Last Sale", align: "right" },
    ],
    rows: rows.map((r) => ({ name: r.name, currentStock: r.currentStock, daysSinceLastSale: r.daysSinceLastSale })),
  };
}

async function categoryPerformanceReport(storeId: string, days: number): Promise<ReportResult> {
  const rows = await db
    .select({
      category: sql<string>`coalesce(${categories.name}, 'Uncategorized')`,
      unitsSold: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
      revenue: sql<number>`coalesce(sum(${saleItems.lineTotal}), 0)`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(sales.id, saleItems.saleId))
    .innerJoin(products, eq(products.id, saleItems.productId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since(days))))
    .groupBy(categories.name)
    .orderBy(desc(sql`sum(${saleItems.lineTotal})`));

  return {
    title: "Category Performance",
    description: `Revenue by category over the last ${days} days`,
    columns: [
      { key: "category", label: "Category" },
      { key: "unitsSold", label: "Units Sold", align: "right" },
      { key: "revenue", label: "Revenue", align: "right" },
    ],
    rows: rows.map((r) => ({ category: r.category, unitsSold: Number(r.unitsSold), revenue: Number(r.revenue) })),
  };
}
