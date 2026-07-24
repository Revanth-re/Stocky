import type { AiFeatureConfig } from "./types";

/**
 * AI features every tenant gets regardless of business template (PRD:
 * "GLOBAL AI"). Vertical-specific AI features live on each template's
 * `aiFeatures` array in `business/<template>/config.ts` and are appended
 * to this list when resolving a tenant's full AI feature set.
 *
 * Each entry is a capability *description* only — no model wiring lives
 * here. Today only `sales-forecast` (naive velocity heuristic) and
 * `smart-reorder` are implemented; the rest are placeholders so the UI,
 * settings toggles, and permission surface are ready before the model
 * behind them is. See README "Future AI service integration".
 */
export const GLOBAL_AI_FEATURES: AiFeatureConfig[] = [
  { id: "business-assistant", label: "AI Business Assistant", description: "Natural-language Q&A over this store's live sales, stock, and customer data.", defaultEnabled: true },
  { id: "sales-forecast", label: "Sales Forecast", description: "Short-horizon demand forecast per product, used to drive reorder suggestions.", defaultEnabled: true },
  { id: "smart-reorder", label: "Smart Reorder Suggestions", description: "Suggested purchase-order quantities based on sales velocity and lead time.", defaultEnabled: true },
  { id: "business-health-score", label: "Business Health Score", description: "A single rolled-up score from margin, stock health, and sales trend.", defaultEnabled: true },
  { id: "profit-prediction", label: "Profit Prediction", description: "Projected profit for the current period based on trend + committed POs.", defaultEnabled: false },
  { id: "daily-summary", label: "Daily AI Summary", description: "A short daily digest of what changed and what needs attention.", defaultEnabled: true },
  { id: "natural-language-search", label: "Natural Language Search", description: "Search products, sales, and customers with plain-language queries.", defaultEnabled: false },
  { id: "invoice-ocr", label: "Invoice OCR", description: "Extract line items from a photographed supplier invoice into a purchase order.", defaultEnabled: false },
  { id: "barcode-recognition", label: "Barcode Recognition", description: "Camera barcode scanning to look up or add products.", defaultEnabled: true },
  { id: "dashboard-insights", label: "AI Dashboard Insights", description: "Contextual callouts surfaced on the dashboard (anomalies, opportunities).", defaultEnabled: true },
];

export function getGlobalAiFeature(id: string) {
  return GLOBAL_AI_FEATURES.find((f) => f.id === id);
}
