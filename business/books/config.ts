import { BookOpen, Package } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const booksConfig: BusinessTemplateConfig = {
  id: "books",
  label: "Books & Stationery",
  description: "ISBN/SKU-tracked catalog with categories and bundle offers.",
  icon: BookOpen,
  featureTags: ["ISBN", "SKU", "Categories", "Bundles", "AI inventory suggestions"],
  sidebarModules: [
    { id: "bundles", label: "Bundles", href: "/books/bundles", icon: Package, permission: "settings.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "category-mix", label: "Category Sales Mix", description: "Sales split across categories (books, stationery, gifting, ...).", defaultEnabled: true },
  ],
  productFields: [
    { key: "isbn", label: "ISBN", type: "text", placeholder: "978-..." },
    { key: "author", label: "Author / Publisher", type: "text" },
    { key: "edition", label: "Edition", type: "text" },
  ],
  aiFeatures: [
    { id: "inventory-suggestions", label: "AI Inventory Suggestions", description: "Suggests titles/categories to restock ahead of school/exam seasons.", defaultEnabled: true },
  ],
  reports: [
    { id: "category-performance", label: "Category Performance", description: "Sales and margin by category." },
    { id: "isbn-lookup", label: "ISBN Register", description: "Full catalog lookup by ISBN." },
  ],
  usesExpiryTracking: false,
  usesWeightBasedPricing: false,
};
