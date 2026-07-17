"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/types/auth";
import type { SalesImportRow } from "@/validators/sales-import";

type ImportResult = { imported: number; skipped: number; skippedRows: { row: number; reason: string }[] };

export function useImportSales() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: SalesImportRow[]) => {
      const res = await fetch("/api/sales/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const json: ApiResponse<ImportResult> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.imported} sales${data.skipped ? ` (${data.skipped} skipped)` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
