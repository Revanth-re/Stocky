import { Ghost } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { DeadStockRow } from "@/types/dashboard";

export function DeadStockCard({ rows }: { rows: DeadStockRow[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Dead Stock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No dead stock — nice work!</p>
        )}
        {rows.map((row) => (
          <div key={row.productId} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-muted/50">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Ghost className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                No sales in {row.daysSinceLastSale >= 999 ? "60+" : row.daysSinceLastSale} days
              </p>
            </div>
            <p className="text-sm font-semibold">{formatNumber(row.currentStock)} left</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
