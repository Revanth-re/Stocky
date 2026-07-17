import { getDashboardKpis, getRecentActivity } from "@/services/dashboard-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    const [kpis, recentActivity] = await Promise.all([
      getDashboardKpis(session.storeId),
      getRecentActivity(session.storeId),
    ]);
    return ok({ kpis, recentActivity });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/dashboard]", error);
    return fail("Could not load dashboard", 500);
  }
}
