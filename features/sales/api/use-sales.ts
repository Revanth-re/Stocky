"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { SaleDetail, SaleListRow } from "@/types/sale";
import type { RecordSaleInput } from "@/validators/sale";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useSales(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ["sales", page, pageSize],
    queryFn: () => getJson<{ items: SaleListRow[]; total: number }>(`/api/sales?page=${page}&pageSize=${pageSize}`),
    placeholderData: (prev) => prev,
  });
}

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () => getJson<SaleDetail>(`/api/sales/${id}`),
    enabled: !!id,
  });
}

export function useRecordSale() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: RecordSaleInput) => {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ saleId: string; invoiceNumber: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`Sale recorded — ${data.invoiceNumber}`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      router.push(`/sales/${data.saleId}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
