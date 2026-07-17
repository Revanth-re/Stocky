import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { verifyAccessToken } from "./jwt";

/**
 * Reads the current session from the access-token cookie. Cached per-request
 * so Server Components can call `getSession()` freely without duplicate work.
 */
export const getSession = cache(async () => {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        storeId: users.storeId,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
});

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}
