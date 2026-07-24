import { Wrench, Car } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const automobileConfig: BusinessTemplateConfig = {
  id: "automobile",
  label: "Automobile Spare Parts",
  description: "Part-number and vehicle-compatibility tracked inventory with warranty and supplier management.",
  icon: Wrench,
  featureTags: ["Part numbers", "Vehicle compatibility", "Warranty", "Supplier management", "AI inventory optimization"],
  sidebarModules: [
    { id: "compatibility", label: "Vehicle Compatibility", href: "/automobile/compatibility", icon: Car, permission: "inventory.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "fast-moving-parts", label: "Fast-moving Parts", description: "Parts with the highest turnover this period.", defaultEnabled: true },
    { id: "warranty-claims", label: "Warranty Claims", description: "Open vs. resolved warranty claims.", defaultEnabled: true },
  ],
  productFields: [
    { key: "partNumber", label: "Part Number (OEM)", type: "text", required: true },
    { key: "compatibleVehicles", label: "Compatible Vehicles", type: "text", placeholder: "e.g. Maruti Swift 2015-2020, Baleno 2017+" },
    { key: "warrantyMonths", label: "Warranty (months)", type: "number" },
  ],
  aiFeatures: [
    { id: "inventory-optimization", label: "AI Inventory Optimization", description: "Recommends stocking levels per part based on vehicle-model demand mix.", defaultEnabled: true },
  ],
  reports: [
    { id: "part-movement", label: "Part Movement", description: "Sales and stock turns by part number." },
    { id: "compatibility-coverage", label: "Vehicle Compatibility Coverage", description: "Which vehicle models have the most/least part coverage." },
  ],
  usesExpiryTracking: false,
  usesWeightBasedPricing: false,
};
