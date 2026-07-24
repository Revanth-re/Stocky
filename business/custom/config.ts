import { Settings2 } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

/**
 * "Other Business (Custom)" — no preset vertical. Ships zero extra
 * sidebar modules / product fields / AI features by default; the tenant
 * enables what they need from Settings > Modules, and any custom product
 * attributes they add are stored the same way a preset template's
 * `productFields` would be (`products.customFields`), just defined
 * per-tenant in `stores.templateSettings.customProductFields` instead of
 * hardcoded here. The settings UI reads/writes that array using the same
 * `ProductFieldDescriptor` shape as every other template.
 */
export const customConfig: BusinessTemplateConfig = {
  id: "custom",
  label: "Other Business (Custom)",
  description: "Start from just the core modules and enable whatever else your business needs.",
  icon: Settings2,
  featureTags: ["Fully configurable modules", "Define your own product fields", "Pick your own AI features"],
  sidebarModules: [],
  dashboardWidgets: [],
  productFields: [],
  aiFeatures: [],
  reports: [],
  usesExpiryTracking: false,
  usesWeightBasedPricing: false,
};
