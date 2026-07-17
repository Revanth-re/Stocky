"use client";
import { useAnalytics } from "../api/use-dashboard";
import { ProductPerformanceCard } from "./product-performance-card";
import { DeadStockCard } from "./dead-stock-card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductInsightsSection() {
  const { data, isLoading } = useAnalytics("30d");

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
      <ProductPerformanceCard title="Top Selling Products" rows={data.topProducts} emptyMessage="No sales recorded yet." />
      <ProductPerformanceCard
        title="Fast Moving Products"
        rows={data.topProducts.slice(0, 5)}
        emptyMessage="No sales recorded yet."
      />
      <ProductPerformanceCard
        title="Slow Moving Products"
        rows={data.slowProducts}
        emptyMessage="Not enough data yet."
      />
      <div className="lg:col-span-3">
        <DeadStockCard rows={data.deadStock} />
      </div>
    </div>
  );
}
