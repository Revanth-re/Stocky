import { Pill, FileText } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const pharmacyConfig: BusinessTemplateConfig = {
  id: "pharmacy",
  label: "Pharmacy & Medical",
  description: "Batch/expiry-tracked medicine inventory with prescription sales and GST.",
  icon: Pill,
  featureTags: ["Batch numbers", "Expiry tracking", "Prescription sales", "GST", "AI expiry prediction"],
  sidebarModules: [
    { id: "prescriptions", label: "Prescription Sales", href: "/pharmacy/prescriptions", icon: FileText, permission: "sales.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "expiry-risk", label: "Batches Nearing Expiry", description: "Batches expiring within the configured risk window.", defaultEnabled: true },
    { id: "prescription-volume", label: "Prescription Sales Volume", description: "Prescription vs. OTC sales split.", defaultEnabled: true },
  ],
  productFields: [
    { key: "batchNumber", label: "Batch Number", type: "text", required: true, placeholder: "e.g. B-2026-0417" },
    { key: "manufacturer", label: "Manufacturer", type: "text" },
    { key: "scheduleClass", label: "Schedule / Drug Class", type: "select", options: [
      { label: "OTC (no prescription)", value: "otc" },
      { label: "Schedule H (prescription required)", value: "schedule_h" },
      { label: "Schedule H1 (register required)", value: "schedule_h1" },
      { label: "Schedule X (narcotic)", value: "schedule_x" },
    ] },
    { key: "hsnCode", label: "HSN Code (GST)", type: "text" },
  ],
  aiFeatures: [
    { id: "expiry-prediction", label: "Expiry Prediction", description: "Flags batches likely to expire before they sell out, ranked by loss risk.", defaultEnabled: true },
    { id: "batch-risk-analysis", label: "Batch Risk Analysis", description: "Surfaces batches with abnormal sell-through vs. their expiry runway.", defaultEnabled: true },
  ],
  reports: [
    { id: "batch-expiry", label: "Batch Expiry Report", description: "All batches grouped by days-to-expiry." },
    { id: "prescription-log", label: "Prescription Sales Log", description: "Prescription-linked sales for compliance review." },
    { id: "gst-summary", label: "GST Summary", description: "Tax collected by HSN code / rate slab." },
  ],
  usesExpiryTracking: true,
  usesWeightBasedPricing: false,
};
