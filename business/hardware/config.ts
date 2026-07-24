import { Hammer, Boxes } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const hardwareConfig: BusinessTemplateConfig = {
  id: "hardware",
  label: "Hardware & Building Materials",
  description: "Bulk unit pricing, supplier comparison, and purchase-order-driven restocking.",
  icon: Hammer,
  featureTags: ["Unit types", "Bulk pricing", "Supplier management", "Purchase orders", "AI stock optimization"],
  sidebarModules: [
    { id: "bulk-pricing", label: "Bulk Pricing Tiers", href: "/hardware/bulk-pricing", icon: Boxes, permission: "inventory.edit", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "bulk-order-value", label: "Bulk Order Value", description: "Revenue split between retail and bulk/wholesale orders.", defaultEnabled: true },
    { id: "supplier-comparison", label: "Supplier Price Comparison", description: "Cheapest current supplier per commonly reordered item.", defaultEnabled: true },
  ],
  productFields: [
    { key: "unitType", label: "Unit Type", type: "select", options: [
      { label: "Piece", value: "piece" },
      { label: "Bag", value: "bag" },
      { label: "Bundle", value: "bundle" },
      { label: "Length (ft/m)", value: "length" },
      { label: "Weight (kg)", value: "weight" },
    ] },
    { key: "bulkThreshold", label: "Bulk Quantity Threshold", type: "number", helpText: "Quantity at which bulk pricing kicks in." },
    { key: "bulkPrice", label: "Bulk Unit Price", type: "number" },
  ],
  aiFeatures: [
    { id: "stock-optimization", label: "AI Stock Optimization", description: "Recommends reorder points per SKU balancing carrying cost vs. stockout risk.", defaultEnabled: true },
  ],
  reports: [
    { id: "bulk-vs-retail", label: "Bulk vs. Retail Sales", description: "Sales split by order size." },
    { id: "supplier-price-history", label: "Supplier Price History", description: "Price trend per supplier per item." },
  ],
  usesExpiryTracking: false,
  usesWeightBasedPricing: true,
};
