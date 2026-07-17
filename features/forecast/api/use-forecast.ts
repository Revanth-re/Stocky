"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { ForecastDTO, ForecastSummary } from "@/types/forecast";

type ForecastResponse = { items: ForecastDTO[]; summary: ForecastSummary };

export function useForecasts(priority?: "high" | "medium" | "low", productId?: string) {
  return useQuery({
    queryKey: ["forecasts", priority, productId],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(priority ? { priority } : {}),
        ...(productId ? { productId } : {}),
      });
      const res = await fetch(`/api/forecast?${params}`);
      const json: ApiResponse<ForecastResponse> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useGenerateForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productIds?: string[]) => {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      const json: ApiResponse<{ generated: number }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`Forecast updated for ${data.generated} products`);
      queryClient.invalidateQueries({ queryKey: ["forecasts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
