import { Smartphone, ShieldCheck } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const electronicsConfig: BusinessTemplateConfig = {
  id: "electronics",
  label: "Electronics & Mobile",
  description: "IMEI/serial-tracked devices with warranty management and accessory cross-selling.",
  icon: Smartphone,
  featureTags: ["IMEI", "Serial numbers", "Warranty", "Accessories", "AI cross-selling suggestions"],
  sidebarModules: [
    { id: "warranty-register", label: "Warranty Register", href: "/electronics/warranty", icon: ShieldCheck, permission: "customers.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "warranty-expiring", label: "Warranties Expiring Soon", description: "Devices whose warranty window is closing.", defaultEnabled: true },
    { id: "cross-sell", label: "Accessory Cross-sell Opportunities", description: "Devices sold recently without a matching accessory.", defaultEnabled: true },
  ],
  productFields: [
    { key: "imei", label: "IMEI", type: "text", placeholder: "15-digit IMEI" },
    { key: "serialNumber", label: "Serial Number", type: "text" },
    { key: "warrantyMonths", label: "Warranty (months)", type: "number" },
    { key: "isAccessory", label: "Accessory item", type: "boolean" },
  ],
  aiFeatures: [
    { id: "warranty-reminder", label: "Warranty Reminder", description: "Auto-reminds customers before their warranty expires.", defaultEnabled: true },
    { id: "cross-sell-suggestions", label: "Cross-sell Suggestions", description: "Suggests accessories to bundle with a device at checkout.", defaultEnabled: true },
  ],
  reports: [
    { id: "imei-register", label: "IMEI / Serial Register", description: "Full device sale history by IMEI or serial number." },
    { id: "warranty-status", label: "Warranty Status", description: "Active vs. expired warranties." },
  ],
  usesExpiryTracking: false,
  usesWeightBasedPricing: false,
};
