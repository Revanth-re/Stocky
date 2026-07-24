import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

/**
 * Reuse a single connection pool across hot-reloads in dev and across
 * warm serverless invocations in production.
 */
const pool =
  global.__mysqlPool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
    waitForConnections: true,
    // Explicit utf8mb4 so ₹ (and any other non-ASCII/emoji) round-trips correctly regardless of
    // the MySQL/MariaDB server's default charset — mysql2's own default is the legacy 3-byte
    // "utf8", and if the target database/table was created without an explicit charset (common on
    // local MySQL/MariaDB installs, e.g. XAMPP defaulting to latin1), inserts containing ₹ or
    // similar characters fail at the driver/column level. This only fixes the connection side —
    // if the database itself wasn't created with utf8mb4, it also needs converting; see the
    // troubleshooting note in README.
    charset: "utf8mb4",
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysqlPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
export type Database = typeof db;
