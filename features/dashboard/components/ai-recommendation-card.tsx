"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useForecasts } from "@/features/forecast/api/use-forecast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AiRecommendationCard() {
  const { data, isLoading } = useForecasts("high");
  const items = data?.items.slice(0, 3) ?? [];
  const totalToReorder = data?.summary.totalItems ?? 0;

  return (
    <Card className="overflow-hidden rounded-2xl border-none bg-gradient-brand text-white shadow-elevated">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-white/80">AI Recommendation</p>
              <p className="mt-1 text-2xl font-semibold">
                {isLoading ? "Analyzing…" : `You need to reorder ${totalToReorder} items`}
              </p>
              <p className="mt-1 text-sm text-white/75">Based on sales velocity & demand prediction</p>
            </div>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link href="/forecast">
              View Suggestions <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-white/10" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <Badge className="border-none bg-white/20 text-white">{Math.round(item.confidenceScore)}%</Badge>
                </div>
                <p className="mt-2 text-xs text-white/75">
                  Order <span className="font-semibold text-white">{item.suggestedOrderQty} {item.unit}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/75">
            No urgent reorders right now — generate a forecast to see fresh recommendations.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
