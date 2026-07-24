import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Users,
  Truck,
  ClipboardList,
  BarChart3,
  Wallet,
  Bell,
  Settings,
  Sparkles,
} from "lucide-react";
import type { NavModule } from "./types";

/**
 * The modules every tenant gets regardless of business template (PRD:
 * "CORE MODULES — Every business gets: Dashboard, POS Sales, Inventory,
 * Products, Customers, Suppliers, Purchases, Reports, Expenses,
 * Notifications, Settings, AI Assistant").
 *
 * `comingSoon: true` marks a core module that's part of the target
 * architecture but doesn't have a route/UI yet in this codebase — the
 * dynamic sidebar skips these for now rather than linking to a 404.
 * Remove the flag as each one ships (see ARCHITECTURE.md phase 2).
 */
export const CORE_MODULES: NavModule[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view", defaultEnabled: true },
  { id: "sales", label: "POS / Sales", href: "/sales", icon: Receipt, permission: "sales.view", defaultEnabled: true },
  // "Products" is folded into Inventory in this codebase (catalog + stock live together) rather than a
  // separate top-level page — see ARCHITECTURE.md. Kept as one core module id, "inventory".
  { id: "inventory", label: "Inventory", href: "/inventory", icon: Boxes, permission: "inventory.view", defaultEnabled: true },
  { id: "customers", label: "Customers", href: "/customers", icon: Users, permission: "customers.view", defaultEnabled: true },
  { id: "suppliers", label: "Suppliers", href: "/settings/suppliers", icon: Truck, permission: "settings.view", defaultEnabled: true },
  { id: "purchases", label: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList, permission: "purchase_orders.view", defaultEnabled: true },
  { id: "reports", label: "Reports", href: "/reports", icon: BarChart3, permission: "reports.view", defaultEnabled: true },
  { id: "expenses", label: "Expenses", href: "/expenses", icon: Wallet, permission: "reports.view", defaultEnabled: true, comingSoon: true },
  { id: "notifications", label: "Notifications", href: "/notifications", icon: Bell, defaultEnabled: true },
  { id: "ai-assistant", label: "AI Assistant", href: "/forecast", icon: Sparkles, permission: "forecast.view", defaultEnabled: true },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, permission: "settings.view", defaultEnabled: true },
];

export const CORE_MODULE_IDS = CORE_MODULES.map((m) => m.id);
