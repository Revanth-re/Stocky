import { Sofa, Truck } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const furnitureConfig: BusinessTemplateConfig = {
  id: "furniture",
  label: "Furniture & Home Decor",
  description: "Delivery and installation tracking for made-to-order and stocked furniture.",
  icon: Sofa,
  featureTags: ["Delivery tracking", "Custom orders", "Warranty", "Installations", "AI demand forecast"],
  sidebarModules: [
    { id: "deliveries", label: "Delivery Tracking", href: "/furniture/deliveries", icon: Truck, permission: "sales.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "pending-deliveries", label: "Pending Deliveries & Installs", description: "Orders awaiting delivery or installation.", defaultEnabled: true },
    { id: "custom-order-pipeline", label: "Custom Order Pipeline", description: "Custom/made-to-order jobs by stage.", defaultEnabled: true },
  ],
  productFields: [
    { key: "dimensions", label: "Dimensions (L x W x H)", type: "text" },
    { key: "material", label: "Material", type: "text" },
    { key: "isCustomOrder", label: "Made to order", type: "boolean" },
    { key: "warrantyMonths", label: "Warranty (months)", type: "number" },
  ],
  aiFeatures: [
    { id: "demand-forecast", label: "AI Demand Forecast", description: "Forecasts demand by category ahead of high-purchase seasons (festivals, moving season).", defaultEnabled: true },
  ],
  reports: [
    { id: "delivery-status", label: "Delivery Status", description: "Orders by delivery/installation stage." },
    { id: "custom-order-margin", label: "Custom Order Margin", description: "Margin on made-to-order jobs vs. stocked items." },
  ],
  usesExpiryTracking: false,
  usesWeightBasedPricing: false,
};
