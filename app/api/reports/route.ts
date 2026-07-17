import { NextRequest } from "next/server";
import { z } from "zod";
import { buildReport } from "@/services/report-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

const querySchema = z.object({
  type: z.enum([
    "revenue",
    "profit",
    "sales",
    "inventory",
    "fast-moving",
    "slow-moving",
    "dead-stock",
    "category-performance",
  ]),
  range: z.enum(["7d", "30d", "90d"]).default("30d"),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const days = parsed.data.range === "7d" ? 7 : parsed.data.range === "90d" ? 90 : 30;
    const result = await buildReport(session.storeId, parsed.data.type, days);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/reports]", error);
    return fail("Could not build report", 500);
  }
}
