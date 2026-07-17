"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { SupplierInput, CategoryInput, BrandInput } from "@/validators/catalog";

type Supplier = { id: string; name: string };
type Category = { id: string; name: string };
type Brand = { id: string; name: string };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

function usePost<TInput>(url: string, invalidateKey: string, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TInput) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export const useSuppliers = () => useQuery({ queryKey: ["suppliers"], queryFn: () => getJson<Supplier[]>("/api/suppliers") });
export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: () => getJson<Category[]>("/api/categories") });
export const useBrands = () => useQuery({ queryKey: ["brands"], queryFn: () => getJson<Brand[]>("/api/brands") });

export const useCreateSupplier = () => usePost<SupplierInput>("/api/suppliers", "suppliers", "Supplier added");
export const useCreateCategory = () => usePost<CategoryInput>("/api/categories", "categories", "Category added");
export const useCreateBrand = () => usePost<BrandInput>("/api/brands", "brands", "Brand added");
