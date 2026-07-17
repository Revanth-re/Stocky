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
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysqlPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
export type Database = typeof db;
