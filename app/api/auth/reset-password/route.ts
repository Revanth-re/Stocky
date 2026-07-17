import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { resetPasswordSchema } from "@/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  const user = await db.query.users.findFirst({
    where: eq(users.resetPasswordToken, parsed.data.token),
  });

  if (!user || !user.resetPasswordExpiresAt || new Date(user.resetPasswordExpiresAt) < new Date()) {
    return fail("This reset link is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db
    .update(users)
    .set({ passwordHash, resetPasswordToken: null, resetPasswordExpiresAt: null })
    .where(eq(users.id, user.id));

  return ok({ message: "Password updated. You can now log in." });
}
