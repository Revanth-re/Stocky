import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { updateProfileSchema } from "@/validators/auth";
import { getSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Not authenticated", 401);
  return ok(session);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  await db
    .update(users)
    .set({ name: parsed.data.name, phone: parsed.data.phone || null, avatarUrl: parsed.data.avatarUrl || null })
    .where(eq(users.id, session.id));

  return ok({ saved: true });
}
