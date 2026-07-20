"use client";
import { IndianRupee, TrendingUp, Wallet, Boxes, HeartPulse, AlertTriangle, ClipboardList } from "lucide-react";
import { useDashboardSummary } from "../api/use-dashboard";
import { KpiCard } from "./kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export function KpiGrid() {
  const { data, isLoading } = useDashboardSummary();
  const { t } = useLanguage();

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
      <KpiCard label={t("kpi.todaysSales")} value={formatCurrency(kpis.todaysSales)} deltaPct={kpis.todaysSalesDeltaPct} icon={IndianRupee} />
      <KpiCard label={t("kpi.revenue")} value={formatCurrency(kpis.revenue)} deltaPct={kpis.revenueDeltaPct} icon={TrendingUp} />
      <KpiCard label={t("kpi.profitEst")} value={formatCurrency(kpis.profit)} deltaPct={kpis.profitDeltaPct} icon={Wallet} />
      <KpiCard label={t("kpi.inventoryValue")} value={formatCurrency(kpis.inventoryValue)} icon={Boxes} hint={t("kpi.acrossActiveSkus")} />
      <KpiCard label={t("kpi.inventoryHealth")} value={`${kpis.inventoryHealthPct}%`} icon={HeartPulse} hint={t("kpi.healthyStock")} />
      <KpiCard label={t("kpi.lowStock")} value={String(kpis.lowStockCount)} icon={AlertTriangle} hint={t("kpi.itemsNeedReorder")} />
      <KpiCard label={t("kpi.pendingOrders")} value={String(kpis.pendingOrders)} icon={ClipboardList} hint={t("kpi.awaitingDelivery")} />
    </div>
  );
}
