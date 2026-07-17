"use client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/auth";
import type {
  DashboardKpis,
  RecentActivityRow,
  SalesChartPoint,
  ProductPerformanceRow,
  DeadStockRow,
} from "@/types/dashboard";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => getJson<{ kpis: DashboardKpis; recentActivity: RecentActivityRow[] }>("/api/dashboard"),
  });
}

export function useAnalytics(range: "7d" | "30d" | "90d" = "7d") {
  return useQuery({
    queryKey: ["analytics", range],
    queryFn: () =>
      getJson<{
        salesChart: SalesChartPoint[];
        topProducts: ProductPerformanceRow[];
        slowProducts: ProductPerformanceRow[];
        deadStock: DeadStockRow[];
      }>(`/api/analytics?range=${range}`),
  });
}
