import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { AiRecommendationCard } from "@/features/dashboard/components/ai-recommendation-card";
import { SalesChartCard } from "@/features/dashboard/components/sales-chart-card";
import { RecentActivityCard } from "@/features/dashboard/components/recent-activity-card";
import { ProductInsightsSection } from "@/features/dashboard/components/product-insights-section";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Good morning, {session?.name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s your store overview for today.</p>
      </div>

      <AiRecommendationCard />

      <KpiGrid />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChartCard />
        </div>
        <RecentActivityCard />
      </div>

      <ProductInsightsSection />
    </div>
  );
}
