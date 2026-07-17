"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/auth";
import type { NotificationDTO } from "@/types/notification";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useNotifications(filters?: { type?: string; isRead?: boolean }) {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.type) params.set("type", filters.type);
      if (filters?.isRead !== undefined) params.set("isRead", String(filters.isRead));
      return getJson<NotificationDTO[]>(`/api/notifications?${params}`);
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const notifications = await getJson<NotificationDTO[]>("/api/notifications?isRead=false");
      return notifications.length;
    },
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
