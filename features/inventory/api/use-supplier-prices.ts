"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { SupplierPriceRow } from "@/types/supplier-price";
import type { UpsertSupplierPriceInput } from "@/validators/supplier-price";

export function useSupplierPrices(productId: string) {
  return useQuery({
    queryKey: ["supplier-prices", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/supplier-prices`);
      const json: ApiResponse<SupplierPriceRow[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useUpsertSupplierPrice(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertSupplierPriceInput) => {
      const res = await fetch(`/api/products/${productId}/supplier-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ saved: boolean }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Price saved");
      queryClient.invalidateQueries({ queryKey: ["supplier-prices", productId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
