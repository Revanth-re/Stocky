import type { UserRole } from "@/db/schema";

export const PERMISSIONS = [
  "dashboard.view",
  "inventory.view",
  "inventory.edit",
  "sales.view",
  "sales.create",
  "purchase_orders.view",
  "purchase_orders.create",
  "purchase_orders.approve",
  "forecast.view",
  "forecast.generate",
  "reports.view",
  "reports.export",
  "settings.view",
  "settings.edit",
  "users.manage",
  "customers.view",
  "customers.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/** Default permission matrix. Stores may override via the `settings` table (category = "permissions"). */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [...PERMISSIONS],
  manager: [
    "dashboard.view",
    "inventory.view",
    "inventory.edit",
    "sales.view",
    "sales.create",
    "purchase_orders.view",
    "purchase_orders.create",
    "purchase_orders.approve",
    "forecast.view",
    "forecast.generate",
    "reports.view",
    "reports.export",
    "settings.view",
    "customers.view",
    "customers.manage",
  ],
  employee: ["dashboard.view", "inventory.view", "sales.view", "sales.create", "reports.view", "customers.view"],
};

export function can(role: UserRole, permission: Permission) {
  return DEFAULT_ROLE_PERMISSIONS[role].includes(permission);
}
