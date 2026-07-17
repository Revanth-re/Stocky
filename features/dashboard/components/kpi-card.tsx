import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatDelta } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  deltaPct,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  deltaPct?: number;
  icon: LucideIcon;
  hint?: string;
}) {
  const isPositive = (deltaPct ?? 0) >= 0;

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
            <Icon className="size-4.5" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        {deltaPct !== undefined ? (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium">
            <span className={cn("flex items-center gap-0.5", isPositive ? "text-success" : "text-destructive")}>
              {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {formatDelta(deltaPct)}
            </span>
            <span className="text-muted-foreground">vs yesterday</span>
          </div>
        ) : hint ? (
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
