import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * Thin wrapper around the Gemini SDK. Returns `null` (rather than throwing)
 * when no key is configured, so callers can cleanly fall back to the
 * placeholder heuristic instead of crashing the forecast feature.
 */
let client: GoogleGenAI | null | undefined;

export function getGeminiClient(): GoogleGenAI | null {
  if (client !== undefined) return client;

  const apiKey = process.env.LLM_API_KEY;
  client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return client;
}

export const LLM_MODEL = process.env.LLM_MODEL || "gemini-2.5-flash";

/**
 * The model's persona for every forecasting call. Scopes it hard to retail
 * sales/demand/inventory so it doesn't wander into unrelated territory, and
 * tells it explicitly to ground numeric predictions in the provided data
 * rather than inventing figures.
 */
export const RETAIL_FORECAST_SYSTEM_INSTRUCTION = `You are a retail sales forecasting and market demand analyst for small Indian "Kirana" (grocery/convenience) stores.

Your ONLY area of expertise is: sales history analysis, inventory demand prediction, seasonal/weather-driven retail demand, and general-store product market trends. You do not answer questions or provide opinions on anything outside retail sales, inventory, and market demand for physical store products.

Rules you must always follow:
- Base every numeric prediction primarily on the sales data provided in the prompt. Do not invent sales history that wasn't given to you.
- If weather or market-trend context is provided, use it only to adjust (not replace) the data-driven prediction — explain the adjustment briefly in your reasoning.
- If a product has little or no sales history, say so plainly and give a conservative, low-confidence estimate based on its minimum stock threshold.
- Never fabricate specific statistics you were not given (e.g. do not invent "20% of shoppers in your area buy X").
- Respond only in the exact JSON format requested — no extra commentary, no markdown fences.`;

/**
 * Structured-JSON forecasting call. We deliberately do NOT rely on the SDK's
 * strict `responseSchema` config (its exact shape varies across SDK
 * versions) — instead we ask for JSON explicitly in the prompt and validate
 * the parsed result ourselves with Zod at the call site. This is more
 * robust to SDK/API drift and still gives us a hard validation gate.
 */
export async function generateJson(prompt: string, systemInstruction = RETAIL_FORECAST_SYSTEM_INSTRUCTION): Promise<unknown> {
  const ai = getGeminiClient();
  if (!ai) throw new Error("LLM_API_KEY is not configured");

  const response = await ai.models.generateContent({
    model: LLM_MODEL,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");

  try {
    return JSON.parse(text);
  } catch {
    // Some responses arrive wrapped in ```json fences despite responseMimeType.
    const stripped = text.replace(/^```json\s*|```$/g, "").trim();
    return JSON.parse(stripped);
  }
}

/**
 * Grounded free-text call using Gemini's built-in Google Search tool — used
 * to pull real, current market context (trending products for a store
 * category, seasonal/festival demand signals) before the structured
 * forecast call. Kept separate from generateJson() because Gemini does not
 * reliably support search-grounding tools and strict JSON mode in the same
 * call. Returns `null` on any failure so callers can proceed without it
 * (grounding is a "nice to have" enrichment, never a hard requirement).
 */
export async function generateGroundedContext(prompt: string): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: LLM_MODEL,
      contents: prompt,
      config: {
        systemInstruction: RETAIL_FORECAST_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text ?? null;
  } catch (error) {
    console.error("[gemini] Google Search grounding call failed, continuing without it:", error);
    return null;
  }
}
