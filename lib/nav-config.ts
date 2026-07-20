import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  Receipt,
  Users,
  ClipboardList,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  User,
} from "lucide-react";
import type { Permission } from "@/lib/auth/rbac";

export type NavItem = {
  label: string;
  labelKey: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
};

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Inventory", labelKey: "nav.inventory", href: "/inventory", icon: Boxes, permission: "inventory.view" },
  { label: "Sales", labelKey: "nav.sales", href: "/sales", icon: Receipt, permission: "sales.view" },
  { label: "Customers", labelKey: "nav.customers", href: "/customers", icon: Users, permission: "customers.view" },
  { label: "Purchase Orders", labelKey: "nav.purchaseOrders", href: "/purchase-orders", icon: ClipboardList, permission: "purchase_orders.view" },
  { label: "AI Forecast", labelKey: "nav.aiForecast", href: "/forecast", icon: Sparkles, permission: "forecast.view" },
  { label: "Reports", labelKey: "nav.reports", href: "/reports", icon: BarChart3, permission: "reports.view" },
  { label: "Notifications", labelKey: "nav.notifications", href: "/notifications", icon: Bell },
  { label: "Settings", labelKey: "nav.settings", href: "/settings", icon: Settings, permission: "settings.view" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Dashboard", labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", labelKey: "nav.inventory", href: "/inventory", icon: Boxes },
  { label: "Sales", labelKey: "nav.sales", href: "/sales", icon: Receipt },
  { label: "Orders", labelKey: "nav.orders", href: "/purchase-orders", icon: ClipboardList },
  { label: "Profile", labelKey: "nav.profile", href: "/settings/profile", icon: User },
];
