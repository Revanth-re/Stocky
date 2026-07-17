import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listNotifications } from "@/services/notification-service";
import type { NotificationType } from "@/db/schema";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") as NotificationType | null;
  const isReadParam = req.nextUrl.searchParams.get("isRead");

  try {
    const session = await requireSession();
    const items = await listNotifications(session.storeId, session.id, {
      type: type ?? undefined,
      isRead: isReadParam === null ? undefined : isReadParam === "true",
    });
    return ok(items);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/notifications GET]", error);
    return fail("Could not load notifications", 500);
  }
}
