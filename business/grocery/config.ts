import { Store, Tag } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

/**
 * Grocery & Kirana — the original/default template this codebase was
 * built around, so every feature here maps to something already shipped:
 * barcode lookup, weight-based pricing, expiry tracking (batches),
 * customer credit ledger ("Khata"), combo offers, and the AI seasonal
 * demand forecast.
 */
export const groceryConfig: BusinessTemplateConfig = {
  id: "grocery",
  label: "Grocery & Kirana",
  description: "Daily essentials, packaged goods, and loose/weighed items with a local customer credit book.",
  icon: Store,
  featureTags: ["Barcode", "Weight-based products", "Expiry tracking", "Khata (credit book)", "Offers", "AI seasonal demand forecast"],
  sidebarModules: [
    { id: "offers", label: "Combo Offers", href: "/settings/combos", icon: Tag, permission: "settings.view", defaultEnabled: true },
  ],
  dashboardWidgets: [
    { id: "ai-recommendation", label: "AI Reorder Recommendation", description: "Top items to reorder this week based on sales velocity.", defaultEnabled: true },
    { id: "dead-stock", label: "Dead Stock", description: "Products with no sales movement in the selected window.", defaultEnabled: true },
    { id: "sales-chart", label: "Sales Trend", description: "Daily sales over the last 14/30 days.", defaultEnabled: true },
    { id: "product-performance", label: "Top / Bottom Products", description: "Best and worst sellers by revenue and margin.", defaultEnabled: true },
  ],
  productFields: [],
  aiFeatures: [
    { id: "seasonal-demand-prediction", label: "Seasonal Demand Prediction", description: "Anticipates festival/season demand spikes for staples and packaged goods.", defaultEnabled: true },
    { id: "low-stock-prediction", label: "Low Stock Prediction", description: "Predicts which SKUs will run out before the next likely reorder date.", defaultEnabled: true },
  ],
  reports: [
    { id: "sales-summary", label: "Sales Summary", description: "Revenue, order count, and average basket size by period." },
    { id: "expiry-report", label: "Expiry Report", description: "Batches nearing or past expiry." },
    { id: "credit-book", label: "Khata / Credit Book", description: "Outstanding customer credit balances." },
  ],
  usesExpiryTracking: true,
  usesWeightBasedPricing: true,
};
