// "use client";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import type { ApiResponse } from "@/types/auth";
// import type { PurchaseOrderDetail, PurchaseOrderListRow } from "@/types/purchase-order";
// import type { CreatePurchaseOrderInput } from "@/validators/purchase-order";
// import type { PurchaseOrderStatus } from "@/db/schema";

// async function getJson<T>(url: string): Promise<T> {
//   const res = await fetch(url);
//   const json: ApiResponse<T> = await res.json();
//   if (!json.success) throw new Error(json.error);
//   return json.data;
// }

// export function usePurchaseOrders(page: number, pageSize = 20) {
//   return useQuery({
//     queryKey: ["purchase-orders", page, pageSize],
//     queryFn: () => getJson<{ items: PurchaseOrderListRow[]; total: number }>(`/api/purchase-orders?page=${page}&pageSize=${pageSize}`),
//     placeholderData: (prev) => prev,
//   });
// }

// export function usePurchaseOrder(id: string | undefined) {
//   return useQuery({
//     queryKey: ["purchase-order", id],
//     queryFn: () => getJson<PurchaseOrderDetail>(`/api/purchase-orders/${id}`),
//     enabled: !!id,
//   });
// }

// export function useCreatePurchaseOrder() {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   return useMutation({
//     mutationFn: async (input: CreatePurchaseOrderInput) => {
//       const res = await fetch("/api/purchase-orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(input),
//       });
//       const json: ApiResponse<{ id: string; poNumber: string }> = await res.json();
//       if (!json.success) throw new Error(json.error);
//       return json.data;
//     },
//     onSuccess: (data) => {
//       toast.success(`Purchase order ${data.poNumber} created`);
//       queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
//       router.push(`/purchase-orders/${data.id}`);
//     },
//     onError: (error: Error) => toast.error(error.message),
//   });
// }

// export function useUpdatePurchaseOrderStatus(id: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (status: PurchaseOrderStatus) => {
//       const res = await fetch(`/api/purchase-orders/${id}/status`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status }),
//       });
//       const json: ApiResponse<{ id: string; status: string }> = await res.json();
//       if (!json.success) throw new Error(json.error);
//       return json.data;
//     },
//     onSuccess: () => {
//       toast.success("Purchase order updated");
//       queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
//       queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//     onError: (error: Error) => toast.error(error.message),
//   });
// }
"use client";
import type { Route } from "next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { PurchaseOrderDetail, PurchaseOrderListRow } from "@/types/purchase-order";
import type { CreatePurchaseOrderInput } from "@/validators/purchase-order";
import type { PurchaseOrderStatus } from "@/db/schema";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function usePurchaseOrders(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ["purchase-orders", page, pageSize],
    queryFn: () => getJson<{ items: PurchaseOrderListRow[]; total: number }>(`/api/purchase-orders?page=${page}&pageSize=${pageSize}`),
    placeholderData: (prev) => prev,
  });
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => getJson<PurchaseOrderDetail>(`/api/purchase-orders/${id}`),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) => {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string; poNumber: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`Purchase order ${data.poNumber} created`);
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      router.push(`/purchase-orders/${data.id}` as Route);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export type ReceivedItemExpiry = { productId: string; expiryDate?: string };

export function useUpdatePurchaseOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { status: PurchaseOrderStatus; items?: ReceivedItemExpiry[] }) => {
      const res = await fetch(`/api/purchase-orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string; status: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Purchase order updated");
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}