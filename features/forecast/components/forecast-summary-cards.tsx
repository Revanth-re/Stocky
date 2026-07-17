import { AlertTriangle, IndianRupee, ListChecks, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ForecastSummary } from "@/types/forecast";

export function ForecastSummaryCards({ summary }: { summary: ForecastSummary }) {
  const tiles = [
    { label: "Items to Review", value: String(summary.totalItems), icon: ListChecks },
    { label: "High Priority", value: String(summary.highPriority), icon: AlertTriangle },
    { label: "Medium Priority", value: String(summary.mediumPriority), icon: TrendingDown },
    { label: "Est. Reorder Cost", value: formatCurrency(summary.estimatedOrderAmount), icon: IndianRupee },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="rounded-2xl">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
              <Icon className="size-4.5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
