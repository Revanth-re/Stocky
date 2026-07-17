import { NextRequest } from "next/server";
import {
  getSalesChartSeries,
  getTopSellingProducts,
  getSlowMovingProducts,
  getDeadStock,
} from "@/services/dashboard-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail } from "@/lib/api-response";

/**
 * General analytics endpoint. `range` selects the chart bucket size, mirroring
 * the shape the future Python service will use for richer analytics
 * (seasonality, cohort, profit optimization) so the frontend contract stays stable.
 */
export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") ?? "7d";
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;

  try {
    const session = await requireSession();
    const [salesChart, topProducts, slowProducts, deadStock] = await Promise.all([
      getSalesChartSeries(session.storeId, days as 7 | 30 | 90),
      getTopSellingProducts(session.storeId),
      getSlowMovingProducts(session.storeId),
      getDeadStock(session.storeId),
    ]);
    return ok({ salesChart, topProducts, slowProducts, deadStock });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/analytics]", error);
    return fail("Could not load analytics", 500);
  }
}
