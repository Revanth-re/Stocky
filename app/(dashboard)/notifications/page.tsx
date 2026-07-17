import type { Metadata } from "next";
import { NotificationList } from "@/features/notifications/components/notification-list";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay on top of stock, orders, and AI insights.</p>
      </div>
      <NotificationList />
    </div>
  );
}
