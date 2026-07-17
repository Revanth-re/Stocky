import { and, eq, gte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { forecasts, inventory, products, saleItems, sales, stores } from "@/db/schema";
import { generateJson, LLM_MODEL } from "@/lib/ai/gemini-client";
import { geminiForecastResponseSchema, type GeminiForecastItem } from "@/validators/ai-forecast";
import { getWeatherOutlook, summarizeWeatherOutlook } from "@/lib/weather/open-meteo";
import { getMarketContext } from "@/services/market-context-service";
import type { ForecastPriority } from "@/db/schema";

const BATCH_SIZE = 10; // products per Gemini call — keeps prompts small & fast

type PeriodSummary = { totalUnits: number; dailyAvg: number; trendPct: number | null };

type ProductSalesProfile = {
  productId: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  last7Days: PeriodSummary;
  last30Days: PeriodSummary;
  dailyLast30: { date: string; units: number }[];
  weeklyLast12: { weekStart: string; units: number }[];
};

function summarizePeriod(daily: { date: string; units: number }[], days: number, previousTotal: number): PeriodSummary {
  const totalUnits = daily.reduce((sum, d) => sum + d.units, 0);
  const trendPct = previousTotal > 0 ? Math.round(((totalUnits - previousTotal) / previousTotal) * 100) : null;
  return { totalUnits, dailyAvg: Number((totalUnits / days).toFixed(2)), trendPct };
}

async function buildSalesProfiles(storeId: string, productIds?: string[]): Promise<ProductSalesProfile[]> {
  const since60 = new Date();
  since60.setDate(since60.getDate() - 60);
  const since84 = new Date();
  since84.setDate(since84.getDate() - 84);

  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      minStock: products.minStock,
      currentStock: sql<number>`coalesce(${inventory.quantity}, 0)`,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isActive, true),
        productIds?.length ? sql`${products.id} in ${productIds}` : sql`1=1`,
      ),
    );

  if (productRows.length === 0) return [];

  const [dailyRows, weeklyRows] = await Promise.all([
    db
      .select({
        productId: saleItems.productId,
        day: sql<string>`date(${sales.createdAt})`,
        units: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(sales.id, saleItems.saleId))
      .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since60)))
      .groupBy(saleItems.productId, sql`date(${sales.createdAt})`),
    db
      .select({
        productId: saleItems.productId,
        weekStart: sql<string>`date(date_sub(${sales.createdAt}, interval weekday(${sales.createdAt}) day))`,
        units: sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(sales.id, saleItems.saleId))
      .where(and(eq(sales.storeId, storeId), gte(sales.createdAt, since84)))
      .groupBy(saleItems.productId, sql`date(date_sub(${sales.createdAt}, interval weekday(${sales.createdAt}) day))`),
  ]);

  const dailyByProduct = new Map<string, { date: string; units: number }[]>();
  for (const row of dailyRows) {
    const list = dailyByProduct.get(row.productId) ?? [];
    list.push({ date: row.day, units: Number(row.units) });
    dailyByProduct.set(row.productId, list);
  }

  const weeklyByProduct = new Map<string, { weekStart: string; units: number }[]>();
  for (const row of weeklyRows) {
    const list = weeklyByProduct.get(row.productId) ?? [];
    list.push({ weekStart: row.weekStart, units: Number(row.units) });
    weeklyByProduct.set(row.productId, list);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  return productRows.map((p) => {
    const daily60 = (dailyByProduct.get(p.id) ?? []).sort((a, b) => a.date.localeCompare(b.date));
    const last7 = daily60.filter((d) => d.date > daysAgo(7) && d.date <= todayStr);
    const prev7 = daily60.filter((d) => d.date > daysAgo(14) && d.date <= daysAgo(7));
    const last30 = daily60.filter((d) => d.date > daysAgo(30) && d.date <= todayStr);
    const prev30 = daily60.filter((d) => d.date > daysAgo(60) && d.date <= daysAgo(30));

    return {
      productId: p.id,
      name: p.name,
      unit: p.unit,
      currentStock: Number(p.currentStock),
      minStock: p.minStock,
      last7Days: summarizePeriod(last7, 7, prev7.reduce((s, d) => s + d.units, 0)),
      last30Days: summarizePeriod(last30, 30, prev30.reduce((s, d) => s + d.units, 0)),
      dailyLast30: last30,
      weeklyLast12: (weeklyByProduct.get(p.id) ?? []).sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    };
  });
}

type PromptContext = { storeName: string; storeType: string | null; city: string | null; weatherSummary: string; marketContext: string | null };

function buildPrompt(batch: ProductSalesProfile[], today: string, context: PromptContext) {
  return `STORE CONTEXT
- Store: ${context.storeName}${context.storeType ? ` (${context.storeType.replace(/_/g, " ")})` : ""}${context.city ? ` in ${context.city}, India` : ""}
- Today's date: ${today}

WEATHER OUTLOOK (next 7 days)
${context.weatherSummary}

MARKET CONTEXT (current trends / upcoming festivals relevant to this store type)
${context.marketContext ?? "No live market context available for this run — rely on sales data only."}

TASK
For each product below, predict near-term demand using its actual sales history as the primary signal. "last7Days" and "last30Days" are pre-computed summaries (totalUnits, dailyAvg, trendPct = % change vs the prior equal-length period, null if no prior data). "dailyLast30" and "weeklyLast12" are the raw underlying data if you want to check day-of-week patterns or longer seasonality. Use the weather outlook and market context above only as secondary adjustments to the data-driven baseline — e.g. a rise in temperature may lift cold-drink demand, an upcoming festival may lift demand for related products. If a product has little or no sales history, say so and give a conservative, low-confidence estimate based on its minimum stock threshold instead.

Products (JSON):
${JSON.stringify(batch, null, 2)}

Respond with ONLY valid JSON matching exactly this shape (no markdown fences, no commentary):
{
  "forecasts": [
    {
      "productId": "string, must match the input productId exactly",
      "next7DaysUnits": number (total predicted units sold over the next 7 days),
      "next30DaysUnits": number (total predicted units sold over the next 30 days),
      "marketDemandTrend": "rising" | "stable" | "declining",
      "confidenceScore": number 0-100,
      "reason": "one short sentence explaining the prediction in plain language a shop owner would understand, mentioning weather/market context only if it actually influenced the number",
      "dailySeries": [
        { "date": "YYYY-MM-DD", "predictedUnits": number }
        // exactly 7 entries, one per day starting tomorrow
      ]
    }
  ]
}

Include exactly one entry per input product, in the same order.`;
}

async function forecastBatch(batch: ProductSalesProfile[], today: string, context: PromptContext): Promise<GeminiForecastItem[]> {
  const raw = await generateJson(buildPrompt(batch, today, context));
  const parsed = geminiForecastResponseSchema.safeParse(raw);

  if (!parsed.success) {
    console.error("[ai-forecast] Gemini response failed validation:", parsed.error.flatten());
    throw new Error("AI forecast response was malformed");
  }

  return parsed.data.forecasts;
}

function priorityFromProfile(item: GeminiForecastItem, currentStock: number): ForecastPriority {
  const dailyRate = item.next7DaysUnits / 7;
  const daysOfCover = dailyRate > 0 ? currentStock / dailyRate : 99;
  if (daysOfCover <= 2) return "high";
  if (daysOfCover <= 5) return "medium";
  return "low";
}

/**
 * Real forecasting path: gathers store/weather/market context once, batches
 * products into Gemini calls with that shared context, validates the
 * structured JSON response, and persists it. Throws on failure so the
 * caller (`generateForecasts`) can fall back to the placeholder heuristic.
 */
export async function generateForecastsWithGemini(storeId: string, productIds?: string[]): Promise<number> {
  const profiles = await buildSalesProfiles(storeId, productIds);
  if (profiles.length === 0) return 0;

  const store = await db.query.stores.findFirst({ where: eq(stores.id, storeId) });
  const [weatherOutlook, marketContext] = await Promise.all([
    store?.city ? getWeatherOutlook(store.city) : Promise.resolve(null),
    getMarketContext(storeId, store?.storeType ?? null, store?.city ?? null),
  ]);

  const context: PromptContext = {
    storeName: store?.name ?? "Kirana Store",
    storeType: store?.storeType ?? null,
    city: store?.city ?? null,
    weatherSummary: summarizeWeatherOutlook(weatherOutlook),
    marketContext,
  };

  const today = new Date().toISOString().slice(0, 10);
  const batches: ProductSalesProfile[][] = [];
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    batches.push(profiles.slice(i, i + BATCH_SIZE));
  }

  const profileById = new Map(profiles.map((p) => [p.productId, p]));
  const now = new Date();
  const rowsToInsert: (typeof forecasts.$inferInsert)[] = [];

  for (const batch of batches) {
    const items = await forecastBatch(batch, today, context);

    for (const item of items) {
      const profile = profileById.get(item.productId);
      if (!profile) continue; // Gemini hallucinated an id we didn't send — skip defensively

      const suggestedOrderQty = Math.max(0, Math.round(item.next7DaysUnits) + profile.minStock - profile.currentStock);
      const dailyRate = item.next7DaysUnits / 7;
      const willStockOutAt =
        dailyRate > 0 ? new Date(Date.now() + (profile.currentStock / dailyRate) * 86_400_000).toISOString() : null;

      rowsToInsert.push({
        id: nanoid(),
        storeId,
        productId: item.productId,
        currentStock: profile.currentStock,
        predictedDemand: Math.round(item.next7DaysUnits),
        suggestedOrderQty,
        confidenceScore: item.confidenceScore.toFixed(2),
        priority: priorityFromProfile(item, profile.currentStock),
        status: "ready",
        reason: item.reason,
        modelMeta: {
          engine: "gemini",
          model: LLM_MODEL,
          predictedDemand30d: Math.round(item.next30DaysUnits),
          marketDemandTrend: item.marketDemandTrend,
          weatherFactored: !!weatherOutlook,
          marketContextFactored: !!marketContext,
        },
        series: item.dailySeries.map((d) => ({ date: d.date, predicted: Math.round(d.predictedUnits) })),
        willStockOutAt,
        generatedAt: now.toISOString(),
      });
    }
  }

  if (rowsToInsert.length > 0) {
    await db.insert(forecasts).values(rowsToInsert);
  }

  return rowsToInsert.length;
}
