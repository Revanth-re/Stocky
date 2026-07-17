import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listForecasts, getForecastSummary, generateForecasts } from "@/services/forecast-service";
import { generateForecastSchema } from "@/validators/forecast";
import { ok, fail, failFromZod } from "@/lib/api-response";

/**
 * GET /api/forecast — read the latest persisted forecast rows.
 * Swappable: point this at the Python FastAPI service's GET /forecast
 * later and keep returning the same { summary, items } shape.
 */
export async function GET(req: NextRequest) {
  const priorityParam = req.nextUrl.searchParams.get("priority") as "high" | "medium" | "low" | null;
  const productIdParam = req.nextUrl.searchParams.get("productId");

  try {
    const session = await requireSession();
    const [items, summary] = await Promise.all([
      listForecasts(session.storeId, priorityParam ?? undefined, productIdParam ?? undefined),
      getForecastSummary(session.storeId),
    ]);
    return ok({ items, summary });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/forecast GET]", error);
    return fail("Could not load forecasts", 500);
  }
}

/**
 * POST /api/forecast — (re)generate forecasts. Uses Gemini (LLM_API_KEY) when
 * configured for real predictions; falls back to a naive sales-velocity
 * heuristic otherwise or if the Gemini call fails. See
 * `services/ai-forecast-service.ts` / `services/forecast-service.ts`.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = generateForecastSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const { count, engine } = await generateForecasts(session.storeId, parsed.data.productIds);
    return ok({ generated: count, engine });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/forecast POST]", error);
    return fail("Could not generate forecasts", 500);
  }
}
