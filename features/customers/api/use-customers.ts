"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { CustomerListResult, CustomerDetail } from "@/types/customer";
import type { CustomerInput, RecordPaymentInput } from "@/validators/customer";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useCustomers(search: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("pageSize", "50");
      return getJson<CustomerListResult>(`/api/customers?${params}`);
    },
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getJson<CustomerDetail>(`/api/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Customer added");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRecordCustomerPayment(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecordPaymentInput) => {
      const res = await fetch(`/api/customers/${customerId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ newBalance: number }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
