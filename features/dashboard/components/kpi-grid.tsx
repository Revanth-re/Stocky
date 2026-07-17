"use client";
import { IndianRupee, TrendingUp, Wallet, Boxes, HeartPulse, AlertTriangle, ClipboardList } from "lucide-react";
import { useDashboardSummary } from "../api/use-dashboard";
import { KpiCard } from "./kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function KpiGrid() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard label="Today's Sales" value={formatCurrency(kpis.todaysSales)} deltaPct={kpis.todaysSalesDeltaPct} icon={IndianRupee} />
      <KpiCard label="Revenue" value={formatCurrency(kpis.revenue)} deltaPct={kpis.revenueDeltaPct} icon={TrendingUp} />
      <KpiCard label="Profit (Est.)" value={formatCurrency(kpis.profit)} deltaPct={kpis.profitDeltaPct} icon={Wallet} />
      <KpiCard label="Inventory Value" value={formatCurrency(kpis.inventoryValue)} icon={Boxes} hint="Across all active SKUs" />
      <KpiCard label="Inventory Health" value={`${kpis.inventoryHealthPct}%`} icon={HeartPulse} hint="SKUs at healthy stock" />
      <KpiCard label="Low Stock" value={String(kpis.lowStockCount)} icon={AlertTriangle} hint="Items need reorder" />
      <KpiCard label="Pending Orders" value={String(kpis.pendingOrders)} icon={ClipboardList} hint="Awaiting delivery" />
    </div>
  );
}
