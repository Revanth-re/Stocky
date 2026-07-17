import { requireSession } from "@/lib/auth/session";
import { markAllNotificationsRead } from "@/services/notification-service";
import { ok, fail } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await requireSession();
    await markAllNotificationsRead(session.storeId, session.id);
    return ok({ message: "All notifications marked as read" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/notifications mark-all-read]", error);
    return fail("Could not update notifications", 500);
  }
}
