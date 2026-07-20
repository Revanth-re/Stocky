"use client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/auth";
import type { InventoryBatch } from "@/types/product";

export function useInventoryBatches(productId: string) {
  return useQuery({
    queryKey: ["inventory-batches", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/batches`);
      const json: ApiResponse<InventoryBatch[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}
