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
  href: string;
  icon: LucideIcon;
  permission?: Permission;
};

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Inventory", href: "/inventory", icon: Boxes, permission: "inventory.view" },
  { label: "Sales", href: "/sales", icon: Receipt, permission: "sales.view" },
  { label: "Customers", href: "/customers", icon: Users, permission: "customers.view" },
  { label: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList, permission: "purchase_orders.view" },
  { label: "AI Forecast", href: "/forecast", icon: Sparkles, permission: "forecast.view" },
  { label: "Reports", href: "/reports", icon: BarChart3, permission: "reports.view" },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings, permission: "settings.view" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Boxes },
  { label: "Sales", href: "/sales", icon: Receipt },
  { label: "Orders", href: "/purchase-orders", icon: ClipboardList },
  { label: "Profile", href: "/settings/profile", icon: User },
];
