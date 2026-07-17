import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { forgotPasswordSchema } from "@/validators/auth";
import { ok, failFromZod } from "@/lib/api-response";
// import { sendPasswordResetEmail } from "@/services/email-service"; // wired up when RESEND_API_KEY is set

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });

  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    const token = nanoid(48);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min
    await db
      .update(users)
      .set({ resetPasswordToken: token, resetPasswordExpiresAt: expiresAt })
      .where(eq(users.id, user.id));

    // await sendPasswordResetEmail(user.email, token);
  }

  return ok({ message: "If that email exists, a reset link has been sent." });
}
