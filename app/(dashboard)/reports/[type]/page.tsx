import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView } from "@/features/reports/components/report-view";
import type { ReportType } from "@/types/report";

const VALID_TYPES: ReportType[] = [
  "revenue",
  "profit",
  "sales",
  "inventory",
  "fast-moving",
  "slow-moving",
  "dead-stock",
  "category-performance",
];

export const metadata: Metadata = { title: "Report" };

export default async function ReportDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type as ReportType)) notFound();

  return (
    <div className="space-y-6">
      <ReportView type={type as ReportType} />
    </div>
  );
}
