"use client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/auth";
import type { ReportResult, ReportType } from "@/types/report";

export function useReport(type: ReportType, range: "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: ["report", type, range],
    queryFn: async () => {
      const res = await fetch(`/api/reports?type=${type}&range=${range}`);
      const json: ApiResponse<ReportResult> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}
