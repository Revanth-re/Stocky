import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import type { UserRole } from "@/db/schema";

export async function listStoreUsers(storeId: string) {
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.storeId, storeId));
}

export async function inviteUser(storeId: string, input: { name: string; email: string; role: UserRole; temporaryPassword: string }) {
  const passwordHash = await hashPassword(input.temporaryPassword);
  const [created] = await db
    .insert(users)
    .values({ storeId, name: input.name, email: input.email, role: input.role, passwordHash })
    .$returningId();
  return created!.id;
}

export async function updateUserRole(storeId: string, userId: string, role: UserRole) {
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserStatus(storeId: string, userId: string, isActive: boolean) {
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}
