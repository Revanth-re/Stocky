import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { stores, users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import type { RegisterInput, LoginInput } from "@/validators/auth";

export class AuthError extends Error {}

/** Registers a new store owner and creates their store shell (onboarding starts after). */
export async function registerOwner(input: RegisterInput) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) throw new AuthError("An account with this email already exists");

  const store = await db.transaction(async (tx) => {
    const [createdStore] = await tx
      .insert(stores)
      .values({ name: input.storeName, ownerName: input.name, phone: input.phone || "" })
      .$returningId();

    const passwordHash = await hashPassword(input.password);
    const [createdUser] = await tx
      .insert(users)
      .values({
        storeId: createdStore!.id,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        passwordHash,
        role: "owner",
      })
      .$returningId();

    return { storeId: createdStore!.id, userId: createdUser!.id };
  });

  return issueTokens(store.userId, store.storeId, "owner");
}

export async function loginWithPassword(input: LoginInput) {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (!user || !user.isActive) throw new AuthError("Invalid email or password");

  const validPassword = await verifyPassword(input.password, user.passwordHash);
  if (!validPassword) throw new AuthError("Invalid email or password");

  return issueTokens(user.id, user.storeId, user.role);
}

function issueTokens(userId: string, storeId: string, role: "owner" | "manager" | "employee") {
  const accessToken = signAccessToken({ sub: userId, storeId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  return { accessToken, refreshToken };
}
