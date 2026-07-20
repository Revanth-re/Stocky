import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { AiRecommendationCard } from "@/features/dashboard/components/ai-recommendation-card";
import { SalesChartCard } from "@/features/dashboard/components/sales-chart-card";
import { RecentActivityCard } from "@/features/dashboard/components/recent-activity-card";
import { ProductInsightsSection } from "@/features/dashboard/components/product-insights-section";
import { DashboardHeading } from "@/features/dashboard/components/dashboard-heading";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <DashboardHeading firstName={session?.name.split(" ")[0] ?? ""} />

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
