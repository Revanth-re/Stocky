"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { UpdateEnabledModulesInput } from "@/validators/settings";

export type ModulesSettingsView = {
  businessTemplate: string;
  templateLabel: string;
  coreModules: { id: string; label: string; alwaysOn: true }[];
  templateModules: { id: string; label: string; comingSoon: boolean; enabled: boolean }[];
  aiFeatures: { id: string; label: string; description: string; enabled: boolean; implemented: boolean }[];
};

const MODULES_QUERY_KEY = ["modules-settings"];

export function useModulesSettings() {
  return useQuery({
    queryKey: MODULES_QUERY_KEY,
    queryFn: async ({ signal }) => {
      // `no-store`: this gets refetched immediately after every toggle save (see
      // useUpdateModulesSettings#onSettled) — without this, the browser can serve a cached
      // response for that refetch and the just-saved change never shows up, making a toggle
      // that genuinely saved correctly look like it "went back off" on its own.
      // `signal`: wires React Query's own AbortController through so an earlier in-flight GET
      // (e.g. the initial page-load fetch) is actually network-cancelled by
      // `cancelQueries()` in `onMutate` below, instead of being left to resolve later and
      // silently overwrite a newer cache entry with stale data.
      const res = await fetch("/api/settings/modules", { cache: "no-store", signal });
      const json: ApiResponse<ModulesSettingsView> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useUpdateModulesSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateEnabledModulesInput) => {
      const res = await fetch("/api/settings/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<{ saved: boolean }> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    // Flip the switch the instant it's clicked instead of waiting on a round trip + refetch to
    // confirm the new state — a slow network or a refetch that lands on a stale response
    // previously made toggles look like they "didn't take" even when the save succeeded. Explicit
    // id-array updates (individual toggles) apply optimistically; a `null` (Reset to defaults)
    // is left to resolve from the server response since computing defaults client-side would
    // duplicate `business/types.ts#resolveEnabledAiFeatureIds`.
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: MODULES_QUERY_KEY });
      const previous = queryClient.getQueryData<ModulesSettingsView>(MODULES_QUERY_KEY);

      queryClient.setQueryData<ModulesSettingsView>(MODULES_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          templateModules:
            input.enabledModules !== undefined && input.enabledModules !== null
              ? old.templateModules.map((m) => ({ ...m, enabled: input.enabledModules!.includes(m.id) }))
              : old.templateModules,
          aiFeatures:
            input.enabledAiFeatures !== undefined && input.enabledAiFeatures !== null
              ? old.aiFeatures.map((f) => ({ ...f, enabled: input.enabledAiFeatures!.includes(f.id) }))
              : old.aiFeatures,
        };
      });

      return { previous };
    },
    onError: (error: Error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(MODULES_QUERY_KEY, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Modules updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
    },
  });
}
