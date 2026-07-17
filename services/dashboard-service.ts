import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sales, saleItems, products, inventory, purchaseOrders, activityLogs, users } from "@/db/schema";
import type {
  DashboardKpis,
  SalesChartPoint,
  ProductPerformanceRow,
  RecentActivityRow,
} from "@/types/dashboard";

function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Aggregate KPI tile data for the dashboard header row. */
export async function getDashboardKpis(storeId: string): Promise<DashboardKpis> {
  const today = startOfDay(0);
  const yesterday = startOfDay(1);

  const [[todayAgg], [yesterdayAgg], [inventoryAgg], [lowStockAgg], [pendingOrdersAgg]] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${sales.totalAmount}), 0)` })
      .from(sales)
      .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, today))),
    db
      .select({ total: sql<number>`coalesce(sum(${sales.totalAmount}), 0)` })
      .from(sales)
      .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, yesterday), sql`${sales.createdAt} < ${today}`)),
    db
      .select({
        value: sql<number>`coalesce(sum(${inventory.quantity} * ${products.purchasePrice}), 0)`,
        good: sql<number>`sum(case when ${inventory.status} = 'good' then 1 else 0 end)`,
        total: sql<number>`count(*)`,
      })
      .from(inventory)
      .innerJoin(products, eq(products.id, inventory.productId))
      .where(eq(inventory.storeId, storeId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(and(eq(inventory.storeId, storeId), sql`${inventory.status} in ('low', 'critical', 'out_of_stock')`)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(purchaseOrders)
      .where(and(eq(purchaseOrders.storeId, storeId), eq(purchaseOrders.status, "ordered"))),
  ]);

  const todaysSales = Number(todayAgg?.total ?? 0);
  const prevDaySales = Number(yesterdayAgg?.total ?? 0);
  const revenue = todaysSales; // simplistic: extend with date-range param for weekly/monthly revenue
  const profit = revenue * 0.22; // placeholder margin until COGS ledger is wired up
  const inventoryHealthPct = inventoryAgg?.total ? Math.round((Number(inventoryAgg.good) / Number(inventoryAgg.total)) * 100) : 100;

  return {
    todaysSales,
    todaysSalesDeltaPct: prevDaySales ? ((todaysSales - prevDaySales) / prevDaySales) * 100 : 0,
    revenue,
    revenueDeltaPct: prevDaySales ? ((todaysSales - prevDaySales) / prevDaySales) * 100 : 0,
    profit,
    profitDeltaPct: 0,
    inventoryValue: Number(inventoryAgg?.value ?? 0),
    inventoryHealthPct,
    lowStockCount: Number(lowStockAgg?.count ?? 0),
    pendingOrders: Number(pendingOrdersAgg?.count ?? 0),
  };
}

/** Sales series bucketed by day for the last N days (used for daily/weekly/monthly chart tabs). */
export async function getSalesChartSeries(storeId: string, days: 7 | 30 | 90): Promise<SalesChartPoint[]> {
  const since = startOfDay(days - 1);
  const rows = await db
    .select({
      day: sql<string>`date(${sales.createdAt})`,
      total: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since)))
    .groupBy(sql`date(${sales.createdAt})`)
    .orderBy(sql`date(${sales.createdAt})`);

  const byDay = new Map(rows.map((r) => [r.day, Number(r.total)]));
  const series: SalesChartPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(i);
    const key = date.toISOString().slice(0, 10);
    series.push({
      label: date.toLocaleDateString("en-IN", { weekday: days <= 7 ? "short" : undefined, day: "numeric", month: days > 7 ? "short" : undefined }),
      sales: byDay.get(key) ?? 0,
    });
  }
  return series;
}

/** Top-selling products in the last 30 days, ranked by revenue. */
export async function getTopSellingProducts(storeId: string, limit = 5): Promise<ProductPerformanceRow[]> {
  const since = startOfDay(30);
  const rows = await db
    .select({
      productId: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      unitsSold: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
      revenue: sql<number>`coalesce(sum(${saleItems.lineTotal}), 0)`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(sales.id, saleItems.saleId))
    .innerJoin(products, eq(products.id, saleItems.productId))
    .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since)))
    .groupBy(products.id, products.name, products.imageUrl)
    .orderBy(desc(sql`sum(${saleItems.lineTotal})`))
    .limit(limit);

  return rows.map((r) => ({ ...r, unitsSold: Number(r.unitsSold), revenue: Number(r.revenue) }));
}

/** Slowest-selling active products in the last 30 days (lowest units sold, excludes dead stock). */
export async function getSlowMovingProducts(storeId: string, limit = 5): Promise<ProductPerformanceRow[]> {
  const since = startOfDay(30);
  const rows = await db
    .select({
      productId: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      unitsSold: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
      revenue: sql<number>`coalesce(sum(${saleItems.lineTotal}), 0)`,
    })
    .from(products)
    .leftJoin(saleItems, eq(saleItems.productId, products.id))
    .leftJoin(sales, and(eq(sales.id, saleItems.saleId), gte(sales.createdAt, since)))
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))
    .groupBy(products.id, products.name, products.imageUrl)
    .orderBy(sql`coalesce(sum(${saleItems.quantity}), 0) asc`)
    .limit(limit);

  return rows.map((r) => ({ ...r, unitsSold: Number(r.unitsSold), revenue: Number(r.revenue) }));
}

/** Recent store activity for the dashboard feed. */
export async function getRecentActivity(storeId: string, limit = 8): Promise<RecentActivityRow[]> {
  const rows = await db
    .select({
      id: activityLogs.id,
      description: activityLogs.description,
      actorName: users.name,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.userId))
    .where(eq(activityLogs.storeId, storeId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Products with stock on hand but no sales in 60+ days ("dead stock"). */
export async function getDeadStock(storeId: string, limit = 5) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);

  const rows = await db
    .select({
      productId: products.id,
      name: products.name,
      currentStock: inventory.quantity,
      lastSoldAt: inventory.lastSoldAt,
    })
    .from(products)
    .innerJoin(inventory, eq(inventory.productId, products.id))
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isActive, true),
        sql`${inventory.quantity} > 0`,
        sql`(${inventory.lastSoldAt} is null or ${inventory.lastSoldAt} < ${cutoff.toISOString()})`,
      ),
    )
    .orderBy(sql`${inventory.lastSoldAt} asc`)
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    name: r.name,
    currentStock: r.currentStock,
    daysSinceLastSale: r.lastSoldAt
      ? Math.floor((Date.now() - new Date(r.lastSoldAt).getTime()) / 86_400_000)
      : 999,
  }));
}
