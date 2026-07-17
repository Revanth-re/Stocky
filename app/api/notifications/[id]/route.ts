import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { markNotificationRead } from "@/services/notification-service";
import { ok, fail, failFromZod } from "@/lib/api-response";

const patchSchema = z.object({ isRead: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    await requireSession();
    await markNotificationRead(id, parsed.data.isRead);
    return ok({ id, isRead: parsed.data.isRead });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/notifications PATCH]", error);
    return fail("Could not update notification", 500);
  }
}
