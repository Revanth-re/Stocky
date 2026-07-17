import { mysqlEnum, mysqlTable, varchar, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { timestamps, softDelete } from "./_columns";
import { stores } from "./stores";
import { activityLogs } from "./activity-logs";
import { notifications } from "./notifications";

/** Store-level role. Permission granularity lives in `settings` (role -> permission map). */
export const userRoleEnum = ["owner", "manager", "employee"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    storeId: varchar("store_id", { length: 21 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 191 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", userRoleEnum).notNull().default("employee"),
    avatarUrl: varchar("avatar_url", { length: 512 }),
    isActive: boolean("is_active").notNull().default(true),
    emailVerifiedAt: varchar("email_verified_at", { length: 64 }),
    resetPasswordToken: varchar("reset_password_token", { length: 191 }),
    resetPasswordExpiresAt: varchar("reset_password_expires_at", { length: 64 }),
    ...timestamps(),
    ...softDelete(),
  },
  (table) => [
    index("users_store_id_idx").on(table.storeId),
    index("users_email_idx").on(table.email),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, { fields: [users.storeId], references: [stores.id] }),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
}));
