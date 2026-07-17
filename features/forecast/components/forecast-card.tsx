"use client";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, Minus, Package, Sparkles, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ForecastDTO } from "@/types/forecast";

const PRIORITY_VARIANT = { high: "destructive", medium: "warning", low: "success" } as const;

const TREND_META = {
  rising: { icon: TrendingUp, label: "Rising demand", className: "text-success" },
  stable: { icon: Minus, label: "Stable demand", className: "text-muted-foreground" },
  declining: { icon: TrendingDown, label: "Declining demand", className: "text-destructive" },
} as const;

export function ForecastCard({ forecast }: { forecast: ForecastDTO }) {
  const trend = forecast.marketDemandTrend ? TREND_META[forecast.marketDemandTrend] : null;
  const TrendIcon = trend?.icon;

  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Package className="size-4.5" />
            </span>
            <div>
              <p className="font-medium">{forecast.productName}</p>
              <p className="text-xs text-muted-foreground">Current stock: {forecast.currentStock} {forecast.unit}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={PRIORITY_VARIANT[forecast.priority]} className="capitalize">
              {forecast.priority}
            </Badge>
            {forecast.engine === "gemini" && (
              <TooltipProvider>
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="info" className="gap-1 border-none bg-accent text-accent-foreground">
                      <Sparkles className="size-3" /> AI
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Predicted by Gemini from real sales history</TooltipContent>
                </UiTooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Next 7 Days" value={`${forecast.predictedDemand}`} />
          <Stat label="Next 30 Days" value={forecast.predictedDemand30d !== undefined ? `${forecast.predictedDemand30d}` : "—"} />
          <Stat label="Confidence" value={`${Math.round(forecast.confidenceScore)}%`} />
        </div>

        {trend && TrendIcon && (
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", trend.className)}>
            <TrendIcon className="size-3.5" /> {trend.label} in the market
          </div>
        )}

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.series}>
              <defs>
                <linearGradient id={`grad-${forecast.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D4AFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6D4AFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 11 }}
              />
              <Area type="monotone" dataKey="predicted" stroke="#6D4AFF" strokeWidth={2} fill={`url(#grad-${forecast.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground">{forecast.reason}</p>

        <div className="flex items-center justify-between text-xs">
          <p className="font-medium">Suggested order: {forecast.suggestedOrderQty} {forecast.unit}</p>
          {forecast.willStockOutAt && (
            <p className="flex items-center gap-1.5 font-medium text-destructive">
              <Clock className="size-3.5" /> Out around {format(new Date(forecast.willStockOutAt), "d MMM")}
            </p>
          )}
        </div>

        <Button asChild size="sm" className="w-full">
          <Link
            href={{
              pathname: "/purchase-orders/new",
              query: { productId: forecast.productId, qty: forecast.suggestedOrderQty },
            } as never}
          >
            <ShoppingCart className="size-4" /> Create Purchase Order
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
