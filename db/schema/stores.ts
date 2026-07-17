import { mysqlEnum, mysqlTable, varchar, text, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, softDelete } from "./_columns";
import { users } from "./users";
import { products } from "./products";

export const storeTypeEnum = [
  "grocery",
  "super_market",
  "bakery",
  "pharmacy",
  "general_store",
] as const;
export type StoreType = (typeof storeTypeEnum)[number];

export const stores = mysqlTable("stores", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 160 }).notNull(),
  ownerName: varchar("owner_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  gstNumber: varchar("gst_number", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 120 }),
  pincode: varchar("pincode", { length: 12 }),
  storeType: mysqlEnum("store_type", storeTypeEnum),
  logoUrl: varchar("logo_url", { length: 512 }),
  /** Selected supplier brands during onboarding (e.g. ["amul","nestle","tata"]) */
  selectedBrandSlugs: json("selected_brand_slugs").$type<string[]>().default([]),
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
