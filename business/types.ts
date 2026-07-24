import type { LucideIcon } from "lucide-react";
import type { BusinessTemplate } from "@/db/schema";
import type { Permission } from "@/lib/auth/rbac";

/**
 * The business-template config engine.
 *
 * This is the single extension point for supporting a new vertical
 * (see PRD: "BUSINESS TEMPLATE ARCHITECTURE" — never hardcode business
 * logic, use configuration"). Every file under `business/<template>/`
 * exports one `BusinessTemplateConfig`. Nothing outside `business/`
 * should ever branch on `if (businessTemplate === "pharmacy")` — instead,
 * UI and services read from the active tenant's resolved config
 * (`business/registry.ts#getBusinessTemplate`).
 *
 * A config only ever *adds* to the always-on core modules
 * (`business/core-modules.ts`) and *describes* optional extras — it never
 * removes or duplicates a core module. This keeps every tenant on the
 * same codebase, differing only in which config is active.
 */

/** A single sidebar/navigation entry contributed by a business template, layered on top of the core nav. */
export type NavModule = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** RBAC permission required to see this item. Omit for items visible to every role. */
  permission?: Permission;
  /** Whether this module is on by default when a tenant first picks this template. */
  defaultEnabled: boolean;
  /** Module is part of the target architecture but has no route/UI yet — rendered disabled with a "Soon" badge instead of linking to a 404. */
  comingSoon?: boolean;
};

/** A dashboard widget a template can contribute (rendered by the dynamic dashboard grid). */
export type DashboardWidgetConfig = {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export type ProductFieldType = "text" | "number" | "date" | "boolean" | "select";

/**
 * Describes one extra product attribute a template needs (IMEI, size,
 * batch number, ISBN, ...). Rendered generically by
 * `components/shared/dynamic-product-fields.tsx` and persisted to
 * `products.customFields` — so a new vertical never needs a schema
 * migration, just a new descriptor.
 */
export type ProductFieldDescriptor = {
  key: string;
  label: string;
  type: ProductFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
};

/** An AI capability a template surfaces. Global features (business/ai-registry.ts) are always listed first; these are vertical-specific additions. */
export type AiFeatureConfig = {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export type ReportConfig = {
  id: string;
  label: string;
  description: string;
};

export type BusinessTemplateConfig = {
  id: BusinessTemplate;
  label: string;
  /** Short description shown on the onboarding template-picker card. */
  description: string;
  /** Lucide icon component for the onboarding card + sidebar branding. */
  icon: LucideIcon;
  /** Feature tags shown on the onboarding card (matches the PRD's per-template feature bullets). */
  featureTags: string[];
  sidebarModules: NavModule[];
  dashboardWidgets: DashboardWidgetConfig[];
  productFields: ProductFieldDescriptor[];
  aiFeatures: AiFeatureConfig[];
  reports: ReportConfig[];
  /**
   * Whether the generic "Expiry date" field on the product form is
   * relevant for this template. Grocery/pharmacy/cosmetics/agriculture
   * track expiry by nature of their goods; most other verticals
   * (fashion, electronics, hardware, ...) don't, so the field is hidden
   * for them rather than shown-but-irrelevant. Product-level expiry is a
   * core column (`products` + `inventory_batches`), not a
   * `productFields` descriptor, which is why this is a flag here rather
   * than just another dynamic field.
   */
  usesExpiryTracking: boolean;
  /**
   * Whether "sold loose, by weight/volume" (fractional quantities, a
   * pack-size field, kg/g/ltr units) is relevant for this template.
   * Grocery, hardware (bulk materials), and agriculture sell this way;
   * fashion, electronics, books, etc. are always sold as whole pieces, so
   * the pricing-type selector and pack-size field are hidden for them
   * rather than shown-but-irrelevant.
   */
  usesWeightBasedPricing: boolean;
};

/** Resolves a tenant's effective enabled-module id set: explicit override if set, otherwise the template's defaults (core modules are always included by the caller). */
export function resolveEnabledModuleIds(
  config: BusinessTemplateConfig,
  enabledModulesOverride: string[] | null | undefined,
): Set<string> {
  if (enabledModulesOverride && enabledModulesOverride.length > 0) {
    return new Set(enabledModulesOverride);
  }
  return new Set(config.sidebarModules.filter((m) => m.defaultEnabled).map((m) => m.id));
}

/**
 * Takes the *full* AI feature list (global + template-specific — callers
 * must pass both, e.g. `[...GLOBAL_AI_FEATURES, ...config.aiFeatures]`)
 * since defaults have to account for both. A previous version of this
 * only looked at `config.aiFeatures` (the template's own additions), so
 * every global feature — including ones with `defaultEnabled: true` like
 * "AI Business Assistant" — always resolved to disabled until a tenant
 * had an explicit override on file.
 */
export function resolveEnabledAiFeatureIds(
  allAiFeatures: AiFeatureConfig[],
  enabledAiFeaturesOverride: string[] | null | undefined,
): Set<string> {
  if (enabledAiFeaturesOverride && enabledAiFeaturesOverride.length > 0) {
    return new Set(enabledAiFeaturesOverride);
  }
  return new Set(allAiFeatures.filter((f) => f.defaultEnabled).map((f) => f.id));
}
