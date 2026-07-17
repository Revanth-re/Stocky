"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { StoreProfileInput } from "@/validators/settings";

export function useStoreProfile() {
  return useQuery({
    queryKey: ["store-profile"],
    queryFn: async () => {
      const res = await fetch("/api/settings/store");
      const json: ApiResponse<StoreProfileInput & { id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useUpdateStoreProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StoreProfileInput) => {
      const res = await fetch("/api/settings/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ saved: boolean }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Store profile updated");
      queryClient.invalidateQueries({ queryKey: ["store-profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
