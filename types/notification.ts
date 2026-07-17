import type { NotificationType } from "@/db/schema";

export type NotificationDTO = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};
