import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { generateGroundedContext } from "@/lib/ai/gemini-client";
import type { StoreType } from "@/db/schema";

const CACHE_CATEGORY = "ai_context";
const CACHE_KEY = "market_trends";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // refresh once a day — trends don't shift hourly

type CachedContext = { text: string; generatedAt: string };

/**
 * Pulls current, real market-demand context for the store's category
 * (grocery / bakery / pharmacy / etc, chosen at onboarding) using Gemini's
 * Google Search grounding — the same LLM_API_KEY already configured, no
 * extra credential needed. Cached per-store for 24h in the generic
 * `settings` table so we're not spending a grounded search call on every
 * single forecast generation. Returns `null` on any failure (grounding is
 * enrichment, not a hard requirement for forecasting to work).
 */
export async function getMarketContext(storeId: string, storeType: StoreType | null, city: string | null): Promise<string | null> {
  const cached = await db.query.settings.findFirst({
    where: and(eq(settings.storeId, storeId), eq(settings.category, CACHE_CATEGORY), eq(settings.key, CACHE_KEY)),
  });

  if (cached?.value) {
    const value = cached.value as CachedContext;
    const age = Date.now() - new Date(value.generatedAt).getTime();
    if (age < CACHE_TTL_MS) return value.text;
  }

  if (!storeType) return cached ? (cached.value as CachedContext).text : null;

  const categoryLabel = storeType.replace(/_/g, " ");
  const locationPhrase = city ? ` in ${city}, India` : " in India";

  const prompt = `Search for current, real information relevant to a small "${categoryLabel}" retail store${locationPhrase} right now: any upcoming Indian festivals or seasonal events in the next 30 days that typically increase demand for specific products, and 3-5 product categories currently trending or in high demand for this type of store. Answer in 3-5 short plain-language bullet points, no more than 100 words total. Do not include sources or links, just the factual summary.`;

  const text = await generateGroundedContext(prompt);
  if (!text) return cached ? (cached.value as CachedContext).text : null;

  const value: CachedContext = { text, generatedAt: new Date().toISOString() };
  if (cached) {
    await db.update(settings).set({ value }).where(eq(settings.id, cached.id));
  } else {
    await db.insert(settings).values({ storeId, category: CACHE_CATEGORY, key: CACHE_KEY, value });
  }

  return text;
}
