import { mysqlTable, varchar, int, decimal, mysqlEnum, text, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps } from "./_columns";
import { stores } from "./stores";
import { products } from "./products";

export const forecastPriorityEnum = ["high", "medium", "low"] as const;
export type ForecastPriority = (typeof forecastPriorityEnum)[number];

export const forecastStatusEnum = ["pending", "ready", "stale", "failed"] as const;

/**
 * Persisted output of the (future) Python FastAPI forecasting service
 * (Prophet / XGBoost). The frontend never computes predictions itself —
 * it only reads/writes rows here via /api/forecast, so swapping the
 * placeholder generator for the real service requires no UI changes.
 */
export const forecasts = mysqlTable(
  "forecasts",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    productId: varchar("product_id", { length: 21 }).notNull(),
    currentStock: int("current_stock").notNull(),
    predictedDemand: int("predicted_demand").notNull(),
    suggestedOrderQty: int("suggested_order_qty").notNull(),
    /** 0-100 confidence score returned by the model. */
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }).notNull(),
    priority: mysqlEnum("priority", forecastPriorityEnum).notNull().default("medium"),
    status: mysqlEnum("status", forecastStatusEnum).notNull().default("ready"),
    /** Human-readable explanation, e.g. "Will run out in 2 days based on 7-day velocity". */
    reason: text("reason"),
    /** Raw model metadata: algorithm used, feature importances, seasonality flags, etc. */
    modelMeta: json("model_meta").$type<Record<string, unknown>>(),
    /** Chart series: [{ date, actual, predicted }] for the forecast sparkline. */
    series: json("series").$type<Array<{ date: string; actual?: number; predicted: number }>>(),
    willStockOutAt: varchar("will_stock_out_at", { length: 32 }),
    generatedAt: varchar("generated_at", { length: 64 }).notNull(),
    ...timestamps(),
  },
  (table) => [
    index("forecasts_store_id_idx").on(table.storeId),
    index("forecasts_product_id_idx").on(table.productId),
    index("forecasts_priority_idx").on(table.priority),
  ],
);

export const forecastsRelations = relations(forecasts, ({ one }) => ({
  store: one(stores, { fields: [forecasts.storeId], references: [stores.id] }),
  product: one(products, { fields: [forecasts.productId], references: [products.id] }),
}));
