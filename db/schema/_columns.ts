import { timestamp, customType } from "drizzle-orm/mysql-core";

/**
 * A JSON column that reads back correctly on MariaDB, not just MySQL.
 *
 * Root cause of the "toggle a switch, it saves, but reads back as off"
 * bug: MariaDB's `JSON` column type is only a `LONGTEXT` alias with a
 * CHECK constraint — there is no native JSON wire type. mysql2 only
 * auto-parses columns the server reports as its true JSON field type, so
 * on MariaDB it hands back the raw string, e.g. `'["sales-forecast"]'`,
 * instead of an array. Drizzle's built-in `json()` column
 * (drizzle-orm/mysql-core/columns/json.js) has no `mapFromDriverValue` —
 * it assumes the driver already parsed it — so that raw string flows
 * straight into app code. `new Set(aRawJsonString)` then builds a Set of
 * *characters*, not the one array element, so every `.has(id)` check
 * silently comes back false: a write that fully succeeded looks, from
 * the read side, like it reverted.
 *
 * This wrapper parses defensively on read (only if the driver handed
 * back a string) and stringifies on write, so it's correct on both
 * MySQL (native JSON, pre-parsed by the driver) and MariaDB (raw text).
 */
export const jsonColumn = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType() {
      return "json";
    },
    toDriver(value: T): string {
      return JSON.stringify(value);
    },
    fromDriver(value: string | T): T {
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      }
      return value;
    },
  })(name);

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
