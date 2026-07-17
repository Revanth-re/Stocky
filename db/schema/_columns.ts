import { timestamp } from "drizzle-orm/mysql-core";

/**
 * Shared timestamp columns applied to (almost) every table.
 *
 * IMPORTANT: these are FUNCTIONS, not plain objects. Drizzle column
 * builders get bound to a specific table when the schema is built, so
 * reusing the same builder *instance* across multiple tables corrupts
 * whichever table gets built last. Always call `timestamps()` /
 * `softDelete()` fresh inside each table definition.
 */
export const timestamps = () => ({
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const softDelete = () => ({
  deletedAt: timestamp("deleted_at"),
});
