"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/** Generic setter for the key/value `settings` table (appearance, notifications, language…). */
export function useSaveSetting(category: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, key, value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Preference saved");
      queryClient.invalidateQueries({ queryKey: ["settings", category] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
