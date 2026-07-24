import type { BusinessTemplate } from "@/db/schema";
import { businessTemplateEnum } from "@/db/schema";
import type { BusinessTemplateConfig } from "./types";
import { groceryConfig } from "./grocery/config";
import { pharmacyConfig } from "./pharmacy/config";
import { fashionConfig } from "./fashion/config";
import { electronicsConfig } from "./electronics/config";
import { hardwareConfig } from "./hardware/config";
import { foodConfig } from "./food/config";
import { automobileConfig } from "./automobile/config";
import { furnitureConfig } from "./furniture/config";
import { cosmeticsConfig } from "./cosmetics/config";
import { booksConfig } from "./books/config";
import { agricultureConfig } from "./agriculture/config";
import { customConfig } from "./custom/config";

/**
 * The business-template registry — the single source of truth mapping a
 * tenant's `stores.businessTemplate` to its full config (sidebar, dashboard
 * widgets, product fields, AI features, reports). Adding a 13th vertical
 * means: add the id to `businessTemplateEnum` in `db/schema/stores.ts`,
 * create `business/<id>/config.ts`, and register it here. Nothing else in
 * the app should need to change.
 */
export const BUSINESS_TEMPLATE_REGISTRY: Record<BusinessTemplate, BusinessTemplateConfig> = {
  grocery: groceryConfig,
  pharmacy: pharmacyConfig,
  fashion: fashionConfig,
  electronics: electronicsConfig,
  hardware: hardwareConfig,
  food: foodConfig,
  automobile: automobileConfig,
  furniture: furnitureConfig,
  cosmetics: cosmeticsConfig,
  books: booksConfig,
  agriculture: agricultureConfig,
  custom: customConfig,
};

export function getBusinessTemplate(id: BusinessTemplate): BusinessTemplateConfig {
  return BUSINESS_TEMPLATE_REGISTRY[id];
}

export function listBusinessTemplates(): BusinessTemplateConfig[] {
  return businessTemplateEnum.map((id) => BUSINESS_TEMPLATE_REGISTRY[id]);
}

/**
 * Templates with a real seeded product catalog (`lib/catalog/global-catalog.ts`).
 * Only grocery has one today — everything else onboards into an empty
 * catalog and adds products manually. Used to hide the "Product Library"
 * picker (grocery-brand items like Amul/Nestlé) for templates it doesn't
 * apply to, and to decide whether onboarding's brand/catalog steps run.
 * See ARCHITECTURE.md "Known gaps".
 */
export const TEMPLATES_WITH_SEEDED_CATALOG: BusinessTemplate[] = ["grocery"];

export function hasSeededCatalog(id: BusinessTemplate): boolean {
  return TEMPLATES_WITH_SEEDED_CATALOG.includes(id);
}
