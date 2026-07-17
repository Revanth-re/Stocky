export type DashboardKpis = {
  todaysSales: number;
  todaysSalesDeltaPct: number;
  revenue: number;
  revenueDeltaPct: number;
  profit: number;
  profitDeltaPct: number;
  inventoryValue: number;
  inventoryHealthPct: number; // % of SKUs at "good" stock status
  lowStockCount: number;
  pendingOrders: number;
};

export type SalesChartPoint = { label: string; sales: number };

export type ProductPerformanceRow = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
};

export type DeadStockRow = {
  productId: string;
  name: string;
  currentStock: number;
  daysSinceLastSale: number;
};

export type RecentActivityRow = {
  id: string;
  description: string;
  actorName: string | null;
  createdAt: string;
};

export type DeadStockRow2 = DeadStockRow; // alias kept for backward-compat imports
