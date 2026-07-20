"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { BundleDTO } from "@/types/bundle";
import type { BundleInput } from "@/validators/bundle";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useBundles(activeOnly = false) {
  return useQuery({
    queryKey: ["bundles", activeOnly],
    queryFn: () => getJson<BundleDTO[]>(`/api/bundles${activeOnly ? "?activeOnly=true" : ""}`),
  });
}

export function useCreateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BundleInput) => {
      const res = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Combo created");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateBundle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BundleInput) => {
      const res = await fetch(`/api/bundles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Combo updated");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bundles/${id}`, { method: "DELETE" });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Combo deleted");
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
