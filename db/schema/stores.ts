import { mysqlEnum, mysqlTable, varchar, text } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, softDelete, jsonColumn } from "./_columns";
import { users } from "./users";
import { products } from "./products";

/**
 * The 12 supported business templates (see `business/registry.ts`). This is
 * the single source of truth for which vertical a tenant operates as — it
 * drives the sidebar, dashboard widgets, product fields, reports, and AI
 * features via the config-driven business-template engine. `custom` opts a
 * tenant out of a preset vertical entirely; every module is then toggled
 * manually via `enabledModules`.
 */
export const businessTemplateEnum = [
  "grocery",
  "pharmacy",
  "fashion",
  "electronics",
  "hardware",
  "food",
  "automobile",
  "furniture",
  "cosmetics",
  "books",
  "agriculture",
  "custom",
] as const;
export type BusinessTemplate = (typeof businessTemplateEnum)[number];

/** @deprecated kept only for the old `store_type` column name during migration — use `businessTemplateEnum`. */
export const storeTypeEnum = businessTemplateEnum;
/** @deprecated use `BusinessTemplate` */
export type StoreType = BusinessTemplate;

export const stores = mysqlTable("stores", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 160 }).notNull(),
  ownerName: varchar("owner_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  gstNumber: varchar("gst_number", { length: 20 }),
  /** VPA for auto-generated UPI payment QR codes on invoices, e.g. "storename@okhdfcbank" */
  upiId: varchar("upi_id", { length: 120 }),
  address: text("address"),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 120 }),
  pincode: varchar("pincode", { length: 12 }),
  /** Which of the 12 business templates this tenant runs as. Drives the whole config-driven engine — see `business/registry.ts`. */
  businessTemplate: mysqlEnum("business_template", businessTemplateEnum).notNull().default("grocery"),
  logoUrl: varchar("logo_url", { length: 512 }),
  /** Selected supplier brands during onboarding (e.g. ["amul","nestle","tata"]) */
  selectedBrandSlugs: jsonColumn<string[]>("selected_brand_slugs").default([]),
  /**
   * Module ids toggled on for this tenant, seeded from the business
   * template's defaults at onboarding and freely editable afterwards
   * (primarily how the `custom` template works, but any template can
   * disable a module it doesn't need). `null` = "use template defaults".
   */
  enabledModules: jsonColumn<string[] | null>("enabled_modules").default(null),
  /** AI feature ids toggled on for this tenant. `null` = "use template defaults". */
  enabledAiFeatures: jsonColumn<string[] | null>("enabled_ai_features").default(null),
  /** Free-form per-tenant overrides for the active template (e.g. custom product-field tweaks). Reserved for the `custom` template and future per-tenant customization. */
  templateSettings: jsonColumn<Record<string, unknown>>("template_settings").default({}),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Asia/Kolkata"),
  onboardingStep: varchar("onboarding_step", { length: 32 }).notNull().default("store_info"),
  onboardingCompletedAt: varchar("onboarding_completed_at", { length: 64 }),
  ...timestamps(),
  ...softDelete(),
});

export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  products: many(products),
}));
