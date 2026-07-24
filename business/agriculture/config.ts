import { Sprout, CalendarRange } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const agricultureConfig: BusinessTemplateConfig = {
  id: "agriculture",
  label: "Agriculture & Fertilizer",
  description: "Batch-tracked seed/fertilizer inventory with seasonal demand and purchase planning.",
  icon: Sprout,
  featureTags: ["Batch tracking", "Seasonal demand", "Supplier management", "Purchase planning", "AI seasonal forecast"],
  sidebarModules: [
    { id: "season-planner", label: "Season Planner", href: "/agriculture/season-planner", icon: CalendarRange, permission: "purchase_orders.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "season-readiness", label: "Season Readiness", description: "Stock coverage ahead of the upcoming sowing/harvest season.", defaultEnabled: true },
  ],
  productFields: [
    { key: "batchNumber", label: "Batch Number", type: "text" },
    { key: "cropType", label: "Crop Type", type: "text", placeholder: "e.g. Paddy, Cotton, Wheat" },
    { key: "npkRatio", label: "NPK Ratio", type: "text", placeholder: "e.g. 10:26:26" },
  ],
  aiFeatures: [
    { id: "seasonal-inventory-planning", label: "Seasonal Inventory Planning", description: "Plans purchase timing/quantity ahead of regional sowing and harvest windows.", defaultEnabled: true },
  ],
  reports: [
    { id: "batch-register", label: "Batch Register", description: "All batches by crop type and expiry." },
    { id: "seasonal-demand", label: "Seasonal Demand", description: "Historical demand by season to plan next season's purchasing." },
  ],
  usesExpiryTracking: true,
  usesWeightBasedPricing: true,
};
