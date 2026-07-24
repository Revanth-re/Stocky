import { LayoutDashboard, Boxes, Receipt, ClipboardList, User } from "lucide-react";
import type { BusinessTemplate, UserRole } from "@/db/schema";
import { can } from "@/lib/auth/rbac";
import { CORE_MODULES } from "@/business/core-modules";
import { getBusinessTemplate } from "@/business/registry";
import type { NavModule } from "@/business/types";

export type { NavModule };

/**
 * The dynamic sidebar engine (PRD: "Dynamic Systems — Create reusable
 * engines instead of hardcoding"). Nothing here hardcodes a business
 * vertical: it merges the always-on core modules with the active tenant's
 * business-template config (`business/registry.ts`), filters by RBAC
 * permission and the tenant's `enabledModules` override, and returns a
 * flat, render-ready list. `Sidebar` / `MobileBottomNav` never branch on
 * business template themselves — they just render whatever this returns.
 */

/** Core module id -> i18n key (falls back to the module's plain label when no translation exists). */
const CORE_LABEL_KEYS: Record<string, string> = {
  dashboard: "nav.dashboard",
  sales: "nav.sales",
  inventory: "nav.inventory",
  customers: "nav.customers",
  suppliers: "nav.suppliers",
  purchases: "nav.purchaseOrders",
  reports: "nav.reports",
  expenses: "nav.expenses",
  notifications: "nav.notifications",
  "ai-assistant": "nav.aiForecast",
  settings: "nav.settings",
};

export type ResolvedNavItem = NavModule & {
  /** i18n key to look up via `useLanguage().t()`; falls back to `label` when absent (business-template extras aren't translated yet — see ARCHITECTURE.md). */
  labelKey?: string;
  /** Core modules ship with every template; non-core come from the active business template. */
  isCore: boolean;
};

export function getSidebarNav(params: {
  businessTemplate: BusinessTemplate;
  role: UserRole;
  /** Tenant's `stores.enabledModules` override — `null`/empty means "use defaults". */
  enabledModules?: string[] | null;
}): ResolvedNavItem[] {
  const { businessTemplate, role, enabledModules } = params;
  const config = getBusinessTemplate(businessTemplate);
  const override = enabledModules && enabledModules.length > 0 ? new Set(enabledModules) : null;

  // Core modules are always on for every tenant (PRD: "Every business gets ...") — the
  // enabledModules override only ever applies to a template's optional extras below. A
  // previous version of this filter also applied `override` here, which meant any tenant
  // who had *any* enabledModules override set (even just to toggle one optional extra) lost
  // every core sidebar item, since none of their ids were in that override set.
  const core: ResolvedNavItem[] = CORE_MODULES.filter((m) => !m.comingSoon)
    .filter((m) => !m.permission || can(role, m.permission))
    .map((m) => ({ ...m, labelKey: CORE_LABEL_KEYS[m.id], isCore: true }));

  const extras: ResolvedNavItem[] = config.sidebarModules
    .filter((m) => (override ? override.has(m.id) : m.defaultEnabled))
    .filter((m) => !m.permission || can(role, m.permission))
    .map((m) => ({ ...m, isCore: false }));

  return [...core, ...extras];
}

/** A deliberately small, fixed subset for the mobile bottom nav (5 slots max around the quick-action button) — always core, never business-template extras. */
const MOBILE_MODULE_IDS = ["dashboard", "inventory", "sales", "purchases"] as const;
const MOBILE_ICON_OVERRIDES: Partial<Record<string, typeof LayoutDashboard>> = {
  dashboard: LayoutDashboard,
  inventory: Boxes,
  sales: Receipt,
  purchases: ClipboardList,
};

export function getMobileNav(params: { role: UserRole }): ResolvedNavItem[] {
  const { role } = params;
  const core = CORE_MODULES.filter((m) => (MOBILE_MODULE_IDS as readonly string[]).includes(m.id))
    .filter((m) => !m.permission || can(role, m.permission))
    .map((m) => ({
      ...m,
      icon: MOBILE_ICON_OVERRIDES[m.id] ?? m.icon,
      label: m.id === "purchases" ? "Orders" : m.label,
      labelKey: m.id === "purchases" ? "nav.orders" : CORE_LABEL_KEYS[m.id],
      isCore: true,
    }));

  const profile: ResolvedNavItem = {
    id: "profile",
    label: "Profile",
    labelKey: "nav.profile",
    href: "/settings/profile",
    icon: User,
    defaultEnabled: true,
    isCore: true,
  };

  return [...core, profile];
}
