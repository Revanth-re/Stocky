"use client";
import { Sparkles, RefreshCw } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { useForecasts, useGenerateForecast } from "@/features/forecast/api/use-forecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ForecastPlaceholderCard({ productId }: { productId: string }) {
  const { data, isLoading } = useForecasts(undefined, productId);
  const generateForecast = useGenerateForecast();
  const forecast = data?.items[0];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> AI Demand Forecast
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          loading={generateForecast.isPending}
          onClick={() => generateForecast.mutate([productId])}
        >
          <RefreshCw className="size-3.5" /> {forecast ? "Recalculate" : "Generate Forecast"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : !forecast ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No forecast yet for this product. Generate one to see predicted demand and reorder suggestions.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Predicted Demand (7d)" value={`${forecast.predictedDemand} ${forecast.unit}`} />
              <Stat label="Suggested Order" value={`${forecast.suggestedOrderQty} ${forecast.unit}`} />
              <Stat label="Confidence" value={`${Math.round(forecast.confidenceScore)}%`} />
              <Stat
                label="Priority"
                value={<Badge variant={forecast.priority === "high" ? "destructive" : forecast.priority === "medium" ? "warning" : "success"} className="capitalize">{forecast.priority}</Badge>}
              />
            </div>
            <p className="text-sm text-muted-foreground">{forecast.reason}</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={forecast.series}>
                <XAxis dataKey="date" fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="predicted" stroke="#6D4AFF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
