"use client";
import { Package } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ProductPerformanceRow } from "@/types/dashboard";

export function ProductPerformanceCard({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: ProductPerformanceRow[];
  emptyMessage: string;
}) {
  const { t } = useLanguage();
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
        {rows.map((row, index) => (
          <div key={row.productId} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/50">
            <span className="w-4 text-xs font-medium text-muted-foreground">{index + 1}</span>
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Package className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">{formatNumber(row.unitsSold)} {t("dashboard.unitsSold")}</p>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(row.revenue)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
