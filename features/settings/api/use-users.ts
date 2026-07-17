"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { UserRole } from "@/db/schema";

export type StoreUser = { id: string; name: string; email: string; role: UserRole; isActive: boolean; avatarUrl: string | null };

export function useStoreUsers() {
  return useQuery({
    queryKey: ["store-users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      const json: ApiResponse<StoreUser[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; role: UserRole; temporaryPassword: string }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Team member added");
      queryClient.invalidateQueries({ queryKey: ["store-users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["store-users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
