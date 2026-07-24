import { Sparkles as SparklesIcon, Heart } from "lucide-react";
import type { BusinessTemplateConfig } from "../types";

export const cosmeticsConfig: BusinessTemplateConfig = {
  id: "cosmetics",
  label: "Cosmetics & Beauty",
  description: "Expiry-tracked beauty products with combo offers and a loyalty program.",
  icon: SparklesIcon,
  featureTags: ["Expiry tracking", "Brand management", "Combo offers", "Loyalty", "AI product recommendations"],
  sidebarModules: [
    { id: "loyalty", label: "Loyalty Program", href: "/cosmetics/loyalty", icon: Heart, permission: "customers.view", defaultEnabled: true, comingSoon: true },
  ],
  dashboardWidgets: [
    { id: "expiry-risk", label: "Products Nearing Expiry", description: "Batches expiring within the configured risk window.", defaultEnabled: true },
    { id: "loyalty-activity", label: "Loyalty Program Activity", description: "Points earned/redeemed this period.", defaultEnabled: true },
  ],
  productFields: [
    { key: "shelfLifeMonths", label: "Shelf Life (months, from opening)", type: "number" },
    { key: "skinType", label: "Skin/Hair Type", type: "text", placeholder: "e.g. Oily, Dry, All types" },
  ],
  aiFeatures: [
    { id: "product-recommendations", label: "AI Product Recommendations", description: "Suggests complementary products based on a customer's purchase history.", defaultEnabled: true },
  ],
  reports: [
    { id: "expiry-report", label: "Expiry Report", description: "Batches nearing or past expiry." },
    { id: "loyalty-summary", label: "Loyalty Summary", description: "Points balances and redemption trends." },
  ],
  usesExpiryTracking: true,
  usesWeightBasedPricing: false,
};
