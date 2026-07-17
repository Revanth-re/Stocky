import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { forecasts, inventory, products, saleItems, sales } from "@/db/schema";
import type { ForecastDTO, ForecastSummary } from "@/types/forecast";
import type { ForecastPriority } from "@/db/schema";
import { nanoid } from "nanoid";
import { generateForecastsWithGemini } from "./ai-forecast-service";

/**
 * PLACEHOLDER GENERATOR — NOT real demand forecasting.
 *
 * This exists purely so the AI Forecast UI has realistic-shaped data to render
 * end-to-end before the dedicated Python service (FastAPI + Prophet + XGBoost)
 * is wired up. It uses a naive "average daily sales velocity over the last 14
 * days" heuristic — no seasonality, no festival-awareness, no ML.
 *
 * Swap-out plan: replace the body of `runPlaceholderForecast` with a call to
 * `AI_SERVICE_URL/forecast`, keep the same `ForecastDTO` return shape, and
 * nothing in the frontend needs to change.
 */
export async function runPlaceholderForecast(storeId: string, productIds?: string[]) {
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const velocityRows = await db
    .select({
      productId: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      unit: products.unit,
      minStock: products.minStock,
      currentStock: sql<number>`coalesce(${inventory.quantity}, 0)`,
      unitsSold14d: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .leftJoin(saleItems, eq(saleItems.productId, products.id))
    .leftJoin(sales, and(eq(sales.id, saleItems.saleId), gte(sales.createdAt, since)))
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isActive, true),
        productIds?.length ? sql`${products.id} in ${productIds}` : sql`1=1`,
      ),
    )
    .groupBy(products.id, products.name, products.imageUrl, products.unit, products.minStock, inventory.quantity);

  const now = new Date().toISOString();
  const rowsToInsert = velocityRows.map((row) => {
    const dailyVelocity = Number(row.unitsSold14d) / 14;
    const predictedDemand = Math.max(1, Math.round(dailyVelocity * 7)); // next-7-day projection
    const suggestedOrderQty = Math.max(0, predictedDemand + row.minStock - Number(row.currentStock));
    const daysOfCoverLeft = dailyVelocity > 0 ? Number(row.currentStock) / dailyVelocity : 99;

    let priority: ForecastPriority = "low";
    if (daysOfCoverLeft <= 2) priority = "high";
    else if (daysOfCoverLeft <= 5) priority = "medium";

    // Confidence scales with how much sales history we actually have to work with.
    const confidenceScore = Math.min(96, 55 + Number(row.unitsSold14d) * 1.5);

    const willStockOutAt =
      dailyVelocity > 0
        ? new Date(Date.now() + daysOfCoverLeft * 86_400_000).toISOString()
        : null;

    const reason =
      dailyVelocity > 0
        ? `Selling ~${dailyVelocity.toFixed(1)}/day over the last 14 days. At this rate, stock runs out in ${Math.max(0, Math.round(daysOfCoverLeft))} day${Math.round(daysOfCoverLeft) === 1 ? "" : "s"}.`
        : "No recent sales history — using minimum stock threshold as a baseline.";

    return {
      id: nanoid(),
      storeId,
      productId: row.productId,
      currentStock: Number(row.currentStock),
      predictedDemand,
      suggestedOrderQty,
      confidenceScore: confidenceScore.toFixed(2),
      priority,
      status: "ready" as const,
      reason,
      series: buildSparkline(dailyVelocity, Number(row.currentStock)),
      willStockOutAt,
      generatedAt: now,
      modelMeta: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  if (rowsToInsert.length > 0) {
    await db.insert(forecasts).values(rowsToInsert);
  }

  return rowsToInsert.length;
}

function buildSparkline(dailyVelocity: number, currentStock: number) {
  const series: Array<{ date: string; actual?: number; predicted: number }> = [];
  let projectedStock = currentStock;
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    projectedStock = Math.max(0, projectedStock - dailyVelocity);
    series.push({ date: date.toISOString().slice(0, 10), predicted: Math.round(projectedStock) });
  }
  return series;
}

export async function listForecasts(
  storeId: string,
  priority?: ForecastPriority,
  productId?: string,
): Promise<ForecastDTO[]> {
  const rows = await db
    .select({
      id: forecasts.id,
      productId: forecasts.productId,
      productName: products.name,
      productImageUrl: products.imageUrl,
      unit: products.unit,
      currentStock: forecasts.currentStock,
      predictedDemand: forecasts.predictedDemand,
      suggestedOrderQty: forecasts.suggestedOrderQty,
      confidenceScore: forecasts.confidenceScore,
      priority: forecasts.priority,
      reason: forecasts.reason,
      series: forecasts.series,
      modelMeta: forecasts.modelMeta,
      willStockOutAt: forecasts.willStockOutAt,
      generatedAt: forecasts.generatedAt,
    })
    .from(forecasts)
    .innerJoin(products, eq(products.id, forecasts.productId))
    .where(
      and(
        eq(forecasts.storeId, storeId),
        priority ? eq(forecasts.priority, priority) : sql`1=1`,
        productId ? eq(forecasts.productId, productId) : sql`1=1`,
      ),
    )
    .orderBy(desc(forecasts.generatedAt))
    .limit(100);

  return rows.map((r) => {
    const meta = (r.modelMeta ?? {}) as Record<string, unknown>;
    return {
      ...r,
      confidenceScore: Number(r.confidenceScore),
      reason: r.reason ?? "",
      series: Array.isArray(r.series) ? r.series : [],
      engine: (meta.engine as "gemini" | "heuristic" | undefined) ?? "heuristic",
      predictedDemand30d: typeof meta.predictedDemand30d === "number" ? meta.predictedDemand30d : undefined,
      marketDemandTrend: meta.marketDemandTrend as "rising" | "stable" | "declining" | undefined,
    };
  });
}

export async function getForecastSummary(storeId: string): Promise<ForecastSummary> {
  const rows = await listForecasts(storeId);
  return {
    totalItems: rows.length,
    highPriority: rows.filter((r) => r.priority === "high").length,
    mediumPriority: rows.filter((r) => r.priority === "medium").length,
    lowPriority: rows.filter((r) => r.priority === "low").length,
    estimatedOrderAmount: rows.reduce((sum, r) => sum + r.suggestedOrderQty * 20, 0), // refined once purchase price is joined
  };
}

/**
 * Orchestrates forecast generation: uses Gemini when LLM_API_KEY is
 * configured, and transparently falls back to the naive heuristic if the
 * key is missing OR the Gemini call fails for any reason (bad response,
 * rate limit, network error) — the "Generate Forecast" button should never
 * just break because of an upstream AI outage.
 */
export async function generateForecasts(storeId: string, productIds?: string[]): Promise<{ count: number; engine: "gemini" | "heuristic" }> {
  if (process.env.LLM_API_KEY) {
    try {
      const count = await generateForecastsWithGemini(storeId, productIds);
      if (count > 0) return { count, engine: "gemini" };
    } catch (error) {
      console.error("[forecast] Gemini generation failed, falling back to heuristic:", error);
    }
  }

  const count = await runPlaceholderForecast(storeId, productIds);
  return { count, engine: "heuristic" };
}
