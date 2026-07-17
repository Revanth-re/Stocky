"use client";
import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useForecasts, useGenerateForecast } from "../api/use-forecast";
import { ForecastSummaryCards } from "./forecast-summary-cards";
import { ForecastCard } from "./forecast-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImportSalesDialog } from "@/features/sales/components/import-sales-dialog";

const TABS = [
  { value: "all", label: "All" },
  { value: "high", label: "High Priority" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export function ForecastDashboard() {
  const [priority, setPriority] = useState<(typeof TABS)[number]["value"]>("all");
  const { data, isLoading } = useForecasts(priority === "all" ? undefined : priority);
  const generateForecast = useGenerateForecast();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Sparkles className="size-6 text-primary" /> AI Forecast
          </h1>
          <p className="text-sm text-muted-foreground">Smart recommendations based on recent sales velocity.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportSalesDialog />
          <Button loading={generateForecast.isPending} onClick={() => generateForecast.mutate(undefined)}>
            <RefreshCw className="size-4" /> {data?.items.length ? "Recalculate" : "Generate Forecast"}
          </Button>
        </div>
      </div>

      {data?.summary && <ForecastSummaryCards summary={data.summary} />}

      <Tabs value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Sparkles className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No forecasts yet</p>
          <p className="text-sm text-muted-foreground">Generate a forecast to see reorder recommendations.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((forecast) => (
            <ForecastCard key={forecast.id} forecast={forecast} />
          ))}
        </div>
      )}
    </div>
  );
}
