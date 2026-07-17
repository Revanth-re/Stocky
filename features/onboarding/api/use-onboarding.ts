// "use client";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import type { CompleteOnboardingInput } from "@/validators/onboarding";
// import type { GlobalCatalogProduct } from "@/lib/catalog/global-catalog";
// import type { ApiResponse } from "@/types/auth";

// export function useCatalogForBrands(brandSlugs: string[]) {
//   return useQuery({
//     queryKey: ["onboarding-catalog", brandSlugs],
//     queryFn: async () => {
//       const params = new URLSearchParams({ brands: brandSlugs.join(",") });
//       const res = await fetch(`/api/onboarding/catalog?${params}`);
//       const json: ApiResponse<GlobalCatalogProduct[]> = await res.json();
//       if (!json.success) throw new Error(json.error);
//       return json.data;
//     },
//     enabled: brandSlugs.length > 0,
//   });
// }

// export function useCompleteOnboarding() {
//   const router = useRouter();
//   return useMutation({
//     mutationFn: async (input: CompleteOnboardingInput) => {
//       const res = await fetch("/api/onboarding", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(input),
//       });
//       const json: ApiResponse<{ redirectTo: string }> = await res.json();
//       if (!json.success) throw new Error(json.error);
//       return json.data;
//     },
//     onSuccess: (data) => {
//       toast.success("Store set up! Welcome to your dashboard.");
//       router.push(data.redirectTo);
//     },
//     onError: (error: Error) => toast.error(error.message),
//   });
// }
"use client";
import type { Route } from "next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { CompleteOnboardingInput } from "@/validators/onboarding";
import type { GlobalCatalogProduct } from "@/lib/catalog/global-catalog";
import type { ApiResponse } from "@/types/auth";

export function useCatalogForBrands(brandSlugs: string[]) {
  return useQuery({
    queryKey: ["onboarding-catalog", brandSlugs],
    queryFn: async () => {
      const params = new URLSearchParams({ brands: brandSlugs.join(",") });
      const res = await fetch(`/api/onboarding/catalog?${params}`);
      const json: ApiResponse<GlobalCatalogProduct[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: brandSlugs.length > 0,
  });
}

export function useCompleteOnboarding() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: CompleteOnboardingInput) => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ redirectTo: string }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success("Store set up! Welcome to your dashboard.");
      router.push(data.redirectTo as Route);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}