"use client";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDashboardSummary } from "../api/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentActivityCard() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading && data?.recentActivity.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
        )}
        {data?.recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Activity className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {activity.actorName ? `${activity.actorName} · ` : ""}
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
