import { UtensilsCrossed, ChefHat, LayoutGrid } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const foodConfig: BusinessTemplateConfig = {
  id: "food",
  label: "Food & Beverage",
  description: "Restaurants, cafes, and bakeries — menu, kitchen orders, ingredients, recipe costing, and tables.",
  icon: UtensilsCrossed,
  featureTags: ["Menu", "Kitchen orders", "Ingredients", "Recipe cost", "Tables", "AI food waste prediction"],
  sidebarModules: [
    { id: "menu", label: "Menu", href: "/food/menu", icon: ChefHat, permission: "inventory.view", defaultEnabled: true, comingSoon: true },
    { id: "kitchen-orders", label: "Kitchen Orders", href: "/food/kitchen-orders", icon: ChefHat, permission: "sales.view", defaultEnabled: true, comingSoon: true },
    { id: "tables", label: "Tables", href: "/food/tables", icon: LayoutGrid, permission: "sales.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "peak-hours", label: "Peak Hour Heatmap", description: "Order volume by hour to plan staffing.", defaultEnabled: true },
    { id: "food-waste", label: "Food Waste Estimate", description: "Estimated ingredient waste from prep vs. sold portions.", defaultEnabled: true },
    { id: "table-turnover", label: "Table Turnover", description: "Average table occupancy time.", defaultEnabled: true },
  ],
  productFields: [
    { key: "recipeCost", label: "Recipe Cost", type: "number", helpText: "Computed ingredient cost per plate/serving." },
    { key: "prepTimeMinutes", label: "Prep Time (minutes)", type: "number" },
    { key: "isVeg", label: "Vegetarian", type: "boolean" },
    { key: "spiceLevel", label: "Spice Level", type: "select", options: [
      { label: "Mild", value: "mild" },
      { label: "Medium", value: "medium" },
      { label: "Spicy", value: "spicy" },
    ] },
  ],
  aiFeatures: [
    { id: "food-waste-prediction", label: "Food Waste Prediction", description: "Predicts likely over-prep by dish based on day-of-week demand.", defaultEnabled: true },
    { id: "peak-hour-prediction", label: "Peak Hour Prediction", description: "Forecasts busy windows to plan kitchen staffing.", defaultEnabled: true },
  ],
  reports: [
    { id: "menu-performance", label: "Menu Item Performance", description: "Best/worst selling dishes by margin." },
    { id: "ingredient-usage", label: "Ingredient Usage", description: "Ingredient consumption vs. purchased stock." },
  ],
  usesExpiryTracking: true,
  usesWeightBasedPricing: false,
};
