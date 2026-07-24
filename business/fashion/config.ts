import { Shirt, Palette } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const fashionConfig: BusinessTemplateConfig = {
  id: "fashion",
  label: "Fashion & Footwear",
  description: "Size/color variant matrix with brand and seasonal-collection inventory.",
  icon: Shirt,
  featureTags: ["Size variants", "Color variants", "Brand management", "Seasonal inventory", "AI trend prediction"],
  sidebarModules: [
    { id: "variant-matrix", label: "Size & Color Matrix", href: "/fashion/variants", icon: Palette, permission: "inventory.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "size-demand", label: "Size Demand Heatmap", description: "Which sizes are selling out fastest per style.", defaultEnabled: true },
    { id: "seasonal-collection", label: "Season / Collection Sell-through", description: "Sell-through rate for the active season's collection.", defaultEnabled: true },
  ],
  productFields: [
    { key: "size", label: "Size", type: "text", placeholder: "e.g. M, 42, UK 9" },
    { key: "color", label: "Color", type: "text" },
    { key: "material", label: "Material", type: "text" },
    { key: "season", label: "Season / Collection", type: "select", options: [
      { label: "Spring/Summer", value: "ss" },
      { label: "Autumn/Winter", value: "aw" },
      { label: "All season", value: "all_season" },
    ] },
  ],
  aiFeatures: [
    { id: "trend-prediction", label: "Trend Prediction", description: "Flags styles trending up or down based on recent sell-through.", defaultEnabled: true },
    { id: "size-demand-forecast", label: "Size Demand Forecast", description: "Predicts the size mix to reorder per style.", defaultEnabled: true },
  ],
  reports: [
    { id: "variant-performance", label: "Variant Performance", description: "Sales by size/color combination." },
    { id: "seasonal-inventory", label: "Seasonal Inventory", description: "Stock aging by season/collection." },
  ],
  usesExpiryTracking: false,
  usesWeightBasedPricing: false,
};
