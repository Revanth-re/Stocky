"use client";
import { Ghost } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { DeadStockRow } from "@/types/dashboard";

export function DeadStockCard({ rows }: { rows: DeadStockRow[] }) {
  const { t } = useLanguage();
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{t("dashboard.deadStockTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.noDeadStock")}</p>
        )}
        {rows.map((row) => (
          <div key={row.productId} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/50">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Ghost className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.noSalesInDaysPrefix")} {row.daysSinceLastSale >= 999 ? "60+" : row.daysSinceLastSale} {t("dashboard.days")}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatNumber(row.currentStock)} {t("dashboard.left")}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
