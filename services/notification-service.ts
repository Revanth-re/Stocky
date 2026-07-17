import { and, desc, eq, or, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import type { NotificationType } from "@/db/schema";
import type { NotificationDTO } from "@/types/notification";

export async function listNotifications(
  storeId: string,
  userId: string,
  filters: { type?: NotificationType; isRead?: boolean } = {},
): Promise<NotificationDTO[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.storeId, storeId),
        or(eq(notifications.userId, userId), isNull(notifications.userId)),
        filters.type ? eq(notifications.type, filters.type) : undefined,
        filters.isRead !== undefined ? eq(notifications.isRead, filters.isRead) : undefined,
      ),
    )
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    isRead: r.isRead,
    metadata: r.metadata,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(id: string, isRead: boolean) {
  await db.update(notifications).set({ isRead }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(storeId: string, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.storeId, storeId), or(eq(notifications.userId, userId), isNull(notifications.userId))));
}
