"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck } from "lucide-react";
import { useNotifications, useMarkNotificationRead } from "../api/use-notifications";
import { NOTIFICATION_ICON, NOTIFICATION_COLOR } from "./notification-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function NotificationList() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data, isLoading } = useNotifications(filter === "unread" ? { isRead: false } : undefined);
  const markRead = useMarkNotificationRead();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetch("/api/notifications/mark-all-read", { method: "POST" }).then(() => window.location.reload())}
        >
          <CheckCheck className="size-4" /> Mark all as read
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="divide-y divide-border p-0">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="m-4 h-14" />)}
          {!isLoading && data?.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">You&apos;re all caught up!</p>
          )}
          {data?.map((notification) => {
            const Icon = NOTIFICATION_ICON[notification.type];
            return (
              <button
                key={notification.id}
                onClick={() => !notification.isRead && markRead.mutate(notification.id)}
                className={cn("flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40", !notification.isRead && "bg-accent/40")}
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", NOTIFICATION_COLOR[notification.type])}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
