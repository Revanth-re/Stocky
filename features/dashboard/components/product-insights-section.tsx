"use client";
import { useAnalytics } from "../api/use-dashboard";
import { ProductPerformanceCard } from "./product-performance-card";
import { DeadStockCard } from "./dead-stock-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n/language-context";

export function ProductInsightsSection() {
  const { data, isLoading } = useAnalytics("30d");
  const { t } = useLanguage();

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ProductPerformanceCard title={t("dashboard.topSelling")} rows={data.topProducts} emptyMessage={t("dashboard.noSalesRecorded")} />
      <ProductPerformanceCard
        title={t("dashboard.fastMoving")}
        rows={data.topProducts.slice(0, 5)}
        emptyMessage={t("dashboard.noSalesRecorded")}
      />
      <ProductPerformanceCard
        title={t("dashboard.slowMoving")}
        rows={data.slowProducts}
        emptyMessage={t("dashboard.notEnoughData")}
      />
      <div className="lg:col-span-3">
        <DeadStockCard rows={data.deadStock} />
      </div>
    </div>
  );
}
